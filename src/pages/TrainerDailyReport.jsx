import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
// src/pages/TrainerDailyReport/index.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ClearableInput from "../components/common/ClearableInput";

const TRAINING_DAYS_LIMIT = 8;
const ATTENDANCE_PRESENT = "Present";
const ATTENDANCE_ABSENT = "Absent";

// Tab constants
const TAB_RUNNING = "running";
const TAB_APPROVED = "approved";
const TAB_DENIED = "denied";
const TAB_LEFT = "left";

export default function TrainerDailyReport() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // UI states
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showEditBatchForm, setShowEditBatchForm] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [showAddEmployeePopup, setShowAddEmployeePopup] = useState(false);
  const [showManualTraineePopup, setShowManualTraineePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showViewReportPopup, setShowViewReportPopup] = useState(false);
  const [showBatchReportsPopup, setShowBatchReportsPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewReportsFor, setViewReportsFor] = useState(null);

  // Lists states
  const [showListsPopup, setShowListsPopup] = useState(false);
  const [approvedList, setApprovedList] = useState([]);
  const [deniedList, setDeniedList] = useState([]);
  const [leftList, setLeftList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(TAB_RUNNING);

  // Manual batch date
  const [batchDate, setBatchDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  // Edit batch form state
  const [editBatchData, setEditBatchData] = useState({
    batchName: "",
    batchDate: "",
  });

  // Manual trainee form state
  const [manualTraineeData, setManualTraineeData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
  });

  const [reportData, setReportData] = useState({
    date: "",
    dayNumber: "",
    attendance: ATTENDANCE_PRESENT,
    behaviour: "",
    attitude: "",
    communication: "",
    learningSpeed: "",
    callPractice: "",
    testScore: "",
    approval: "",
    dayName: "",
    comments: "",
  });

  // Filters
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [addEmpSearch, setAddEmpSearch] = useState("");
  const [hideExistingInBatch, setHideExistingInBatch] = useState(true);

  /* ---------------- FETCH BATCHES ---------------- */
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const snap = await getDocs(collection(db, "trainingBatches"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort by date descending (newest first)
    data.sort((a, b) => {
      const dateA = a.batchDate || a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.batchDate || b.createdAt?.toDate?.() || new Date(0);
      return new Date(dateB) - new Date(dateA);
    });
    setBatches(data);
  };

  /* ---------------- FETCH LISTS ---------------- */
  const fetchLists = async () => {
    if (!selectedBatch) return;

    setLoadingLists(true);
    try {
      // Fetch approved list
      const approvedSnap = await getDocs(
        collection(db, "trainingBatches", selectedBatch.id, "approved")
      );
      const approvedData = approvedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApprovedList(approvedData);

      // Fetch denied list
      const deniedSnap = await getDocs(
        collection(db, "trainingBatches", selectedBatch.id, "denied")
      );
      const deniedData = deniedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDeniedList(deniedData);

      // Fetch left list
      const leftSnap = await getDocs(
        collection(db, "trainingBatches", selectedBatch.id, "left")
      );
      const leftData = leftSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLeftList(leftData);

      setShowListsPopup(true);
    } catch (err) {
      console.error("Fetch lists error:", err);
      alert("Failed to load lists.");
    } finally {
      setLoadingLists(false);
    }
  };

  /* ---------------- ADD TO LIST ---------------- */
  const addToList = async (emp, listType) => {
    if (!selectedBatch || !emp) return;

    try {
      // Determine which list to add to
      let listPath = "";
      let listState = null;
      let setListState = null;

      switch (listType) {
        case "approved":
          listPath = "approved";
          listState = approvedList;
          setListState = setApprovedList;
          break;
        case "denied":
          listPath = "denied";
          listState = deniedList;
          setListState = setDeniedList;
          break;
        case "left":
          listPath = "left";
          listState = leftList;
          setListState = setLeftList;
          break;
        default:
          return;
      }

      // Check if already in list
      const exists = listState.some(item => item.email === emp.email);
      if (exists) {
        // Already in list, just update
        return;
      }

      // Add to Firebase list
      await setDoc(
        doc(db, "trainingBatches", selectedBatch.id, listPath, emp.email),
        {
          email: emp.email,
          firstName: emp.firstName,
          lastName: emp.lastName || "",
          phone: emp.phone || "",
          department: emp.department || "Not specified",
          reports: emp.reports || [],
          finalDecision: listType.charAt(0).toUpperCase() + listType.slice(1),
          addedAt: Timestamp.now(),
          source: emp.source || "database",
        }
      );

      // Update local state
      setListState(prev => [...prev, {
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName || "",
        phone: emp.phone || "",
        department: emp.department || "Not specified",
        reports: emp.reports || [],
        finalDecision: listType.charAt(0).toUpperCase() + listType.slice(1),
        addedAt: Timestamp.now(),
        source: emp.source || "database",
      }]);
    } catch (err) {
      console.error("Add to list error:", err);
      alert(`Failed to add trainee to ${listType} list.`);
    }
  };

  /* ---------------- REMOVE FROM LIST ---------------- */
  const removeFromList = async (email, listType) => {
    if (!selectedBatch || !email) return;

    try {
      // Determine which list to remove from
      let listPath = "";
      let listState = null;
      let setListState = null;

      switch (listType) {
        case "approved":
          listPath = "approved";
          listState = approvedList;
          setListState = setApprovedList;
          break;
        case "denied":
          listPath = "denied";
          listState = deniedList;
          setListState = setDeniedList;
          break;
        case "left":
          listPath = "left";
          listState = leftList;
          setListState = setLeftList;
          break;
        default:
          return;
      }

      // Remove from Firebase
      await deleteDoc(
        doc(db, "trainingBatches", selectedBatch.id, listPath, email)
      );

      // Update local state
      setListState(prev => prev.filter(item => item.email !== email));

      alert(`Trainee removed from ${listType} list successfully!`);
    } catch (err) {
      console.error("Remove from list error:", err);
      alert(`Failed to remove trainee from ${listType} list.`);
    }
  };

  /* ---------------- CREATE BATCH ---------------- */
  const createBatch = async () => {
    if (!batchDate) {
      alert("Please select a batch date.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "trainingBatches"), {
        batchName: `Batch – ${batchDate}`,
        batchDate,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setBatches((prev) => [
        {
          id: docRef.id,
          batchName: `Batch – ${batchDate}`,
          batchDate,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        ...prev,
      ]);

      setShowBatchForm(false);
      setBatchDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Create batch error:", err);
      alert("Failed to create batch.");
    }
  };

  /* ---------------- EDIT BATCH ---------------- */
  const openEditBatchForm = (batch) => {
    setBatchToEdit(batch);
    setEditBatchData({
      batchName: batch.batchName || `Batch – ${batch.batchDate || ""}`,
      batchDate: batch.batchDate || "",
    });
    setShowEditBatchForm(true);
  };

  const updateBatch = async () => {
    if (!batchToEdit) return;

    if (!editBatchData.batchName.trim()) {
      alert("Please enter a batch name.");
      return;
    }

    if (!editBatchData.batchDate) {
      alert("Please select a batch date.");
      return;
    }

    try {
      const batchRef = doc(db, "trainingBatches", batchToEdit.id);
      await updateDoc(batchRef, {
        batchName: editBatchData.batchName,
        batchDate: editBatchData.batchDate,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === batchToEdit.id
            ? {
              ...batch,
              batchName: editBatchData.batchName,
              batchDate: editBatchData.batchDate,
              updatedAt: Timestamp.now(),
            }
            : batch
        )
      );

      // If this batch is currently selected, update it
      if (selectedBatch && selectedBatch.id === batchToEdit.id) {
        setSelectedBatch((prev) => ({
          ...prev,
          batchName: editBatchData.batchName,
          batchDate: editBatchData.batchDate,
        }));
      }

      setShowEditBatchForm(false);
      setBatchToEdit(null);
      alert("Batch updated successfully!");
    } catch (err) {
      console.error("Update batch error:", err);
      alert("Failed to update batch.");
    }
  };

  /* ---------------- DELETE BATCH ---------------- */
  const openDeleteConfirm = (batch) => {
    setBatchToDelete(batch);
    setShowDeleteConfirm(true);
  };

  const deleteBatch = async () => {
    if (!batchToDelete) return;

    try {
      // Delete employees subcollection
      const employeesSnap = await getDocs(
        collection(db, "trainingBatches", batchToDelete.id, "employees")
      );
      const deletePromises = employeesSnap.docs.map((empDoc) =>
        deleteDoc(
          doc(db, "trainingBatches", batchToDelete.id, "employees", empDoc.id)
        )
      );

      // Delete lists subcollections
      const lists = ["approved", "denied", "left"];
      for (const list of lists) {
        const listSnap = await getDocs(
          collection(db, "trainingBatches", batchToDelete.id, list)
        );
        listSnap.docs.forEach((doc) => {
          deletePromises.push(
            deleteDoc(doc.ref)
          );
        });
      }

      await Promise.all(deletePromises);

      // Delete the batch itself
      await deleteDoc(doc(db, "trainingBatches", batchToDelete.id));

      // Update local state
      setBatches((prev) => prev.filter((batch) => batch.id !== batchToDelete.id));

      // If the deleted batch was currently selected, clear selection
      if (selectedBatch && selectedBatch.id === batchToDelete.id) {
        setSelectedBatch(null);
        setEmployees([]);
        setApprovedList([]);
        setDeniedList([]);
        setLeftList([]);
      }

      setShowDeleteConfirm(false);
      setBatchToDelete(null);
      alert("Batch deleted successfully!");
    } catch (err) {
      console.error("Delete batch error:", err);
      alert("Failed to delete batch. Please try again.");
    }
  };

  /* ---------------- OPEN BATCH ---------------- */
  const openBatch = async (batch) => {
    setSelectedBatch(batch);
    setIsSidebarOpen(false);
    setActiveTab(TAB_RUNNING); // Reset to Running tab when opening batch

    const snap = await getDocs(
      collection(db, "trainingBatches", batch.id, "employees")
    );

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEmployees(list);
  };

  /* ---------------- FETCH AVAILABLE EMPLOYEES ---------------- */
  const fetchAvailableEmployees = async () => {
    const snap = await getDocs(collection(db, "jobApplications"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAvailableEmployees(list);
    setAddEmpSearch("");
    setHideExistingInBatch(true);
    setShowAddEmployeePopup(true);
  };

  /* ---------------- ADD EMPLOYEE TO BATCH (from database) ---------------- */
  const addEmployeeToBatch = async (emp) => {
    if (!selectedBatch) return;

    try {
      await setDoc(
        doc(db, "trainingBatches", selectedBatch.id, "employees", emp.email),
        {
          email: emp.email,
          firstName: emp.firstName,
          lastName: emp.lastName || "",
          phone: emp.phone || emp.contactNumber || "",
          department: emp.department || "Not specified",
          reports: [],
          createdAt: Timestamp.now(),
          finalDecision: null,
          source: "database", // Mark as from database
        }
      );

      setEmployees((prev) => [
        ...prev,
        {
          email: emp.email,
          firstName: emp.firstName,
          lastName: emp.lastName || "",
          phone: emp.phone || emp.contactNumber || "",
          department: emp.department || "Not specified",
          reports: [],
          finalDecision: null,
          source: "database",
        },
      ]);

      setShowAddEmployeePopup(false);
    } catch (err) {
      console.error("Add employee error:", err);
      alert("Failed to add employee.");
    }
  };

  /* ---------------- ADD MANUAL TRAINEE ---------------- */
  const addManualTrainee = async () => {
    if (!selectedBatch) return;

    // Validate required fields
    if (!manualTraineeData.firstName.trim()) {
      alert("Please enter trainee's first name");
      return;
    }

    if (!manualTraineeData.email.trim()) {
      alert("Please enter trainee's email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualTraineeData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Check if email already exists in batch
    const emailExists = employees.some(
      (emp) =>
        emp.email?.toLowerCase() === manualTraineeData.email.toLowerCase()
    );

    if (emailExists) {
      alert("A trainee with this email already exists in the batch");
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          "trainingBatches",
          selectedBatch.id,
          "employees",
          manualTraineeData.email
        ),
        {
          email: manualTraineeData.email,
          firstName: manualTraineeData.firstName,
          lastName: manualTraineeData.lastName || "",
          phone: manualTraineeData.phone || "",
          department: manualTraineeData.department || "Not specified",
          reports: [],
          createdAt: Timestamp.now(),
          finalDecision: null,
          source: "manual", // Mark as manually added
        }
      );

      setEmployees((prev) => [
        ...prev,
        {
          email: manualTraineeData.email,
          firstName: manualTraineeData.firstName,
          lastName: manualTraineeData.lastName || "",
          phone: manualTraineeData.phone || "",
          department: manualTraineeData.department || "Not specified",
          reports: [],
          finalDecision: null,
          source: "manual",
        },
      ]);

      // Reset form
      setManualTraineeData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
      });

      setShowManualTraineePopup(false);
    } catch (err) {
      console.error("Add manual trainee error:", err);
      alert("Failed to add trainee.");
    }
  };

  /* ---------------- OPEN REPORT FORM ---------------- */
  const openReportForm = (emp) => {
    const reports = emp.reports || [];
    const presentDaysCount = reports.filter(
      (r) => r.attendance === ATTENDANCE_PRESENT
    ).length;

    if (presentDaysCount >= TRAINING_DAYS_LIMIT) {
      alert(
        `Training is limited to ${TRAINING_DAYS_LIMIT} Present days. Use Approve / Deny for final decision.`
      );
      return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    setReportData({
      date: formattedDate,
      dayName: dayNames[today.getDay()],
      dayNumber: presentDaysCount + 1,
      attendance: ATTENDANCE_PRESENT,
      behaviour: "",
      attitude: "",
      communication: "",
      learningSpeed: "",
      callPractice: "",
      testScore: "",
      approval: "",
      comments: "",
    });

    setSelectedEmployee(emp);
    setShowReportPopup(true);
  };

  /* ---------------- SAVE REPORT ---------------- */
  const saveReport = async () => {
    if (!selectedBatch || !selectedEmployee) return;

    // Validation for absent trainees
    if (reportData.attendance === ATTENDANCE_ABSENT && !reportData.comments.trim()) {
      alert("Please add a comment explaining the reason for absence.");
      return;
    }

    try {
      const ref = doc(
        db,
        "trainingBatches",
        selectedBatch.id,
        "employees",
        selectedEmployee.email
      );

      const existingReports = selectedEmployee.reports || [];
      const presentDaysCount = existingReports.filter(
        (r) => r.attendance === ATTENDANCE_PRESENT
      ).length;

      const isPresent = reportData.attendance === ATTENDANCE_PRESENT;

      const newReport = {
        ...reportData,
        dayNumber: isPresent ? presentDaysCount + 1 : presentDaysCount,
        createdAt: Timestamp.now(),
      };

      if (!isPresent) {
        newReport.behaviour = "";
        newReport.attitude = "";
        newReport.communication = "";
        newReport.learningSpeed = "";
        newReport.callPractice = "";
        newReport.testScore = "";
        newReport.approval = "";
      }

      const updatedReports = [...existingReports, newReport];

      await updateDoc(ref, {
        reports: updatedReports,
        updatedAt: Timestamp.now()
      });

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.email === selectedEmployee.email
            ? {
              ...emp,
              reports: updatedReports,
              updatedAt: Timestamp.now()
            }
            : emp
        )
      );

      // Show success message
      alert(`Report saved successfully! ${isPresent ? "Present" : "Absent"} day added.`);

      setShowReportPopup(false);
      setReportData({
        date: "",
        dayNumber: "",
        attendance: ATTENDANCE_PRESENT,
        behaviour: "",
        attitude: "",
        communication: "",
        learningSpeed: "",
        callPractice: "",
        testScore: "",
        approval: "",
        dayName: "",
        comments: "",
      });
    } catch (err) {
      console.error("Save report error:", err);
      alert("Failed to save report.");
    }
  };

  /* ---------------- REPORTS (navigate to separate page) ---------------- */
  const openViewReports = (emp) => {
    navigate(`/trainer-reports/${selectedBatch.id}/trainee/${emp.email}`);
  };

  /* ---------------- VIEW BATCH REPORTS ---------------- */
  const openBatchReports = () => {
    setShowBatchReportsPopup(true);
  };

  /* ---------------- BACK TO RUNNING (from any tab) ---------------- */
  const moveBackToRunning = async (emp) => {
    try {
      const ref = doc(
        db,
        "trainingBatches",
        selectedBatch.id,
        "employees",
        emp.email
      );

      // Update in employees collection
      await updateDoc(ref, {
        finalDecision: null,
        updatedAt: Timestamp.now()
      });

      // Remove from current list if exists
      if (emp.finalDecision === "Approved") {
        await removeFromList(emp.email, "approved");
      } else if (emp.finalDecision === "Denied") {
        await removeFromList(emp.email, "denied");
      } else if (emp.finalDecision === "Left") {
        await removeFromList(emp.email, "left");
      }

      // Update local state
      setEmployees((prev) =>
        prev.map((e) =>
          e.email === emp.email ? { ...e, finalDecision: null } : e
        )
      );

      // Switch to Running tab
      setActiveTab(TAB_RUNNING);

      alert(`Trainee moved back to Running tab!`);
    } catch (err) {
      console.error("Move back to running error:", err);
      alert("Failed to move trainee back to running.");
    }
  };

  /* ---------------- FINAL DECISION ---------------- */
  const setFinalDecision = async (emp, decision) => {
    try {
      const ref = doc(
        db,
        "trainingBatches",
        selectedBatch.id,
        "employees",
        emp.email
      );

      await updateDoc(ref, {
        finalDecision: decision,
        updatedAt: Timestamp.now()
      });

      setEmployees((prev) =>
        prev.map((e) =>
          e.email === emp.email ? { ...e, finalDecision: decision } : e
        )
      );

      // If the decision changes, we might need to switch tabs
      if (decision === "Approved") {
        setActiveTab(TAB_APPROVED);
        // Add to approved list
        await addToList(emp, "approved");
      } else if (decision === "Denied") {
        setActiveTab(TAB_DENIED);
        // Add to denied list
        await addToList(emp, "denied");
      } else if (decision === "Left") {
        setActiveTab(TAB_LEFT);
        // Add to left list
        await addToList(emp, "left");
      }

      alert(`Trainee marked as ${decision}!`);
    } catch (err) {
      console.error("Set final decision error:", err);
      alert("Failed to set final decision.");
    }
  };

  /* ---------------- FILTER EMPLOYEES BY TAB ---------------- */
  const filterEmployeesByTab = (employees) => {
    switch (activeTab) {
      case TAB_APPROVED:
        return employees.filter((e) => e.finalDecision === "Approved");
      case TAB_DENIED:
        return employees.filter((e) => e.finalDecision === "Denied");
      case TAB_LEFT:
        return employees.filter((e) => e.finalDecision === "Left");
      case TAB_RUNNING:
      default:
        return employees.filter(
          (e) =>
            !e.finalDecision ||
            (e.finalDecision !== "Approved" &&
              e.finalDecision !== "Denied" &&
              e.finalDecision !== "Left")
        );
    }
  };

  /* ---------------- GET FILTERED EMPLOYEES WITH SEARCH ---------------- */
  const getFilteredEmployees = () => {
    const tabFiltered = filterEmployeesByTab(employees);

    if (!employeeSearch.trim()) return tabFiltered;

    const term = employeeSearch.trim().toLowerCase();
    return tabFiltered.filter((e) => {
      const haystack = `${e.firstName || ""} ${e.lastName || ""} ${e.email || ""
        }`.toLowerCase();
      return haystack.includes(term);
    });
  };

  /* ---------------- FILTER AVAILABLE EMPLOYEES ---------------- */
  const filteredAvailableEmployees = availableEmployees.filter((emp) => {
    const term = addEmpSearch.trim().toLowerCase();

    if (
      hideExistingInBatch &&
      employees.some((e) => e.email && emp.email && e.email === emp.email)
    ) {
      return false;
    }

    if (!term) return true;

    const haystack = `${emp.firstName || ""} ${emp.lastName || ""} ${emp.email || ""
      } ${(emp.phone || emp.contactNumber || "").toString()}`.toLowerCase();
    return haystack.includes(term);
  });

  /* ---------------- EXPORT CSV ---------------- */
  const exportBatchReports = () => {
    if (!selectedBatch) return;

    const rows = [];
    employees.forEach((emp) => {
      (emp.reports || []).forEach((r, idx) => {
        rows.push({
          "Batch Name": selectedBatch.batchName,
          "Batch Date": selectedBatch.batchDate || "",
          "Trainee Name": `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
          "Trainee Email": emp.email || "",
          Phone: emp.phone || "",
          Department: emp.department || "",
          Source: emp.source === "manual" ? "Manual Entry" : "Database",
          "Report #": idx + 1,
          "Training Day": r.dayNumber ?? "",
          Date: r.date || "",
          "Day Name": r.dayName || "",
          Attendance: r.attendance || "",
          Behaviour: r.behaviour || "",
          "Attitude Observation": r.attitude || "",
          "Communication (Listening, Speaking)": r.communication || "",
          "Learning Speed": r.learningSpeed || "",
          "Call Practice Feedback": r.callPractice || "",
          "Test Score Sheet (Price Quiz)": r.testScore || "",
          "Approve / Dis-Approve": r.approval || "",
          Comments: r.comments || "",
          "Final Decision (After 8 days)": emp.finalDecision || "",
        });
      });
    });

    if (!rows.length) {
      alert("No reports to export for this batch.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map(
            (h) =>
              `"${(row[h] ?? "")
                .toString()
                .replace(/"/g, '""')
                .replace(/\n/g, " ")}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = (selectedBatch.batchName || "batch").replace(/\s+/g, "_");
    link.setAttribute("download", `${safeName}_reports.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  // Handle manual trainee form input change
  const handleManualTraineeChange = (field, value) => {
    setManualTraineeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit batch form input change
  const handleEditBatchChange = (field, value) => {
    setEditBatchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle report form input change
  const handleReportChange = (field, value) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get counts for each tab
  const getTabCounts = () => {
    const runningCount = employees.filter(
      (e) =>
        !e.finalDecision ||
        (e.finalDecision !== "Approved" &&
          e.finalDecision !== "Denied" &&
          e.finalDecision !== "Left")
    ).length;
    const approvedCount = employees.filter(
      (e) => e.finalDecision === "Approved"
    ).length;
    const deniedCount = employees.filter(
      (e) => e.finalDecision === "Denied"
    ).length;
    const leftCount = employees.filter(
      (e) => e.finalDecision === "Left"
    ).length;

    return { runningCount, approvedCount, deniedCount, leftCount };
  };

  const { runningCount, approvedCount, deniedCount, leftCount } = getTabCounts();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full md:flex overflow-x-hidden">
        <div className="w-full">
          {/* DESKTOP HEADER - IMPROVED LAYOUT */}
          <div className="flex items-center md:justify-between justify-center p-4 sm:p-6 bg-white md:border-b">
            <h1 className=" md:block hidden text-xl sm:text-2xl font-bold text-red-700">
              Training Batch Manager
            </h1>

            <div className="flex items-center gap-4">
              {selectedBatch ? (
                <>
                  <div className="hidden md:block">
                    <h2 className="text-lg font-bold text-red-800">
                      {selectedBatch.batchName}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBatch(null);
                      setEmployees([]);
                      setActiveTab(TAB_RUNNING);
                    }}
                    className="px-4 py-2 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium whitespace-nowrap"
                  >
                    Close Batch
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setBatchDate(today);
                    setShowBatchForm(true);
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow text-sm font-medium"
                >
                  + Create Batch
                </button>
              )}
            </div>
          </div>

          {/* CONTENT CONTAINER */}
          <div className="p-3 sm:p-4 md:p-6">
            {/* BATCH LIST (if no batch selected) */}
            {!selectedBatch && (
              <>
                <div className="space-y-3">
                  {batches.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-red-100 hover:border-red-200 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-red-800 truncate">
                            {b.batchName}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Batch Date:{" "}
                            {b.batchDate
                              ? b.batchDate
                              : b.createdAt?.toDate
                                ? b.createdAt.toDate().toLocaleDateString()
                                : ""}
                          </p>
                          {b.updatedAt && (
                            <p className="text-xs text-slate-400 mt-1">
                              Updated:{" "}
                              {b.updatedAt?.toDate
                                ? b.updatedAt.toDate().toLocaleDateString()
                                : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => openBatch(b)}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                          >
                            Open Batch
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditBatchForm(b)}
                              className="flex-1 sm:w-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md whitespace-nowrap"
                            >
                              <AiOutlineEdit />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(b)}
                              className="flex-1 sm:w-auto px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md whitespace-nowrap"
                            >
                              <AiOutlineDelete />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {batches.length === 0 && (
                    <div className="bg-white p-6 rounded-xl border border-red-100 text-center text-slate-600">
                      <p className="mb-4">No batches found.</p>
                      <button
                        onClick={() => {
                          const today = new Date().toISOString().split("T")[0];
                          setBatchDate(today);
                          setShowBatchForm(true);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                      >
                        Create Your First Batch
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* BATCH VIEW */}
            {selectedBatch && (
              <div className="space-y-4">
                {/* Mobile Batch Header */}
                <div className="md:hidden">
                  <h2 className="text-xl font-bold text-red-800 mb-2">
                    {selectedBatch.batchName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Batch Date: {selectedBatch.batchDate || ""}
                  </p>
                </div>

                {/* SIMPLE TABS - Clean Design - RESPONSIVE */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  <button
                    className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === TAB_RUNNING
                      ? "border-b-2 border-red-600 text-red-700"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => setActiveTab(TAB_RUNNING)}
                  >
                    Running{" "}
                    <span className="ml-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                      {runningCount}
                    </span>
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === TAB_APPROVED
                      ? "border-b-2 border-green-600 text-green-700"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => setActiveTab(TAB_APPROVED)}
                  >
                    Approved{" "}
                    <span className="ml-1 bg-green-100 px-2 py-0.5 rounded-full text-xs text-green-800">
                      {approvedCount}
                    </span>
                  </button>
                  <button
                    className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === TAB_DENIED
                      ? "border-b-2 border-red-700 text-red-800"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => setActiveTab(TAB_DENIED)}
                  >
                    Denied{" "}
                    <span className="ml-1 bg-red-100 px-2 py-0.5 rounded-full text-xs text-red-800">
                      {deniedCount}
                    </span>
                  </button>
                  {/* NEW LEFT TAB */}
                  <button
                    className={`px-3 sm:px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === TAB_LEFT
                      ? "border-b-2 border-purple-600 text-purple-700"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => setActiveTab(TAB_LEFT)}
                  >
                    Left{" "}
                    <span className="ml-1 bg-purple-100 px-2 py-0.5 rounded-full text-xs text-purple-800">
                      {leftCount}
                    </span>
                  </button>
                </div>

                {/* Batch Actions - IMPROVED DESKTOP LAYOUT */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {activeTab === TAB_RUNNING && (
                      <button
                        onClick={fetchAvailableEmployees}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                      >
                        Add Trainee
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button
                      onClick={fetchLists}
                      disabled={loadingLists}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50"
                    >
                      {loadingLists ? "Loading..." : "View Lists"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/trainer-reports/${selectedBatch.id}`)
                        }
                        className="px-4 py-2.5 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium whitespace-nowrap"
                      >
                        View All Reports
                      </button>

                      <button
                        onClick={exportBatchReports}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Filter */}
                <div className="bg-white p-3 rounded-lg border border-red-100">
                  <ClearableInput
                    id="employee-search"
                    type="text"
                    placeholder="Search trainee by name or email..."
                    className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                </div>

                {/* EMPLOYEE CARDS - SIMPLIFIED UI */}
                <div className="space-y-3">
                  {getFilteredEmployees().map((e) => {
                    const reports = e.reports || [];
                    const presentDaysCount = reports.filter(
                      (r) => r.attendance === ATTENDANCE_PRESENT
                    ).length;
                    const totalDaysCount = reports.length;
                    const trainingCompleted =
                      presentDaysCount >= TRAINING_DAYS_LIMIT;

                    return (
                      <div
                        key={e.email}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-200 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          {/* Left Column - Trainee Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <p className="text-lg font-semibold text-gray-900 truncate">
                                {e.firstName} {e.lastName}
                              </p>
                              <div className="flex gap-2">
                                {activeTab === TAB_APPROVED && (
                                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    ✓ Approved
                                  </span>
                                )}
                                {activeTab === TAB_DENIED && (
                                  <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    ✗ Denied
                                  </span>
                                )}
                                {activeTab === TAB_LEFT && (
                                  <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                    ← Left
                                  </span>
                                )}
                                {activeTab === TAB_RUNNING &&
                                  trainingCompleted && (
                                    <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                      Ready for Decision
                                    </span>
                                  )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {e.email}
                            </p>

                            {/* Days Counter for Mobile */}
                            <div className="md:hidden mt-2">
                              <div className="text-sm font-medium text-gray-700">
                                Days: {presentDaysCount}/{TRAINING_DAYS_LIMIT}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Reports: {totalDaysCount}
                              </div>
                              {activeTab === TAB_RUNNING && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {trainingCompleted
                                    ? "Completed"
                                    : "In Progress"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Days Counter (Desktop) and Actions */}
                          <div className="flex flex-col items-end gap-3">
                            {/* Days Counter for Desktop */}
                            <div className="hidden md:block text-right">
                              <div className="text-sm font-medium text-gray-700">
                                Days: {presentDaysCount}/{TRAINING_DAYS_LIMIT}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Reports: {totalDaysCount}
                              </div>
                              {activeTab === TAB_RUNNING && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {trainingCompleted
                                    ? "Completed"
                                    : "In Progress"}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons - RESPONSIVE */}
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                              {activeTab === TAB_RUNNING ? (
                                <>
                                  <div className="flex gap-2">
                                    {!trainingCompleted && (
                                      <button
                                        onClick={() => openReportForm(e)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Add Report
                                      </button>
                                    )}

                                    <button
                                      onClick={() => openViewReports(e)}
                                      className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded text-sm font-medium hover:bg-red-50 whitespace-nowrap"
                                    >
                                      View Reports
                                    </button>

                                    <button
                                      onClick={() =>
                                        setFinalDecision(e, "Left")
                                      }
                                      className="px-3 py-2 rounded text-sm font-medium whitespace-nowrap bg-purple-600 text-white border border-purple-500 hover:bg-white hover:text-purple-600"
                                    >
                                      Left
                                    </button>
                                  </div>

                                  {trainingCompleted && (
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Approved")
                                        }
                                        className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${e.finalDecision === "Approved"
                                          ? "bg-green-600 text-white"
                                          : "bg-white text-green-600 border border-green-500 hover:bg-green-50"
                                          }`}
                                      >
                                        Approve
                                      </button>

                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Denied")
                                        }
                                        className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${e.finalDecision === "Denied"
                                          ? "bg-red-600 text-white"
                                          : "bg-white text-red-600 border border-red-500 hover:bg-red-50"
                                          }`}
                                      >
                                        Deny
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                // For Approved/Denied/Left tabs
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => openViewReports(e)}
                                    className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
                                  >
                                    View Reports
                                  </button>

                                  {/* Back to Running button for all non-running tabs */}
                                  <button
                                    onClick={() => moveBackToRunning(e)}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                  >
                                    Back to Running
                                  </button>

                                  {/* Different Move buttons for different tabs */}
                                  {activeTab === TAB_APPROVED && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Denied")
                                        }
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Denied
                                      </button>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Left")
                                        }
                                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Left
                                      </button>
                                    </>
                                  )}

                                  {activeTab === TAB_DENIED && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Approved")
                                        }
                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Approved
                                      </button>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Left")
                                        }
                                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Left
                                      </button>
                                    </>
                                  )}

                                  {activeTab === TAB_LEFT && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Approved")
                                        }
                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Approved
                                      </button>
                                      <button
                                        onClick={() =>
                                          setFinalDecision(e, "Denied")
                                        }
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                      >
                                        Move to Denied
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getFilteredEmployees().length === 0 && (
                    <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-600">
                      {employeeSearch
                        ? `No matching trainees found in ${activeTab.charAt(0).toUpperCase() +
                        activeTab.slice(1)
                        }.`
                        : activeTab === TAB_RUNNING
                          ? "No trainees in this batch yet. Click 'Add Trainee' to add trainees."
                          : `No ${activeTab} trainees found.`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Create Batch Modal */}
      {showBatchForm && (
        <Modal onClose={() => setShowBatchForm(false)} title="Create New Batch">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batch Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button
                onClick={createBatch}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Create Batch
              </button>
              <button
                onClick={() => setShowBatchForm(false)}
                className="flex-1 px-4 py-3 bg-white border border-red-200 text-red-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Batch Modal */}
      {showEditBatchForm && batchToEdit && (
        <Modal onClose={() => setShowEditBatchForm(false)} title="Edit Batch">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <ClearableInput
                id="edit-batch-name"
                type="text"
                placeholder="Enter batch name"
                className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                value={editBatchData.batchName}
                onChange={(e) => handleEditBatchChange("batchName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batch Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                value={editBatchData.batchDate}
                onChange={(e) => handleEditBatchChange("batchDate", e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button
                onClick={updateBatch}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Update Batch
              </button>
              <button
                onClick={() => {
                  setShowEditBatchForm(false);
                  setBatchToEdit(null);
                }}
                className="flex-1 px-4 py-3 bg-white border border-red-200 text-red-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && batchToDelete && (
        <Modal onClose={() => setShowDeleteConfirm(false)} title="Delete Batch">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium mb-2">Warning!</p>
              <p className="text-sm text-red-600">
                Are you sure you want to delete <strong>"{batchToDelete.batchName}"</strong>?
                This action will permanently delete:
              </p>
              <ul className="text-sm text-red-600 mt-2 ml-4 list-disc">
                <li>The batch record</li>
                <li>All trainee records in this batch</li>
                <li>All daily reports for each trainee</li>
                <li>All lists (Approved, Denied, Left)</li>
              </ul>
              <p className="text-sm text-red-600 mt-3 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button
                onClick={deleteBatch}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Yes, Delete Batch
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBatchToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Lists Modal */}
      {showListsPopup && (
        <Modal
          onClose={() => setShowListsPopup(false)}
          title="Trainee Lists"
        >
          <div className="space-y-6">
            {/* Approved List */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 p-3 sm:p-4 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-800 text-lg">
                    Approved List
                  </h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {approvedList.length} trainees
                  </span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {approvedList.length > 0 ? (
                  approvedList.map((trainee, index) => (
                    <div
                      key={trainee.email}
                      className="p-3 sm:p-4 border-b border-green-100 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {trainee.firstName} {trainee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{trainee.email}</p>
                          <p className="text-xs text-gray-500">
                            {trainee.department} • {trainee.source === "manual" ? "Manual Entry" : "Database"}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => openViewReports(trainee)}
                            className="px-3 py-1.5 text-xs bg-white text-green-700 border border-green-300 rounded hover:bg-green-50 whitespace-nowrap"
                          >
                            View Reports
                          </button>
                          <button
                            onClick={() => removeFromList(trainee.email, "approved")}
                            className="px-3 py-1.5 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No approved trainees yet.
                  </div>
                )}
              </div>
            </div>

            {/* Denied List */}
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 p-3 sm:p-4 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-800 text-lg">
                    Denied List
                  </h3>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {deniedList.length} trainees
                  </span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {deniedList.length > 0 ? (
                  deniedList.map((trainee, index) => (
                    <div
                      key={trainee.email}
                      className="p-3 sm:p-4 border-b border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {trainee.firstName} {trainee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{trainee.email}</p>
                          <p className="text-xs text-gray-500">
                            {trainee.department} • {trainee.source === "manual" ? "Manual Entry" : "Database"}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => openViewReports(trainee)}
                            className="px-3 py-1.5 text-xs bg-white text-red-700 border border-red-300 rounded hover:bg-red-50 whitespace-nowrap"
                          >
                            View Reports
                          </button>
                          <button
                            onClick={() => removeFromList(trainee.email, "denied")}
                            className="px-3 py-1.5 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No denied trainees yet.
                  </div>
                )}
              </div>
            </div>

            {/* Left List */}
            <div className="border border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 p-3 sm:p-4 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-800 text-lg">
                    Left List
                  </h3>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {leftList.length} trainees
                  </span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {leftList.length > 0 ? (
                  leftList.map((trainee, index) => (
                    <div
                      key={trainee.email}
                      className="p-3 sm:p-4 border-b border-purple-100 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {trainee.firstName} {trainee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{trainee.email}</p>
                          <p className="text-xs text-gray-500">
                            {trainee.department} • {trainee.source === "manual" ? "Manual Entry" : "Database"}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => openViewReports(trainee)}
                            className="px-3 py-1.5 text-xs bg-white text-purple-700 border border-purple-300 rounded hover:bg-purple-50 whitespace-nowrap"
                          >
                            View Reports
                          </button>
                          <button
                            onClick={() => removeFromList(trainee.email, "left")}
                            className="px-3 py-1.5 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No left trainees yet.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowListsPopup(false)}
                className="w-full px-4 py-3 bg-white border border-red-200 text-red-700 rounded-lg font-medium hover:bg-red-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAddEmployeePopup && (
        <Modal
          onClose={() => setShowAddEmployeePopup(false)}
          title="Add Trainee from Database"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <ClearableInput
                  id="add-emp-search"
                  type="text"
                  placeholder="Search by name, email, phone..."
                  className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                  value={addEmpSearch}
                  onChange={(e) => setAddEmpSearch(e.target.value)}
                />
                <button
                  onClick={() => setShowManualTraineePopup(true)}
                  className="flex-1 min-w-[110px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                >
                  Add Manual
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-red-200 text-red-600 focus:ring-red-300"
                  checked={hideExistingInBatch}
                  onChange={(e) => setHideExistingInBatch(e.target.checked)}
                />
                Hide already added trainees
              </label>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredAvailableEmployees.map((emp) => (
                <div
                  key={emp.email}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100 hover:bg-red-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-red-800 truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {emp.email}
                    </p>
                  </div>
                  <button
                    onClick={() => addEmployeeToBatch(emp)}
                    className="ml-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              ))}

              {filteredAvailableEmployees.length === 0 && (
                <p className="text-center text-slate-500 p-4">
                  No trainees found.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showManualTraineePopup && (
        <Modal
          onClose={() => setShowManualTraineePopup(false)}
          title="Add Manual Trainee"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <ClearableInput
                  id="manual-trainee-firstname"
                  type="text"
                  placeholder="Enter first name"
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  value={manualTraineeData.firstName}
                  onChange={(e) =>
                    handleManualTraineeChange("firstName", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <ClearableInput
                  id="manual-trainee-lastname"
                  type="text"
                  placeholder="Enter last name (optional)"
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  value={manualTraineeData.lastName}
                  onChange={(e) =>
                    handleManualTraineeChange("lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  value={manualTraineeData.email}
                  onChange={(e) =>
                    handleManualTraineeChange("email", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  value={manualTraineeData.phone}
                  onChange={(e) =>
                    handleManualTraineeChange("phone", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <select
                  className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 bg-white"
                  value={manualTraineeData.department}
                  onChange={(e) =>
                    handleManualTraineeChange("department", e.target.value)
                  }
                >
                  <option value="">Select department (optional)</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button
                onClick={addManualTrainee}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
              >
                Add Trainee
              </button>
              <button
                onClick={() => setShowManualTraineePopup(false)}
                className="flex-1 px-4 py-3 bg-white border border-red-200 text-red-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showReportPopup && selectedEmployee && (
        <Modal
          onClose={() => setShowReportPopup(false)}
          title={`Add Report — ${selectedEmployee.firstName}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <SelectField
                label="Attendance"
                value={reportData.attendance}
                onChange={(val) => {
                  handleReportChange("attendance", val);
                  // When attendance changes to absent, clear evaluation fields
                  if (val === ATTENDANCE_ABSENT) {
                    handleReportChange("behaviour", "");
                    handleReportChange("attitude", "");
                    handleReportChange("communication", "");
                    handleReportChange("learningSpeed", "");
                    handleReportChange("callPractice", "");
                    handleReportChange("testScore", "");
                    handleReportChange("approval", "");
                  }
                }}
                options={[
                  { value: ATTENDANCE_PRESENT, label: "Present" },
                  { value: ATTENDANCE_ABSENT, label: "Absent" },
                ]}
              />

              {reportData.attendance === ATTENDANCE_PRESENT && (
                <>
                  <SelectField
                    label="Behaviour"
                    value={reportData.behaviour}
                    onChange={(v) => handleReportChange("behaviour", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Bad", label: "Bad" },
                      { value: "Good", label: "Good" },
                      { value: "Excellent", label: "Excellent" },
                    ]}
                  />
                  <SelectField
                    label="Attitude"
                    value={reportData.attitude}
                    onChange={(v) => handleReportChange("attitude", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Polite", label: "Polite" },
                      { value: "Calm", label: "Calm" },
                      { value: "Arrogant", label: "Arrogant" },
                      { value: "Stubborn", label: "Stubborn" },
                      { value: "Rude", label: "Rude" },
                      { value: "Normal", label: "Normal" },
                      { value: "Inquisitive", label: "Inquisitive" },
                      { value: "Active", label: "Active" },
                    ]}
                  />
                  <SelectField
                    label="Communication"
                    value={reportData.communication}
                    onChange={(v) => handleReportChange("communication", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Average", label: "Average" },
                      { value: "Good", label: "Good" },
                      { value: "Excellent", label: "Excellent" },
                    ]}
                  />
                  <SelectField
                    label="Learning Speed"
                    value={reportData.learningSpeed}
                    onChange={(v) => handleReportChange("learningSpeed", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Average", label: "Average" },
                      { value: "Medium", label: "Medium" },
                      { value: "Fast", label: "Fast" },
                    ]}
                  />
                  <SelectField
                    label="Call Practice"
                    value={reportData.callPractice}
                    onChange={(v) => handleReportChange("callPractice", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Average", label: "Average" },
                      { value: "Good", label: "Good" },
                      { value: "Excellent", label: "Excellent" },
                    ]}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Test Score Sheet (Price Quiz)
                    </label>
                    <ClearableInput
                      id="report-test-score"
                      type="text"
                      placeholder="e.g. Q1-6/20, Q2-6/8"
                      value={reportData.testScore}
                      onChange={(e) => handleReportChange("testScore", e.target.value)}
                      className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                    />
                  </div>

                  <SelectField
                    label="Approve / Dis-Approve"
                    value={reportData.approval}
                    onChange={(v) => handleReportChange("approval", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "Selected", label: "Selected" },
                      { value: "Not Selected", label: "Not Selected" },
                    ]}
                  />
                </>
              )}

              {reportData.attendance === ATTENDANCE_ABSENT && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium mb-2">
                    Trainee is marked as Absent
                  </p>
                  <p className="text-sm text-yellow-600">
                    Evaluation fields are disabled for absent trainees.
                    Please add a comment below to note the reason for absence.
                  </p>
                </div>
              )}

              {/* Comments Section - ALWAYS SHOWN for both Present and Absent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Comments {reportData.attendance === ATTENDANCE_ABSENT &&
                    <span className="text-red-500 ml-1">(Required for absent trainees)</span>}
                </label>
                <textarea
                  placeholder={
                    reportData.attendance === ATTENDANCE_ABSENT
                      ? "Please add a comment explaining the reason for absence..."
                      : "Any additional notes / remarks... (optional)"
                  }
                  value={reportData.comments}
                  onChange={(e) => handleReportChange("comments", e.target.value)}
                  className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  rows={reportData.attendance === ATTENDANCE_ABSENT ? 4 : 3}
                />
                {reportData.attendance === ATTENDANCE_ABSENT && (
                  <p className="text-xs text-red-600 mt-1">
                    Comment is required when marking a trainee as absent.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button
                onClick={saveReport}
                disabled={reportData.attendance === ATTENDANCE_ABSENT && !reportData.comments.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${reportData.attendance === ATTENDANCE_ABSENT && !reportData.comments.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                Save Report
              </button>
              <button
                onClick={() => {
                  setShowReportPopup(false);
                  setReportData({
                    date: "",
                    dayNumber: "",
                    attendance: ATTENDANCE_PRESENT,
                    behaviour: "",
                    attitude: "",
                    communication: "",
                    learningSpeed: "",
                    callPractice: "",
                    testScore: "",
                    approval: "",
                    dayName: "",
                    comments: "",
                  });
                }}
                className="flex-1 px-4 py-3 bg-white border border-red-200 text-red-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showViewReportPopup && viewReportsFor && (
        <Modal
          onClose={() => setShowViewReportPopup(false)}
          title={`Reports — ${viewReportsFor.firstName}`}
        >
          <div>
            <ReportsCards
              reports={viewReportsFor.reports || []}
              traineeName={`${viewReportsFor.firstName} ${viewReportsFor.lastName || ""
                }`}
            />
          </div>
        </Modal>
      )}

      {showBatchReportsPopup && (
        <Modal
          onClose={() => setShowBatchReportsPopup(false)}
          title={`All Reports — ${selectedBatch?.batchName}`}
        >
          <div>
            <BatchReportsCards employees={employees} />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- REUSABLE UI COMPONENTS ---------------- */

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-red-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-red-100">
          <h3 className="text-lg sm:text-xl font-bold text-red-700">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-300 outline-none bg-white text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// NEW: Single Trainee Reports Cards (Table-like format)
function ReportsCards({ reports, traineeName }) {
  if (!reports || reports.length === 0)
    return <p className="text-slate-600 p-4 text-center">No reports found.</p>;

  // Sort reports by date or day number
  const sortedReports = [...reports].sort((a, b) => {
    if (a.dayNumber && b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    }
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });

  return (
    <div className="border-t border-gray-100">
      <div className="p-3 sm:p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 text-lg">{traineeName}</h4>
          <p className="text-sm text-gray-600">Total Reports: {reports.length}</p>
          <p className="text-sm text-gray-600">
            Present Days: {reports.filter(r => r.attendance === "Present").length} / 8
          </p>
        </div>
        <div className="">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-red-50 text-gray-800">
                <th className="px-2 py-1.5 text-left font-medium">#</th>
                <th className="px-2 py-1.5 text-left font-medium">Date</th>
                <th className="px-2 py-1.5 text-left font-medium">Day</th>
                <th className="px-2 py-1.5 text-left font-medium">
                  Attendance
                </th>
                <th className="px-2 py-1.5 text-left font-medium">Behaviour</th>
                <th className="px-2 py-1.5 text-left font-medium">Attitude</th>
                <th className="px-2 py-1.5 text-left font-medium">
                  Communication
                </th>
                <th className="px-2 py-1.5 text-left font-medium">Learning</th>
                <th className="px-2 py-1.5 text-left font-medium">
                  Call Practice
                </th>
                <th className="px-2 py-1.5 text-left font-medium">
                  Test Score
                </th>
                <th className="px-2 py-1.5 text-left font-medium">Approve</th>
                <th className="px-2 py-1.5 text-left font-medium">Comments</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-2 py-1.5 font-medium">
                    {report.dayNumber ?? index + 1}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    {report.date || "-"}
                  </td>
                  <td className="px-2 py-1.5">{report.dayName || "-"}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${report.attendance === "Present"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {report.attendance || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">{report.behaviour || "-"}</td>
                  <td className="px-2 py-1.5">{report.attitude || "-"}</td>
                  <td className="px-2 py-1.5">{report.communication || "-"}</td>
                  <td className="px-2 py-1.5">{report.learningSpeed || "-"}</td>
                  <td className="px-2 py-1.5">{report.callPractice || "-"}</td>
                  <td className="px-2 py-1.5">{report.testScore || "-"}</td>
                  <td className="px-2 py-1.5">
                    {report.approval ? (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${report.approval === "Selected"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {report.approval}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 max-w-[200px] break-words text-xs">
                    {report.comments || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// NEW: Improved Expandable Cards for All Reports (No scroll bars)
function BatchReportsCards({ employees }) {
  const [expandedTrainee, setExpandedTrainee] = useState(null);

  if (!employees || employees.length === 0)
    return (
      <p className="text-slate-600 p-4 text-center">
        No reports found for this batch.
      </p>
    );

  const toggleExpand = (email) => {
    if (expandedTrainee === email) {
      setExpandedTrainee(null);
    } else {
      setExpandedTrainee(email);
    }
  };

  // Filter employees who have at least one report
  const employeesWithReports = employees.filter(
    (emp) => (emp.reports || []).length > 0
  );

  if (employeesWithReports.length === 0) {
    return (
      <p className="text-slate-600 p-4 text-center">
        No reports found for any trainee in this batch.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {employeesWithReports.map((emp) => {
        const reports = emp.reports || [];
        const presentDaysCount = reports.filter(
          (r) => r.attendance === "Present"
        ).length;
        const totalReports = reports.length;
        const isExpanded = expandedTrainee === emp.email;

        // Sort reports by date or day number
        const sortedReports = [...reports].sort((a, b) => {
          if (a.dayNumber && b.dayNumber) {
            return a.dayNumber - b.dayNumber;
          }
          if (a.date && b.date) {
            return new Date(a.date) - new Date(b.date);
          }
          return 0;
        });

        return (
          <div
            key={emp.email}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Trainee Header - Clickable to expand/collapse */}
            <div
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
              onClick={() => toggleExpand(emp.email)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {emp.finalDecision === "Approved" && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Approved
                        </span>
                      )}
                      {emp.finalDecision === "Denied" && (
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          ✗ Denied
                        </span>
                      )}
                      {emp.finalDecision === "Left" && (
                        <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          ← Left
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                    {emp.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="font-medium">Reports:</span>{" "}
                      {totalReports}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="font-medium">Present Days:</span>{" "}
                      {presentDaysCount}/8
                    </span>
                  </div>
                </div>

                <div className="flex items-center ml-2">
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content - Table format */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="p-3 sm:p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-red-50 text-gray-800">
                          <th className="px-2 py-1.5 text-left font-medium">
                            #
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Date
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Day
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Attendance
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Behaviour
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Attitude
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Communication
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Learning
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Call Practice
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Test Score
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Approve
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium">
                            Comments
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedReports.map((report, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-2 py-1.5 font-medium">
                              {report.dayNumber ?? index + 1}
                            </td>
                            <td className="px-2 py-1.5 whitespace-nowrap">
                              {report.date || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.dayName || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${report.attendance === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {report.attendance || "-"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              {report.behaviour || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.attitude || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.communication || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.learningSpeed || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.callPractice || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.testScore || "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {report.approval ? (
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${report.approval === "Selected"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {report.approval}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 max-w-[200px] break-words text-xs">
                              {report.comments || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}