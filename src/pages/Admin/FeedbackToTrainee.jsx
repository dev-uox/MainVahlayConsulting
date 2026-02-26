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
        feedbackType: "trainee_feedback", // Mark where it came from
        sourceCollection: "traineeFeedback"
      }));

      // Process trainees from trainerFeedbackFinal collection
      const traineesFromTrainer = trainerFeedbackSnap.docs.map((d) => ({ 
        id: d.id, 
        ...d.data(),
        feedbackDate: d.data().feedbackDate || d.data().submissionDate || "Not specified",
        feedbackType: "trainer_feedback", // Mark where it came from
        sourceCollection: "trainerFeedbackFinal"
      }));

      // Combine both lists and remove duplicates based on traineeEmail or traineeName
      const combinedTrainees = [...traineesFromFeedback, ...traineesFromTrainer];
      
      // Remove duplicates: if same trainee appears in both collections, keep the trainer feedback version
      const uniqueTraineesMap = new Map();
      
      combinedTrainees.forEach(trainee => {
        const key = trainee.traineeEmail || trainee.userEmail || trainee.traineeName || trainee.id;
        const existing = uniqueTraineesMap.get(key);
        
        // If no existing entry, or if current is trainer feedback (which we want to prioritize)
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
    setSearchQuery(""); // Reset search when opening
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

  // View Trainee Feedback - Now handles both types
  const showFeedback = async (trainee) => {
    try {
      // Check which collection the feedback is in
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
        // For trainer feedback, just use the data we already have
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
      
      // Feedback ratings
      attendance: formData.attendance,
      discipline: formData.discipline,
      willingnessToLearn: formData.willingnessToLearn,
      processUnderstanding: formData.processUnderstanding,
      abilityToTakeCalls: formData.abilityToTakeCalls,
      communicationSkills: formData.communicationSkills,
      abilityToFollowInstructions: formData.abilityToFollowInstructions,
      
      // Evaluations
      readyForLiveCalls: formData.readyForLiveCalls,
      readyToContinueEmployment: formData.readyToContinueEmployment,
      
      // Remarks
      trainerRemarks: formData.trainerRemarks,
      trainerRemarksForManagement: formData.trainerRemarksForManagement,
      
      // Approval info
      trainerName: formData.trainerName,
      managerApproval: formData.managerApproval,
      approvalDate: formData.approvalDate,
      
      // Training completion
      eightDayConfirmation: formData.eightDayConfirmation,
      
      // Metadata
      feedbackDate: currentDate,
      submissionDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      submittedAt: Date.now()
    };
  };

  // Submit Trainer Feedback (from main list)
  const submitTrainerFeedback = async (e) => {
    e.preventDefault();
    
    // Validate required fields
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
      
      // Reset states
      setSelectedTrainee(null);
      resetFormData();
      
      // Refresh trainees list
      fetchAllTraineesData();
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    }
  };

  // Submit Feedback to selected trainee (from "Feedback To Trainee" modal)
  const submitFeedbackToSelectedTrainee = async (e) => {
    e.preventDefault();
    
    // Validate required fields
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
      
      // Reset states
      setSelectedTraineeForFeedback(null);
      setShowTraineeList(false);
      resetFormData();
      
      // Refresh trainees list
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

  // Get feedback type badge
  const getFeedbackTypeBadge = (trainee) => {
    if (trainee.feedbackType === "trainer_feedback") {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          Trainer Feedback
        </span>
      );
    } else if (trainee.feedbackType === "trainee_feedback") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          Trainee Feedback
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     
      {/* MAIN CONTENT */}
      <div className="flex-1 w-full overflow-x-hidden">
       
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-6 bg-white border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Trainer Feedback Dashboard</h1>
            <p className="text-gray-600 mt-1">View and manage all trainee feedback</p>
          </div>
          <button 
            onClick={handleFeedbackToTrainee} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Feedback To Trainee
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-8">
          {/* Main Card */}
          <div className="bg-white shadow-lg rounded-xl border border-red-100">
            {/* Header with button for mobile */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
                <div className="md:hidden">
                  <button 
                    onClick={handleFeedbackToTrainee} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Feedback To Trainee
                  </button>
                </div>
              </div>
            </div>

            {/* Trainees List */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                  <p className="text-gray-600">Loading trainees...</p>
                </div>
              ) : trainees.length > 0 ? (
                <div className="space-y-4">
                  {trainees.map((t) => (
                    <div
                      key={`${t.sourceCollection}-${t.id}`}
                      className="flex flex-col md:flex-row justify-between p-4 rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all duration-200 gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-gray-800">{t.traineeName || t.name || "Unnamed Trainee"}</p>
                            </div>
                            <p className="text-gray-600 text-sm break-all">
                              {t.traineeEmail || t.userEmail || t.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm mt-2">
                          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full">
                            Feedback Date: {formatDate(t.feedbackDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 self-center">
                        <button
                          onClick={() => showFeedback(t)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 min-w-[140px] justify-center"
                        >
                          View Feedback
                        </button>
                        <button
                          onClick={() => setSelectedTrainee(t)}
                          className="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2 min-w-[140px] justify-center"
                        >
                          {t.feedbackType === "trainer_feedback" ? "Update Feedback" : "Trainer Feedback"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Feedback Yet</h3>
                  <p className="text-gray-500 mb-6">No trainees have given or received feedback yet.</p>
                  <button 
                    onClick={handleFeedbackToTrainee} 
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Give First Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW Feedback POPUP - Improved for Mobile */}
      {viewFeedbackData && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2 md:p-4 z-50">
          <div className="bg-white w-full h-full md:h-auto md:w-full md:max-w-lg md:max-h-[90vh] md:rounded-xl shadow-2xl md:border-t-4 md:border-red-600 flex flex-col">
            {/* Mobile Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-red-700 truncate">
                {viewFeedbackData.feedbackType === "trainer_feedback" ? "Trainer Feedback" : "Trainee Feedback"}
              </h2>
              <button 
                onClick={() => setViewFeedbackData(null)} 
                className="text-2xl md:text-3xl text-red-700 font-bold hover:text-red-900 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Trainee Info Card */}
              <div className="mb-4 p-3 md:p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="font-bold text-red-700 mb-2 text-sm md:text-base">Trainee Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Name:</span>
                    <p className="text-gray-800 mt-0.5">{viewFeedbackData.traineeName || viewFeedbackData.name || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Email:</span>
                    <p className="text-gray-800 mt-0.5 break-words">{viewFeedbackData.traineeEmail || viewFeedbackData.userEmail || viewFeedbackData.email || "Not specified"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 text-sm">Feedback Date:</span>
                    <span className="text-gray-800">{formatDate(viewFeedbackData.feedbackDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Feedback Type:</span>
                    <p className="text-gray-800 mt-0.5">
                      {viewFeedbackData.feedbackType === "trainer_feedback" ? "Trainer Feedback" : "Trainee Feedback"}
                    </p>
                  </div>
                </div>
              </div>

              {viewFeedbackData.feedbackType === "trainee_feedback" ? (
                <>
                  {/* Training Quality - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Training Quality</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Clarity:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.clarity || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Communication:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainerCommunication || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Knowledge:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainerKnowledge || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Support:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainingSupport || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Material Quality:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainingMaterial || "Not rated"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Overall Assessment - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Overall Assessment</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Confidence Level:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.confidence || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Areas Needing Help:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.areasHelpNeeded || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Additional Comments:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.comments || "No comments"}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Attendance & Discipline - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Attendance & Discipline</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Attendance:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.attendance || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Discipline:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.discipline || "Not rated"}</p>
                      </div>
                      <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Willingness to Learn:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.willingnessToLearn || "Not rated"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Training Performance - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Training Performance</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Process Understanding:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.processUnderstanding || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Ability to Take Calls:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.abilityToTakeCalls || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Communication Skills:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.communicationSkills || "Not rated"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Following Instructions:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.abilityToFollowInstructions || "Not rated"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Final Evaluation - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Final Evaluation</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Ready for Live Calls:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.readyForLiveCalls || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Continue Employment:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.readyToContinueEmployment || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Trainer Remarks:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainerRemarks || "No remarks"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Approval Information - Mobile Optimized */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300 text-base">Approval Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Trainer Name:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainerName || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Manager Approval:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.managerApproval || "Not specified"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">Approval Date:</span>
                        <p className="text-gray-700 mt-1 text-sm">{formatDate(viewFeedbackData.approvalDate)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900 text-sm">8-Day Training Completed:</span>
                        <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.eightDayConfirmation || "NO"}</p>
                      </div>
                      {viewFeedbackData.trainerRemarksForManagement && (
                        <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-900 text-sm">Management Remarks:</span>
                          <p className="text-gray-700 mt-1 text-sm">{viewFeedbackData.trainerRemarksForManagement}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Close Button for Mobile */}
              <div className="md:hidden mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setViewFeedbackData(null)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GIVE/UPDATE Trainer Feedback POPUP (from main list) */}
      {selectedTrainee && (
        <Popup
          onClose={() => setSelectedTrainee(null)}
          title={`${selectedTrainee.feedbackType === "trainer_feedback" ? "Update" : "Give"} Trainer Feedback — ${selectedTrainee.traineeName || selectedTrainee.name || "Trainee"}`}
        >
          <form onSubmit={submitTrainerFeedback} className="space-y-4">
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <h3 className="font-bold text-red-700 mb-2">Trainee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p><span className="font-medium">Name:</span> {selectedTrainee.traineeName || selectedTrainee.name || "Not specified"}</p>
                <p><span className="font-medium">Email:</span> {selectedTrainee.traineeEmail || selectedTrainee.userEmail || selectedTrainee.email || "Not specified"}</p>
                <p><span className="font-medium">Current Status:</span> {selectedTrainee.feedbackType === "trainer_feedback" ? "Has Trainer Feedback" : "Has Trainee Feedback"}</p>
                {selectedTrainee.feedbackDate && (
                  <p>
                    <span className="font-medium">Last Feedback:</span> {formatDate(selectedTrainee.feedbackDate)}
                  </p>
                )}
              </div>
            </div>

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
              <textarea 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4} 
                placeholder="Write detailed remarks about the trainee's performance, strengths, and areas for improvement..."
                value={formData.trainerRemarks} 
                onChange={(e) => handleInputChange('trainerRemarks', e.target.value)} 
              />
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

              <textarea
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                value={formData.trainerRemarksForManagement}
                placeholder="Additional remarks for management (optional)..."
                onChange={(e) => handleInputChange('trainerRemarksForManagement', e.target.value)}
              />
            </Section>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setSelectedTrainee(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                {selectedTrainee.feedbackType === "trainer_feedback" ? "Update Feedback" : "Submit Feedback"}
              </button>
            </div>
          </form>
        </Popup>
      )}

      {/* FEEDBACK TO TRAINEE POPUP (List all trainees) */}
      {showTraineeList && (
        <Popup
          onClose={() => {
            setShowTraineeList(false);
            setSearchQuery("");
          }}
          title="Select Trainee for Feedback"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {filteredTrainees.length} {filteredTrainees.length === 1 ? 'trainee' : 'trainees'} found
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Trainees List */}
          <div className="space-y-3 h-[60vh] md:h-[50vh] overflow-y-auto pr-2">
            {filteredTrainees.length > 0 ? (
              filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                >
                  <div className="flex-1 mb-3 md:mb-0">
                    <div className="mb-2">
                      <p className="font-bold text-gray-800 text-md">
                        {trainee.name || trainee.traineeName || trainee.email || `Trainee ${trainee.id}`}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 break-all">
                        {trainee.email || trainee.traineeEmail || "No email provided"}
                      </p>
                    </div>
                    {trainee.department && trainee.department !== "Not specified" && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {trainee.department}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTraineeForFeedback(trainee);
                      setShowTraineeList(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    Give Feedback
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchQuery ? 'No matching trainees found' : 'No Trainees Found'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try a different search term or clear the search'
                    : 'No trainees found in the database. Please add trainees to provide feedback.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </Popup>
      )}

      {/* FEEDBACK FORM FOR SELECTED TRAINEE (from "Feedback To Trainee") */}
      {selectedTraineeForFeedback && (
        <Popup
          onClose={() => setSelectedTraineeForFeedback(null)}
          title={`Give Feedback — ${selectedTraineeForFeedback.name || selectedTraineeForFeedback.email || "Trainee"}`}
        >
          <form onSubmit={submitFeedbackToSelectedTrainee} className="space-y-4">
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <h3 className="font-bold text-red-700 mb-2">Trainee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p><span className="font-medium">Name:</span> {selectedTraineeForFeedback.name || selectedTraineeForFeedback.traineeName || "Not specified"}</p>
                <p><span className="font-medium">Email:</span> {selectedTraineeForFeedback.email || selectedTraineeForFeedback.traineeEmail || "Not specified"}</p>
                {selectedTraineeForFeedback.department && selectedTraineeForFeedback.department !== "Not specified" && (
                  <p><span className="font-medium">Department:</span> {selectedTraineeForFeedback.department}</p>
                )}
              </div>
            </div>

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
              <textarea 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4} 
                placeholder="Write detailed remarks about the trainee's performance, strengths, and areas for improvement..."
                value={formData.trainerRemarks} 
                onChange={(e) => handleInputChange('trainerRemarks', e.target.value)} 
              />
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

              <textarea
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                value={formData.trainerRemarksForManagement}
                placeholder="Additional remarks for management (optional)..."
                onChange={(e) => handleInputChange('trainerRemarksForManagement', e.target.value)}
              />
            </Section>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedTraineeForFeedback(null);
                  setShowTraineeList(true);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </Popup>
      )}
    </div>
  );
};

/* -----------------------------------
    REUSABLE COMPONENTS (keep these the same)
------------------------------------ */

const Popup = ({ children, onClose, title }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-2 md:p-4 z-50">
    <div className="bg-white w-full h-full md:h-auto md:w-full md:max-w-lg md:max-h-[90vh] md:rounded-xl shadow-2xl md:border-t-4 md:border-red-600 flex flex-col">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 md:border-b md:border-red-100 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-red-700 truncate">{title}</h2>
        <button 
          onClick={onClose} 
          className="text-2xl md:text-3xl text-red-700 font-bold hover:text-red-900 transition"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="p-4 md:p-5 rounded-lg md:rounded-xl mb-4 md:mb-5 border border-gray-200 bg-gray-50">
    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 pb-2 border-b border-gray-300">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">{children}</div>
  </div>
);

const TwoCol = ({ label, value }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <span className="font-semibold text-gray-900 text-sm md:text-base">{label}:</span>
    <p className="text-gray-700 mt-1 text-sm">{value}</p>
  </div>
);

const OneCol = ({ label, value }) => (
  <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
    <span className="font-semibold text-gray-900 text-sm md:text-base">{label}:</span>
    <p className="text-gray-700 mt-1 text-sm">{value}</p>
  </div>
);

const Select = ({ label, value, setValue }) => (
  <div>
    <label className="font-semibold text-gray-700 block mb-1 text-sm md:text-base">{label}</label>
    <select 
      className="border border-gray-300 p-2.5 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
  <div className="col-span-1 md:col-span-2">
    <label className="font-semibold text-gray-700 block mb-1 text-sm md:text-base">{label}</label>
    <select 
      className="border border-gray-300 p-2.5 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
    <label className="font-semibold text-gray-700 block mb-1 text-sm md:text-base">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input 
      type={type} 
      className="border border-gray-300 p-2.5 rounded-lg w-full bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
      value={value} 
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default TrainerFeedback;