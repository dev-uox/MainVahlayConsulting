import React, { memo, useState } from "react";
import { Outlet } from "react-router-dom";
import { BiArrowFromLeft } from "react-icons/bi";
import SideBar from "../../components/Side_bar";

const MemoSideBar = memo(SideBar);

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen md:block flex flex-row bg-gray-100">
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
      <div className=" md:flex w-full">
        {/* Sidebar (always mounted – IMPORTANT) */}
        <MemoSideBar isOpen={sidebarOpen} onClose={setSidebarOpen} />

        {/* Main Content */}
        <main className="md:w-full w-6/7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
