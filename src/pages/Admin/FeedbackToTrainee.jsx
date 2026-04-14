// src/pages/TrainerFeedback/index.js
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import Side_bar from "../../components/Side_bar";

const TrainerFeedback = () => {
  // State for data
  const [trainees, setTrainees] = useState([]);
  const [allTrainees, setAllTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [viewFeedbackData, setViewFeedbackData] = useState(null);
  const [showTraineeList, setShowTraineeList] = useState(false);
  const [selectedTraineeForFeedback, setSelectedTraineeForFeedback] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainSearchQuery, setMainSearchQuery] = useState("");

  // Trainer feedback form state
  const [formData, setFormData] = useState({
    attendance: 1,
    discipline: 1,
    willingnessToLearn: 1,
    processUnderstanding: 1,
    abilityToTakeCalls: 1,
    communicationSkills: 1,
    abilityToFollowInstructions: 1,
    readyForLiveCalls: "Needs more training",
    readyToContinueEmployment: "Needs re-evaluation",
    trainerRemarks: "",
    trainerName: "",
    managerApproval: "",
    approvalDate: "",
    eightDayConfirmation: "NO",
    trainerRemarksForManagement: ""
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      attendance: 1,
      discipline: 1,
      willingnessToLearn: 1,
      processUnderstanding: 1,
      abilityToTakeCalls: 1,
      communicationSkills: 1,
      abilityToFollowInstructions: 1,
      readyForLiveCalls: "Needs more training",
      readyToContinueEmployment: "Needs re-evaluation",
      trainerRemarks: "",
      trainerName: "",
      managerApproval: "",
      approvalDate: "",
      eightDayConfirmation: "NO",
      trainerRemarksForManagement: ""
    });
  };

  // Fetch all trainees data (from both collections)
  useEffect(() => {
    fetchAllTraineesData();
  }, []);

  const fetchAllTraineesData = async () => {
    setLoading(true);
    try {
      // Fetch from both collections
      const [traineeFeedbackSnap, trainerFeedbackSnap] = await Promise.all([
        getDocs(collection(db, "traineeFeedback")),
        getDocs(collection(db, "trainerFeedbackFinal"))
      ]);

      // Process trainees from traineeFeedback collection
      const traineesFromFeedback = traineeFeedbackSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        feedbackDate: d.data().feedbackDate || "Not specified",
        feedbackType: "trainee_feedback",
        sourceCollection: "traineeFeedback"
      }));

      // Process trainees from trainerFeedbackFinal collection
      const traineesFromTrainer = trainerFeedbackSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        feedbackDate: d.data().feedbackDate || d.data().submissionDate || "Not specified",
        feedbackType: "trainer_feedback",
        sourceCollection: "trainerFeedbackFinal"
      }));

      // Combine both lists
      const combinedTrainees = [...traineesFromFeedback, ...traineesFromTrainer];

      // Remove duplicates
      const uniqueTraineesMap = new Map();
      combinedTrainees.forEach(trainee => {
        const key = trainee.traineeEmail || trainee.userEmail || trainee.traineeName || trainee.id;
        const existing = uniqueTraineesMap.get(key);
        if (!existing || trainee.feedbackType === "trainer_feedback") {
          uniqueTraineesMap.set(key, trainee);
        }
      });

      const uniqueTrainees = Array.from(uniqueTraineesMap.values());
      setTrainees(uniqueTrainees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trainees data:", error);
      alert("Error loading trainees list");
      setLoading(false);
    }
  };

  // Fetch all job applicants for "Feedback To Trainee" functionality
  const fetchAllTrainees = async () => {
    try {
      const jobAppsSnap = await getDocs(collection(db, "jobApplications"));

      if (!jobAppsSnap.empty) {
        const traineesData = jobAppsSnap.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            name: doc.data().firstName ? `${doc.data().firstName} ${doc.data().lastName || ''}`.trim() : doc.data().name,
            email: doc.data().email,
            department: doc.data().department || "Not specified"
          }))
          .filter(trainee => trainee.name || trainee.email);

        setAllTrainees(traineesData);
      } else {
        // Fallback to other collections
        const collections = ["users", "trainees", "employees"];
        for (const collectionName of collections) {
          try {
            const snap = await getDocs(collection(db, collectionName));
            if (!snap.empty) {
              const traineesData = snap.docs
                .map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                  name: doc.data().name || doc.data().fullName || `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim(),
                  email: doc.data().email || doc.data().userEmail,
                  department: doc.data().department || doc.data().dept || "Not specified"
                }))
                .filter(trainee => trainee.name || trainee.email);

              setAllTrainees(traineesData);
              break;
            }
          } catch (err) {
            console.log(`Collection ${collectionName} not found or error:`, err);
            continue;
          }
        }

        if (allTrainees.length === 0) {
          alert("No trainees found in any collection. Please check your database structure.");
        }
      }
    } catch (error) {
      console.error("Error fetching all trainees:", error);
      alert("Error loading trainees list");
    }
  };

  // Handle "Feedback To Trainee" button click
  const handleFeedbackToTrainee = async () => {
    await fetchAllTrainees();
    setShowTraineeList(true);
    setSearchQuery("");
  };

  // Filter trainees based on search query
  const filteredTrainees = allTrainees.filter(trainee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (trainee.name && trainee.name.toLowerCase().includes(searchLower)) ||
      (trainee.email && trainee.email.toLowerCase().includes(searchLower)) ||
      (trainee.department && trainee.department.toLowerCase().includes(searchLower))
    );
  });

  // View Trainee Feedback
  const showFeedback = async (trainee) => {
    try {
      if (trainee.sourceCollection === "traineeFeedback") {
        const snap = await getDoc(doc(db, "traineeFeedback", trainee.id));
        if (snap.exists()) {
          setViewFeedbackData({
            ...snap.data(),
            feedbackType: "trainee_feedback"
          });
        } else {
          alert("Trainee feedback not found");
        }
      } else if (trainee.sourceCollection === "trainerFeedbackFinal") {
        setViewFeedbackData({
          ...trainee,
          feedbackType: "trainer_feedback"
        });
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      alert("Error loading feedback");
    }
  };

  // Common function to prepare feedback data
  const prepareFeedbackData = (trainee, isFromMainList = true) => {
    const currentDate = new Date().toISOString().split('T')[0];

    return {
      traineeId: trainee.id,
      traineeName: isFromMainList
        ? trainee.traineeName || trainee.name
        : trainee.name || trainee.traineeName || trainee.email || `Trainee ${trainee.id}`,
      userEmail: isFromMainList
        ? trainee.traineeEmail || trainee.userEmail || ""
        : trainee.email || trainee.traineeEmail || "",
      attendance: formData.attendance,
      discipline: formData.discipline,
      willingnessToLearn: formData.willingnessToLearn,
      processUnderstanding: formData.processUnderstanding,
      abilityToTakeCalls: formData.abilityToTakeCalls,
      communicationSkills: formData.communicationSkills,
      abilityToFollowInstructions: formData.abilityToFollowInstructions,
      readyForLiveCalls: formData.readyForLiveCalls,
      readyToContinueEmployment: formData.readyToContinueEmployment,
      trainerRemarks: formData.trainerRemarks,
      trainerRemarksForManagement: formData.trainerRemarksForManagement,
      trainerName: formData.trainerName,
      managerApproval: formData.managerApproval,
      approvalDate: formData.approvalDate,
      eightDayConfirmation: formData.eightDayConfirmation,
      feedbackDate: currentDate,
      submissionDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      submittedAt: Date.now()
    };
  };

  // Submit Trainer Feedback (from main list)
  const submitTrainerFeedback = async (e) => {
    e.preventDefault();

    if (!formData.trainerName.trim()) {
      alert("Please enter Trainer Name");
      return;
    }

    if (!formData.approvalDate) {
      alert("Please select Approval Date");
      return;
    }

    try {
      const feedbackData = prepareFeedbackData(selectedTrainee, true);
      await addDoc(collection(db, "trainerFeedbackFinal"), feedbackData);
      alert("Trainer Feedback Submitted Successfully!");
      setSelectedTrainee(null);
      resetFormData();
      fetchAllTraineesData();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    }
  };

  // Submit Feedback to selected trainee
  const submitFeedbackToSelectedTrainee = async (e) => {
    e.preventDefault();

    if (!formData.trainerName.trim()) {
      alert("Please enter Trainer Name");
      return;
    }

    if (!formData.approvalDate) {
      alert("Please select Approval Date");
      return;
    }

    try {
      const feedbackData = prepareFeedbackData(selectedTraineeForFeedback, false);
      await addDoc(collection(db, "trainerFeedbackFinal"), feedbackData);
      alert(`Feedback submitted successfully for ${feedbackData.traineeName}!`);
      setSelectedTraineeForFeedback(null);
      setShowTraineeList(false);
      resetFormData();
      fetchAllTraineesData();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Trainer Feedbacks
          </h1>

        </div>


        {/* Search Bar */}
        <div className=" flex justify-between items-center mb-6 sm:mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="name or email..."
              value={mainSearchQuery}
              onChange={(e) => setMainSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm text-sm sm:text-base"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleFeedbackToTrainee}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md active:transform active:scale-95 gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Feedback
          </button>
        </div>

        {/* Trainees Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading trainees...</p>
          </div>
        ) : trainees.filter(t => {
          const searchLower = mainSearchQuery.toLowerCase();
          const name = t.traineeName || t.name || "";
          const email = t.traineeEmail || t.userEmail || t.email || "";
          return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
        }).length > 0 ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            {trainees.filter(t => {
              const searchLower = mainSearchQuery.toLowerCase();
              const name = t.traineeName || t.name || "";
              const email = t.traineeEmail || t.userEmail || t.email || "";
              return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
            }).map((t) => (
              <div
                key={`${t.sourceCollection}-${t.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:border-red-200 transition-all flex flex-row justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight truncate">
                        {t.traineeName || t.name || "Unnamed Trainee"}
                      </h3>
                      <span className="text-gray-500 text-xs mt-1 truncate">
                        {t.traineeEmail || t.userEmail || t.email || "No email"}
                      </span>
                    </div>

                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Dated:</span>
                    <span className="text-gray-700 text-xs font-bold">{formatDate(t.feedbackDate)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-col gap-2">
                  <button
                    onClick={() => showFeedback(t)}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => setSelectedTrainee(t)}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-bold"
                  >
                    {t.feedbackType === "trainer_feedback" ? "Update" : "Give Feedback"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Feedback Yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">No trainees have given or received feedback yet.</p>
            <button
              onClick={handleFeedbackToTrainee}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Give First Feedback
            </button>
          </div>
        )}
      </main>

      {/* VIEW Feedback POPUP */}
      {viewFeedbackData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-6">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-white rounded-t-xl shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-red-700">
                {viewFeedbackData.feedbackType === "trainer_feedback"
                  ? "Trainer Feedback"
                  : "Trainee Feedback"}
              </h2>

              <button
                onClick={() => setViewFeedbackData(null)}
                className="text-2xl font-bold text-gray-500 hover:text-red-700"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">

              {/* Trainee Info */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="font-semibold text-red-700 mb-3">
                  Trainee Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                  <div>
                    <span className="font-medium text-gray-600">Name</span>
                    <p className="text-gray-800">
                      {viewFeedbackData.traineeName ||
                        viewFeedbackData.name ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Email</span>
                    <p className="text-gray-800 break-all">
                      {viewFeedbackData.traineeEmail ||
                        viewFeedbackData.userEmail ||
                        viewFeedbackData.email ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">
                      Feedback Date
                    </span>
                    <p>{formatDate(viewFeedbackData.feedbackDate)}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">
                      Feedback Type
                    </span>
                    <p>
                      {viewFeedbackData.feedbackType === "trainer_feedback"
                        ? "Trainer Feedback"
                        : "Trainee Feedback"}
                    </p>
                  </div>

                </div>
              </div>

              {/* CONDITIONAL SECTIONS */}
              {viewFeedbackData.feedbackType === "trainee_feedback" ? (

                <div className="space-y-6">

                  {/* Training Quality */}
                  <div>
                    <h3 className="font-semibold border-b pb-2 mb-3">
                      Training Quality
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                      <div className="border rounded-lg p-3">
                        <b>Clarity</b>
                        <p>{viewFeedbackData.clarity || "Not rated"}</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Communication</b>
                        <p>
                          {viewFeedbackData.trainerCommunication ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Knowledge</b>
                        <p>
                          {viewFeedbackData.trainerKnowledge ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Support</b>
                        <p>
                          {viewFeedbackData.trainingSupport ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3 sm:col-span-2">
                        <b>Material Quality</b>
                        <p>
                          {viewFeedbackData.trainingMaterial ||
                            "Not rated"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div>
                    <h3 className="font-semibold border-b pb-2 mb-3">
                      Overall Assessment
                    </h3>

                    <div className="space-y-3 text-sm">

                      <div className="border rounded-lg p-3">
                        <b>Confidence Level</b>
                        <p>
                          {viewFeedbackData.confidence ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Areas Needing Help</b>
                        <p>
                          {viewFeedbackData.areasHelpNeeded ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Additional Comments</b>
                        <p>
                          {viewFeedbackData.comments || "No comments"}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

              ) : (

                <div className="space-y-6">

                  {/* Attendance */}
                  <div>
                    <h3 className="font-semibold border-b pb-2 mb-3">
                      Attendance & Discipline
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                      <div className="border rounded-lg p-3">
                        <b>Attendance</b>
                        <p>{viewFeedbackData.attendance || "Not rated"}</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Discipline</b>
                        <p>{viewFeedbackData.discipline || "Not rated"}</p>
                      </div>

                      <div className="border rounded-lg p-3 sm:col-span-2">
                        <b>Willingness to Learn</b>
                        <p>
                          {viewFeedbackData.willingnessToLearn ||
                            "Not rated"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <h3 className="font-semibold border-b pb-2 mb-3">
                      Training Performance
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                      <div className="border rounded-lg p-3">
                        <b>Process Understanding</b>
                        <p>
                          {viewFeedbackData.processUnderstanding ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Ability to Take Calls</b>
                        <p>
                          {viewFeedbackData.abilityToTakeCalls ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Communication Skills</b>
                        <p>
                          {viewFeedbackData.communicationSkills ||
                            "Not rated"}
                        </p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <b>Following Instructions</b>
                        <p>
                          {viewFeedbackData.abilityToFollowInstructions ||
                            "Not rated"}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

              )}

            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end shrink-0">
              <button
                onClick={() => setViewFeedbackData(null)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
      {/* GIVE/UPDATE Trainer Feedback POPUP */}
      {selectedTrainee && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2 sm:p-4 z-[9999]">
          <div className="bg-white w-full sm:w-full sm:max-w-2xl h-[95vh] sm:max-h-[90vh] sm:rounded-xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-red-700 truncate">
                {selectedTrainee.feedbackType === "trainer_feedback" ? "Update" : "Give"} Trainer Feedback
              </h2>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="text-2xl sm:text-3xl text-red-700 font-bold hover:text-red-900 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
              <form onSubmit={submitTrainerFeedback} className="space-y-3 sm:space-y-4">
                {/* Trainee Info */}
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
                  <h3 className="font-bold text-red-700 mb-2 text-xs sm:text-sm">Trainee Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <p><span className="font-medium">Name:</span> {selectedTrainee.traineeName || selectedTrainee.name || "Not specified"}</p>
                    <p><span className="font-medium">Email:</span> {selectedTrainee.traineeEmail || selectedTrainee.userEmail || selectedTrainee.email || "Not specified"}</p>
                    <p><span className="font-medium">Current Status:</span> {selectedTrainee.feedbackType === "trainer_feedback" ? "Has Trainer Feedback" : "Has Trainee Feedback"}</p>
                    {selectedTrainee.feedbackDate && (
                      <p><span className="font-medium">Last Feedback:</span> {formatDate(selectedTrainee.feedbackDate)}</p>
                    )}
                  </div>
                </div>

                {/* Form Sections */}
                <Section title="Attendance & Discipline">
                  <Select
                    label="Attendance"
                    value={formData.attendance}
                    setValue={(val) => handleInputChange('attendance', val)}
                  />
                  <Select
                    label="Discipline"
                    value={formData.discipline}
                    setValue={(val) => handleInputChange('discipline', val)}
                  />
                  <Select
                    label="Willingness to Learn"
                    value={formData.willingnessToLearn}
                    setValue={(val) => handleInputChange('willingnessToLearn', val)}
                  />
                </Section>

                <Section title="Training Performance">
                  <Select
                    label="Process Understanding"
                    value={formData.processUnderstanding}
                    setValue={(val) => handleInputChange('processUnderstanding', val)}
                  />
                  <Select
                    label="Ability to Take Calls"
                    value={formData.abilityToTakeCalls}
                    setValue={(val) => handleInputChange('abilityToTakeCalls', val)}
                  />
                  <Select
                    label="Communication Skills"
                    value={formData.communicationSkills}
                    setValue={(val) => handleInputChange('communicationSkills', val)}
                  />
                  <Select
                    label="Following Instructions"
                    value={formData.abilityToFollowInstructions}
                    setValue={(val) => handleInputChange('abilityToFollowInstructions', val)}
                  />
                </Section>

                <Section title="Final Evaluation">
                  <LongSelect
                    label="Ready for Live Calls?"
                    value={formData.readyForLiveCalls}
                    setValue={(val) => handleInputChange('readyForLiveCalls', val)}
                    options={["Yes", "No", "Needs more training"]}
                  />
                  <LongSelect
                    label="Continue Employment?"
                    value={formData.readyToContinueEmployment}
                    setValue={(val) => handleInputChange('readyToContinueEmployment', val)}
                    options={["Yes", "No", "Needs re-evaluation"]}
                  />
                </Section>

                <Section title="Trainer Remarks">
                  <div className="col-span-2">
                    <textarea
                      className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                      rows={3}
                      placeholder="Write detailed remarks about the trainee's performance..."
                      value={formData.trainerRemarks}
                      onChange={(e) => handleInputChange('trainerRemarks', e.target.value)}
                    />
                  </div>
                </Section>

                <Section title="Approval Information">
                  <Input
                    label="Trainer Name *"
                    value={formData.trainerName}
                    setValue={(val) => handleInputChange('trainerName', val)}
                    required
                  />
                  <Input
                    label="Manager Approval"
                    value={formData.managerApproval}
                    setValue={(val) => handleInputChange('managerApproval', val)}
                    placeholder="Manager's name"
                  />
                  <Input
                    type="date"
                    label="Approval Date *"
                    value={formData.approvalDate}
                    setValue={(val) => handleInputChange('approvalDate', val)}
                    required
                  />
                </Section>

                <Section title="8-Day Training Completion">
                  <LongSelect
                    label="Training Completed?"
                    value={formData.eightDayConfirmation}
                    setValue={(val) => handleInputChange('eightDayConfirmation', val)}
                    options={["YES", "NO"]}
                  />
                  <div className="col-span-2">
                    <textarea
                      className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                      rows={2}
                      value={formData.trainerRemarksForManagement}
                      placeholder="Additional remarks for management (optional)..."
                      onChange={(e) => handleInputChange('trainerRemarksForManagement', e.target.value)}
                    />
                  </div>
                </Section>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTrainee(null)}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm sm:text-base order-1 sm:order-2"
                  >
                    {selectedTrainee.feedbackType === "trainer_feedback" ? "Update Feedback" : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TO TRAINEE POPUP */}
      {showTraineeList && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2 sm:p-4 z-[9999]">
          <div className="bg-white w-full sm:w-full sm:max-w-2xl h-[95vh] sm:max-h-[90vh] sm:rounded-xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-red-700 truncate">Select Trainee for Feedback</h2>
              <button
                onClick={() => {
                  setShowTraineeList(false);
                  setSearchQuery("");
                }}
                className="text-2xl sm:text-3xl text-red-700 font-bold hover:text-red-900 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                    placeholder="Search by name, email, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {filteredTrainees.length} {filteredTrainees.length === 1 ? 'trainee' : 'trainees'} found
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-800"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>

              {/* Trainees List */}
              <div className="space-y-2 sm:space-y-3">
                {filteredTrainees.length > 0 ? (
                  filteredTrainees.map((trainee) => (
                    <div
                      key={trainee.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                    >
                      <div className="flex-1 mb-2 sm:mb-0">
                        <div className="mb-1">
                          <p className="font-bold text-gray-800 text-sm sm:text-base">
                            {trainee.name || trainee.traineeName || trainee.email || `Trainee ${trainee.id}`}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 break-words">
                            {trainee.email || trainee.traineeEmail || "No email provided"}
                          </p>
                        </div>
                        {trainee.department && trainee.department !== "Not specified" && (
                          <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {trainee.department}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTraineeForFeedback(trainee);
                          setShowTraineeList(false);
                        }}
                        className="w-full sm:w-auto px-4 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-xs sm:text-sm mt-2 sm:mt-0"
                      >
                        Give Feedback
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                      {searchQuery ? 'No matching trainees found' : 'No Trainees Found'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      {searchQuery
                        ? 'Try a different search term or clear the search'
                        : 'No trainees found in the database. Please add trainees to provide feedback.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK FORM FOR SELECTED TRAINEE */}
      {selectedTraineeForFeedback && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2 sm:p-4 z-[9999]">
          <div className="bg-white w-full sm:w-full sm:max-w-2xl h-[95vh] sm:max-h-[90vh] sm:rounded-xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-red-700 truncate">
                Give Feedback
              </h2>
              <button
                onClick={() => setSelectedTraineeForFeedback(null)}
                className="text-2xl sm:text-3xl text-red-700 font-bold hover:text-red-900 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
              <form onSubmit={submitFeedbackToSelectedTrainee} className="space-y-3 sm:space-y-4">
                {/* Trainee Info */}
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
                  <h3 className="font-bold text-red-700 mb-2 text-xs sm:text-sm">Trainee Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <p><span className="font-medium">Name:</span> {selectedTraineeForFeedback.name || selectedTraineeForFeedback.traineeName || "Not specified"}</p>
                    <p><span className="font-medium">Email:</span> {selectedTraineeForFeedback.email || selectedTraineeForFeedback.traineeEmail || "Not specified"}</p>
                    {selectedTraineeForFeedback.department && selectedTraineeForFeedback.department !== "Not specified" && (
                      <p><span className="font-medium">Department:</span> {selectedTraineeForFeedback.department}</p>
                    )}
                  </div>
                </div>

                {/* Same form sections as above */}
                <Section title="Attendance & Discipline">
                  <Select
                    label="Attendance"
                    value={formData.attendance}
                    setValue={(val) => handleInputChange('attendance', val)}
                  />
                  <Select
                    label="Discipline"
                    value={formData.discipline}
                    setValue={(val) => handleInputChange('discipline', val)}
                  />
                  <Select
                    label="Willingness to Learn"
                    value={formData.willingnessToLearn}
                    setValue={(val) => handleInputChange('willingnessToLearn', val)}
                  />
                </Section>

                <Section title="Training Performance">
                  <Select
                    label="Process Understanding"
                    value={formData.processUnderstanding}
                    setValue={(val) => handleInputChange('processUnderstanding', val)}
                  />
                  <Select
                    label="Ability to Take Calls"
                    value={formData.abilityToTakeCalls}
                    setValue={(val) => handleInputChange('abilityToTakeCalls', val)}
                  />
                  <Select
                    label="Communication Skills"
                    value={formData.communicationSkills}
                    setValue={(val) => handleInputChange('communicationSkills', val)}
                  />
                  <Select
                    label="Following Instructions"
                    value={formData.abilityToFollowInstructions}
                    setValue={(val) => handleInputChange('abilityToFollowInstructions', val)}
                  />
                </Section>

                <Section title="Final Evaluation">
                  <LongSelect
                    label="Ready for Live Calls?"
                    value={formData.readyForLiveCalls}
                    setValue={(val) => handleInputChange('readyForLiveCalls', val)}
                    options={["Yes", "No", "Needs more training"]}
                  />
                  <LongSelect
                    label="Continue Employment?"
                    value={formData.readyToContinueEmployment}
                    setValue={(val) => handleInputChange('readyToContinueEmployment', val)}
                    options={["Yes", "No", "Needs re-evaluation"]}
                  />
                </Section>

                <Section title="Trainer Remarks">
                  <div className="col-span-2">
                    <textarea
                      className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                      rows={3}
                      placeholder="Write detailed remarks about the trainee's performance..."
                      value={formData.trainerRemarks}
                      onChange={(e) => handleInputChange('trainerRemarks', e.target.value)}
                    />
                  </div>
                </Section>

                <Section title="Approval Information">
                  <Input
                    label="Trainer Name *"
                    value={formData.trainerName}
                    setValue={(val) => handleInputChange('trainerName', val)}
                    required
                  />
                  <Input
                    label="Manager Approval"
                    value={formData.managerApproval}
                    setValue={(val) => handleInputChange('managerApproval', val)}
                    placeholder="Manager's name"
                  />
                  <Input
                    type="date"
                    label="Approval Date *"
                    value={formData.approvalDate}
                    setValue={(val) => handleInputChange('approvalDate', val)}
                    required
                  />
                </Section>

                <Section title="8-Day Training Completion">
                  <LongSelect
                    label="Training Completed?"
                    value={formData.eightDayConfirmation}
                    setValue={(val) => handleInputChange('eightDayConfirmation', val)}
                    options={["YES", "NO"]}
                  />
                  <div className="col-span-2">
                    <textarea
                      className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
                      rows={2}
                      value={formData.trainerRemarksForManagement}
                      placeholder="Additional remarks for management (optional)..."
                      onChange={(e) => handleInputChange('trainerRemarksForManagement', e.target.value)}
                    />
                  </div>
                </Section>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTraineeForFeedback(null);
                      setShowTraineeList(true);
                    }}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm sm:text-base order-2 sm:order-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm sm:text-base order-1 sm:order-2"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -----------------------------------
    REUSABLE COMPONENTS
------------------------------------ */

const Section = ({ title, children }) => (
  <div className="p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 border border-gray-200 bg-gray-50">
    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 pb-1 border-b border-gray-300">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">{children}</div>
  </div>
);

const Select = ({ label, value, setValue }) => (
  <div>
    <label className="font-semibold text-gray-700 block mb-1 text-xs sm:text-sm">{label}</label>
    <select
      className="border border-gray-300 p-2 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
      value={value}
      onChange={(e) => setValue(parseInt(e.target.value))}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>{n} - {n === 1 ? 'Poor' : n === 5 ? 'Excellent' : 'Average'}</option>
      ))}
    </select>
  </div>
);

const LongSelect = ({ label, value, setValue, options }) => (
  <div className="col-span-1 sm:col-span-2">
    <label className="font-semibold text-gray-700 block mb-1 text-xs sm:text-sm">{label}</label>
    <select
      className="border border-gray-300 p-2 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const Input = ({ label, value, setValue, type = "text", placeholder = "", required = false }) => (
  <div>
    <label className="font-semibold text-gray-700 block mb-1 text-xs sm:text-sm">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      className="border border-gray-300 p-2 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default TrainerFeedback;