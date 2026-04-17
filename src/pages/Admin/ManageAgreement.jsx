import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import ClearableInput from "../../components/common/ClearableInput";

const ManageAgreements = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'inprogress' | 'completed'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [signedStatus, setSignedStatus] = useState({}); // { [appId]: boolean }
  const [agreementUrls, setAgreementUrls] = useState({}); // { [userId]: agreementUrl }
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Fetch job applications (users)
        const appsSnap = await getDocs(collection(db, "jobApplications"));
        const list = appsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(list);

        // 2) Fetch agreements -> to know who has signed
        const agrSnap = await getDocs(collection(db, "agreements"));
        const signMap = {};
        const agreementUrlMap = {}; // Will hold the signed URL
        agrSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          signMap[docSnap.id] = !!data.candidateHasSigned;

          // If the candidate signed, we store the agreement download URL
          if (data.candidateHasSigned && data.agreementFile) {
            agreementUrlMap[docSnap.id] = data.agreementFile; // Assuming file URL is stored here
          }
        });
        setSignedStatus(signMap);
        setAgreementUrls(agreementUrlMap);
      } catch (err) {
        console.error("Error fetching agreements/jobApplications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const filteredUsers = users
    .filter((u) => {
      const signed = !!signedStatus[u.id];

      if (activeTab === "pending") {
        return !u.agreementDone;
      }

      if (activeTab === "inprogress") {
        return !!u.agreementDone && !signed;
      }

      if (activeTab === "completed") {
        return !!u.agreementDone && signed;
      }

      return true;
    })
    .filter((u) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleCreateAgreement = (user) => {
    navigate(`/agreement/${user.id}`, { state: { user } });
  };

  const handleDownloadAgreement = (userId) => {
    const downloadUrl = agreementUrls[userId];
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    } else {
      alert("No signed agreement found.");
    }
  };

  const pendingCount = users.filter((u) => !u.agreementDone).length;
  const inProgressCount = users.filter((u) => u.agreementDone && !signedStatus[u.id]).length;
  const completedCount = users.filter((u) => u.agreementDone && signedStatus[u.id]).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 text-lg">Loading agreements...</div>
      </div>
    );
  }

  return (
    
  <div className="min-h-screen bg-gray-100 flex">
      
      <main className="flex-1 ">
        
        <div className="md:w-full w-5/6 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 w-fit border-red-500 pb-2">
          Manage Agreements
        </h1>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div>
              
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View all users and manage their employment agreements.
              </p>
            </div>

            {/* Search - Full width on mobile, fixed width on desktop */}
            <div className="w-full sm:w-auto sm:min-w-[280px] md:w-72">
              <ClearableInput
                id="desktop-search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
              />
            </div>
          </div>
        </div>

        {/* Mobile Search - Below mobile header */}
        <div className="lg:hidden mb-4">
          <ClearableInput
            id="mobile-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
          />
        </div>

        {/* Tabs - Responsive with scroll on mobile */}
        <div className="mb-4 md:mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
            <div className="flex items-center gap-1 md:gap-2 min-w-max border-b border-slate-200">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-2 text-xs md:text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === "pending"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Pending
                <span className="ml-1 md:ml-2 text-xs rounded-full px-2 py-0.5 bg-red-50 text-red-600">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("inprogress")}
                className={`px-3 py-2 text-xs md:text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === "inprogress"
                    ? "border-yellow-600 text-yellow-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                In Progress
                <span className="ml-1 md:ml-2 text-xs rounded-full px-2 py-0.5 bg-yellow-50 text-yellow-700">
                  {inProgressCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-2 text-xs md:text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === "completed"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Signed
                <span className="ml-1 md:ml-2 text-xs rounded-full px-2 py-0.5 bg-green-50 text-green-700">
                  {completedCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards View for Mobile, Table View for Desktop */}
        <div className="lg:hidden">
          {/* Mobile Cards View */}
          <div className="space-y-3">
            {currentItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
                <p className="text-slate-500 text-sm">
                  No users found in this tab.
                </p>
              </div>
            ) : (
              currentItems.map((u, idx) => {
                const globalIdx = indexOfFirstItem + idx;
                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                const signed = !!signedStatus[u.id];

                let statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    Pending
                  </span>
                );

                if (u.agreementDone && !signed) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                      In Progress
                    </span>
                  );
                }

                if (u.agreementDone && signed) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Signed by Candidate
                    </span>
                  );
                }

                return (
                  <div
                    key={u.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-500 text-sm">#{globalIdx + 1}</span>
                          <h3 className="font-medium text-slate-800">
                            {fullName || "No name"}
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm">{u.email || "-"}</p>
                        <p className="text-slate-600 text-sm mt-1">
                          Position: {u.position || "-"}
                        </p>
                      </div>
                      <div>{statusBadge}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleCreateAgreement(u)}
                        className="flex-1 min-w-[140px] px-3 py-2 rounded-full text-xs font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm text-center"
                      >
                        {u.agreementDone ? "View/Edit" : "Create Agreement"}
                      </button>

                      {activeTab === "completed" && signed && (
                        <button
                          onClick={() => handleDownloadAgreement(u.id)}
                          className="flex-1 min-w-[140px] px-3 py-2 rounded-full text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm text-center"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {filteredUsers.length > itemsPerPage && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a few page numbers if there are many pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-red-600 text-white shadow-md shadow-red-200"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500">
                      Position
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500 text-sm"
                      >
                        No users found in this tab.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((u, idx) => {
                      const globalIdx = indexOfFirstItem + idx;
                      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                      const signed = !!signedStatus[u.id];

                      let statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Pending
                        </span>
                      );

                      if (u.agreementDone && !signed) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                            In Progress
                          </span>
                        );
                      }

                      if (u.agreementDone && signed) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Signed by Candidate
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-3 text-slate-500 align-middle">
                            {globalIdx + 1}
                          </td>
                          <td className="px-4 py-3 text-slate-800 align-middle">
                            {fullName || "No name"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 align-middle">
                            {u.email || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 align-middle">
                            {u.position || "-"}
                          </td>
                          <td className="px-4 py-3 align-middle">
                            {statusBadge}
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            <button
                              onClick={() => handleCreateAgreement(u)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm"
                            >
                              {u.agreementDone
                                ? "View / Edit Agreement"
                                : "Create Agreement"}
                            </button>

                            {activeTab === "completed" && signed && (
                              <button
                                onClick={() => handleDownloadAgreement(u.id)}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm ml-2"
                              >
                                Download Agreement
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {filteredUsers.length > itemsPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-t border-slate-100 px-1">
              <p className="text-sm text-slate-500 mb-4 sm:mb-0 order-2 sm:order-1">
                Showing <span className="font-medium text-slate-700">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-700">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="font-medium text-slate-700">{filteredUsers.length}</span> entries
              </p>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-red-600 text-white shadow-md shadow-red-200"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default ManageAgreements;