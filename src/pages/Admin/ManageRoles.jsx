import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Shield, Plus, Trash2, Edit2, Check, X } from "lucide-react";

const PERMISSIONS = [
  { key: "manage-emp", label: "Manage Employees" },
  { key: "interestedcandidates", label: "Candidates List" },
  { key: "jobs", label: "Manage Jobs" },
  { key: "manageblogs", label: "Manage Blogs" },
  { key: "manageservices", label: "Manage Services" },
  { key: "manageprojects", label: "Manage Projects" },
  { key: "managejoiningdates", label: "Onboarding Dates" },
  { key: "manageagreements", label: "Manage Agreements" },
  { key: "result", label: "Test Results" },
  { key: "feedbacktotrainee", label: "Feedback To Trainee" },
  { key: "trainerdailyreport", label: "Trainer Daily Report" },
  { key: "trainingaccess", label: "Training Access" },
  { key: "manageroles", label: "Manage Roles" },
  { key: "usermanagement", label: "User Management" },
];

export default function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: "", permissions: [] });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "roles"));
      const rolesList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoles(rolesList);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    if (!currentRole.id.trim()) {
      alert("Role name is required");
      return;
    }
    try {
      await setDoc(doc(db, "roles", currentRole.id.toLowerCase().trim()), {
        permissions: currentRole.permissions
      });
      setIsEditing(false);
      setCurrentRole({ id: "", permissions: [] });
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      alert("Failed to save role");
    }
  };

  const handleDeleteRole = async (id) => {
    if (id === "admin") {
      alert("Cannot delete admin role");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the "${id}" role?`)) return;
    try {
      await deleteDoc(doc(db, "roles", id));
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      alert("Failed to delete role");
    }
  };

  const togglePermission = (key) => {
    setCurrentRole(prev => {
      const permissions = prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions };
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Roles
          </h1>
          <button
            onClick={() => {
              setIsEditing(true);
              setCurrentRole({ id: "", permissions: [] });
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New Role
          </button>
        </div>

        {isEditing && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {roles.some(r => r.id === currentRole.id) ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
              <input
                type="text"
                value={currentRole.id}
                onChange={(e) => setCurrentRole({ ...currentRole, id: e.target.value })}
                disabled={roles.some(r => r.id === currentRole.id)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100"
                placeholder="e.g. Manager"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PERMISSIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${currentRole.permissions.includes(perm.key)
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-200"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={currentRole.permissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${currentRole.permissions.includes(perm.key)
                      ? "bg-red-600 border-red-600"
                      : "bg-white border-gray-300"
                      }`}>
                      {currentRole.permissions.includes(perm.key) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Save Role
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Permissions Count</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                    No custom roles found.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900 capitalize">{role.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {role.permissions?.length || 0} Permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setCurrentRole({ id: role.id, permissions: role.permissions || [] });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.id === "admin"}
                        className={`p-2 ${role.id === "admin" ? "text-gray-300" : "text-red-600 hover:bg-red-50"} rounded-lg transition`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
