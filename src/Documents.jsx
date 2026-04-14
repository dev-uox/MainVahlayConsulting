import React, { useState } from "react";

const Documents = () => {
  // State to store the uploaded file names
  const [resumeFile, setResumeFile] = useState("");
  const [adharFrontFile, setAdharFrontFile] = useState("");
  const [adharBackFile, setAdharBackFile] = useState("");
  const [panCardFile, setPanCardFile] = useState("");
  const [previousCompanyDocFile, setPreviousCompanyDocFile] = useState("");

  // Function to handle file selection and update the state
  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      setter(file.name);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-8 py-[10px]">
        {/* Left Side (Logo and USA | CANADA | BHARAT) */}
        <div className="flex flex-col items-start">
          <img
            src="./src/Photo/v.jpg"
            alt="Logo"
            className="h-[105px] w-auto object-contain"
          />
          <div className="flex justify-start w-full">
            <hr className="w-[75px] border-t-3 border-red-600 ml-[20px]" />
          </div>
          <div className="flex flex-col items-center mt-2">
            <p className="text-[9px] text-red-600 font-semibold">USA | CANADA | BHARAT</p>
            <p className="text-[7px] text-red-600 font-bold text-center">www.vahlay.consulting.com</p>
          </div>
        </div>

        {/* Centered Text Section */}
        <div className="flex-grow">
          <h1 className="text-4xl text-red-600 font-bold mb-0 text-center">Vahlay Consulting</h1>
          <p className="text-sm text-red-400 font-light mb-4 text-center">Delivering Excellence in Consulting Services</p>
          <h1 className="text-2xl text-red-500 font-bold text-center">Application Form</h1>
        </div>
      </div>

      {/* Red Line and Personal Details box */}
      <div className="relative mt-6">
        <div className="border-t-4 border-red-600"></div>
        <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 text-red-600 font-bold rounded-xl shadow-md">
          Documents
        </div>
      </div>

      {/* Form starts here */}
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 pt-[20px]">
        <div className="bg-gray-300 p-8 rounded-lg w-full max-w-3xl">
          <form className="space-y-6">
            {/* Upload Resume */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-xs mx-auto">
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept="application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, setResumeFile)}
                />
                <div className="w-1/2 h-[40px] p-3 mt-2 h-[40px] border border-gray-300 rounded-md text-center bg-gray-200 cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600">
                  Choose File
                </div>
              </div>
              <div className="w-[1200px] p-3 mt-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md">
                {/* Display file name or placeholder */}
                {resumeFile ? resumeFile : "Upload Resume (PDF, Max 5MB)"}
              </div>
            </div>

            {/* Upload Aadhar Front */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-xs mx-auto">
                <input
                  type="file"
                  id="adhar_front"
                  name="adhar_front"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, setAdharFrontFile)}
                />
                <div className="w-1/2 p-3 mt-2 h-[40px] border border-gray-300 rounded-md text-center bg-gray-200 cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600">
                  Choose File
                </div>
              </div>
              <div className="w-[1200px] p-3 mt-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md">
                {/* Display file name or placeholder */}
                {adharFrontFile ? adharFrontFile : "Aadhar Card Front (Image/PDF, Max 5MB)"}
              </div>
            </div>

            {/* Upload Aadhar Back */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-xs mx-auto">
                <input
                  type="file"
                  id="adhar_back"
                  name="adhar_back"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, setAdharBackFile)}
                />
                <div className="w-1/2 p-3 h-[40px] mt-2 border border-gray-300 rounded-md text-center bg-gray-200 cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600">
                  Choose File
                </div>
              </div>
              <div className="w-[1200px] p-3 mt-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md">
                {/* Display file name or placeholder */}
                {adharBackFile ? adharBackFile : "Aadhar Card Back (Image/PDF, Max 5MB)"}
              </div>
            </div>

            {/* Upload PAN Card */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-xs mx-auto">
                <input
                  type="file"
                  id="pan_card"
                  name="pan_card"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, setPanCardFile)}
                />
                <div className="w-1/2 p-3 h-[40px] mt-2 border border-gray-300 rounded-md text-center bg-gray-200 cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600">
                  Choose File
                </div>
              </div>
              <div className="w-[1200px] p-3 mt-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md">
                {/* Display file name or placeholder */}
                {panCardFile ? panCardFile : "PAN Card (Image/PDF, Max 5MB)"}
              </div>
            </div>

            {/* Checkbox - I don't have documents of previous company */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="no_docs"
                name="no_docs"
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-0"
              />
              <label htmlFor="no_docs" className="text-sm text-gray-700">
                I don't have documents of previous company
              </label>
            </div>

            {/* Upload Document of Previous Company */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-xs mx-auto">
                <input
                  type="file"
                  id="previous_company_doc"
                  name="previous_company_doc"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, setPreviousCompanyDocFile)}
                />
                <div className="w-[160px] h-[40px] p-3 mt-2 border border-gray-300 rounded-md text-center bg-gray-200 cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600">
                  Choose File
                </div>
              </div>
              <div className="w-[1200px] p-3 mt-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md">
                {/* Display file name or placeholder */}
                {previousCompanyDocFile ? previousCompanyDocFile : "Document of Previous Company (Image/PDF, Max 5MB)"}
              </div>
            </div>

            {/* Checkbox - Accept Terms and Conditions */}
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="checkbox"
                id="accept_terms"
                name="accept_terms"
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-0"
              />
              <label htmlFor="accept_terms" className="text-sm text-gray-700">
                I accept the terms and conditions
              </label>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Documents;
