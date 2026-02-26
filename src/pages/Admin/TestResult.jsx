import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import Side_Bar from "../../components/Side_bar";

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
  <div className="min-h-screen bg-gray-100 flex">
      
      <main className="flex-1">
        
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
          Manage Test Results
        </h1>
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            {/* Search - Full width on mobile, fixed on desktop */}
            <div className="w-full md:max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name"
                className="border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none p-2 rounded-md w-full"
              />
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3">
              <label
                htmlFor="pageSize"
                className="text-sm text-gray-600 whitespace-nowrap"
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
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-200 focus:border-red-500 w-full xs:w-auto"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.registeredAt
                        ? user.registeredAt.toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.registeredAt
                        ? user.registeredAt.toLocaleTimeString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {user.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.number || user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/results/${user.id}`}
                        className="text-red-600 hover:text-red-700 font-medium underline-offset-2 hover:underline"
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
          <div className="hidden md:block lg:hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">
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
                  className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4"
                >
                  <div className="flex justify-between mb-2 text-sm text-gray-700">
                    <span className="font-medium">{date}</span>
                    <span className="text-gray-500">{time}</span>
                  </div>
                  <div className="text-sm text-gray-800 mb-1">
                    <span className="font-semibold text-gray-900">Name: </span>
                    {user.name || "-"}
                  </div>
                  <div className="text-sm text-gray-800 mb-1">
                    <span className="font-semibold text-gray-900">Phone: </span>
                    {user.number || user.phone || "-"}
                  </div>
                  <div className="text-sm text-gray-800 mb-3">
                    <span className="font-semibold text-gray-900">Email: </span>
                    {user.email || "-"}
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/results/${user.id}`}
                      className="px-3 py-1.5 rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Showing Count */}
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium text-gray-900">{showingFrom}</span>
                –<span className="font-medium text-gray-900">{showingTo}</span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {filteredUsers.length}
                </span>
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
              {/* Page Size Info (Mobile only) */}
              <div className="xs:hidden text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center justify-center xs:justify-end gap-1 w-full xs:w-auto overflow-x-auto py-2">
                {/* First & Prev Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={goFirst}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm"
                    aria-label="First page"
                  >
                    « First
                  </button>
                  <button
                    onClick={goPrev}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm"
                    aria-label="Previous page"
                  >
                    ‹ Prev
                  </button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((n, i) => {
                    const isCurrent = n === currentPage;
                    const prev = pageNumbers[i - 1];
                    const showDots = prev && n - prev > 1;
                    return (
                      <React.Fragment key={n}>
                        {showDots && (
                          <span className="px-1 sm:px-2 text-gray-400">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(n)}
                          className={
                            isCurrent
                              ? "px-2 sm:px-3 py-1 rounded-md border border-red-600 bg-red-600 text-white text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] text-center"
                              : "px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] text-center"
                          }
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Next & Last Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={goNext}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm"
                    aria-label="Next page"
                  >
                    Next ›
                  </button>
                  <button
                    onClick={goLast}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm"
                    aria-label="Last page"
                  >
                    Last »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
