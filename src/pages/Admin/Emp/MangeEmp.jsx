import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Side_bar from "../../../components/Side_bar";

const ManageEmp = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const jobAppRef = collection(db, "jobApplications");
        const snapshot = await getDocs(jobAppRef);
        const rawList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        const uniqueApps = new Map();
        rawList.forEach((app) => {
          const emailKey = (app.email || "").toLowerCase().trim();
          if (!emailKey) return;
          if (!uniqueApps.has(emailKey)) {
            uniqueApps.set(emailKey, app);
          } else {
            const existingDate = new Date(uniqueApps.get(emailKey).applicationDate || 0);
            const currentDate = new Date(app.applicationDate || 0);
            if (currentDate > existingDate) {
              uniqueApps.set(emailKey, app);
            }
          }
        });

        const appList = Array.from(uniqueApps.values());

        // Sort applications by applicationDate (YYYY-MM-DD) in descending order
        appList.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );
        setApplications(appList);
        setFilteredApplications(appList);
      } catch (error) {
        console.error("Error fetching job applications:", error);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      setFilteredApplications(applications);
      return;
    }

    const searchWords = query.split(/\s+/); // split by space

    const filtered = applications.filter((app) => {
      const firstName = (app.firstName || "").toLowerCase();
      const lastName = (app.lastName || "").toLowerCase();
      const email = (app.email || "").toLowerCase();

      const fullName = `${firstName} ${lastName}`.trim();

      // ✅ Check each word exists somewhere in name
      const nameMatch = searchWords.every(word =>
        firstName.includes(word) ||
        lastName.includes(word) ||
        fullName.includes(word)
      );

      return nameMatch || email.includes(query);
    });

    setFilteredApplications(filtered);
  }, [searchTerm, applications]);

  // Pagination logic
  const totalApplications = filteredApplications.length;
  const pageCount = Math.ceil(totalApplications / rowsPerPage);

  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalApplications);
  const currentPageData = filteredApplications.slice(startIndex, endIndex);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleNextPage = () => {
    if (page < pageCount - 1) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0); // Reset to first page whenever rows per page changes
  };

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen bg-gray-100 flex">

        <main className="flex-1">

          <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
              {" "}
              Manage Employees
            </h1>

            <div className=" flex items-center justify-between  gap-2 my-2">
              <input
                id="searchInput"
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-2/3 pl-2 pr-4 py-3 border border-gray-300 rounded-xl  sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Link
                to={"/multistepform"}
                className="inline-block  px-4 py-3 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
              >
                <button>Add Emp</button>
              </Link>
            </div>

            {/* Search Input */}

            {/* Card for Table (Desktop/Tablet) */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Last Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Application Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {currentPageData.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-6 py-2 whitespace-nowrap  text-gray-700">
                        {app.firstName}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap  text-gray-700">
                        {app.lastName}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap  text-gray-700">
                        {app.email}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap  text-gray-700">
                        {app.applicationDate}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center">
                        <Link
                          to={`/manage-emp/${app.id}`}
                          className="inline-block px-4 py-2 text-red-600 underline text-sm rounded hover:bg-red-600 transition hover:text-white"
                        >
                          More Details
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {/* If no results */}
                  {currentPageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Card Layout) */}
            <div className="block md:hidden space-y-4">
              {currentPageData.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="mb-2 flex items-center">
                    <span className="text-sm font-semibold text-gray-600">
                      Name:
                    </span>
                    <span className="ml-2 text-base text-gray-800">
                      {app.firstName} {app.lastName}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-sm font-semibold text-gray-600">
                      Email:{" "}
                      <span className="text-base font-normal text-gray-800">
                        {app.email}
                      </span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/manage-emp/${app.id}`}
                      className="block text-center px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                    >
                      More Details
                    </Link>
                  </div>
                </div>
              ))}

              {/* If no results (mobile) */}
              {currentPageData.length === 0 && (
                <div className="text-center text-gray-500">No results found.</div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              {/* Rows Per Page Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">Rows per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Range & Navigation */}
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <span>
                  {startIndex + 1} - {endIndex} of {totalApplications}
                </span>
                <div className="flex space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                    className={`px-2 py-1 rounded border ${page === 0
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    &lt;
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={page === pageCount - 1 || pageCount === 0}
                    className={`px-2 py-1 rounded border ${page === pageCount - 1 || pageCount === 0
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ManageEmp;
