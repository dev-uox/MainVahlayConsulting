import React, { useState, useEffect } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { CheckCircle, User, Loader2, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, all

  // --- REAL-TIME FIRESTORE LISTENER ---
  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "jobApplications"),
      (querySnapshot) => {
        let userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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

  return (
    <div className="min-h-screen bg-gray-50 font-poppins text-gray-900 pb-12">
      <div className="p-4 md:p-8">
        <div className="max-w-8xl mx-auto">
          <header className="mb-8 pt-4">
            <h1 className="text-2xl font-bold text-red-700">
              Manage user access and platform approvals.
            </h1>
            <div className="w-16 h-1 bg-red-600 rounded-full mt-2 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  filter === "pending"
                    ? "border-b-2 border-red-600 text-red-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending Approval
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  filter === "approved"
                    ? "border-b-2 border-emerald-600 text-emerald-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Approved Users
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  filter === "all"
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Users
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-600">
              <p className="text-lg font-medium">
                No users found for this filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-red-200 transition-colors shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0 border border-red-100">
                        <User size={22} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                              {`${user.firstName || ""} ${
                                user.lastName || ""
                              }`.trim() || "No Name"}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                user.isApproved
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                              }`}
                            >
                              {user.isApproved ? (
                                <>
                                  <CheckCircle size={12} className="mr-1" />{" "}
                                  Approved
                                </>
                              ) : (
                                "Pending"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {!user.isApproved ? (
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisapprove(user.id)}
                          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ShieldOff size={16} />
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
