import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const TRAINING_DAYS_LIMIT = 8;
const ATTENDANCE_PRESENT = "Present";
const ATTENDANCE_ABSENT = "Absent";

/* ---------- helpers ---------- */
const getDayNameFromDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return "";
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[d.getDay()];
};

const makeReportId = () =>
  globalThis.crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

// Normalize dayNumber based on Present count (useful after delete/edit attendance changes)
const normalizeReports = (reports = []) => {
  const sorted = [...reports].sort((a, b) => {
    const at =
      (a?.createdAt?.toMillis?.() ?? 0) ||
      (a?.date ? new Date(`${a.date}T00:00:00`).getTime() : 0);
    const bt =
      (b?.createdAt?.toMillis?.() ?? 0) ||
      (b?.date ? new Date(`${b.date}T00:00:00`).getTime() : 0);
    return at - bt;
  });

  let present = 0;
  return sorted.map((r) => {
    const isPresent = r.attendance === ATTENDANCE_PRESENT;
    if (isPresent) present += 1;
    return {
      ...r,
      reportId: r.reportId || makeReportId(),
      dayName: r.dayName || getDayNameFromDate(r.date),
      dayNumber: isPresent ? present : present,
    };
  });
};

export default function ReportsPage() {
  const { batchId, email } = useParams();
  const traineeEmail = email ? decodeURIComponent(email) : null;

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [singleTrainee, setSingleTrainee] = useState(null);

  // Edit Modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { traineeEmail, reportId }
  const [editData, setEditData] = useState(null); // report object copy

  // load batch info
  useEffect(() => {
    if (!batchId) return;
    (async () => {
      const bSnap = await getDoc(doc(db, "trainingBatches", batchId));
      if (bSnap.exists()) setSelectedBatch({ id: batchId, ...bSnap.data() });
    })();
  }, [batchId]);

  // load employees for "all"
  useEffect(() => {
    if (!batchId || traineeEmail) return;
    (async () => {
      const eSnap = await getDocs(
        collection(db, "trainingBatches", batchId, "employees")
      );
      const list = eSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Normalize reportId/dayName/dayNumber for UI stability (doesn't write back)
      const normalized = list.map((emp) => ({
        ...emp,
        reports: normalizeReports(emp.reports || []),
      }));
      setEmployees(normalized);
    })();
  }, [batchId, traineeEmail]);

  // load single trainee for "view reports"
  useEffect(() => {
    if (!batchId || !traineeEmail) return;
    (async () => {
      const tSnap = await getDoc(
        doc(db, "trainingBatches", batchId, "employees", traineeEmail)
      );
      if (tSnap.exists()) {
        const data = tSnap.data();
        setSingleTrainee({
          id: traineeEmail,
          ...data,
          reports: normalizeReports(data.reports || []),
        });
      } else {
        setSingleTrainee(null);
      }
    })();
  }, [batchId, traineeEmail]);

  /* ---------- actions (edit/delete) ---------- */
  const openEdit = (traineeEmailForRow, report) => {
    const fixed = {
      ...report,
      reportId: report.reportId || makeReportId(),
      dayName: report.dayName || getDayNameFromDate(report.date),
    };
    setEditTarget({ traineeEmail: traineeEmailForRow, reportId: fixed.reportId });
    setEditData(fixed);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!batchId || !editTarget?.traineeEmail || !editTarget?.reportId || !editData)
      return;

    const empRef = doc(
      db,
      "trainingBatches",
      batchId,
      "employees",
      editTarget.traineeEmail
    );

    // Get current reports from local state (fast) — fallback to empty
    const currentReports =
      traineeEmail && singleTrainee?.id === editTarget.traineeEmail
        ? singleTrainee?.reports || []
        : (employees.find((e) => e.email === editTarget.traineeEmail)?.reports ||
          []);

    let updated = currentReports.map((r) =>
      r.reportId === editTarget.reportId
        ? {
          ...r,
          ...editData,
          dayName: getDayNameFromDate(editData.date),
          updatedAt: Timestamp.now(),
        }
        : r
    );

    // If attendance is Absent, clear fields
    updated = updated.map((r) => {
      if (r.reportId !== editTarget.reportId) return r;
      if (r.attendance === ATTENDANCE_ABSENT) {
        return {
          ...r,
          behaviour: "",
          attitude: "",
          communication: "",
          learningSpeed: "",
          callPractice: "",
          testScore: "",
          approval: "",
          comments: "",
        };
      }
      return r;
    });

    const normalized = normalizeReports(updated);

    await updateDoc(empRef, { reports: normalized });

    // update local UI
    if (traineeEmail && singleTrainee?.id === editTarget.traineeEmail) {
      setSingleTrainee((p) => (p ? { ...p, reports: normalized } : p));
    } else {
      setEmployees((prev) =>
        prev.map((e) =>
          e.email === editTarget.traineeEmail ? { ...e, reports: normalized } : e
        )
      );
    }

    setEditOpen(false);
    setEditTarget(null);
    setEditData(null);
  };

  const deleteReport = async (traineeEmailForRow, report) => {
    if (!batchId || !traineeEmailForRow) return;

    const reportId = report?.reportId;
    if (!reportId) {
      alert("ReportId missing. Please re-open this page or re-save reports.");
      return;
    }

    const ok = window.confirm("Delete this report? This cannot be undone.");
    if (!ok) return;

    const empRef = doc(db, "trainingBatches", batchId, "employees", traineeEmailForRow);

    const currentReports =
      traineeEmail && singleTrainee?.id === traineeEmailForRow
        ? singleTrainee?.reports || []
        : (employees.find((e) => e.email === traineeEmailForRow)?.reports || []);

    const filtered = currentReports.filter((r) => r.reportId !== reportId);
    const normalized = normalizeReports(filtered);

    await updateDoc(empRef, { reports: normalized });

    // update local UI
    if (traineeEmail && singleTrainee?.id === traineeEmailForRow) {
      setSingleTrainee((p) => (p ? { ...p, reports: normalized } : p));
    } else {
      setEmployees((prev) =>
        prev.map((e) =>
          e.email === traineeEmailForRow ? { ...e, reports: normalized } : e
        )
      );
    }
  };

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
                Manage Reports
              </h1>

            </div>
            <p className="text-gray-600 mt-1">
              {selectedBatch
                ? `${selectedBatch.batchName || "Batch"} • Started on ${selectedBatch.batchDate || "N/A"}`
                : "Analyze trainee progress and attendance statistics"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/trainerdailyreport"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>

            {traineeEmail && (
              <Link
                to={`/trainer-reports/${batchId}`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold transition-all shadow-md shadow-red-100"
              >
                View Batch Summary
              </Link>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6">
          {/* SINGLE TRAINEE VIEW */}
          {traineeEmail ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {singleTrainee
                        ? `${singleTrainee.firstName || ""} ${singleTrainee.lastName || ""}`
                        : "Trainee not found"}
                    </h2>
                    <p className="text-sm text-gray-500">{traineeEmail}</p>
                  </div>
                  {singleTrainee && (
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Attendance:</span>
                      <span className="text-gray-900 text-sm font-bold">
                        {singleTrainee.reports?.filter(r => r.attendance === "Present").length}/{TRAINING_DAYS_LIMIT} Days
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <ReportsTable
                  traineeEmail={traineeEmail}
                  reports={singleTrainee?.reports || []}
                  onEdit={(report) => openEdit(traineeEmail, report)}
                  onDelete={(report) => deleteReport(traineeEmail, report)}
                />
              </div>
            </div>
          ) : (
            /* ALL REPORTS VIEW */
            <div className="bg-transparent">
              <AllReports
                employees={employees}
                onEdit={(empEmail, report) => openEdit(empEmail, report)}
                onDelete={(empEmail, report) => deleteReport(empEmail, report)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editOpen && editData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Modify Report Entry</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-white transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Date">
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    value={editData.date || ""}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Attendance">
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                    value={editData.attendance || ATTENDANCE_PRESENT}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, attendance: e.target.value }))
                    }
                  >
                    <option value={ATTENDANCE_PRESENT}>Present</option>
                    <option value={ATTENDANCE_ABSENT}>Absent</option>
                  </select>
                </Field>

                {editData.attendance === ATTENDANCE_PRESENT && (
                  <>
                    <SmallInput
                      label="Behaviour"
                      value={editData.behaviour || ""}
                      onChange={(v) => setEditData((p) => ({ ...p, behaviour: v }))}
                    />
                    <SmallInput
                      label="Attitude"
                      value={editData.attitude || ""}
                      onChange={(v) => setEditData((p) => ({ ...p, attitude: v }))}
                    />
                    <SmallInput
                      label="Communication"
                      value={editData.communication || ""}
                      onChange={(v) =>
                        setEditData((p) => ({ ...p, communication: v }))
                      }
                    />
                    <SmallInput
                      label="Learning Speed"
                      value={editData.learningSpeed || ""}
                      onChange={(v) =>
                        setEditData((p) => ({ ...p, learningSpeed: v }))
                      }
                    />
                    <SmallInput
                      label="Call Practice"
                      value={editData.callPractice || ""}
                      onChange={(v) =>
                        setEditData((p) => ({ ...p, callPractice: v }))
                      }
                    />
                    <SmallInput
                      label="Test Score"
                      value={editData.testScore || ""}
                      onChange={(v) => setEditData((p) => ({ ...p, testScore: v }))}
                    />
                    <SmallInput
                      label="Approve"
                      value={editData.approval || ""}
                      onChange={(v) => setEditData((p) => ({ ...p, approval: v }))}
                    />

                    <Field label="Comments" full>
                      <textarea
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg"
                        value={editData.comments || ""}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, comments: e.target.value }))
                        }
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-100"
              >
                Update Documentation
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-all hover:bg-gray-50 hover:border-gray-400"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Components ---------- */

function ReportsTable({ traineeEmail, reports, onEdit, onDelete }) {
  const [openComment, setOpenComment] = useState(null);

  if (!reports || reports.length === 0) {
    return (
      <div className="text-gray-600 text-sm text-center p-6">No reports found.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-xs border-collapse">
        <thead className="bg-gray-50">
          <tr className="text-gray-500">
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Day#</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Day</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Behaviour</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Attitude</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Comm.</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Learning</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Call Practice</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Test</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Approve</th>
            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Comments</th>
            <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr
              key={r.reportId || idx}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-4 py-4"><span className="font-bold text-gray-900">{r.dayNumber || "-"}</span></td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-600 font-medium">{r.date || "-"}</td>
              <td className="px-4 py-4 text-gray-600">{r.dayName || "-"}</td>
              <td className="px-4 py-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${r.attendance === ATTENDANCE_PRESENT
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
                  }`}>
                  {r.attendance || "-"}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-700">{r.behaviour || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.attitude || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.communication || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.learningSpeed || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.callPractice || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.testScore || "-"}</td>
              <td className="px-4 py-4 text-gray-700">{r.approval || "-"}</td>

              <td className="px-4 py-4">
                {r.comments ? (
                  <button
                    type="button"
                    onClick={() => setOpenComment(r.comments)}
                    className="text-[11px] font-bold text-blue-600 hover:blue-700 uppercase tracking-wider"
                  >
                    Read
                  </button>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>

              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit?.(r)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Edit Report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(r)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                    title="Delete Report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Comment Modal */}
      {openComment && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenComment(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Full Comment</h3>
              <button
                onClick={() => setOpenComment(null)}
                className="text-xl font-bold text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="whitespace-pre-wrap break-words text-sm text-gray-800 max-h-[60vh] overflow-y-auto">
              {openComment}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AllReports({ employees, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(null);

  const employeesWithReports = useMemo(
    () => (employees || []).filter((e) => (e.reports || []).length > 0),
    [employees]
  );

  if (!employeesWithReports.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
        No reports found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {employeesWithReports.map((emp) => {
        const reports = emp.reports || [];
        const presentDays = reports.filter((r) => r.attendance === "Present").length;
        const isOpen = expanded === emp.email;

        return (
          <div
            key={emp.email}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:border-red-200"
          >
            <div
              className={`p-6 cursor-pointer transition-colors ${isOpen ? "bg-gray-50 border-b border-gray-100" : "hover:bg-gray-50"}`}
              onClick={() => setExpanded((p) => (p === emp.email ? null : emp.email))}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold shrink-0 border border-red-100">
                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{emp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                    <span className="text-sm font-bold text-gray-900">
                      {presentDays}/{TRAINING_DAYS_LIMIT} <span className="text-gray-400 font-normal">Present</span>
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isOpen ? "rotate-180 bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="p-6">
                <ReportsTable
                  traineeEmail={emp.email}
                  reports={reports}
                  onEdit={(report) => onEdit?.(emp.email, report)}
                  onDelete={(report) => onDelete?.(emp.email, report)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );


}

/* ---------- Small UI helpers ---------- */

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function SmallInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input
        className="w-full p-3 border border-gray-200 rounded-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
