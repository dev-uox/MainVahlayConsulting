import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig"; // Make sure storage is exported
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [trainerFeedback, setTrainerFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    bloodgroup: "",
    nationality: "",
    religion: "",
    address: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    position: "",
    joiningDate: "",
    applicationDate: "",
    nightShift: "",
    firstJob: "",
    pressure: "",
    interestInPosition: "",
    leaveOrganization: false,
    exitDate: "",
    exitType: "",
    exitReason: "",
    noPreviousDocReason: "",
    usSalesExperience: "",
    adharCardFrontUrl: "",
    adharCardBackUrl: "",
    panCardUrl: "",
    resumeUrl: "",
    previousCompanyDocUrl: "",
  });

  const navigate = useNavigate();
  const auth = getAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file upload
  const handleFileUpload = async (file, fieldName) => {
    if (!file || !user?.email) return null;

    try {
      setUploading(true);
      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: 0,
      }));

      // Create a unique file name
      const fileName = `${user.email}_${fieldName}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `user-documents/${user.email}/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Simulate progress
      setUploadProgress((prev) => ({
        ...prev,
        [fieldName]: 100,
      }));

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update state with new URL
      setUserProfile((prev) => ({
        ...prev,
        [fieldName]: downloadURL,
      }));

      return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      alert(`Failed to upload ${fieldName}. Please try again.`);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [fieldName]: undefined,
        }));
      }, 2000);
    }
  };

  // Load trainer feedback
  useEffect(() => {
    if (!user?.email) return;

    const loadFeedback = async () => {
      try {
        const q = query(
          collection(db, "trainerFeedbackFinal"),
          where("traineeId", "==", user.email)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const feedback = snap.docs[0].data();
          setTrainerFeedback(feedback);
        } else {
          setTrainerFeedback(null);
        }
      } catch (error) {
        console.error("Error loading trainer feedback:", error);
      }
    };

    loadFeedback();
  }, [user]);

  // Load user profile and agreement
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const q = query(
          collection(db, "jobApplications"),
          where("email", "==", currentUser.email)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();

          setDocId(d.id);

          setUserProfile((prev) => ({
            ...prev,
            ...data,
            email: currentUser.email,
          }));

          // Load agreement
          try {
            const agreementRef = doc(db, "agreements", d.id);
            const agreementSnap = await getDoc(agreementRef);

            if (agreementSnap.exists()) {
              setAgreement({
                id: agreementSnap.id,
                ...agreementSnap.data(),
              });
            } else {
              setAgreement(null);
            }
          } catch (err) {
            console.error("Error fetching agreement:", err);
            setAgreement(null);
          }
        } else {
          console.log("No document found for email:", currentUser.email);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Update Firestore + Auth
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!user || !docId) {
      alert("User document not loaded.");
      return;
    }

    try {
      // Update Firebase Auth displayName
      await updateProfile(user, {
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
      });

      // Update Firestore document
      const userRef = doc(db, "jobApplications", docId);

      await updateDoc(userRef, {
        ...userProfile,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p>You are not logged in.</p>
      </div>
    );
  }

  const fullName = `${userProfile.firstName || ""} ${
    userProfile.lastName || ""
  }`.trim();
  const initials =
    (userProfile.firstName?.[0] || "") + (userProfile.lastName?.[0] || "");

  // File upload component
  const FileUploadField = ({ label, fieldName, accept = "*" }) => {
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handleFileUpload(file, fieldName);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-500">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {userProfile[fieldName] ? (
            <div className="flex items-center gap-2">
              <a
                href={userProfile[fieldName]}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 text-sm underline"
              >
                View current file
              </a>
              <span className="text-xs text-slate-400">•</span>
            </div>
          ) : (
            <span className="text-sm text-slate-500">No file uploaded</span>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
              uploading
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}>
              {uploadProgress[fieldName] ? "Uploading..." : "Upload New"}
            </span>
          </label>
          {uploadProgress[fieldName] !== undefined && (
            <div className="w-24 bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress[fieldName]}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center pt-6 md:pt-10">
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-red-200 flex items-center justify-center text-5xl font-semibold text-red-600">
              {initials || "U"}
            </div>
            <div className="pb-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {fullName || "Your Name"}
              </h1>
              <p className="text-sm text-slate-500">
                {userProfile.position || "Add your job title"}
              </p>
            </div>
          </div>

          <div className="md:ml-auto mb-3 flex flex-wrap gap-3 items-center">
            {/* TRAINING BUTTON ADDED HERE - UPDATED TO THEME COLORS */}
            <a
              href="https://training.vahlayconsulting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gray-700 shadow-sm hover:bg-gray-900 transition-all flex items-center gap-2"
            >
              <span>🚀</span> Go to Training
            </a>

            {agreement ? (
              agreement.candidateHasSigned ? (
                <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-300">
                  Agreement Completed
                </span>
              ) : (
                <button
                  onClick={() => navigate(`/my-agreement/${docId}`)}
                  className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full border border-amber-300 hover:bg-amber-200 flex items-center gap-2"
                >
                  Agreement Pending – Upload Signature
                  <span className="blink-dot" />
                </button>
              )
            ) : (
              <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-300">
                Agreement Not Created
              </span>
            )}

            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-red-600 shadow-sm hover:bg-red-700"
            >
              {isEditing ? "Cancel" : "Edit profile"}
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* About card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase">
                About
              </h2>
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-slate-400">💼</span>
                  <div>
                    <p className="font-medium text-slate-900">Your job title</p>
                    <p className="text-slate-600">
                      {userProfile.position || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-slate-400">🧩</span>
                  <div>
                    <p className="font-medium text-slate-900">Your department</p>
                    <p className="text-slate-600">
                      {userProfile.department || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-slate-400">🏢</span>
                  <div>
                    <p className="font-medium text-slate-900">Your organization</p>
                    <p className="text-slate-600">
                      {userProfile.organization || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-slate-400">📍</span>
                  <div>
                    <p className="font-medium text-slate-900">Your location</p>
                    <p className="text-slate-600">
                      {userProfile.currentAddress ||
                        userProfile.address ||
                        "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase">
                Contact
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <p className="text-slate-600 break-all">
                    {userProfile.email}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Phone</p>
                  <p className="text-slate-600">
                    {userProfile.phone || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Trainer Feedback Card */}
            {trainerFeedback && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">
                    Trainer Feedback
                  </h2>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-4 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
                  >
                    View Feedback
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* VIEW MODE */}
            {!isEditing && (
              <>
                {/* Personal Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Personal information
                  </h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-500">Full name</span>
                      <br />
                      {fullName || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Date of birth</span>
                      <br />
                      {userProfile.dob || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Blood group</span>
                      <br />
                      {userProfile.bloodgroup || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Nationality</span>
                      <br />
                      {userProfile.nationality || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Religion</span>
                      <br />
                      {userProfile.religion || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Address & Emergency */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Addresses & emergency contact
                  </h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-500">Current address</span>
                      <br />
                      {userProfile.currentAddress || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Permanent address</span>
                      <br />
                      {userProfile.permanentAddress || "Not set"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium text-slate-500">Other address</span>
                      <br />
                      {userProfile.address || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Emergency contact name</span>
                      <br />
                      {userProfile.emergencyContactName || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Emergency contact number</span>
                      <br />
                      {userProfile.emergencyContactNumber || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Job Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Job information
                  </h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-500">Position</span>
                      <br />
                      {userProfile.position || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Application date</span>
                      <br />
                      {userProfile.applicationDate || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Joining date</span>
                      <br />
                      {userProfile.joiningDate || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Night shift</span>
                      <br />
                      {userProfile.nightShift || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">First job</span>
                      <br />
                      {userProfile.firstJob || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">US sales experience</span>
                      <br />
                      {userProfile.usSalesExperience || "Not set"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium text-slate-500">Handle pressure</span>
                      <br />
                      {userProfile.pressure || "Not set"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium text-slate-500">Interest in position</span>
                      <br />
                      {userProfile.interestInPosition || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Exit info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Exit information
                  </h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-500">Leave organization</span>
                      <br />
                      {userProfile.leaveOrganization ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Exit date</span>
                      <br />
                      {userProfile.exitDate || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Exit type</span>
                      <br />
                      {userProfile.exitType || "Not set"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium text-slate-500">Exit reason</span>
                      <br />
                      {userProfile.exitReason || "Not set"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-medium text-slate-500">No previous document reason</span>
                      <br />
                      {userProfile.noPreviousDocReason || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Documents View Mode */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Documents
                  </h2>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-slate-500 text-sm mb-1">Aadhar card (front)</p>
                        {userProfile.adharCardFrontUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={userProfile.adharCardFrontUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 text-sm underline"
                            >
                              View
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Not uploaded</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-sm mb-1">Aadhar card (back)</p>
                        {userProfile.adharCardBackUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={userProfile.adharCardBackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 text-sm underline"
                            >
                              View
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Not uploaded</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-sm mb-1">PAN card</p>
                        {userProfile.panCardUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={userProfile.panCardUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 text-sm underline"
                            >
                              View
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Not uploaded</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-sm mb-1">Resume</p>
                        {userProfile.resumeUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={userProfile.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 text-sm underline"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Not uploaded</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500 text-sm mb-1">Previous company document</p>
                      {userProfile.previousCompanyDocUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={userProfile.previousCompanyDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 text-sm underline"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">Not uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EDIT MODE FORM */}
            {isEditing && (
              <form
                onSubmit={handleUpdateProfile}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-6"
              >
                <h2 className="text-base font-semibold text-slate-900 mb-2">
                  Edit profile
                </h2>

                {/* Personal */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Personal information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={userProfile.firstName}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={userProfile.lastName}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userProfile.email}
                        disabled
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm bg-slate-50 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={userProfile.phone}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Date of birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={userProfile.dob}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Blood group
                      </label>
                      <input
                        type="text"
                        name="bloodgroup"
                        value={userProfile.bloodgroup}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={userProfile.nationality}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Religion
                      </label>
                      <input
                        type="text"
                        name="religion"
                        value={userProfile.religion}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Addresses & emergency */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Addresses & emergency contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Current address
                      </label>
                      <textarea
                        name="currentAddress"
                        value={userProfile.currentAddress}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Permanent address
                      </label>
                      <textarea
                        name="permanentAddress"
                        value={userProfile.permanentAddress}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Other address
                      </label>
                      <textarea
                        name="address"
                        value={userProfile.address}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Emergency contact name
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={userProfile.emergencyContactName}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Emergency contact number
                      </label>
                      <input
                        type="text"
                        name="emergencyContactNumber"
                        value={userProfile.emergencyContactNumber}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Job info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Job information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={userProfile.position}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Application date
                      </label>
                      <input
                        type="date"
                        name="applicationDate"
                        value={userProfile.applicationDate}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Joining date
                      </label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={userProfile.joiningDate}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Night shift
                      </label>
                      <input
                        type="text"
                        name="nightShift"
                        value={userProfile.nightShift}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        First job
                      </label>
                      <input
                        type="text"
                        name="firstJob"
                        value={userProfile.firstJob}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        US sales experience
                      </label>
                      <input
                        type="text"
                        name="usSalesExperience"
                        value={userProfile.usSalesExperience}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Handle pressure
                      </label>
                      <textarea
                        name="pressure"
                        value={userProfile.pressure}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Interest in position
                      </label>
                      <textarea
                        name="interestInPosition"
                        value={userProfile.interestInPosition}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Exit info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Exit information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="leaveOrganization"
                        name="leaveOrganization"
                        checked={userProfile.leaveOrganization}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <label
                        htmlFor="leaveOrganization"
                        className="text-xs font-medium text-slate-600"
                      >
                        Has left organization
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Exit date
                      </label>
                      <input
                        type="date"
                        name="exitDate"
                        value={userProfile.exitDate}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Exit type
                      </label>
                      <input
                        type="text"
                        name="exitType"
                        value={userProfile.exitType}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Exit reason
                      </label>
                      <textarea
                        name="exitReason"
                        value={userProfile.exitReason}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        No previous document reason
                      </label>
                      <textarea
                        name="noPreviousDocReason"
                        value={userProfile.noPreviousDocReason}
                        onChange={handleInputChange}
                        className="p-2.5 border border-slate-200 rounded-lg w-full text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Documents with File Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Documents
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FileUploadField
                        label="Aadhar Card (Front)"
                        fieldName="adharCardFrontUrl"
                        accept="image/*,.pdf"
                      />
                      <FileUploadField
                        label="Aadhar Card (Back)"
                        fieldName="adharCardBackUrl"
                        accept="image/*,.pdf"
                      />
                      <FileUploadField
                        label="PAN Card"
                        fieldName="panCardUrl"
                        accept="image/*,.pdf"
                      />
                      <FileUploadField
                        label="Resume"
                        fieldName="resumeUrl"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                    <div>
                      <FileUploadField
                        label="Previous Company Document"
                        fieldName="previousCompanyDocUrl"
                        accept="image/*,.pdf"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`px-6 py-2 rounded-full text-sm font-medium text-white ${
                      uploading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-sky-600 hover:bg-sky-700"
                    }`}
                  >
                    {uploading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && trainerFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Trainer Feedback Summary
            </h2>
            <div className="space-y-3 text-sm text-slate-700">
              <p><strong>Trainer Name:</strong> {trainerFeedback.trainerName}</p>
              <p><strong>Trainee Name:</strong> {trainerFeedback.traineeName}</p>
              <p><strong>Trainee Email:</strong> {trainerFeedback.traineeEmail}</p>
              <p><strong>Attendance:</strong> {trainerFeedback.attendance}</p>
              <p><strong>Discipline:</strong> {trainerFeedback.discipline}</p>
              <p><strong>Willingness To Learn:</strong> {trainerFeedback.willingnessToLearn}</p>
              <p><strong>Process Understanding:</strong> {trainerFeedback.processUnderstanding}</p>
              <p><strong>Ability To Take Calls:</strong> {trainerFeedback.abilityToTakeCalls}</p>
              <p><strong>Ability To Follow Instructions:</strong> {trainerFeedback.abilityToFollowInstructions}</p>
              <p><strong>Communication Skills:</strong> {trainerFeedback.communicationSkills}</p>
              <p><strong>Manager Approval:</strong> {trainerFeedback.managerApproval}</p>
              <p><strong>Approval Date:</strong> {trainerFeedback.approvalDate}</p>
              <p><strong>8-Day Confirmation:</strong> {trainerFeedback.eightDayConfirmation}</p>
              <p><strong>Ready for Live Calls:</strong> {trainerFeedback.readyForLiveCalls}</p>
              <p><strong>Continue Employment:</strong> {trainerFeedback.readyToContinueEmployment}</p>
              <p><strong>Trainer Remarks:</strong><br/>{trainerFeedback.trainerRemarks}</p>
              <p><strong>Remarks For Management:</strong><br/>{trainerFeedback.trainerRemarksForManagement}</p>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;