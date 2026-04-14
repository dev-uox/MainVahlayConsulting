import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaBriefcase, FaBlogger, FaServicestack, FaProjectDiagram } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const Aside = () => {
 

  return (
    <aside className=" text-white h-screen ">
      {/* Desktop Footer (visible on md and larger) */}
      <div className="hidden bg-gray-900 md:block w-1/5 h-screen p-6 ">
      <h2 className="text-2xl font-bold mb-6">Admin Portal</h2>
      <nav>
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/manage-emp"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaUserFriends size={20} />
              </span>
              Manage Employee
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaBriefcase size={20} />
              </span>
              Manage Jobs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageblogs"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaBlogger size={20} />
              </span>
              Manage Blogs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageservices"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaServicestack size={20} />
              </span>
              Manage Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageprojects"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaProjectDiagram size={20} />
              </span>
              Manage Projects
            </NavLink>
          </li>
        </ul>
      </nav>
      </div>

      {/* Mobile Footer (visible on small screens) */}
      <div className="block md:hidden bg-gray-900 w-12 h-screen">
        
        <nav className=''>
        <ul className="space-y-8 ">
          <li>
            <NavLink
              to="/manage-emp"
              className={({ isActive }) =>
                ` px-4 py-2  rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaUserFriends size={20} />
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaBriefcase size={20} />
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageblogs"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaBlogger size={20} />
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageservices"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaServicestack size={20} />
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manageprojects"
              className={({ isActive }) =>
                ` px-4 py-2 rounded flex items-center ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">
                <FaProjectDiagram size={20} />
              </span>
            </NavLink>
          </li>
        </ul>
      </nav>
        
      </div>
    </aside>
  );
};

export default Aside;
