import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Shield, Loader2, Search, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userRolesMap, setUserRolesMap] = useState({}); // { email: role }

  useEffect(() => {
    // 1. Fetch available roles
    const fetchRoles = async () => {
      const snap = await getDocs(collection(db, "roles"));
      const rolesList = snap.docs.map(doc => doc.id);
      // Ensure "admin" and "user" are always in the list even if not in roles collection
      if (!rolesList.includes("admin")) rolesList.push("admin");
      if (!rolesList.includes("user")) rolesList.push("user");
      setRoles(rolesList.sort());
    };

    fetchRoles();

    // 2. Real-time listener for job applications
    const unsubscribeApps = onSnapshot(collection(db, "jobApplications"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    // 3. Real-time listener for roles (from users collection)
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const rolesMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          rolesMap[data.email.toLowerCase().trim()] = data.role;
        }
      });
      setUserRolesMap(rolesMap);
    });

    return () => {
      unsubscribeApps();
      unsubscribeUsers();
    };
  }, []);

  const handleRoleChange = async (userEmail, newRole) => {
    if (!userEmail) {
      alert("User email is missing");
      return;
    }
    if (!window.confirm(`Are you sure you want to change the role of ${userEmail} to "${newRole}"?`)) return;
    try {
      // Use setDoc with merge: true to create the document if it doesn't exist
      await setDoc(doc(db, "users", userEmail.toLowerCase().trim()), {
        role: newRole,
        email: userEmail.toLowerCase().trim()
      }, { merge: true });
      alert("Role updated successfully");
    } catch (err) {
      console.error("Error updating user role:", err);
      alert("Failed to update user role");
    }
  };

  const filteredUsers = users.filter(u =>
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalUsers = filteredUsers.length;
  const pageCount = Math.ceil(totalUsers / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalUsers);
  const currentPageData = filteredUsers.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (page < pageCount - 1) setPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(prev => prev - 1);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery, rowsPerPage]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            User Role Management
          </h1>


        </div>
        <div className="relative w-full md:w-ful p-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 outline-none transition"
          />
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assign New Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((user) => {
                    const currentRole = userRolesMap[user.email?.toLowerCase().trim()] || user.role || 'user';
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold uppercase">
                              {user.email?.[0] || "?"}
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-gray-900">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${currentRole === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : currentRole === 'recruiter'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                            }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {currentRole}
                          </span>
                        </td>
                        <td className="px-6 py-2">
                          <select
                            value={currentRole}
                            onChange={(e) => handleRoleChange(user.email, e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 outline-none"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-green-600 text-xs font-bold gap-1">
                            <UserCheck className="w-4 h-4" />
                            Active
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalUsers > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-red-500"
                >
                  {[5, 10, 25, 50].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600 font-medium">
                  {startIndex + 1}-{endIndex} of {totalUsers}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                    className={`p-1 rounded-lg border transition ${page === 0
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-gray-600 border-gray-300 hover:bg-white hover:text-red-600'
                      }`}
                    type="button"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page >= pageCount - 1}
                    className={`p-1 rounded-lg border transition ${page >= pageCount - 1
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-gray-600 border-gray-300 hover:bg-white hover:text-red-600'
                      }`}
                    type="button"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
