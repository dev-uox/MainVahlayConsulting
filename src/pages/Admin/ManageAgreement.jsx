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
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
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
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
                <p className="text-slate-500 text-sm">
                  No users found in this tab.
                </p>
              </div>
            ) : (
              filteredUsers.map((u, idx) => {
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
                          <span className="text-slate-500 text-sm">#{idx + 1}</span>
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
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500 text-sm"
                      >
                        No users found in this tab.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => {
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
                            {idx + 1}
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
        </div>
      </div>
      </main>
    </div>
  );
};

export default ManageAgreements;