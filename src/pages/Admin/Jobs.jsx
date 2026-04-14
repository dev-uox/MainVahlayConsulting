import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Side_Bar from "../../components/Side_bar";
import ClearableInput from "../../components/common/ClearableInput";

const AdminPortal = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "",
    minQualification: "",
    employmentType: "",
    experience: "",
    shift: "",
    timing: "",
    postedOn: new Date().toISOString().split("T")[0],
    sections: [],
  });
  const [newSection, setNewSection] = useState({
    heading: "",
    paragraph: "",
    bulletheading: "",
    bullets: [],
  });
  const [newBullet, setNewBullet] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobSnapshot = await getDocs(collection(db, "jobs"));
      setJobs(jobSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingJob) {
      await updateDoc(doc(db, "jobs", editingJob.id), jobForm);
      setEditingJob(null);
    } else {
      await addDoc(collection(db, "jobs"), jobForm);
    }
    setJobForm({
      title: "",
      location: "",
      minQualification: "",
      employmentType: "",
      experience: "",
      shift: "",
      timing: "",
      postedOn: new Date().toISOString().split("T")[0],
      sections: [],
    });
    setNewSection({
      heading: "",
      paragraph: "",
      bulletheading: "",
      bullets: [],
    });
    setNewBullet("");
    setEditingSectionIndex(null);
    const updatedJobs = await getDocs(collection(db, "jobs"));
    setJobs(updatedJobs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleEdit = (job) => {
    const updatedJob = { ...job, sections: job.sections || [] };
    setEditingJob(updatedJob);
    setJobForm(updatedJob);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditingSectionIndex(null);
    setNewSection({
      heading: "",
      paragraph: "",
      bulletheading: "",
      bullets: [],
    });
    setNewBullet("");
  };

  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await deleteDoc(doc(db, "jobs", id));
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  const addBullet = () => {
    if (newBullet.trim() !== "") {
      setNewSection({
        ...newSection,
        bullets: [...newSection.bullets, newBullet.trim()],
      });
      setNewBullet("");
    }
  };

  const removeBullet = (index) => {
    setNewSection({
      ...newSection,
      bullets: newSection.bullets.filter((_, i) => i !== index),
    });
  };

  const handleEditSection = (job, sectionIndex) => {
    if (job.id && (!editingJob || editingJob.id !== job.id)) {
      handleEdit(job);
    }
    window.scrollTo(0, 0);
    setEditingSectionIndex(sectionIndex);

    if (job.sections && job.sections[sectionIndex]) {
      const sectionData = job.sections[sectionIndex];
      setNewSection({ ...sectionData });
    } else {
      console.error("Invalid section index or missing sections", sectionIndex);
    }
  };

  const handleDeleteSection = async (job, sectionIndex) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      const updatedSections = [...job.sections];
      updatedSections.splice(sectionIndex, 1);
      try {
        await updateDoc(doc(db, "jobs", job.id), { sections: updatedSections });
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === job.id ? { ...j, sections: updatedSections } : j,
          ),
        );
      } catch (error) {
        console.error("Error deleting section:", error);
      }
    }
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
              {" "}
              Add New Job
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 md:mb-8 border border-red-200 my-2">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
              >
                {/* Basic Job Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <ClearableInput
                    id="job-title"
                    type="text"
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm sm:text-base"
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <ClearableInput
                    id="job-location"
                    type="text"
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm sm:text-base"
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Qualification
                  </label>
                  <select
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.minQualification}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        minQualification: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Qualification</option>
                    <option value="Diploma">Diploma</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employment Type
                  </label>
                  <select
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.employmentType}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, employmentType: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Level
                  </label>
                  <select
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.experience}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, experience: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Fresher/Experience">
                      Fresher/Experience
                    </option>
                    <option value="Fresher">Fresher</option>
                    <option value="6th Months to 1 Year">
                      6th Months to 1 Year
                    </option>
                    <option value="1 to 3 Years">1 to 3 Years</option>
                    <option value="6+ Years">6+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.shift}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, shift: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="Monday-Friday (Day)">
                      Monday-Friday (Day)
                    </option>
                    <option value="Monday-Friday (Night)">
                      Monday-Friday (Night)
                    </option>
                    <option value="Monday-Saturday (Day)">
                      Monday-Saturday (Day)
                    </option>
                    <option value="Monday-Saturday (Night)">
                      Monday-Saturday (Night)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shift Timing
                  </label>
                  <select
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.timing}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, timing: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Shift Timing</option>
                    <option value="12:00 PM to 09:00 PM / 01:00 PM to 10:00 PM">
                      12:00 PM to 09:00 PM / 01:00 PM to 10:00 PM
                    </option>
                    <option value="07:00/08:00 PM to 05:00/06:00 AM">
                      07:00/08:00 PM to 05:00/06:00 AM
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posted On
                  </label>
                  <input
                    type="date"
                    className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                    value={jobForm.postedOn}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, postedOn: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Job Detail Section */}
                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-4">
                  <h3 className="text-lg sm:text-xl font-bold text-red-500 mb-3">
                    Job Detail Section
                  </h3>

                  {/* Display current sections from jobForm */}
                  {jobForm.sections && jobForm.sections.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-base sm:text-lg font-bold text-red-500 mb-1">
                        Job Details
                      </h4>
                      {jobForm.sections.map((section, index) => (
                        <div key={index} className="mb-2 border-t pt-2">
                          {section.heading && (
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                              {section.heading}
                            </p>
                          )}
                          {section.paragraph && (
                            <p className="text-gray-700 mt-1 text-sm sm:text-base">
                              {section.paragraph}
                            </p>
                          )}
                          {section.bulletheading && (
                            <p className="font-semibold text-gray-800 mt-2 text-sm sm:text-base">
                              {section.bulletheading}
                            </p>
                          )}
                          {section.bullets && section.bullets.length > 0 && (
                            <ul className="list-disc pl-5 mt-1 text-gray-700 text-sm sm:text-base">
                              {section.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handleEditSection(jobForm, index)}
                              className="text-blue-500 hover:underline text-xs sm:text-sm"
                            >
                              Edit Section
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSections = [...jobForm.sections];
                                updatedSections.splice(index, 1);
                                setJobForm({
                                  ...jobForm,
                                  sections: updatedSections,
                                });
                              }}
                              className="text-red-500 hover:underline text-xs sm:text-sm"
                            >
                              Delete Section
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section Form Fields */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Section Heading
                    </label>
                    <ClearableInput
                      id="section-heading"
                      type="text"
                      className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm sm:text-base"
                      value={newSection.heading}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          heading: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Section Paragraph
                    </label>
                    <textarea
                      className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-red-200 text-sm sm:text-base"
                      rows="3"
                      value={newSection.paragraph}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          paragraph: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Bullet Point Heading
                    </label>
                    <ClearableInput
                      id="bullet-heading"
                      type="text"
                      className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm sm:text-base"
                      value={newSection.bulletheading}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          bulletheading: e.target.value,
                        })
                      }
                      placeholder="Heading for bullet points (optional)"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Bullet Points
                    </label>
                    <div className="flex gap-2 mt-1">
                      <ClearableInput
                        id="new-bullet"
                        type="text"
                        className="border border-gray-300 rounded px-3 py-1 w-full focus:ring focus:ring-red-200 text-sm sm:text-base outline-none"
                        value={newBullet}
                        onChange={(e) => setNewBullet(e.target.value)}
                        placeholder="Enter bullet point"
                      />
                      <button
                        type="button"
                        className="bg-green-500 text-white rounded px-3 py-1 hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
                        onClick={addBullet}
                      >
                        Add
                      </button>
                    </div>
                    {newSection.bullets.length > 0 && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm sm:text-base">
                        {newSection.bullets.map((bullet, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-1">{bullet}</span>
                            <button
                              type="button"
                              className="text-red-500 text-sm hover:underline ml-2"
                              onClick={() => removeBullet(index)}
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {editingSectionIndex === null ? (
                    <button
                      type="button"
                      className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 text-sm sm:text-base"
                      onClick={() => {
                        setJobForm({
                          ...jobForm,
                          sections: [...jobForm.sections, newSection],
                        });
                        setNewSection({
                          heading: "",
                          paragraph: "",
                          bulletheading: "",
                          bullets: [],
                        });
                        setNewBullet("");
                      }}
                    >
                      Add Section
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 text-sm sm:text-base"
                      onClick={() => {
                        const updatedSections = [...jobForm.sections];
                        updatedSections[editingSectionIndex] = newSection;
                        setJobForm({ ...jobForm, sections: updatedSections });
                        setNewSection({
                          heading: "",
                          paragraph: "",
                          bulletheading: "",
                          bullets: [],
                        });
                        setNewBullet("");
                        setEditingSectionIndex(null);
                      }}
                    >
                      Update Section
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-red-500 text-white rounded px-6 py-2 shadow hover:bg-red-600 text-sm sm:text-base"
                  >
                    {editingJob ? "Update Job" : "Add Job"}
                  </button>
                </div>
              </form>
            </div>

            {/* Job List Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Job Openings
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 shadow bg-gray-50"
                  >
                    <div className="mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-red-600">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mt-1">
                        {job.location}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {job.employmentType}
                      </p>
                    </div>

                    <div className="flex justify-between mt-3">
                      <button
                        type="button"
                        className="text-red-500 hover:underline text-sm sm:text-base"
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-700 hover:underline text-sm sm:text-base"
                        onClick={() => deleteJob(job.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminPortal;
