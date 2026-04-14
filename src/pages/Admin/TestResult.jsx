import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import Side_Bar from "../../components/Side_bar";

export default function ResultsTable() {
  const [users, setUsers] = useState([]); // all users
  const [filteredUsers, setFilteredUsers] = useState([]); // after search
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Test Results
          </h1>

        </div>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name..."
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="pageSize"
              className="text-sm font-semibold text-gray-600 whitespace-nowrap"
            >
              Rows per page
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Candidate Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registeredAt
                      ? user.registeredAt.toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registeredAt
                      ? user.registeredAt.toLocaleTimeString("en-IN")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {user.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.number || user.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to={`/results/${user.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tablet Responsive Table (768px - 1023px) */}
        <div className="hidden md:block lg:hidden bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-red-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.registeredAt
                      ? user.registeredAt.toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {user.name || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.number || user.phone || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/results/${user.id}`}
                      className="text-red-600 hover:text-red-700 font-medium underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Below 768px) */}
        <div className="md:hidden space-y-3">
          {currentUsers.map((user) => {
            const date = user.registeredAt
              ? user.registeredAt.toLocaleDateString("en-IN")
              : "-";
            const time = user.registeredAt
              ? user.registeredAt.toLocaleTimeString("en-IN")
              : "-";
            return (
              <div
                key={user.id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:border-red-200 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold text-base leading-tight">
                      {user.name || "Unnamed Candidate"}
                    </span>
                    <span className="text-gray-500 text-xs mt-0.5">{date} at {time}</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 font-medium min-w-[50px]">Phone:</span>
                    {user.number || user.phone || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 font-medium min-w-[50px]">Email:</span>
                    <span className="truncate">{user.email || "N/A"}</span>
                  </div>
                </div>

                <Link
                  to={`/results/${user.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
                >
                  View Details
                </Link>
              </div>
            );
          })}
          {currentUsers.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No users found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{showingFrom}</span> to <span className="font-bold text-gray-900">{showingTo}</span> of <span className="font-bold text-gray-900">{filteredUsers.length}</span> candidates
            </p>
          </div>

          <nav className="flex items-center justify-center gap-1">
            <button
              onClick={goFirst}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="First Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((n, i) => {
                const isCurrent = n === currentPage;
                const prev = pageNumbers[i - 1];
                const showDots = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {showDots && <span className="text-gray-400 px-1">…</span>}
                    <button
                      onClick={() => setCurrentPage(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${isCurrent
                        ? "bg-red-600 text-white shadow-md shadow-red-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={goLast}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="Last Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
}
