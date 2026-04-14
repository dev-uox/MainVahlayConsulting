// src/components/ApplicationForm.jsx

import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

import Select from "react-select";
import countryList from "react-select-country-list";

// PDF generation (works on mobile too)
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

/* -----------------------------------------------------------
   iOS/Android friendly helpers
----------------------------------------------------------- */

// Local (timezone-safe) YYYY-MM-DD string
const toLocalISODate = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Pretty label for select (safe on iOS)
const formatLong = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const todayLocalISO = () => toLocalISODate(new Date());

/* -----------------------------------------------------------
   Component
----------------------------------------------------------- */
export default function ApplicationForm() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const countryOptions = useMemo(() => countryList().getData(), []);
  const auth = getAuth();
  const usr = auth.currentUser;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) {
        setUser(usr);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationality: "", // store as country label string for now
    currentAddress: "",
    permanentAddress: "",
    phone: "",
    email: "",
    position: "",
    dob: "",
    bloodgroup: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactNumber: "",
    joiningDate: "",
    firstJob: "",
    nightShift: "",
    pressure: "",
    religion: "",
    usSalesExperience: "",
    interestInPosition: "",
    // files
    resume: null,
    nationalID: null,
    passport: null,
    efrroForm: null,
    immigrationForm: null,
    adharCardFront: null,
    adharCardBack: null,
    panCard: null,
    previousCompanyDoc: null,

    noPreviousDocReason: "",
    applicationDate: toLocalISODate(new Date()),
    previousCompanyExitType: "",
    previousCompanyExitReason: "",
    previousCompanyLastWorkingDate: "",
  });

  const [isSameAddress, setIsSameAddress] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noPreviousDoc, setNoPreviousDoc] = useState(false);
  const [dateList, setDateList] = useState([]); // ISO strings only
  const [trainingAccepted, setTrainingAccepted] = useState(false); //sales condition

  // 18+ only
  const maxDOB = toLocalISODate(
    new Date(
      new Date().getFullYear() - 18,
      new Date().getMonth(),
      new Date().getDate()
    )
  );

  // Fetch available joining dates from Firestore and convert to ISO
  useEffect(() => {
    (async () => {
      const snapshot = await getDocs(collection(db, "dateList"));
      const fetchedISO = snapshot.docs
        .map((doc) => {
          const raw = doc.data().date; // could be a Firestore Timestamp or string
          if (!raw) return null;
          if (typeof raw === "string") return raw; // assume 'YYYY-MM-DD'
          if (raw.toDate) return toLocalISODate(raw.toDate());
          // Fallback: attempt Date construct
          return toLocalISODate(new Date(raw));
        })
        .filter(Boolean);

      const upcoming = fetchedISO
        .filter((iso) => iso >= todayLocalISO())
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

      setDateList(upcoming);
    })();
  }, []);

  // Change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "currentAddress") {
      setFormData((prev) => {
        const updated = { ...prev, currentAddress: value };
        if (isSameAddress) updated.permanentAddress = value;
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.currentAddress,
      }));
    }
  };

  // Robust file validation for iOS (MIME can be empty; HEIC allowed)
  const handleFileChange = (e) => {
    const removeFile = (name) => {
      setFormData((prev) => ({ ...prev, [name]: null }));
    };

    const { name, files } = e.target;
    const file = files?.[0];
    const maxFileSize = 5 * 1024 * 1024;

    if (!file) return;

    if (file.size > maxFileSize) {
      alert("File size should not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const type = file.type || ""; // can be "" on iOS
    const isPdf = type === "application/pdf" || ext === "pdf";
    const isImage =
      type.startsWith("image/") ||
      ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext);

    const needsPdf = ["resume", "previousCompanyDoc"].includes(name);
    const needsImg = ["adharCardFront", "adharCardBack", "panCard"].includes(
      name
    );

    if (needsPdf && !isPdf) {
      alert(
        "Please upload PDF files only for resume and previous company doc."
      );
      e.target.value = "";
      return;
    }
    if (needsImg && !isImage) {
      alert("Please upload image files only for Aadhar/PAN.");
      e.target.value = "";
      return;
    }

    // Passport: allow PDF or image (common on mobile)
    if (name === "passport" && !(isPdf || isImage)) {
      alert("Please upload a Passport as PDF or an image.");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guided validation: each entry maps field → { step, label }
    const isIndia = formData.nationality === "India";

    const fieldMap = [
      { field: "firstName",                  step: 1, label: "First Name" },
      { field: "lastName",                   step: 1, label: "Last Name" },
      { field: "phone",                      step: 1, label: "Phone Number" },
      { field: "dob",                        step: 1, label: "Date of Birth" },
      { field: "currentAddress",             step: 1, label: "Current Address" },
      ...(!isSameAddress ? [{ field: "permanentAddress", step: 1, label: "Permanent Address" }] : []),
      { field: "nationality",                step: 1, label: "Country of Citizenship" },
      { field: "religion",                   step: 1, label: "Religion" },
      { field: "bloodgroup",                 step: 1, label: "Blood Group" },
      { field: "emergencyContactName",       step: 1, label: "Emergency Contact Name" },
      { field: "emergencyContactRelation",   step: 1, label: "Emergency Contact Relation" },
      { field: "emergencyContactNumber",     step: 1, label: "Emergency Contact Number" },
      { field: "position",                   step: 2, label: "Position Applying For" },
      { field: "joiningDate",               step: 2, label: "Preferred Joining Date" },
      { field: "firstJob",                   step: 2, label: "Is This Your First Job?" },
      { field: "nightShift",                 step: 2, label: "Comfortable in Night Shift?" },
      { field: "pressure",                   step: 2, label: "Able to Work Under Pressure?" },
      { field: "usSalesExperience",          step: 2, label: "Experience in US/Canada Market?" },
      { field: "interestInPosition",         step: 2, label: "Why Are You Interested in This Position?" },
      { field: "resume",                     step: 3, label: "Resume (PDF)" },
      ...(isIndia
        ? [
            { field: "adharCardFront", step: 3, label: "Aadhar Card - Front" },
            { field: "adharCardBack",  step: 3, label: "Aadhar Card - Back" },
            { field: "panCard",        step: 3, label: "PAN Card" },
          ]
        : [{ field: "passport", step: 3, label: "Passport" }]),
      ...(formData.firstJob === "No"
        ? [
            { field: "previousCompanyExitType",        step: 3, label: "Type of Exit (Previous Company)" },
            { field: "previousCompanyExitReason",      step: 3, label: "Reason for Exit (Previous Company)" },
            { field: "previousCompanyLastWorkingDate", step: 3, label: "Last Working Date (Previous Company)" },
          ]
        : []),
    ];

    // Find first missing field
    const missing = fieldMap.find(
      ({ field }) => !formData[field] || formData[field] === ""
    );

    if (missing) {
      setCurrentStep(missing.step);
      alert(`⚠️ Step ${missing.step} — Please fill in: "${missing.label}"`);
      return;
    }

    // Previous company doc check
    if (
      formData.firstJob === "No" &&
      !formData.previousCompanyDoc &&
      !noPreviousDoc
    ) {
      setCurrentStep(3);
      alert("⚠️ Step 3 — Please upload your Previous Company Document, or check \"No Document Available\" and provide a reason.");
      return;
    }

    if (!termsAccepted) {
      setCurrentStep(3);
      alert("⚠️ Step 3 — Please accept the Terms and Conditions before submitting.");
      return;
    }

    if (
      formData.position === "Business Development Associate" &&
      !trainingAccepted
    ) {
      setCurrentStep(3);
      alert("⚠️ Step 3 — Please accept the Training Condition in the Terms and Conditions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadFileAndGetUrl = async (file, folder) => {
        const safeName = `${Date.now()}_${file.name}`; // unique to avoid collisions
        const fileRef = ref(storage, `${folder}/${safeName}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
      };

      const maybeUpload = async (file, folder, condition = true) => {
        if (!file || !condition) return "";
        return await uploadFileAndGetUrl(file, folder);
      };

      // Uploads in parallel
      const [
        resumeUrl,
        adharCardFrontUrl,
        adharCardBackUrl,
        panCardUrl,
        previousCompanyDocUrl,
        passportUrl,
        nationalIDUrl,
        efrroFormUrl,
        immigrationFormUrl,
      ] = await Promise.all([
        maybeUpload(formData.resume, "resumes"),
        maybeUpload(formData.adharCardFront, "adharCards/front"),
        maybeUpload(formData.adharCardBack, "adharCards/back"),
        maybeUpload(formData.panCard, "panCards"),
        maybeUpload(
          formData.previousCompanyDoc,
          "previousCompanyDocs",
          !noPreviousDoc
        ),
        maybeUpload(formData.passport, "passports"),
        maybeUpload(formData.nationalID, "nationalIDs"),
        maybeUpload(formData.efrroForm, "efrroForms"),
        maybeUpload(formData.immigrationForm, "immigrationForms"),
      ]);

      // Store in Firestore
      await addDoc(collection(db, "jobApplications"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationality: formData.nationality,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        phone: formData.phone,
        email: user.email,
        position: formData.position,
        dob: formData.dob,
        bloodgroup: formData.bloodgroup,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactRelation: formData.emergencyContactRelation,
        emergencyContactNumber: formData.emergencyContactNumber,
        joiningDate: formData.joiningDate,
        firstJob: formData.firstJob,
        nightShift: formData.nightShift,
        pressure: formData.pressure,
        religion: formData.religion,
        usSalesExperience: formData.usSalesExperience,
        interestInPosition: formData.interestInPosition,

        resumeUrl,
        adharCardFrontUrl,
        adharCardBackUrl,
        panCardUrl,
        previousCompanyDocUrl,
        passportUrl,
        nationalIDUrl,
        efrroFormUrl,
        immigrationFormUrl,

        noPreviousDoc,
        noPreviousDocReason: formData.noPreviousDocReason || "",

        applicationDate: formData.applicationDate,
        previousCompanyExitType: formData.previousCompanyExitType || "",
        previousCompanyExitReason: formData.previousCompanyExitReason || "",
        previousCompanyLastWorkingDate:
          formData.previousCompanyLastWorkingDate || "",
      });

      // Mark form as completed for this user
      await setDoc(
        doc(db, "jobApplications", user.email.toLowerCase()),
        { formCompleted: true },
        { merge: true }
      );

      // Build PDF
      const docDefinition = {
        content: [
          { text: "Job Application Summary", style: "header" },
          { text: `Name: ${formData.firstName} ${formData.lastName}` },
          { text: `Email: ${user.email}` },
          { text: `Phone: ${formData.phone}` },
          { text: `Country: ${formData.nationality}` },
          { text: `Position: ${formData.position}` },
          { text: `DOB: ${formData.dob}` },
          { text: `Blood Group: ${formData.bloodgroup}` },
          { text: `Joining Date: ${formData.joiningDate}` },
          { text: `First Job: ${formData.firstJob}` },
          { text: `Night Shift: ${formData.nightShift}` },
          { text: `Handles Pressure: ${formData.pressure}` },
          { text: `Religion: ${formData.religion}` },
          { text: `US Sales Experience: ${formData.usSalesExperience}` },
          { text: `Interested in Position: ${formData.interestInPosition}` },
          {
            text: `Emergency Contact: ${formData.emergencyContactName} (${formData.emergencyContactNumber})`,
          },
          ...(formData.firstJob === "No"
            ? [
              {
                text: `Previous Company Exit Type: ${formData.previousCompanyExitType}`,
              },
              {
                text: `Previous Company Exit Reason: ${formData.previousCompanyExitReason}`,
              },
              {
                text: `Previous Company Last Working Date: ${formData.previousCompanyLastWorkingDate}`,
              },
            ]
            : []),
          { text: "\nThank you for applying!", style: "subheader" },
        ],
        styles: {
          header: { fontSize: 18, bold: true, marginBottom: 10 },
          subheader: { fontSize: 14, italics: true, marginTop: 20 },
        },
      };

      // Send PDF via your Cloud Function
      pdfMake.createPdf(docDefinition).getBase64(async (base64) => {
        await fetch(
          "https://us-central1-vahlay1.cloudfunctions.net/sendApplicationPDF",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              base64Pdf: base64,
            }),
          }
        );
      });

      alert("Form submitted successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert(`An error occurred while submitting the form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Per-step validation before advancing
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.firstName.trim()) { alert("Please enter your First Name."); return false; }
      if (!formData.lastName.trim()) { alert("Please enter your Last Name."); return false; }
      if (!formData.phone.trim()) { alert("Please enter your Phone Number."); return false; }
      if (!formData.dob) { alert("Please enter your Date of Birth."); return false; }
      if (!formData.currentAddress.trim()) { alert("Please enter your Current Address."); return false; }
      if (!isSameAddress && !formData.permanentAddress.trim()) { alert("Please enter your Permanent Address."); return false; }
      if (!formData.nationality) { alert("Please select your Country of Citizenship."); return false; }
      if (!formData.religion.trim()) { alert("Please enter your Religion."); return false; }
      if (!formData.bloodgroup.trim()) { alert("Please enter your Blood Group."); return false; }
      if (!formData.emergencyContactName.trim()) { alert("Please enter the Emergency Contact Name."); return false; }
      if (!formData.emergencyContactRelation) { alert("Please select the Emergency Contact Relation."); return false; }
      if (!formData.emergencyContactNumber.trim()) { alert("Please enter the Emergency Contact Number."); return false; }
    }
    if (step === 2) {
      if (!formData.position) { alert("Please select the Position you are applying for."); return false; }
      if (!formData.joiningDate) { alert("Please select a Preferred Joining Date."); return false; }
      if (!formData.firstJob) { alert("Please answer: Is This Your First Job?"); return false; }
      if (!formData.nightShift) { alert("Please answer: Comfortable in Night Shift?"); return false; }
      if (!formData.pressure) { alert("Please answer: Able to Work Under Pressure?"); return false; }
      if (!formData.usSalesExperience) { alert("Please answer: Experience in US/Canada Market?"); return false; }
      if (!formData.interestInPosition.trim()) { alert("Please explain why you are interested in this position."); return false; }
    }
    return true;
  };

  // UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-5xl">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-red-800">
          Job Application Form
        </h2>

        {/* Step Pills */}
        <div className="flex justify-around">
          {[
            { step: 1, label: "Personal Info" },
            { step: 2, label: "Job Details" },
            { step: 3, label: "Documents" },
          ].map(({ step, label }) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              disabled={step > currentStep}
              className={`text-sm font-semibold px-2 transition-all ${currentStep === step
                  ? "text-red-600 bg-gray-200 rounded-t-md border-b-2 border-red-600 shadow-sm"
                  : step > currentStep
                    ? "text-gray-400 bg-gray-100 rounded-full mb-1 cursor-not-allowed opacity-60"
                    : "text-white bg-red-600 rounded-full mb-1 hover:bg-red-700 active:scale-95"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-gray-200 p-2 rounded-b-md max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-2">
            {/* Step 1: Personal */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.94 6.34L10 11l7.06-4.66A2 2 0 0015.94 4H4.06a2 2 0 00-1.12 2.34z"></path>
                    <path d="M18 8.12l-8 5.28-8-5.28V14a2 2 0 002 2h12a2 2 0 002-2V8.12z"></path>
                  </svg>
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    {user?.email ? user.email : "User not logged in"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="p-3 border rounded w-full text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="p-3 border rounded w-full text-sm"
                    required
                  />
                </div>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="p-3 border rounded w-full text-sm mt-4"
                  required
                />

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="p-3 border rounded w-full text-sm"
                    required
                    max={maxDOB}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Current Address
                  </label>
                  <textarea
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    placeholder="Current Address"
                    className="p-3 border rounded w-full text-sm"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={isSameAddress}
                    onChange={handleSameAddressChange}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    Permanent address is same as current address
                  </span>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    placeholder="Permanent Address"
                    className="p-3 border rounded w-full text-sm"
                    rows="3"
                    required={!isSameAddress}
                    disabled={isSameAddress}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Country of Citizenship
                  </label>
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(
                      (opt) => opt.label === formData.nationality
                    )}
                    onChange={(opt) =>
                      setFormData((prev) => ({
                        ...prev,
                        nationality: opt.label,
                      }))
                    }
                    className="text-sm"
                    placeholder="Select Country"
                    isSearchable
                    name="nationality"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Religion
                  </label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    placeholder="Religion"
                    className="p-3 border rounded w-full text-sm"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    name="bloodgroup"
                    value={formData.bloodgroup}
                    onChange={handleChange}
                    placeholder="Enter Your Blood Group"
                    className="p-3 border rounded w-full text-sm"
                    required
                  />
                </div>

                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">
                    Emergency Contact Details
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    (Allowed relations: Mother, Father, Husband, Wife)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Contact Name */}
                    <div>
                      <label
                        htmlFor="emergencyContactName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="emergencyContactName"
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="e.g., Rakesh Sharma"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        required
                      />
                    </div>

                    {/* Contact Relation */}
                    <div>
                      <label
                        htmlFor="emergencyContactRelation"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Relation <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="emergencyContactRelation"
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Select relation</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Husband">Husband</option>
                        <option value="Wife">Wife</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                      </select>
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label
                        htmlFor="emergencyContactNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="emergencyContactNumber"
                        type="tel"
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber}
                        onChange={handleChange}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        pattern="^(\+?\d{1,3}[- ]?)?\d{10}$"
                        title="Enter a valid 10-digit number (country code optional)"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Position Applying For
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="p-3 border rounded w-full text-sm"
                      required
                    >
                      <option value="">Select the position</option>
                      <option value="Business Development Associate">
                        Business Development Associate
                      </option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Backend Developer">
                        Backend Developer
                      </option>
                      <option value="Frontend Developer">
                        Frontend Developer
                      </option>
                      <option value="Data Assistants/Excel & Dialer Management">
                        Data Assistants/Excel & Dialer Management
                      </option>
                      <option value="Digital Marketing Executive">
                        Digital Marketing Executive
                      </option>
                      <option value="Content Writer">Content Writer</option>
                      <option value="Human Resources (HR)">
                        Human Resources (HR) & Back Office Manager
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Preferred Joining Date
                    </label>
                    <select
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="p-3 border rounded w-full text-sm"
                      required
                    >
                      <option value="">Select Joining Date</option>
                      {/* optional default */}
                      <option value="2025-01-01">
                        01 January 2025 — Use default
                      </option>
                      {dateList.map((iso) => (
                        <option key={iso} value={iso}>
                          {formatLong(iso)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {[
                  { label: "Is This Your First Job?", name: "firstJob" },
                  { label: "Comfortable in Night Shift?", name: "nightShift" },
                  { label: "Able to Work Under Pressure?", name: "pressure" },
                  {
                    label: "Experience in US/Canada Market?",
                    name: "usSalesExperience",
                  },
                ].map((q) => (
                  <div key={q.name} className="flex flex-col mt-4">
                    <label className="text-sm font-semibold mb-2">
                      {q.label}
                    </label>
                    <select
                      name={q.name}
                      value={formData[q.name]}
                      onChange={handleChange}
                      className="p-3 border rounded w-full text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                ))}

                <div className="mt-4">
                  <label className="text-sm font-semibold mb-2">
                    Why are you interested in this position?
                  </label>
                  <textarea
                    name="interestInPosition"
                    value={formData.interestInPosition}
                    onChange={handleChange}
                    placeholder="Please provide your reasons"
                    className="p-3 border rounded w-full text-sm"
                    rows="4"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div>
                {/* Resume – always required */}
                <div className="flex flex-col mt-4">
                  <label className="text-sm font-semibold mb-2">
                    Upload Resume
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    (Allowed: PDF only)
                  </p>
                  <input
                    type="file"
                    name="resume"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="p-3 border rounded w-full text-sm"
                    required={!formData.resume}
                  />
                  <FileBadge
                    file={formData.resume}
                    onRemove={() => removeFile("resume")}
                  />
                </div>

                {/* Previous company details if not first job */}
                {formData.firstJob === "No" && (
                  <div className="mt-6 border-t pt-4">
                    <label className="text-sm font-semibold mb-4 text-gray-700">
                      Previous Company Details
                    </label>

                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={noPreviousDoc}
                        onChange={(e) => setNoPreviousDoc(e.target.checked)}
                      />
                      <span className="text-sm">No Document Available</span>
                    </div>

                    {!noPreviousDoc && (
                      <div className="flex flex-col mt-4">
                        <label className="text-sm font-semibold mb-2">
                          Document of Previous Company
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          (Allowed: PDF only)
                        </p>
                        <input
                          type="file"
                          name="previousCompanyDoc"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="p-3 border rounded w-full text-sm"
                          required={!formData.previousCompanyDoc}
                        />
                        <FileBadge
                          file={formData.previousCompanyDoc}
                          onRemove={() => removeFile("previousCompanyDoc")}
                        />
                      </div>
                    )}

                    {noPreviousDoc && (
                      <div className="mb-4">
                        <label className="text-sm font-semibold mb-2">
                          Reason for No Document
                        </label>
                        <textarea
                          name="noPreviousDocReason"
                          value={formData.noPreviousDocReason}
                          onChange={handleChange}
                          className="p-3 border rounded w-full text-sm"
                          rows="3"
                          placeholder="Explain why the document is not available"
                          required
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-sm font-semibold mb-2">
                        Type of Exit
                      </label>
                      <select
                        name="previousCompanyExitType"
                        value={formData.previousCompanyExitType}
                        onChange={handleChange}
                        className="p-3 border rounded w-full text-sm"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Resigned">Resigned</option>
                        <option value="Terminated">Terminated</option>
                        <option value="Contract Ended">Contract Ended</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-semibold mb-2">
                        Reason for Exit
                      </label>
                      <textarea
                        name="previousCompanyExitReason"
                        value={formData.previousCompanyExitReason}
                        onChange={handleChange}
                        className="p-3 border rounded w-full text-sm"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-semibold mb-2">
                        Last Working Date
                      </label>
                      <input
                        type="date"
                        name="previousCompanyLastWorkingDate"
                        value={formData.previousCompanyLastWorkingDate}
                        onChange={handleChange}
                        className="p-3 border rounded w-full text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* India docs */}
                {formData.nationality === "India" && (
                  <>
                    {["adharCardFront", "adharCardBack", "panCard"].map(
                      (field) => (
                        <div key={field} className="flex flex-col mt-4">
                          <label className="text-sm font-semibold mb-2">
                            Upload{" "}
                            {field === "adharCardFront"
                              ? "Aadhar Card - Front"
                              : field === "adharCardBack"
                                ? "Aadhar Card - Back"
                                : "PAN Card"}
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            (Allowed: Image only)
                          </p>
                          <input
                            type="file"
                            name={field}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="p-3 border rounded w-full text-sm"
                            required={!formData[field]}
                          />
                          <FileBadge
                            file={formData[field]}
                            onRemove={() => removeFile(field)}
                          />
                        </div>
                      )
                    )}
                  </>
                )}

                {/* Non-India docs */}
                {formData.nationality && formData.nationality !== "India" && (
                  <>
                    <div className="flex flex-col mt-4">
                      <label className="text-sm font-semibold mb-2">
                        Upload Passport
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        (Allowed: PDF or Image — scans from phone are OK)
                      </p>
                      <input
                        type="file"
                        name="passport"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="p-3 border rounded w-full text-sm"
                        required={!formData.passport}
                      />
                      <FileBadge
                        file={formData.passport}
                        onRemove={() => removeFile("passport")}
                      />
                    </div>

                    <div className="flex flex-col mt-4">
                      <label className="text-sm font-semibold mb-2">
                        Upload National ID (Optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        (PDF/Image allowed. Optional if you upload
                        EFRRO/Immigration Form)
                      </p>
                      <input
                        type="file"
                        name="nationalID"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="p-3 border rounded w-full text-sm"
                      />
                      <FileBadge
                        file={formData.nationalID}
                        onRemove={() => removeFile("nationalID")}
                      />
                    </div>

                    <div className="flex flex-col mt-4">
                      <label className="text-sm font-semibold mb-2">
                        Upload EFRRO Form or Immigration Form (if no National
                        ID)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        (PDF/Image allowed)
                      </p>
                      <input
                        type="file"
                        name="efrroForm"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="p-3 border rounded w-full text-sm"
                        required={!formData.nationalID && !formData.efrroForm}
                      />
                      <FileBadge
                        file={formData.efrroForm}
                        onRemove={() => removeFile("efrroForm")}
                      />
                    </div>
                  </>
                )}

                {/* Terms */}
                <div
                  className="flex items-center text-sm mt-4"
                  onClick={() => setShowTermsModal(true)}
                >
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setShowTermsModal(true);
                    }}
                    className="mr-2"
                    required
                  />
                  <p>
                    I accept the{" "}
                    <span
                      className="text-blue-600 underline ml-1"
                      onClick={() => setShowTermsModal(true)}
                    >
                      Terms and Conditions
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between space-x-2 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => { if (validateStep(currentStep)) setCurrentStep((s) => s + 1); }}
                  className="ml-auto bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-auto max-h-[80vh] p-4 md:p-8">
              <div className="text-black mb-4 leading-relaxed">
                <h3 className="text-2xl font-bold mb-2">
                  Terms and Conditions
                </h3>
                <h4 className="font-medium mt-3">Dear New Joinee,</h4>
                <p>
                  We are committed to maintaining the highest standards of
                  professionalism...
                </p>
                {formData.position === "Business Development Associate" && (
                  <div className="mt-4 font-semibold italic ">
                    <h2 className="font-semibold text-xl mt-3">
                      Important Training Condition{" "}
                    </h2>
                    <br />
                    <input
                      type="checkbox"
                      checked={trainingAccepted}
                      onChange={(e) => setTrainingAccepted(e.target.checked)}
                      className="mr-2 text-5xl"
                      required
                    />
                    <span>
                      Note: You will begin with an 8‑day training period to
                      familiarize yourself with our systems and culture.
                      Following this period, you will receive a final
                      confirmation email. If selected, your salary will be
                      calculated from the first day of training; if not
                      selected, the training days are unpaid. Please understand
                      that whether the decision not to proceed comes from the
                      company or yourself, this policy regarding compensation
                      for the training period remains the same.
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold mt-4">
                  Key Updates to the Onboarding Process
                </h3>
                <h4 className="font-medium mt-3">Police Verification Policy</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li>
                    <span className="font-semibold">Declaration:</span>{" "}
                    Employees should have no criminal records.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Verification Requirement:
                    </span>{" "}
                    The company may require verification.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Action on Discrepancies:
                    </span>{" "}
                    Falsification may lead to termination.
                  </li>
                </ul>
                <h4 className="font-medium mt-3">Police Verification Policy</h4>
                <ul className="list-disc pl-5">
                  <li>
                    <span className="font-semibold mt-4">Declaration:</span> We
                    trust that all employees joining our organization have no
                    criminal records or ongoing legal cases registered under
                    their name.
                  </li>
                  <li>
                    <span className="font-semibold mt-4">
                      Verification Requirement:
                    </span>{" "}
                    In case of any doubts or discrepancies, the company reserves
                    the right to mandate police verification, either before or
                    after joining.
                  </li>
                  <li>
                    <span className="font-semibold mt-4">
                      Action on Discrepancies:
                    </span>{" "}
                    Any falsification of information or concealment of legal
                    issues may result in immediate termination and further legal
                    action if necessary.
                  </li>
                </ul>
                <h4 className="font-medium mt-3">Legal Compliance Awareness</h4>
                <ul className="list-disc pl-5">
                  <li>
                    As part of your onboarding, you will be provided with a
                    detailed briefing on the legal implications of misconduct
                    during professional interactions.
                  </li>
                  <li>
                    Attached to this email is an important case highlighting the
                    consequences of violating company policies and laws,
                    including harassment, abusive language, and unprofessional
                    conduct while handling clients.
                  </li>
                </ul>
                <h4 className="font-medium mt-3">
                  Key Legal Guidelines to Follow
                </h4>
                <ul className="list-disc pl-5">
                  <li>
                    Always adhere to professional and ethical communication
                    practices.
                  </li>
                  <li>
                    Avoid using restricted language, misguiding, harassing, or
                    speaking rudely to clients.
                  </li>
                  <li>
                    Follow both Indian and US laws, including the IT Act, IPC
                    sections, and US Federal Telemarketing Guidelines.
                  </li>
                </ul>
                <h4 className="font-medium mt-3">
                  Consequences of Non-Compliance
                </h4>
                <p>Failure to adhere to these guidelines may result in:</p>
                <ul className="list-disc pl-5">
                  <li>Immediate termination for non-compliance.</li>
                  <li>
                    Legal actions, including police involvement and defamation
                    charges.
                  </li>
                  <li>
                    Financial penalties and other repercussions as per company
                    policy.
                  </li>
                </ul>
                <p className="mt-4">
                  For any questions or clarifications, please reach out to the
                  HR team.
                </p>
                <p className="mt-4">
                  We are thrilled about the opportunity to have you join Vahlay
                  Consulting Inc! Before we move forward with issuing your
                  formal offer letter, please take the following important steps
                  to ensure a smooth onboarding process.
                </p>

                <h2 className="font-semibold text-xl mt-3">
                  Important Note For TeleSale /Telecaller{" "}
                </h2>

                <p className="my-3">
                  <strong>
                    Payout eligibility is subjected upon completing 15 days of
                    training, having your mock call approved by the trainer, and
                    after beginning to live calling.
                  </strong>
                </p>
                <p className="font-semibold mt-4">Salary Revision:</p>
                <p>
                  Your salary will be reviewed after 1 year from your last
                  increment, or at such other time as the Management may decide.
                  Salary revisions are discretionary and based on effective
                  performance. You may be asked to justify your salary by
                  completing your monthly targets.
                </p>
                <p className="font-semibold mt-4">Working Hours:</p>
                <p>
                  Working hours will be from 07:00/08:00 PM to 05:00/06:00 AM
                  and may change as per Management's decision. The company
                  typically operates six days a week, but you will work five
                  days a week, with Sunday as your weekly off.
                </p>
                <p className="font-semibold mt-4">Absence/Leave Rule:</p>
                <p>
                  If you are absent for a continuous period of 3 days without
                  prior approval, or if you overstay on leave or training, it
                  will lead to automatic termination of your employment without
                  notice.
                </p>
                <p className="font-semibold mt-4">Probation/Confirmation:</p>
                <p>
                  You will be on probation for three months. Based on your
                  performance, your services may be confirmed in writing. During
                  probation, your services can be terminated with seven days'
                  notice on either side.
                </p>
                <strong>
                  Please note that the security deposit will not be refunded if
                  you leave the position before the appraisal date, and the
                  salary for days worked will not be pay out if you are
                  terminated by the company for a specific reason.
                </strong>
                <p className="font-semibold mt-4">Confidentiality:</p>
                <p>
                  You are not allowed to publish any articles, statements, or
                  make any communications related to the company’s products or
                  matters without prior written permission.
                </p>
                <p className="font-semibold mt-4">Intellectual Property:</p>
                <p>
                  Any new methods or improvements developed by you during your
                  employment will remain the sole property of the company.
                </p>
                <p className="font-semibold mt-4">Responsibilities & Duties:</p>
                <p>
                  You are required to adhere to the company’s rules and
                  regulations and perform effectively.
                </p>
                <p className="font-semibold mt-4">Notice Period:</p>
                <p>
                  Upon confirmation, your appointment may be terminated by
                  either party with two months' notice or two months' salary in
                  lieu of the notice period.
                </p>
                <p className="font-semibold mt-4">
                  No Benefits if Leaving Without Notice:
                </p>
                <p>
                  Employees leaving without serving the agreed notice period
                  will not receive salary slips, experience letters, or any
                  other formal documentation.
                </p>
                <p className="font-semibold mt-4">Termination of Employment:</p>
                <p>
                  Upon termination, all company property must be returned
                  immediately, and no copies of company data should be retained.
                </p>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setTermsAccepted(true);
                      setShowTermsModal(false);
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setTermsAccepted(false);
                      setShowTermsModal(false);
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition w-full sm:w-auto"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Put this above your component or in a small file
const FileBadge = ({ file, onRemove }) => {
  if (!file) return null;
  const kb = Math.round(file.size / 1024);
  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <span className="inline-flex text-sm items-center rounded-full bg-green-100 text-gray-800 px-2 py-1">
        Uploaded: {file.name} ({kb} KB)
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="bg-red-600 text-white p-2 rounded-full hover:underline"
        aria-label="Remove uploaded file"
      >
        Remove
      </button>
    </div>
  );
};
