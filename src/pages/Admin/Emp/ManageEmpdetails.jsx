
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig"; // Adjust path to your config
import Side_bar from "../../../components/Side_bar";
import { IoMdArrowRoundBack } from "react-icons/io";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";



import Select from "react-select";
import countryList from "react-select-country-list";
import { useMemo } from "react";

function createDownloadLink(url) {
  if (!url || url === "N/A") return "#";

  // If it’s already a full URL or blob, just return it
  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Otherwise assume a GS path
  const baseUrl =
    "https://firebasestorage.googleapis.com/v0/b/vahlay1.appspot.com/o/";
  const cleaned = url
    .replace("gs://vahlay1.appspot.com/", "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");

  return `${baseUrl}${encodeURIComponent(cleaned)}?alt=media`;
}


const ManageEmpDetails = () => {
  const { id } = useParams(); // Document ID from the URL
  const navigate = useNavigate(); // For navigation after delete
  const [application, setApplication] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const countryOptions = useMemo(() => countryList().getData(), []);

  // State for the form fields including new fields for exit details
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    bloodgroup: "",
    religion: "",
    address: "",
    permanentAddress: "",
    currentAddress: "",
    applicationDate: "",
    joiningDate: "",
    position: "",
    nightShift: "",
    noPreviousDocReason: "",
    usSalesExperience: "",
    resumeUrl: "",
    pressure: "",
    firstJob: "",
    interestInPosition: "",
    adharCardUrl: "",
    adharCardFrontUrl: "",
    adharCardBackUrl: "",
    panCardUrl: "",
    previousCompanyDocUrl: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelation: "",
    // New fields for exit details:
    leaveOrganization: false,
    exitType: "", // Options: "terminated" or "resign"
    exitReason: "",
    exitDate: "",
    passportUrl: "",     // ✅ Add this
    efrroFormUrl: "",
    nationality: "",
  });

  // Fetch the specific job application document from Firestore
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const docRef = doc(db, "jobApplications", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setApplication({ id: docSnap.id, ...data });

          // Initialize form data for editing, including new exit details
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            dob: data.dob || "",
            bloodgroup: data.bloodgroup || "",
            religion: data.religion || "",
            nationality: data.nationality || "",
            address: data.address || "",
            currentAddress: data.currentAddress || "",
            permanentAddress: data.permanentAddress || "",
            applicationDate: data.applicationDate || "",
            joiningDate: data.joiningDate || "",
            position: data.position || "",
            nightShift: data.nightShift || "",
            noPreviousDocReason: data.noPreviousDocReason || "",
            usSalesExperience: data.usSalesExperience || "",
            pressure: data.pressure || "",
            firstJob: data.firstJob || "",
            interestInPosition: data.interestInPosition || "",
            // files
            resumeUrl: data.resumeUrl || "",
            adharCardUrl: data.adharCardUrl || "",
            adharCardFrontUrl: data.adharCardFrontUrl || "",
            adharCardBackUrl: data.adharCardBackUrl || "",
            panCardUrl: data.panCardUrl || "",
            previousCompanyDocUrl: data.previousCompanyDocUrl || "",
            passportUrl: data.passportUrl || "",
            nationalIDUrl: data.nationalIDUrl || "",
            efrroFormUrl: data.efrroFormUrl || "",
            // emergency contacts
            emergencyContactName: data.emergencyContactName || "",
            emergencyContactNumber: data.emergencyContactNumber || "",
            emergencyContactRelation: data.emergencyContactRelation || "",
            // exit details
            leaveOrganization: data.leaveOrganization || false,
            exitType: data.exitType || "",
            exitReason: data.exitReason || "",
            exitDate: data.exitDate || "",
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchApplication();
  }, [id]);
  console.log(application);

  const downloadPDF = () => {
    if (!application) return;

    const docContent = [{ text: "Job Application Details", style: "header" }];

    const fields = [
      { label: "First Name", value: application.firstName },
      { label: "Last Name", value: application.lastName },
      { label: "PAN Card URL", value: application.panCardUrl },
      { label: "Passport URL", value: application.passportUrl },         // ✅ Added
      { label: "eFRRO Form URL", value: application.efrroFormUrl },
      { label: "Email", value: application.email },
      { label: "Phone", value: application.phone },
      { label: "DOB", value: application.dob },
      { label: "Blood Group", value: application.bloodgroup },
      { label: "Religion", value: application.religion },
      { label: "Address", value: application.address },
      { label: "Permanent Address", value: application.permanentAddress },
      { label: "Current Address", value: application.currentAddress },
      { label: "Application Date", value: application.applicationDate },
      { label: "Joining Date", value: application.joiningDate },
      { label: "Position", value: application.position },
      { label: "Night Shift", value: application.nightShift },
      { label: "Resume URL", value: application.resumeUrl },
      { label: "Aadhar Card Front URL", value: application.adharCardFrontUrl },
      { label: "Aadhar Card Back URL", value: application.adharCardBackUrl },
      { label: "PAN Card URL", value: application.panCardUrl },
      {
        label: "Emergency Contact Name",
        value: application.emergencyContactName,
      },
      {
        label: "Emergency Contact Number",
        value: application.emergencyContactNumber,
      },
      {
        label: "emergencyContactRelation", value: application.emergencyContactRelation,
      },
      { label: "Exit Type", value: application.exitType },
      { label: "Exit Reason", value: application.exitReason },
      { label: "Exit Date", value: application.exitDate },
    ];

    const docDeclaration = [
      { text: `Declaration`, style: "subheader" },
      {
        text: `I, ${application.firstName} ${application.lastName}, hereby declare that I have read, understood, and unconditionally accept all the terms and conditions mentioned, I agree to abide by these provisions throughout my employment tenure.`,
        margin: [0, 10],
      },
      {
        text: `Date: ${application.applicationDate}`,
        style: "smallText",
        margin: [0, 10],
      },
      { text: "Terms and Conditions", style: "subheader" },
      {
        text: "Dear New Joinee,",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        text: `We are committed to maintaining the highest standards of professionalism...`,
        margin: [0, 2, 0, 10]
      },
      {
        text: "Key Updates to the Onboarding Process", style: "subheader",

      },
      { text: "Police Verification Policy", style: "subheader", margin: [0, 2, 0, 0] },
      {
        ul: [
          {
            text: "Declaration: Employees should have no criminal records.",
            bold: true,
          },
          {
            text: "Verification Requirement: The company may require verification.",
            bold: true,
          },
          {
            text: "Action on Discrepancies: Falsification may lead to termination.",
            bold: true,
          },
        ],
        margin: [0, 10],
      },
      {
        text: "Police Verification Policy",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [
          {
            text: "Declaration: We trust that all employees joining our organization have no criminal records or ongoing legal cases.",
            bold: true,
          },
          {
            text: "Verification Requirement: In case of doubts, the company may require police verification.",
            bold: true,
          },
          {
            text: "Action on Discrepancies: Any falsification may result in immediate termination.",
            bold: true,
          },
        ],
        margin: [0, 10],
      },
      {
        text: "Legal Compliance Awareness",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [
          "You will be briefed on the legal implications of misconduct.",
          "Attached is a case on the consequences of violating company policies.",
        ],
        margin: [0, 10],
      },
      {
        text: "Key Legal Guidelines to Follow",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [
          "Adhere to professional communication practices.",
          "Avoid restricted language, misguiding or harassment.",
          "Follow Indian and US laws, including the IT Act, IPC, and Telemarketing Guidelines.",
        ],
        margin: [0, 10],
      },
      {
        text: "Consequences of Non-Compliance",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [
          "Immediate termination for non-compliance.",
          "Legal actions, including police involvement and defamation charges.",
          "Financial penalties and other repercussions.",
        ],
        margin: [0, 10],
      },
      {
        text: "Salary Revision",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Your salary will be reviewed after 1 year or at another time decided by management. Salary revisions are discretionary and based on effective performance.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Working Hours",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Working hours will be from 07:00/08:00 PM to 05:00/06:00 AM, with Sunday as your weekly off.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Absence/Leave Rule",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Absence for 3 days without approval will lead to termination.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Probation/Confirmation",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `You will be on probation for 3 months. Your services can be confirmed or terminated with 7 days' notice.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Confidentiality",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `You are not allowed to publish any articles or make any communications related to company matters without written permission.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Intellectual Property",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Any new methods or improvements developed by you will remain the company's property.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Responsibilities & Duties",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `You are required to adhere to the company’s rules and regulations and perform effectively.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Notice Period",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Upon confirmation, either party can terminate the appointment with two months' notice or salary in lieu.`,
          margin: [0, 10],
        }]
      },
      {
        text: "No Benefits if Leaving Without Notice",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Employees leaving without notice will not receive salary slips, experience letters, or other formal documentation.`,
          margin: [0, 10],
        }]
      },
      {
        text: "Termination of Employment",
        style: "subheader",
        margin: [0, 2, 0, 0]
      },
      {
        ul: [{
          text: `Upon termination, all company property must be returned immediately.`,
          margin: [0, 10],
        }]
      },
    ];

    const docfooter = [{
      text: `This PDF is automatically generated by the system on ${application.applicationDate}, once all required documents have been submitted and the terms and conditions have been accepted. `,
      style: "footer"
    }];

    fields.forEach((field) => {
      if (field.value) {
        docContent.push({
          columns: [
            { text: `${field.label}:`, width: "40%" },
            {
              canvas: [
                { type: "line", x1: 0, y1: 0, x2: 0, y2: 10, lineWidth: 0.5 },
              ],
            },
            field.label.includes("URL")
              ? {
                text: field.value,
                link: field.value,
                width: "55%",
                color: "blue",
                decoration: "underline",
              }
              : { text: field.value, width: "55%" },
          ],
          columnGap: 10,
          margin: [0, 5],
        });

        // Add page break logic dynamically
        if (docContent.length > 20 && docContent.length % 21 === 0) {
          docContent.push({ text: '', pageBreak: 'after' });
        }
      }
    });

    const docDefinition = {
      content: [
        ...docContent,
        { text: " ", pageBreak: "before" },
        ...docDeclaration,
      ],
      footer: docfooter,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10],
        },
        smallText: {
          fontSize: 12,
          margin: [0, 10],
        },
        footer: {
          margin: [0, 10, 0, 10],
          fontSize: 10,
          alignment: "center",
          color: "gray",
          height: 100
        },
        // Declaration section styles
        declarationHeader: {
          fontSize: 16,
          bold: true,
          color: "#2a2a2a",
          margin: [0, 20, 0, 10],
          alignment: "center",
        },
        declarationText: {
          fontSize: 12,
          margin: [0, 10],
          lineHeight: 1.5,
          color: "#333",
          italics: true,
          alignment: "justify",
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  };


  // Toggle between read-only and edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    window.scrollTo(0, 0);
  };

  // Handle form input changes in edit mode (for text fields and select)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file changes for document fields.
  // In a real implementation, you would upload the file (e.g., to Firebase Storage)
  // and update formData with the resulting download URL.
  // 3️⃣ Swap in this handleFileChange to upload + retrieve a real download URL:
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const path = `jobApplications/${id}/${fieldName}/${file.name}`;
    const sRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(sRef, file);

    uploadTask.on(
      "state_changed",
      null,
      console.error,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 1) update local state so the UI shows the new URL
        setFormData(prev => ({ ...prev, [fieldName]: downloadURL }));
        setApplication(prev => ({ ...prev, [fieldName]: downloadURL }));

        // 2) write just this one field back to Firestore immediately
        await updateDoc(doc(db, "jobApplications", id), {
          [fieldName]: downloadURL
        });

        alert(`${fieldName} uploaded and saved!`);
      }
    );
  };



  // Save the updated data to Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "jobApplications", id);
      await updateDoc(docRef, formData);

      // ✅ Re-fetch the updated document from Firestore
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.data();
        setApplication({ id: updatedSnap.id, ...updatedData });
      }

      setIsEditing(false);
      window.scrollTo(0, 0);
      alert("Record updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };


  // Delete the document
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "jobApplications", id));
        navigate("/manage-emp"); // Return to the list page
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  if (!application) {
    return <div className="p-4">Loading...</div>;
  }
  console.log(application)
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
    

      {/* Main Content */}
      <div className="w-full  px-6 py-8">
        <div className="flex items-center mb-8">
          <Link to="/manage-emp" className="mr-4">
            <IoMdArrowRoundBack className="text-3xl text-red-600" />
          </Link>
          <h1 className="text-3xl text-red-600 font-bold">Employee Details</h1>
        </div>

        {isEditing ? (
          /* ============================
             EDIT MODE: Render the form
             ============================ */
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-lg shadow space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block font-semibold">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block font-semibold">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold">Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block font-semibold">Date of Birth:</label>
                <input
                  type="text"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block font-semibold">Blood Group:</label>
                <input
                  type="text"
                  name="bloodgroup"
                  value={formData.bloodgroup}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Religion */}
              <div>
                <label className="block font-semibold">Religion:</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Country of Citizenship</label>
                {/* <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                /> */}
                <Select
                  options={countryOptions}

                  value={countryOptions.find(
                    (opt) => opt.label === formData.nationality
                  )}

                  onChange={(opt) =>
                    setFormData((prev) => ({ ...prev, nationality: opt.label }))
                  }
                  className="text-sm"
                  placeholder="Select Country"
                  isSearchable

                  name="nationality"
                  required
                />
              </div>


              {/* Address */}
              <div className="md:col-span-2">
                <label className="block font-semibold">Address:</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Current Address */}
              <div className="md:col-span-2">
                <label className="block font-semibold">Current Address:</label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Permanent Address */}
              <div className="md:col-span-2">
                <label className="block font-semibold">
                  Permanent Address:
                </label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Application Date */}
              <div>
                <label className="block font-semibold">Application Date:</label>
                <input
                  type="text"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block font-semibold">Joining Date:</label>
                <input
                  type="text"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block font-semibold">Position:</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Night Shift */}
              <div>
                <label className="block font-semibold mb-2">Night Shift:</label>
                <select
                  name="nightShift"
                  value={formData.nightShift}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* No Previous Doc Reason */}
              <div className="md:col-span-2">
                <label className="block font-semibold">
                  No Previous Doc Reason:
                </label>
                <textarea
                  name="noPreviousDocReason"
                  value={formData.noPreviousDocReason}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* US/Canada Market Experience */}
              <div>
                <label className="block font-semibold">
                  US/Canada Market Experience?
                </label>
                <select
                  name="usSalesExperience"
                  value={formData.usSalesExperience}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* resumeUrl */}
              <div>
                <label className="block font-semibold">resumeUrl:</label>
                {formData.resumeUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "resumeUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Work Under Pressure */}
              <div>
                <label className="block font-semibold">
                  Work Under Pressure?
                </label>
                <select
                  name="pressure"
                  value={formData.pressure}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* First Job */}
              <div>
                <label className="block font-semibold">First Job:</label>
                <select
                  name="firstJob"
                  value={formData.firstJob}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Interest In Position */}
              <div>
                <label className="block font-semibold">
                  Interest In Position:
                </label>
                <input
                  type="text"
                  name="interestInPosition"
                  value={formData.interestInPosition}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Aadhar Card Front */}
              <div>
                <label className="block font-semibold">
                  Aadhar Card Front:
                </label>
                {formData.adharCardFrontUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.adharCardFrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "adharCardFrontUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Aadhar Card Back */}
              <div>
                <label className="block font-semibold">Aadhar Card Back:</label>
                {formData.adharCardBackUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.adharCardBackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "adharCardBackUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Pan Card */}
              <div>
                <label className="block font-semibold">Pan Card:</label>
                {formData.panCardUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.panCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "panCardUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Previous Company Doc */}
              <div>
                <label className="block font-semibold">Passport:</label>
                {formData.passportUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.passportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "passportUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">National Id Card:</label>
                {formData.nationalIDUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.nationalIDUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "nationalIDUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">EFRRO Form/Immigration Form (if no National ID):</label>
                {formData.efrroFormUrl && (
                  <div className="mb-2">
                    <a
                      href={formData.efrroFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Current Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "efrroFormUrl")}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>


              {/* Emergency Contact Name */}
              <div>
                <label className="block font-semibold">
                  Emergency Contact Name:
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Emergency Contact Number */}
              <div>
                <label className="block font-semibold">
                  Emergency Contact Number:
                </label>
                <input
                  type="text"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>

              {/* Emergency Contact Relation */}
              <div>
                <label className=" block font-semibold">
                  Emergency Contact Relation
                </label>
                <input type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  className="border border-gray-300 rounded p-2 w-full" />
              </div>
            </div>
            {/* New Section: Leave the Organization */}
            
            <div className="mt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="leaveOrganization"
                  checked={formData.leaveOrganization}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leaveOrganization: e.target.checked,
                    }))
                  }
                  className="form-checkbox"
                />
                <span className="ml-2 font-semibold">Exit Organization</span>
              </label>
              {formData.leaveOrganization && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block font-semibold">Exit Type:</label>
                    <select
                      name="exitType"
                      value={formData.exitType}
                      onChange={handleChange}
                      className="border border-gray-300 rounded p-2 w-full"
                    >
                      <option value="">Select Exit Type</option>
                      <option value="Terminated">Terminated</option>
                      <option value="Self Resignation">Self Resignation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold">
                      {" "}
                      Last Working Date:
                    </label>
                    <input
                      type="date"
                      name="exitDate"
                      value={formData.exitDate}
                      onChange={handleChange}
                      className="border border-gray-300 rounded p-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold">Reason:</label>
                    <textarea
                      name="exitReason"
                      value={formData.exitReason}
                      onChange={handleChange}
                      className="border border-gray-300 rounded p-2 w-full"
                      placeholder="Add your comment here..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save & Cancel Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ===============================
             READ-ONLY MODE: Show details
             =============================== */
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-6">
              Application Details
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  First Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.firstName}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.lastName}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.email}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.phone}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.dob}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Blood Group
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.bloodgroup}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Emergency Contact Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.emergencyContactName}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Emergency Contact Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.emergencyContactNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Emergency Contact Relation
                </dt>
                <dd className=" mt-1 text-sm text-gray-900">
                  {application.emergencyContactRelation}

                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Religion</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.religion}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nationality</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.nationality}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Application Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.applicationDate}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.position}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Joining Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.joiningDate}
                </dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.address}
                </dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Current Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.currentAddress}
                </dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Permanent Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.permanentAddress}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Work Under Pressure?
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.pressure}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">First Job</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.firstJob}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Night Shift
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.nightShift}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  US Sales Experience
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.usSalesExperience}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {" "}
                  Why are you Interested{" "}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.interestInPosition}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Resume</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.resumeUrl ? (
                    <a
                      href={createDownloadLink(application.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 text-white rounded-full px-3 py-1"
                    >
                      View Document
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>

              {application.nationality === 'India' && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Aadhar Card
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.adharCardUrl ? (
                        <a
                          href={createDownloadLink(application.adharCardUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Aadhar Card Front
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.adharCardFrontUrl ? (
                        <a
                          href={createDownloadLink(application.adharCardFrontUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Aadhar Card Back
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.adharCardBackUrl ? (
                        <a
                          href={createDownloadLink(application.adharCardBackUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pan Card</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.panCardUrl ? (
                        <a
                          href={createDownloadLink(application.panCardUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                </>)}


              {application.nationality !== "India" && (
                <>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Passport
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.passportUrl ? (
                        <a
                          href={createDownloadLink(application.passportUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      nationalID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.nationalIDUrl ? (
                        <a
                          href={createDownloadLink(application.nationalIDUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Efrro /immigrationForm
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.efrroFormUrl ? (
                        <a
                          href={createDownloadLink(application.efrroFormUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                </>
              )}
              {application.firstJob === 'No' && (
                <>
                  {/* Previous Company Doc */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Previous Company Doc
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.previousCompanyDocUrl ? (
                        <a
                          href={createDownloadLink(application.previousCompanyDocUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white rounded-full px-3 py-1"
                        >
                          View Document
                        </a>
                      ) : (
                        <dd className="mt-1 text-sm text-gray-900">
                          {application.noPreviousDocReason}
                        </dd>
                      )}
                    </dd>
                  </div>

                  {/* Exit Details */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Exit Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.previousCompanyExitType || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Working Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.previousCompanyLastWorkingDate || '—'}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Reason
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.previousCompanyExitReason || '—'}
                    </dd>
                  </div>
                </>
              )}

              {/* New Section: Exit Details (if applicable) */}
              {application.leaveOrganization && (
                <div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Exit Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.exitType}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Working Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.exitDate}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Reason
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.exitReason}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-2">Declaration</h4>
              <p>
                I, <strong>{application.firstName} {application.lastName}</strong>, hereby declare that I have read, understood, and unconditionally accept all the
                terms and conditions mentioned,I agree to abide by these provisions throughout my employment tenure.
              </p>
              <p className="mt-4">
                <strong>Date:</strong> {application.applicationDate}
              </p>
              <br />
              <h3 className="text-xl font-bold mb-2">Terms and Conditions</h3>
              <h4 className="font-medium mt-3">Dear New Joinee,</h4>
              <p>We are committed to maintaining the highest standards of professionalism...</p>
              <h3 className="text-lg font-semibold mt-4">Key Updates to the Onboarding Process</h3>
              <h4 className="font-medium mt-3">Police Verification Policy</h4>
              <ul className="list-disc pl-5 text-sm">
                <li>
                  <span className="font-semibold">Declaration:</span> Employees should have no criminal records.
                </li>
                <li>
                  <span className="font-semibold">Verification Requirement:</span> The company may require verification.
                </li>
                <li>
                  <span className="font-semibold">Action on Discrepancies:</span> Falsification may lead to termination.
                </li>
              </ul>
              <h4 className="font-medium mt-3">Police Verification Policy</h4>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-semibold mt-4">Declaration:</span> We trust that all employees joining our organization have no criminal records or ongoing legal cases registered under their name.
                </li>
                <li>
                  <span className="font-semibold mt-4">Verification Requirement:</span> In case of any doubts or discrepancies, the company reserves the right to mandate police verification, either before or after joining.
                </li>
                <li>
                  <span className="font-semibold mt-4">Action on Discrepancies:</span> Any falsification of information or concealment of legal issues may result in immediate termination and further legal action if necessary.
                </li>
              </ul>
              <h4 className="font-medium mt-3">Legal Compliance Awareness</h4>
              <ul className="list-disc pl-5">
                <li>
                  As part of your onboarding, you will be provided with a detailed briefing on the legal implications of misconduct during professional interactions.
                </li>
                <li>
                  Attached to this email is an important case highlighting the consequences of violating company policies and laws, including harassment, abusive language, and unprofessional conduct while handling clients.
                </li>
              </ul>
              <h4 className="font-medium mt-3">Key Legal Guidelines to Follow</h4>
              <ul className="list-disc pl-5">
                <li>Always adhere to professional and ethical communication practices.</li>
                <li>Avoid using restricted language, misguiding, harassing, or speaking rudely to clients.</li>
                <li>Follow both Indian and US laws, including the IT Act, IPC sections, and US Federal Telemarketing Guidelines.</li>
              </ul>
              <h4 className="font-medium mt-3">Consequences of Non-Compliance</h4>
              <p>Failure to adhere to these guidelines may result in:</p>
              <ul className="list-disc pl-5">
                <li>Immediate termination for non-compliance.</li>
                <li>Legal actions, including police involvement and defamation charges.</li>
                <li>Financial penalties and other repercussions as per company policy.</li>
              </ul>
              <p className="mt-4">For any questions or clarifications, please reach out to the HR team.</p>
              <p className="mt-4">
                We are thrilled about the opportunity to have you join Vahlay Consulting Inc! Before we move forward with issuing your formal offer letter, please take the following important steps to ensure a smooth onboarding process.
              </p>

              <h2 className="font-semibold text-xl mt-3">Note for Tele Caller: </h2>
              <p className='my-3'><strong> You become eligible for payout during the probation period once you successfully complete your training, receive approval on your mock call from the trainer or management, and begin live calling.</strong></p>
              <p className="font-semibold mt-4">Salary Revision:</p>
              <p>
                Your salary will be reviewed after 1 year from your last increment, or at such other time as the Management may decide. Salary revisions are discretionary and based on effective performance. You may be asked to justify your salary by completing your monthly targets.
              </p>
              <p className="font-semibold mt-4">Working Hours:</p>
              <p>
                Working hours will be from 07:00/08:00 PM to 05:00/06:00 AM and may change as per Management's decision. The company typically operates six days a week, but you will work five days a week, with Sunday as your weekly off.
              </p>
              <p className="font-semibold mt-4">Absence/Leave Rule:</p>
              <p>
                If you are absent for a continuous period of 3 days without prior approval, or if you overstay on leave or training, it will lead to automatic termination of your employment without notice.
              </p>
              <p className="font-semibold mt-4">Probation/Confirmation:</p>
              <p>
                You will be on probation for three months. Based on your performance, your services may be confirmed in writing. During probation, your services can be terminated with seven days' notice on either side.
              </p>
              <strong>Please note that the security deposit will not be refunded if you leave the position before the appraisal date, and the salary for days worked will not be pay out if you are terminated by the company for a specific reason.</strong>
              <p className="font-semibold mt-4">Confidentiality:</p>
              <p>
                You are not allowed to publish any articles, statements, or make any communications related to the company’s products or matters without prior written permission.
              </p>
              <p className="font-semibold mt-4">Intellectual Property:</p>
              <p>
                Any new methods or improvements developed by you during your employment will remain the sole property of the company.
              </p>
              <p className="font-semibold mt-4">Responsibilities & Duties:</p>
              <p>You are required to adhere to the company’s rules and regulations and perform effectively.</p>
              <p className="font-semibold mt-4">Notice Period:</p>
              <p>
                Upon confirmation, your appointment may be terminated by either party with two months' notice or two months' salary in lieu of the notice period.
              </p>
              <p className="font-semibold mt-4">No Benefits if Leaving Without Notice:</p>
              <p>
                Employees leaving without serving the agreed notice period will not receive salary slips, experience letters, or any other formal documentation.
              </p>
              <p className="font-semibold mt-4">Termination of Employment:</p>
              <p>
                Upon termination, all company property must be returned immediately, and no copies of company data should be retained.
              </p>
            </div>
          </div>
        )}



        {/* Edit / Delete Buttons (visible only when NOT editing) */}
        {!isEditing && (
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleEditToggle}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>

            <button
              onClick={downloadPDF}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Download
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default ManageEmpDetails;




