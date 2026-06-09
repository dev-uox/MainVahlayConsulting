import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import ClearableInput from "../../../components/common/ClearableInput";
import AdminPageShell, { AdminCard } from "../../../components/common/AdminPageShell";

const ManageEmp = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Sort state
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchApplications = useCallback(async () => {
    try {
      const jobAppRef = collection(db, "jobApplications");
      const snapshot = await getDocs(jobAppRef);
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(appList);
    } catch (error) {
      console.error("Error fetching job applications:", error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const trimmedQuery = searchTerm.trim().toLowerCase();
    const searchWords = trimmedQuery.split(/\s+/).filter(word => word);

    const filtered = applications.filter((app) => {
      // Name/Email match
      let nameMatch = true;
      if (trimmedQuery) {
        const firstName = (app.firstName || "").toLowerCase();
        const lastName = (app.lastName || "").toLowerCase();
        const email = (app.email || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();

        nameMatch = searchWords.every(word =>
          firstName.includes(word) ||
          lastName.includes(word) ||
          fullName.includes(word)
        ) || email.includes(trimmedQuery);
      }

      // Date match
      let dateMatch = true;
      if (searchDate) {
        const appDate = (app.applicationDate || "").trim();
        dateMatch = appDate === searchDate;
      }

      return nameMatch && dateMatch;
    });

    setFilteredApplications(filtered);
    setPage(0);
  }, [searchTerm, searchDate, applications]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(a.applicationDate || 0);
    const dateB = new Date(b.applicationDate || 0);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalApplications = sortedApplications.length;
  const pageCount = Math.ceil(totalApplications / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalApplications);
  const currentPageData = sortedApplications.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (page < pageCount - 1) setPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(prev => prev - 1);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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
    if (!window.confirm(`Move ${selectedIds.size} selected employee(s) to Trash?`)) return;

    setIsDeleting(true);
    try {
      const movePromises = Array.from(selectedIds).map(async (id) => {
        const docRef = doc(db, "jobApplications", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          await addDoc(collection(db, "trashApplications"), {
            ...data,
            originalId: id,
            deletedAt: new Date().toISOString(),
          });
          await deleteDoc(docRef);
        }
      });
      await Promise.all(movePromises);
      setSelectedIds(new Set());
      await fetchApplications();
    } catch (error) {
      console.error("Error moving to trash:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchDate("");
  };

  return (
    <AdminPageShell title="Manage Employees" subtitle="Search, review, and manage job applications">
        <AdminCard>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <ClearableInput
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none text-sm"
              />
              <Link
                to="/multistepform"
                className="px-5 py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm"
              >
                Add Emp
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
            <span>{filteredApplications.length} results found</span>
            <button onClick={clearFilters} className="text-red-600 font-semibold hover:underline">
              Clear Filters
            </button>
          </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={handleSelectAll}
                    checked={currentPageData.length > 0 && selectedIds.size === currentPageData.length}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Email</th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={toggleSort}
                >
                  Date {sortOrder === "desc" ? "↓" : "↑"}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPageData.map((app) => (
                <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(app.id) ? "bg-red-50" : ""}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded text-red-600"
                      checked={selectedIds.has(app.id)}
                      onChange={(e) => handleSelectRow(e, app.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{app.firstName} {app.lastName}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{app.email}</td>
                  <td className="px-6 py-4 text-gray-600">{app.applicationDate}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/manage-emp/${app.id}`} className="text-red-600 font-semibold hover:underline">
                      More Details
                    </Link>
                  </td>
                </tr>
              ))}
              {currentPageData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentPageData.map((app) => (
            <div key={app.id} className={`bg-white p-4 rounded-2xl border ${selectedIds.has(app.id) ? "border-red-500 bg-red-50" : "border-gray-100"} shadow-sm`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    className="rounded text-red-600 mt-1"
                    checked={selectedIds.has(app.id)}
                    onChange={(e) => handleSelectRow(e, app.id)}
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{app.firstName} {app.lastName}</h3>
                    <p className="text-xs text-gray-500">{app.email}</p>
                  </div>
                </div>
                <Link to={`/manage-emp/${app.id}`} className="text-red-600 text-xs font-bold uppercase underline">
                  View
                </Link>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">Applied: {app.applicationDate}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-red-100"
            >
              {[5, 10, 25, 50].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>results</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500">
              {startIndex + 1}-{endIndex} of {totalApplications}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handlePreviousPage} 
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                &lt;
              </button>
              <button 
                onClick={handleNextPage} 
                disabled={page >= pageCount - 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
        </AdminCard>
    </AdminPageShell>
  );
};

export default ManageEmp;
