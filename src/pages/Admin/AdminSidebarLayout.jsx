import React, { memo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/Side_bar";

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* ✅ Mobile Toggle Button (Sticky) */}
      <div className="md:hidden w-4 h-12 flex items-center justify-center bg-red-600 sticky top-20 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white text-3xl leading-none"
          aria-label="Open Sidebar"
        >
          {">"}
        </button>
      </div>

      {/* ✅ Layout */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar (always mounted – IMPORTANT) */}
        <MemoSideBar isOpen={sidebarOpen} onClose={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
