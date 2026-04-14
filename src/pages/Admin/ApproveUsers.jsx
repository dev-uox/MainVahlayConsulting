import React, { useState, useEffect } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { CheckCircle, User, Loader2, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, all
  const [searchQuery, setSearchQuery] = useState("");

  // --- REAL-TIME FIRESTORE LISTENER ---
  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "jobApplications"),
      (querySnapshot) => {
        const rawList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const uniqueUsers = new Map();
        rawList.forEach((user) => {
          const emailKey = (user.email || "").toLowerCase().trim();
          if (!emailKey) return;
          
          if (!uniqueUsers.has(emailKey)) {
            uniqueUsers.set(emailKey, user);
          } else {
            const existing = uniqueUsers.get(emailKey);
            
            // Helper to get timestamp
            const getTs = (obj) => {
              if (!obj.createdAt) return 0;
              return typeof obj.createdAt.toMillis === "function" ? obj.createdAt.toMillis() : new Date(obj.createdAt).getTime();
            };
            
            if (getTs(user) > getTs(existing)) {
              uniqueUsers.set(emailKey, user);
            }
          }
        });
        
        let userList = Array.from(uniqueUsers.values());

        if (filter === "pending") {
          // --- DATE FILTER LOGIC ---
          const CUTOFF_DATE = new Date("2026-02-21T00:00:00").getTime();

          userList = userList.filter((user) => {
            const isPending = user.isApproved !== true;
            let userTimestamp = 0;
            if (user.createdAt) {
              if (typeof user.createdAt.toMillis === "function") {
                userTimestamp = user.createdAt.toMillis();
              } else {
                userTimestamp = new Date(user.createdAt).getTime();
              }
            }
            return isPending && userTimestamp >= CUTOFF_DATE;
          });
        } else if (filter === "approved") {
          userList = userList.filter((user) => user.isApproved === true);
        }

        setUsers(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      },
    );

    // Cleanup the listener when the component unmounts or filter changes
    return () => unsubscribe();
  }, [filter]);

  const handleApprove = async (userId) => {
    // --- ADDED CONFIRMATION HERE ---
    if (window.confirm("Are you sure you want to approve this user?")) {
      try {
        await updateDoc(doc(db, "jobApplications", userId), {
          isApproved: true,
        });
        // UI updates automatically via onSnapshot
      } catch (error) {
        console.error("Error approving user:", error);
        alert("Error approving user: " + error.message);
      }
    }
  };

  const handleDisapprove = async (userId) => {
    if (
      window.confirm("Are you sure you want to remove this user's approval?")
    ) {
      try {
        await updateDoc(doc(db, "jobApplications", userId), {
          isApproved: false,
        });
        // UI updates automatically via onSnapshot
      } catch (error) {
        console.error("Error removing approval:", error);
        alert("Error removing approval: " + error.message);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Training Approval
          </h1>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-fit overflow-x-auto">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 sm:px-6 py-2 font-bold text-xs uppercase tracking-wider rounded-md transition-all ${filter === "pending"
                ? "bg-red-600 text-white shadow-md shadow-red-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 sm:px-6 py-2 font-bold text-xs uppercase tracking-wider rounded-md transition-all ${filter === "approved"
                ? "bg-green-600 text-white shadow-md shadow-green-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 sm:px-6 py-2 font-bold text-xs uppercase tracking-wider rounded-md transition-all ${filter === "all"
                ? "bg-gray-900 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              All Users
            </button>
          </div>
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500">There are no users matching your current criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-red-200 transition-all flex flex-row justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {user.firstName} {user.lastName}
                      </h3>
                      <span className="text-gray-500 text-xs mt-1 break-all">{user.email || "No email"}</span>
                    </div>

                  </div>

                  <div className="space-y-2 mb-6">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 font-medium min-w-[50px]">Phone:</span>
                        {user.phone}
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 font-medium min-w-[50px]">Dept:</span>
                        {user.department}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  {user.isApproved ? (
                    <button
                      onClick={() => handleDisapprove(user.id)}
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-100"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md shadow-red-100"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
