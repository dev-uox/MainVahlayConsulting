import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

import { IoIosArrowBack } from "react-icons/io";
import {
  FaUserFriends,
  FaUserTie,
  FaBriefcase,
  FaBlogger,
  FaServicestack,
  FaProjectDiagram,
  FaCalendarAlt,
  FaClipboardList,
  FaExternalLinkAlt,
  FaTrash,
} from "react-icons/fa";

const MENU = [
  {
    to: "/manage-emp",
    label: "Manage Emp",
    icon: <FaUserFriends size={18} />,
    key: "manage-emp",
  },
  {
    to: "/interestedcandidates",
    label: "Candidates List",
    icon: <FaUserTie size={18} />,
    key: "interestedcandidates",
  },
  {
    to: "/jobs",
    label: "Manage Jobs",
    icon: <FaBriefcase size={18} />,
    key: "jobs",
  },
  {
    to: "/manageblogs",
    label: "Manage Blogs",
    icon: <FaBlogger size={18} />,
    key: "manageblogs",
  },
  {
    to: "/manageservices",
    label: "Manage Services",
    icon: <FaServicestack size={18} />,
    key: "manageservices",
  },
  {
    to: "/manageprojects",
    label: "Manage Projects",
    icon: <FaProjectDiagram size={18} />,
    key: "manageprojects",
  },
  {
    to: "/managejoiningdates",
    label: "Onboarding Dates",
    icon: <FaCalendarAlt size={18} />,
    key: "managejoiningdates",
  },
  {
    to: "/manageagreements",
    label: "Manage Agreements",
    icon: <FaCalendarAlt size={18} />,
    key: "manageagreements",
  },
  {
    to: "/result",
    label: "Test Result",
    icon: <FaClipboardList size={18} />,
    key: "result",
  },
  {
    to: "/FeedbackToTrainee",
    label: "Feedback To Trainee",
    icon: <FaClipboardList size={18} />,
    key: "feedbacktotrainee",
  },
  {
    to: "/trainerdailyreport",
    label: "Trainer Daily Report",
    icon: <FaClipboardList size={18} />,
    key: "trainerdailyreport",
  },
  {
    to: "/approve-users",
    label: "Training Access",
    icon: <FaExternalLinkAlt size={18} />,
    key: "trainingaccess",
  },
  {
    to: "/trash-emp",
    label: "Trash",
    icon: <FaTrash size={18} />,
    key: "trash-emp",
  },
];

const ALLOWED_KEYS_BY_ROLE = {
  admin: [...MENU.map((m) => m.key), "trainingaccess"],
  recruiter: [
    "result",
    "itresult",
    "interestedcandidates",
    "managejoiningdates",
    "trainerdailyreport",
    "feedbacktotrainee",
  ],
  trainer: ["trainerdailyreport", "FeedbackToTrainee"],
  user: [],
};

const SideBar = ({ isOpen, onClose }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (!authUser?.email) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        setUser(authUser);
        const snap = await getDoc(
          doc(db, "users", authUser.email.toLowerCase()),
        );
        setRole(
          snap.exists()
            ? String(snap.data()?.role || "user").toLowerCase()
            : "user",
        );
      } catch (err) {
        console.error(err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024 && onClose) onClose(false);
  }, [location]);

  // Disable scroll when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
      document.body.style.position = isOpen ? "fixed" : "static";
      document.body.style.width = isOpen ? "100%" : "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isOpen]);

  const allowedKeys = ALLOWED_KEYS_BY_ROLE[role] || [];
  const visibleMenu = MENU.filter((item) => allowedKeys.includes(item.key));

  if (loading) {
    return (
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      </aside>
    );
  }

  if (!user || visibleMenu.length === 0) return null;

  return (
    <>
      <aside
        className={` fixed top-0 left-0 h-full overflow-scroll w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white
          transform transition-transform duration-300 ease-out z-50
          flex-shrink-0
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-40 border-r border-gray-700
        `}
      >
        <div className="flex flex-col h-full">
          <button
            className="lg:hidden absolute top-5 right-4 text-white hover:text-gray-300 p-2 z-50"
            onClick={() => onClose && onClose(false)}
            aria-label="Close sidebar"
          >
            <IoIosArrowBack size={26} />
          </button>

          <h1 className="p-4 text-2xl font-bold">Admin Panel</h1>

          <nav className="flex-1  py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <ul className="space-y-1 px-3">
              {visibleMenu.map(({ to, label, icon, key }) => (
                <li key={key}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 mx-1
                      ${
                        isActive
                          ? "bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20"
                          : "hover:bg-gray-800 hover:translate-x-1"
                      }`
                    }
                    onClick={() => onClose && onClose(false)}
                  >
                    <span className="mr-3 flex-shrink-0 text-gray-300">
                      {icon}
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-700 p-4 bg-gray-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {role || "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut(getAuth())}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 border border-gray-700 hover:border-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {isOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => onClose && onClose(false)}
        />
      )}
    </>
  );
};

export default SideBar;
