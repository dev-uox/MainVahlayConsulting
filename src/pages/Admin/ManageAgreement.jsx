import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Agreements
          </h1>

        </div>

        {/* Desktop Header Actions */}
        <div className="hidden lg:flex items-center justify-between gap-4 mb-8">
          <div className="w-full sm:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-hidden bg-white border border-gray-200 p-1 rounded-xl shadow-sm inline-flex w-full sm:w-auto">
          <div className="flex w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "pending"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Pending
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inprogress")}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "inprogress"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              In Progress
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'inprogress' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {inProgressCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "completed"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Signed
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'completed' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {completedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Cards View for Mobile, Table View for Desktop */}
        <div className="lg:hidden">
          {/* Mobile Cards View */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354A4 4 0 1115.354 11H8.646a4.002 4.002 0 00-3.292-6.646" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No users found in this category.</p>
              </div>
            ) : (
              filteredUsers.map((u, idx) => {
                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                const signed = !!signedStatus[u.id];

                let statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                    Pending
                  </span>
                );

                if (u.agreementDone && !signed) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                      In Progress
                    </span>
                  );
                }

                if (u.agreementDone && signed) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                      Signed
                    </span>
                  );
                }

                return (
                  <div
                    key={u.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-red-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400 text-xs font-bold">#{idx + 1}</span>
                          <h3 className="font-bold text-gray-900">
                            {fullName || "No name"}
                          </h3>
                        </div>
                        <p className="text-gray-500 text-xs">{u.email || "-"}</p>
                        <p className="text-gray-700 text-xs mt-2 flex items-center gap-1">
                          <span className="text-gray-400">Position:</span> {u.position || "-"}
                        </p>
                      </div>
                      <div>{statusBadge}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCreateAgreement(u)}
                        className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
                      >
                        {u.agreementDone ? "View/Edit" : "Create Agreement"}
                      </button>

                      {activeTab === "completed" && signed && (
                        <button
                          onClick={() => handleDownloadAgreement(u.id)}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Candidate Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500 italic bg-gray-50/50"
                      >
                        No users found in this tab.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => {
                      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                      const signed = !!signedStatus[u.id];

                      let statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                          Pending
                        </span>
                      );

                      if (u.agreementDone && !signed) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                            In Progress
                          </span>
                        );
                      }

                      if (u.agreementDone && signed) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                            Signed
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-400 text-xs font-bold align-middle">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-bold align-middle">
                            {fullName || "No name"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm align-middle">
                            {u.email || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm align-middle">
                            {u.position || "-"}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {statusBadge}
                          </td>
                          <td className="px-6 py-4 text-right align-middle space-x-2">
                            <button
                              onClick={() => handleCreateAgreement(u)}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm shadow-red-100"
                            >
                              {u.agreementDone
                                ? "View / Edit"
                                : "Create Agreement"}
                            </button>

                            {activeTab === "completed" && signed && (
                              <button
                                onClick={() => handleDownloadAgreement(u.id)}
                                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm shadow-green-100 gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
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
      </main>
    </div>
  );
};

export default ManageAgreements;