import React from "react";

/**
 * Unified admin page wrapper — use inside AdminSidebarLayout.
 */
export default function AdminPageShell({
  title,
  subtitle,
  actions,
  children,
  wide = false,
}) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
      <header className="mb-6 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 border-b border-red-100 bg-red-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-red-600 sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </header>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function AdminCard({ title, subtitle, children, className = "", noPadding = false }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${noPadding ? "" : "p-5 sm:p-6"} ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminTable({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="admin-table w-full text-left">{children}</table>
      </div>
    </div>
  );
}

export const adminInputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200";

export const adminBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50";

export const adminBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200";
