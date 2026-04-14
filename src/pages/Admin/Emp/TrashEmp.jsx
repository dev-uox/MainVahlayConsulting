import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Side_bar from "../../../components/Side_bar";
import ClearableInput from "../../../components/common/ClearableInput";

const TrashEmp = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Selection and Action states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTrash = useCallback(async () => {
    try {
      const trashRef = collection(db, "trashApplications");
      const snapshot = await getDocs(trashRef);
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by deletedAt in descending order
      appList.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      setApplications(appList);
      setFilteredApplications(appList);
    } catch (error) {
      console.error("Error fetching trash applications:", error);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm === "") {
      setFilteredApplications(applications);
      return;
    }
    const lowerSearchTerm = trimmedSearchTerm.toLowerCase();
    setFilteredApplications(
      applications.filter((app) => {
        const fullName = `${app.firstName ?? ""} ${app.lastName ?? ""}`.toLowerCase();
        const email = (app.email ?? "").toLowerCase();
        return fullName.includes(lowerSearchTerm) || email.includes(lowerSearchTerm);
      })
    );
  }, [searchTerm, applications]);

  // Pagination logic
  const totalApplications = filteredApplications.length;
  const pageCount = Math.ceil(totalApplications / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalApplications);
  const currentPageData = filteredApplications.slice(startIndex, endIndex);

  const handleNextPage = () => { if (page < pageCount - 1) setPage((prev) => prev + 1); };
  const handlePreviousPage = () => { if (page > 0) setPage((prev) => prev - 1); };
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  // --- Trash Action Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(currentPageData.map((app) => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (e, id) => {
    const newSelected = new Set(selectedIds);
    if (e.target.checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleRestoreSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Restore ${selectedIds.size} record(s) back to active list?`)) return;

    setIsProcessing(true);
    try {
      const restorePromises = Array.from(selectedIds).map(async (id) => {
        const trashRef = doc(db, "trashApplications", id);
        const snap = await getDoc(trashRef);
        if (snap.exists()) {
          const { deletedAt, originalId, ...rest } = snap.data();
          // Restore to jobApplications
          await addDoc(collection(db, "jobApplications"), rest);
          // Delete from trash
          await deleteDoc(trashRef);
        }
      });
      await Promise.all(restorePromises);
      alert(`Successfully restored ${selectedIds.size} record(s).`);
      setSelectedIds(new Set());
      await fetchTrash();
    } catch (error) {
      console.error("Error restoring records:", error);
      alert("Failed to restore some records.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePermanent = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm("PERMANENTLY DELETE selected records? This cannot be undone!")) return;

    setIsProcessing(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        deleteDoc(doc(db, "trashApplications", id))
      );
      await Promise.all(deletePromises);
      alert("Selected records deleted permanently.");
      setSelectedIds(new Set());
      await fetchTrash();
    } catch (error) {
      console.error("Error permanently deleting records:", error);
      alert("Failed to delete some records.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-4 sm:mb-6 border-b-4 border-orange-500 pb-2">
            Trash (Deleted Employees)
          </h1>

          <div className="flex items-center justify-between gap-2 my-2">
            <ClearableInput
              id="searchInput"
              type="text"
              placeholder="Search trash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-2/3 pl-2 pr-4 py-3 border border-gray-300 rounded-xl"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRestoreSelected}
                disabled={selectedIds.size === 0 || isProcessing}
                className={`px-4 py-2 text-sm rounded ${selectedIds.size === 0 ? "bg-gray-300" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                Restore ({selectedIds.size})
              </button>
              <button
                onClick={handleDeletePermanent}
                disabled={selectedIds.size === 0 || isProcessing}
                className={`px-4 py-2 text-sm rounded ${selectedIds.size === 0 ? "bg-gray-300" : "bg-red-700 text-white hover:bg-red-800"}`}
              >
                Delete Forever
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={currentPageData.length > 0 && selectedIds.size === currentPageData.length} /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">First Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Last Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Deleted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentPageData.map((app) => (
                  <tr key={app.id} className={selectedIds.has(app.id) ? "bg-orange-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-2"><input type="checkbox" checked={selectedIds.has(app.id)} onChange={(e) => handleSelectRow(e, app.id)} /></td>
                    <td className="px-6 py-2">{app.firstName}</td>
                    <td className="px-6 py-2">{app.lastName}</td>
                    <td className="px-6 py-2">{app.email}</td>
                    <td className="px-6 py-2 text-gray-500">{new Date(app.deletedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {currentPageData.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-500">Trash is empty.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select className="border rounded px-2 py-1" value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                {[5, 10, 25, 50].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <span>{startIndex + 1} - {endIndex} of {totalApplications}</span>
              <div className="flex space-x-2">
                <button onClick={handlePreviousPage} disabled={page === 0} className="px-2 py-1 border rounded disabled:opacity-30">&lt;</button>
                <button onClick={handleNextPage} disabled={page === pageCount - 1 || pageCount === 0} className="px-2 py-1 border rounded disabled:opacity-30">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrashEmp;
