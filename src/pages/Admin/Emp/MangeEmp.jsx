import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Side_bar from "../../../components/Side_bar";
import ClearableInput from "../../../components/common/ClearableInput";

const ManageEmp = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Selection and Delete states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchApplications = useCallback(async () => {
    try {
      const jobAppRef = collection(db, "jobApplications");
      const snapshot = await getDocs(jobAppRef);
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort applications by applicationDate (YYYY-MM-DD) in descending order
      appList.sort(
        (a, b) => {
          const dateA = a.applicationDate ? new Date(a.applicationDate) : new Date(0);
          const dateB = b.applicationDate ? new Date(b.applicationDate) : new Date(0);
          return dateB - dateA;
        }
      );
      setApplications(appList);
      setFilteredApplications(appList);
    } catch (error) {
      console.error("Error fetching job applications:", error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm === "") {
      setFilteredApplications(applications);
      return;
    }

    const lowerSearchTerm = trimmedSearchTerm.toLowerCase();

    setFilteredApplications(
      applications.filter((app) => {
        const fullName = `${app.firstName ?? ""} ${
          app.lastName ?? ""
        }`.toLowerCase();
        const email = (app.email ?? "").toLowerCase();
        return (
          fullName.includes(lowerSearchTerm) || email.includes(lowerSearchTerm)
        );
      })
    );
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

  // --- Delete Feature Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentPageData.map((app) => app.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (e, id) => {
    const newSelected = new Set(selectedIds);
    if (e.target.checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.size} selected employee(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const movePromises = Array.from(selectedIds).map(async (id) => {
        const docRef = doc(db, "jobApplications", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Add to trash collection with deletedAt timestamp
          await addDoc(collection(db, "trashApplications"), {
            ...data,
            originalId: id,
            deletedAt: new Date().toISOString(),
          });
          // Delete from main collection
          await deleteDoc(docRef);
        }
      });
      
      await Promise.all(movePromises);
      
      alert(`Moved ${selectedIds.size} employee(s) to Trash.`);
      setSelectedIds(new Set());
      await fetchApplications();
      // Adjust page if we deleted everything on the current page
      if (page > 0 && selectedIds.size === currentPageData.length) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error("Error moving applications to trash:", error);
      alert("Failed to move some records to trash. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
            <ClearableInput
              id="searchInput"
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-2/3 pl-2 pr-4 py-3 border border-gray-300 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
             <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || isDeleting}
                className={`inline-block px-4 py-3 text-sm rounded transition ${
                  selectedIds.size === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {isDeleting ? "Moving..." : `Move to Trash (${selectedIds.size})`}
              </button>
              <Link
                to={"/multistepform"}
                className="inline-block px-4 py-3 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
              >
                <button>Add Emp</button>
              </Link>
            </div>
          </div>

          {/* Search Input */}

          {/* Card for Table (Desktop/Tablet) */}
          <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-500">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        currentPageData.length > 0 &&
                        selectedIds.size === currentPageData.length
                      }
                      className="w-4 h-4 rounded"
                    />
                  </th>
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
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(app.id) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={(e) => handleSelectRow(e, app.id)}
                        className="w-4 h-4 rounded text-red-600"
                      />
                    </td>
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
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
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
                className={`bg-white p-4 rounded-lg shadow-md border ${
                  selectedIds.has(app.id) ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={(e) => handleSelectRow(e, app.id)}
                      className="w-4 h-4 mr-3 rounded text-red-600"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-600">
                        Name:
                      </span>
                      <span className="ml-2 text-base text-gray-800">
                        {app.firstName} {app.lastName}
                      </span>
                    </div>
                  </div>
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
                  className={`px-2 py-1 rounded border ${
                    page === 0
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
                  className={`px-2 py-1 rounded border ${
                    page === pageCount - 1 || pageCount === 0
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
