import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import ClearableInput from "../../components/common/ClearableInput";
import PageHeader from "../../components/common/PageHeader";

export default function ResultsTable() {
  const [users, setUsers] = useState([]); // all users
  const [filteredUsers, setFilteredUsers] = useState([]); // after search
  const [audioURLs, setAudioURLs] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function fetchUsers() {
      const q = query(
        collection(db, "campusDrive"),
        orderBy("registeredAt", "desc")
      );
      const snap = await getDocs(q);

      const usersData = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt ? data.registeredAt.toDate() : null,
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchAudio() {
      const urls = {};
      for (const user of users) {
        for (const sec of ["speaking", "selling", "problemSolving"]) {
          if (user[sec]?.audioPath) {
            try {
              const downloadUrl = await getDownloadURL(
                storageRef(storage, user[sec].audioPath)
              );
              urls[user.id] = { ...(urls[user.id] || {}), [sec]: downloadUrl };
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      setAudioURLs(urls);
    }
    if (users.length) fetchAudio();
  }, [users]);

  // search by name
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const needle = value.trim().toLowerCase();
    if (!needle) {
      setFilteredUsers(users);
      setCurrentPage(1);
      return;
    }

    const filtered = users.filter((u) =>
      (u.name || "").toLowerCase().includes(needle)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // reset to first page on new search
  };

  // clamp current page if filtered list shrinks or page size changes
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // current page slice
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const showingFrom =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, filteredUsers.length);

  const goFirst = () => setCurrentPage(1);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  // small page number group (1 … current-1, current, current+1 … last)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxAround = 1; // show one on each side of current
    const add = (n) => pages.push(n);

    add(1);
    for (let i = currentPage - maxAround; i <= currentPage + maxAround; i++) {
      if (i > 1 && i < totalPages) add(i);
    }
    if (totalPages > 1) add(totalPages);

    // dedupe + sort
    return [...new Set(pages)].sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50">
        <p className="text-gray-600 text-lg">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <PageHeader
        title="Test Results"
        breadcrumbs={[
          { label: "Admin", to: "/manage-emp" },
          { label: "Talent" },
          { label: "Results" },
        ]}
      />

      <div className="space-y-6 mt-6">
        {/* Controls & Search */}
        <section className="premium-card p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:max-w-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Search Candidates</label>
              <ClearableInput
                id="search-test-results"
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onClear={() => handleSearch({ target: { value: "" } })}
                placeholder="Ex: John Doe"
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <label htmlFor="pageSize" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Display
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-red-200 block p-2 transition-all"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </section>

        {/* Desktop Data Grid */}
        <div className="hidden lg:block premium-card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date / Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Execution</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.registeredAt ? user.registeredAt.toLocaleDateString("en-IN") : "-"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {user.registeredAt ? user.registeredAt.toLocaleTimeString("en-IN") : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {user.name || "Anonymous Candidate"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">{user.number || user.phone || "-"}</div>
                    <div className="text-xs text-slate-400">{user.email || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/results/${user.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                    >
                      Analyze Report
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No candidate records matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Stream */}
        <div className="lg:hidden space-y-4">
          {currentUsers.map((user) => (
            <div key={user.id} className="premium-card p-4 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{user.name || "Anonymous"}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {user.registeredAt ? `${user.registeredAt.toLocaleDateString("en-IN")} @ ${user.registeredAt.toLocaleTimeString("en-IN")}` : "No Date"}
                  </p>
                </div>
                <Link to={`/results/${user.id}`} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Phone</span>
                  <span className="text-slate-700 dark:text-slate-300">{user.number || user.phone || "-"}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Email</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate block">{user.email || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Pagination Footer */}
        <footer className="premium-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{showingFrom}-{showingTo}</span> of <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span> candidates
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={goFirst}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((n, i) => {
                const isCurrent = n === currentPage;
                const prev = pageNumbers[i - 1];
                const showDots = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {showDots && <span className="text-slate-300 px-1">…</span>}
                    <button
                      onClick={() => setCurrentPage(n)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                      }`}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={goLast}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
