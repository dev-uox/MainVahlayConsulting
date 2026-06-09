import React, { memo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/Side_bar";
import { BiArrowFromLeft } from "react-icons/bi";

const MemoSideBar = memo(SideBar);

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Global Dark Mode Persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || 
        (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-slate-900">
      {/* Sidebar (always mounted) */}
      <MemoSideBar isOpen={sidebarOpen} onClose={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ Mobile Header (Sticky) */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-4 h-16 sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <img src="/assets/logo1.png" alt="Logo" className="h-8 w-auto" />
             <span className="font-bold text-red-600 text-sm">ADMIN PANEL</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Open Sidebar"
          >
            <BiArrowFromLeft className="text-2xl" />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
