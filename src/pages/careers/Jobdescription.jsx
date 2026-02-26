import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";


// Modal Component for Terms and Conditions
const TermsModal = ({ isOpen, onClose, onAcceptTerms }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-center mb-4">Terms and Conditions</h2>
        <div className="text-gray-700 overflow-y-auto max-h-96">
          <p>
            <strong>Dear Candidate,</strong>
          </p>
          <p>
            <strong>
              Welcome to Vahlay Consulting Inc! Please review the key terms below:
            </strong>
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Salary Revision:</strong> Reviewed annually based on performance at Management's discretion.
            </li>
            <li>
              <strong>Working Hours:</strong> Night shifts (07:00/08:00 PM to 05:00/06:00 AM), 5-6 days/week. Weekend work may be required.
            </li>
            <li>
              <strong>Leave Policy:</strong> Absence beyond 3 days without approval leads to termination.
            </li>
            <li>
              <strong>Probation:</strong> 3-month probation (extendable); post-probation requires 2-month notice for termination.
            </li>
            <li>
              <strong>Confidentiality:</strong> Disclosure of company information requires prior written permission.
            </li>
            <li>
              <strong>Intellectual Property:</strong> Work created during employment belongs to the company.
            </li>
            <li>
              <strong>Notice Period:</strong> Two months' notice or salary in lieu; no benefits for leaving without notice.
            </li>
            <li>
              <strong>Termination:</strong> Immediate termination for serious violations.
            </li>
          </ul>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <label className="block">
            <input type="checkbox" onChange={onAcceptTerms} className="mr-2" />
            I accept the Terms and Conditions.
          </label>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const JobDescriptionPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [agreeSkills, setAgreeSkills] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDocRef = doc(db, "jobs", jobId);
        const jobSnapshot = await getDoc(jobDocRef);
        if (jobSnapshot.exists()) {
          setJobData(jobSnapshot.data());
        } else {
          console.error("Job not found");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    fetchJob();
  }, [jobId]);

  // Enable Apply button when all conditions are met
  const isApplyEnabled = agreeSkills && acceptTerms && isTermsAccepted;

  if (!jobData)
    return <div className="p-6 text-center text-gray-700">Loading job details...</div>;

  return (
    <div className=" min-h-screen  bg-gray-50">

      <main className="w-full  p-6">
        {/* Terms Modal */}
        <TermsModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          onAcceptTerms={() => setIsTermsAccepted(true)}
        />

        {/* Hero Banner */}
        <div
          className="relative text-xs  bg-cover bg-center h-64 rounded-lg shadow-lg mb-6"
          style={{ backgroundImage: 'url("/assets/work with us.jpg")' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">Work with Us</h1>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-600">{jobData.title}</h2>
            <p className=" text-gray-600">
              <strong>Posted On:</strong> {jobData.postedOn}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-6">
            <div>
              <p>
                <strong>Location:</strong> {jobData.location}
              </p>
            </div>
            <div>
              <p>
                <strong>Minimum Qualification:</strong> {jobData.minQualification}
              </p>
            </div>
            <div>
              <p>
                <strong>Experience Level:</strong> {jobData.experience}
              </p>
            </div>
            <div>
              <p>
                <strong>Employment Type:</strong> {jobData.employmentType}
              </p>
            </div>
            <div>
              <p>
                <strong>Working Shift:</strong> {jobData.shift}
              </p>
            </div>
            <div>
              <p>
                <strong>Shift Timing:</strong> {jobData.timing}
              </p>
            </div>
          </div>

          {jobData.sections && jobData.sections.length > 0 ? (
            <div className="mb-6">
              {jobData.sections.map((section, index) => (
                <div key={index} className="mb-4 pt-2">
                  {section.heading && (
                    <h2 className="text-xl font-semibold text-gray-800">{section.heading}</h2>
                  )}
                  {section.paragraph && (
                    <p className="text-gray-700 mt-1">{section.paragraph}</p>
                  )}
                  {section.bulletheading && (
                    <h3 className="font-semibold text-gray-800 mt-2">{section.bulletheading}</h3>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 text-gray-700">
                      {section.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Job Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Job Description</h3>
                <p className="text-gray-700">{jobData.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {jobData.responsibilities &&
                    jobData.responsibilities.split("\n").map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </div>
            </>
          )}


          {/* Applicant Acknowledgements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-gray-800">
              Applicant Acknowledgements
            </h3>
            <label className="block mb-2">
              <input
                type="checkbox"
                checked={agreeSkills}
                onChange={(e) => setAgreeSkills(e.target.checked)}
                className="mr-2"
              />
              I confirm that I possess the required skills.
            </label>
            <label className="block">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (e.target.checked) setIsTermsModalOpen(true);
                }}
                className="mr-2"
              />
              I accept the{" "}
              <span
                className="font-bold text-red-600 cursor-pointer"
                onClick={() => setIsTermsModalOpen(true)}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            <button
              className={`w-full md:w-auto px-4 py-2 rounded text-center ${isApplyEnabled
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              disabled={!isApplyEnabled}
              onClick={() =>
                navigate("/Jobapplicationform", { state: { jobData } })
              }
            >
              Apply Now
            </button>
            <button
              className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 text-center"
              onClick={() => navigate("/jobopening")}
            >
              Back to Careers
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDescriptionPage;
