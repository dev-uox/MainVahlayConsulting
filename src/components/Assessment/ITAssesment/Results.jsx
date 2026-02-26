import React, { useState, useEffect } from "react";
import { db, storage } from "../../../firebaseConfig";
import { Link } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  ref as storageRef,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Side_Bar from "../../Side_bar";

export default function ResultsTable() {
  const [users, setUsers] = useState([]);
  const [audioURLs, setAudioURLs] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalUsers, setOriginalUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setOriginalUsers(users);
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    async function fetchAudio() {
      const urls = {};
      for (const user of users) {
        for (const sec of ["speaking", "selling", "problemSolving"]) {
          if (user[sec]?.audioPath) {
            try {
              const u = await getDownloadURL(
                storageRef(storage, user[sec].audioPath)
              );
              urls[user.id] = { ...(urls[user.id] || {}), [sec]: u };
            } catch {}
          }
        }
      }
      setAudioURLs(urls);
    }
    if (users.length) fetchAudio();
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "campusDriveIt"));
    const usersList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const sortedUsers = usersList.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name)
    );
    setUsers(sortedUsers);
    setLoading(false);
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    const filtered = originalUsers.filter((user) =>
      user.email?.toLowerCase().includes(search)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    await deleteDoc(doc(db, "campusDriveIt", user.id));
    setUsers((prev) => prev.filter((u) => u.id !== user.id));

    for (const sec of ["speaking", "selling", "problemSolving"]) {
      if (user[sec]?.audioPath) {
        try {
          await deleteObject(storageRef(storage, user[sec].audioPath));
        } catch (error) {
          console.error(`Error deleting audio for ${user.id}:`, error);
        }
      }
    }

    setAudioURLs((prev) => {
      const newUrls = { ...prev };
      delete newUrls[user.id];
      return newUrls;
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Loading…</p>
      </div>
    );

  return (
  <div className="min-h-screen bg-gray-100 flex">
      
      <main className="flex-1">
        
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
          Manage IT-Test Result
        </h1>

        {/* Content Container */}
        <div className=" sm:p-4 md:p-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by email"
              className="border border-gray-300 p-2 sm:p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {user.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {user.number || user.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {user.email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-4">
                          <Link
                            to={`/itresults/${user.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white shadow rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium">
                        Name
                      </p>
                      <p className="mt-1 text-base text-gray-800 font-medium">
                        {user.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium">
                        Phone
                      </p>
                      <p className="mt-1 text-base text-gray-800">
                        {user.number || user.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium">
                        Email
                      </p>
                      <p className="mt-1 text-base text-gray-800 break-all">
                        {user.email || "-"}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 uppercase font-medium mb-2">
                        Actions
                      </p>
                      <div className="flex gap-4">
                        <Link
                          to={`/itresults/${user.id}`}
                          className="flex-1 text-center py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(user)}
                          className="flex-1 text-center py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
