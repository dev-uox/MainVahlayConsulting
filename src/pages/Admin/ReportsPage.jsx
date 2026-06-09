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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 sm:p-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-red-700 truncate">
            {traineeEmail ? "Trainee Reports" : "Batch Reports"}
          </h1>
          <p className="text-sm text-slate-500 truncate">
            {selectedBatch
              ? `${selectedBatch.batchName || ""} • ${selectedBatch.batchDate || ""}`
              : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/trainerdailyreport"
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
          >
            Back
          </Link>

          {traineeEmail && (
            <Link
              to={`/trainer-reports/${batchId}`}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              View All
            </Link>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6">
        {/* SINGLE TRAINEE VIEW */}
        {traineeEmail ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <div className="font-semibold text-gray-900">
                {singleTrainee
                  ? `${singleTrainee.firstName || ""} ${singleTrainee.lastName || ""}`
                  : "Trainee not found"}
              </div>
              <div className="text-sm text-gray-600">{traineeEmail}</div>
            </div>

            <div className="p-4">
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
          <AllReports
            employees={employees}
            onEdit={(empEmail, report) => openEdit(empEmail, report)}
            onDelete={(empEmail, report) => deleteReport(empEmail, report)}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && editData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Edit Report</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-xl font-bold text-gray-600"
              >
                ×
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

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg font-medium"
              >
                Cancel
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
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-red-50 text-gray-800">
            <th className="px-2 py-2 text-left font-medium">Day#</th>
            <th className="px-2 py-2 text-left font-medium">Date</th>
            <th className="px-2 py-2 text-left font-medium">Day</th>
            <th className="px-2 py-2 text-left font-medium">Attendance</th>
            <th className="px-2 py-2 text-left font-medium">Behaviour</th>
            <th className="px-2 py-2 text-left font-medium">Attitude</th>
            <th className="px-2 py-2 text-left font-medium">Communication</th>
            <th className="px-2 py-2 text-left font-medium">Learning</th>
            <th className="px-2 py-2 text-left font-medium">Call Practice</th>
            <th className="px-2 py-2 text-left font-medium">Test Score</th>
            <th className="px-2 py-2 text-left font-medium">Approve</th>
            <th className="px-2 py-2 text-left font-medium">Comments</th>
            <th className="px-2 py-2 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr
              key={r.reportId || idx}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-2 py-2 font-medium">{r.dayNumber ?? "-"}</td>
              <td className="px-2 py-2 whitespace-nowrap">{r.date || "-"}</td>
              <td className="px-2 py-2">{r.dayName || "-"}</td>
              <td className="px-2 py-2">{r.attendance || "-"}</td>
              <td className="px-2 py-2">{r.behaviour || "-"}</td>
              <td className="px-2 py-2">{r.attitude || "-"}</td>
              <td className="px-2 py-2">{r.communication || "-"}</td>
              <td className="px-2 py-2">{r.learningSpeed || "-"}</td>
              <td className="px-2 py-2">{r.callPractice || "-"}</td>
              <td className="px-2 py-2">{r.testScore || "-"}</td>
              <td className="px-2 py-2">{r.approval || "-"}</td>

              <td className="px-2 py-2">
                {r.comments ? (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenComment(r.comments)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      View
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              <td className="px-2 py-2 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit?.(r)}
                    className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(r)}
                    className="px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium"
                  >
                    Delete
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
    <div className="space-y-3">
      {employeesWithReports.map((emp) => {
        const reports = emp.reports || [];
        const presentDays = reports.filter((r) => r.attendance === "Present").length;
        const isOpen = expanded === emp.email;

        return (
          <div
            key={emp.email}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
              onClick={() => setExpanded((p) => (p === emp.email ? null : emp.email))}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-sm text-gray-600 truncate">{emp.email}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Reports: <b>{reports.length}</b> • Present:{" "}
                    <b>
                      {presentDays}/{TRAINING_DAYS_LIMIT}
                    </b>
                  </div>
                </div>
                <div className="text-gray-500">{isOpen ? "▲" : "▼"}</div>
              </div>
            </div>

            {isOpen && (
              <div className="p-4">
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
