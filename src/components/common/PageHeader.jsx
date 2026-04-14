import React, { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { Link } from "react-router-dom";

/**
 * Reusable PageHeader for Admin Panel
 * @param {string} title - Page title
 * @param {Array} breadcrumbs - [{label: 'Home', to: '/'}, {label: 'Projects'}]
 * @param {ReactNode} actions - Action buttons for the top right
 */
const PageHeader = ({ title, breadcrumbs = [], actions }) => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    // Initial check handled by layout, but keep sync here
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-red-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
