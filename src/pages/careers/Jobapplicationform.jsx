import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ClearableInput from "../../components/common/ClearableInput";

const JobApplicationForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { jobData } = state || {};
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experienceLevel: "",
    resume: null,
    applicationDate: new Date().toISOString().split("T")[0],
    jobTitle: jobData?.title || "N/A",
    jobId: jobData?.requisitionId || "N/A",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!jobData) {
      console.error("Job data not found. Redirecting...");
      navigate("/jobopening");
    }
  }, [jobData, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";

    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";

    if (!formData.resume) newErrors.resume = "Resume is required.";

    if (!formData.experienceLevel) newErrors.experienceLevel = "Experience Level is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let resumeUrl = "";
      if (formData.resume) {
        const fileRef = ref(storage, `resumes/${formData.resume.name}`);
        await uploadBytes(fileRef, formData.resume);
        resumeUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, "jobIntrested"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experienceLevel: formData.experienceLevel,
        resumeUrl,
        applicationDate: formData.applicationDate,
        jobTitle: formData.jobTitle,
        jobId: formData.jobId,
      });

      alert("Form submitted successfully!");
      navigate("/careers");
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-lg font-semibold text-gray-600">
          Loading job details... Please wait or try again later.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col md:flex-row">
      {/* Left Column */}
      <div className="hidden md:flex w-1/2 bg-white text-red-800 flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">{jobData.title}</h1>
        <p className="text-lg mb-6 text-red-800">
          {jobData.description || "Join us and make an impact!"}
        </p>
        <div className="flex items-center relative">
                    
                      <img
                        src="/assets/logo1.png"
                        alt="Vahlay Consulting Logo"
                        className="w-80"
                      />
                      <img src="/assets/logorings.png"
                        className=" w-auto absolute top-0 logoRingsSpin"
                      />
                   
                  </div>
      </div>

      {/* Form Column */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-4 md:p-6">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 w-full max-w-lg">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            Apply for <strong className="text-red-800">{formData.jobTitle}</strong>
          </h1>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <ClearableInput
                id="apply-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <ClearableInput
                id="apply-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <ClearableInput
                id="apply-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Experience Level </option>
               
                <option value="Fresher"> Fresher </option>
                <option value="6th Months to 1 Year">6th Months to 1 Year</option>
                <option value="1 to 3 Years">1 to 3 Years</option>
                <option value="6+ Years">6+ Years</option>
              </select>
              {errors.experienceLevel && (
                <p className="text-red-500 text-sm">{errors.experienceLevel}</p>
              )}
            </div>

            {/* Resume Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Resume</label>
              <input
                type="file"
                name="resume"
                onChange={handleChange}
                accept=".pdf"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
