import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

import { IoIosArrowBack } from "react-icons/io";
import {
  FaUserCircle,
  FaUsers,
  FaUserGraduate,
  FaBriefcase,
  FaNewspaper,
  FaTools,
  FaProjectDiagram,
  FaCalendarAlt,
  FaClipboardList,
  FaExternalLinkAlt,
  FaTrash,
  FaCalendarCheck,
  FaFileContract,
  FaGraduationCap,
  FaCommentDots,
  FaFileAlt,
  FaUserLock,
  FaShieldAlt,
  FaUsersCog,
  FaUserTie,
  FaUserFriends,
  FaSearch,
  FaLayerGroup,
} from "react-icons/fa";

const MENU = [
  {
    to: "/admin/profile",
    label: "My Profile",
    icon: <FaUserCircle size={18} />,
    key: "profile",
  },
  {
    to: "/manage-emp",
    label: "Manage Emp",
    icon: <FaUsers size={18} />,
    key: "manage-emp",
  },
  {
    to: "/interestedcandidates",
    label: "Candidates List",
    icon: <FaUserGraduate size={18} />,
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
    icon: <FaNewspaper size={18} />,
    key: "manageblogs",
  },
  {
    to: "/manageservices",
    label: "Manage Services",
    icon: <FaTools size={18} />,
    key: "manageservices",
  },
  {
    to: "/managesubservices",
    label: "Manage Subservices",
    icon: <FaLayerGroup size={18} />,
    key: "managesubservices",
  },
  {
    to: "/manageseo",
    label: "Manage SEO",
    icon: <FaSearch size={18} />,
    key: "manageseo",
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
    icon: <FaCalendarCheck size={18} />,
    key: "managejoiningdates",
  },
  {
    to: "/manageagreements",
    label: "Manage Agreements",
    icon: <FaFileContract size={18} />,
    key: "manageagreements",
  },
  {
    to: "/manageroles",
    label: "Manage Roles",
    icon: <FaUserTie size={18} />,
    key: "manageroles",
  },
  {
    to: "/usermanagement",
    label: "User Management",
    icon: <FaUserFriends size={18} />,
    key: "usermanagement",
  },
  {
    to: "/result",
    label: "Test Result",
    icon: <FaGraduationCap size={18} />,
    key: "result",
  },
  {
    to: "/feedbacktotrainee",
    label: "Feedback To Trainee",
    icon: <FaCommentDots size={18} />,
    key: "feedbacktotrainee",
  },
  {
    to: "/trainerdailyreport",
    label: "Trainer Daily Report",
    icon: <FaFileAlt size={18} />,
    key: "trainerdailyreport",
  },
  {
    to: "/approve-users",
    label: "Training Access",
    icon: <FaUserLock size={18} />,
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
    "profile",
    "result",
    "itresult",
    "interestedcandidates",
    "managejoiningdates",
    "trainerdailyreport",
    "feedbacktotrainee",
  ],
  trainer: ["profile", "trainerdailyreport", "feedbacktotrainee"],
  user: ["profile"],
};

const SideBar = ({ isOpen, onClose }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allowedKeys, setAllowedKeys] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (!authUser?.email) {
          setUser(null);
          setRole(null);
          setAllowedKeys([]);
          setLoading(false);
          return;
        }
        setUser(authUser);
        const userEmail = authUser.email.toLowerCase().trim();
        const userSnap = await getDoc(doc(db, "users", userEmail));
        let userRole = "user";
        
        if (userSnap.exists()) {
          userRole = String(userSnap.data()?.role || "user").toLowerCase();
        } else {
          const q = query(collection(db, "jobApplications"), where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userRole = String(querySnapshot.docs[0].data()?.role || "user").toLowerCase();
          }
        }

        setRole(userRole);
        
        // Fetch role permissions or use static map
        const roleSnap = await getDoc(doc(db, "roles", userRole));
        let permissions = [];

        if (roleSnap.exists()) {
          permissions = roleSnap.data()?.permissions || [];
        } else {
          permissions = ALLOWED_KEYS_BY_ROLE[userRole] || [];
        }

        // Ensure profile is always there for logged in users
        if (userRole !== "user" && !permissions.includes("profile")) {
          permissions.push("profile");
        }

        setAllowedKeys(permissions);
      } catch (err) {
        console.error(err);
        setRole("user");
        setAllowedKeys(["profile"]);
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

  const visibleMenu = MENU.filter((item) => allowedKeys.includes(item.key));

  if (loading) {
    return (
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white transform transition-transform duration-300 z-50 md:z-20 ${isOpen ? "translate-x-0" : "-translate-x-full"
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
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#0a1225] via-[#0b1327] to-[#111b30] text-white transform transition-transform duration-300 ease-out z-50 md:z-20
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none border-r border-white/10 overflow-hidden
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

          <div className="px-6 pt-6 pb-5 border-b border-white/10">
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
            <ul className="space-y-3">
              {visibleMenu.map(({ to, label, icon, key }) => (
                <li key={key}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex items-center w-full gap-3 px-4 py-3.5 rounded-3xl transition-all duration-200 text-sm font-medium
                      ${isActive
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
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
