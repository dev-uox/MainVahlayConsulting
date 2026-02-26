import React, { useState } from "react";
import { Link } from "react-router-dom";

const Aside = () => {
  // State to toggle the aside section
  const [isAsideOpen, setIsAsideOpen] = useState(false);

  // Function to toggle the aside section
  const toggleAside = () => setIsAsideOpen(!isAsideOpen);

  return (
    <div className="relative">
      {/* Arrow Button */}
      {!isAsideOpen && (
        <button
          className="fixed top-1/2 right-2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-lg z-50"
          onClick={toggleAside}
        >
          ➤
        </button>
      )}

      {/* Aside Section */}
      <aside
        className={`fixed top-0 right-0 h-full bg-red-600 shadow-lg p-4 w-3/4 md:w-1/4 transform ${
          isAsideOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-40`}
      >
        <button
          className="absolute top-4 left-4 bg-white text-red-600 p-2 rounded-full shadow-lg"
          onClick={toggleAside}
        >
          ✖
        </button>
        <h2 className="text-xl text-white font-semibold mb-4 text-center">Topics</h2>
        <ul className=" list-disc marker:text-white  space-y-4 ms-2">
          <li>
            <Link
              to="/trendpage"
              className="text-white hover:text-blue-800 font-medium"
            >
              5 Trends Shaping the Future of Telecom Sales
            </Link>
          </li>
          <li>
            <Link
              to="/leadgen"
              className="text-white hover:text-blue-800 font-medium"
            >
              Effective Lead Generation Strategies for Telecom Businesses
            </Link>
          </li>
          <li>
            <Link
              to="/dataanalyst"
              className="text-white hover:text-blue-800 font-medium"
            >
              How Data Analytics Can Transform Business Management
            </Link>
          </li>
          <li>
            <Link
              to="/teams"
              className="text-white hover:text-blue-800 font-medium"
            >
              Building Resilient Teams: Leadership Tips for Managers
            </Link>
          </li>
          <li>
            <Link
              to="/benefits"
              className="text-white hover:text-blue-800 font-medium"
            >
              The Benefits of Outsourcing Business Functions for Efficiency
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Aside;
