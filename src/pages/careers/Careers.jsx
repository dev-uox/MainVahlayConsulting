import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaTimes, FaFilter } from "react-icons/fa";

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters in mobile view
  const [filters, setFilters] = useState({
    location: "",
    postDate: "",
    shift: "",
    role: "",
    minQualification: "",
    experienceLevel: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      const jobCollection = collection(db, "jobs");
      const jobSnapshot = await getDocs(jobCollection);
      const jobsData = jobSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    };
    fetchJobs();
  }, []);
  const clearFilterField = (fieldName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [fieldName]: "", // Clearing the field
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    let updatedJobs = [...jobs];

    // Role Filter
    if (filters.role.trim()) {
      updatedJobs = updatedJobs.filter((job) =>
        job.title?.toLowerCase().includes(filters.role.toLowerCase().trim())
      );
    }

    // Location Filter
    if (filters.location.trim()) {
      updatedJobs = updatedJobs.filter((job) =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase().trim())
      );
    }

    // Post Date Filter
    if (filters.postDate) {
      const currentDate = new Date();
      let dateRange = null;

      switch (filters.postDate) {
        case "recent":
          dateRange = new Date();
          dateRange.setDate(currentDate.getDate() - 1);
          break;
        case "1week":
          dateRange = new Date();
          dateRange.setDate(currentDate.getDate() - 7);
          break;
        case "1month":
          dateRange = new Date();
          dateRange.setMonth(currentDate.getMonth() - 1);
          break;
        case "3months":
          dateRange = new Date();
          dateRange.setMonth(currentDate.getMonth() - 3);
          break;
        default:
          dateRange = null;
      }

      if (dateRange) {
        updatedJobs = updatedJobs.filter((job) => {
          const postedOnDate = new Date(job.postedOn);
          return (
            !isNaN(postedOnDate.getTime()) && postedOnDate >= dateRange
          );
        });
      }
    }

    // Shift Filter
    if (filters.shift.trim()) {
      updatedJobs = updatedJobs.filter(
        (job) => job.shift?.toLowerCase() === filters.shift.toLowerCase().trim()
      );
    }

    // Minimum Qualification Filter
    if (filters.minQualification.trim()) {
      updatedJobs = updatedJobs.filter(
        (job) =>
          job.minQualification?.toLowerCase() === filters.minQualification.toLowerCase().trim()
      );
    }

    // Experience Level Filter
    if (filters.experienceLevel.trim()) {
      updatedJobs = updatedJobs.filter(
        (job) =>
          job.experienceLevel?.toLowerCase() === filters.experienceLevel.toLowerCase().trim()
      );
    }

    setFilteredJobs(updatedJobs);
  };

  // Reset Filters
  const removeFilters = () => {
    setFilters({
      location: "",
      postDate: "",
      shift: "",
      role: "",
      minQualification: "",
      experienceLevel: "",
    });
    setFilteredJobs(jobs);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative w-full h-[250px] md:h-[550px] flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dzdnwpocf/image/upload/v1751570847/qyi0rt6hmceubjlzlpek.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <h1 className="relative text-2xl md:text-5xl font-bold text-white z-10">Find Your Dream Job</h1>
        <p className="relative text-sm mt-2 z-10">Be a part of something great</p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex justify-end px-4 py-3">
        <button
          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="mr-2" /> Add Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-6 py-8">
        {/* Sidebar Filters */}
        <div className={` bg-white  p-3 shadow-sm lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Filter Jobs</h2>

          <div className="space-y-5">
            {/* Text Input Filters */}
            {[
              { name: "role", label: "Role", type: "text", placeholder: "Search by role" },
              { name: "location", label: "Location", type: "text", placeholder: "Search by location" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name} className="relative">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="relative">
                  <input
                    type={type}
                    name={name}
                    value={filters[name]}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-red-500 focus:border-red-500"
                    placeholder={placeholder}
                  />
                  {filters[name] && (
                    <FaTimes
                      className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-red-500"
                      onClick={() => clearFilterField(name)}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Dropdown Filters */}
            {[
              { name: "postDate", label: "Post Date", options: ["recent", "1week", "1month", "3months"] },
              { name: "shift", label: "Shift", options: ["Day", "Night"] },
              { name: "minQualification", label: "Minimum Qualification", options: ["12th Pass", "Bachelors", "Masters"] },
              { name: "experienceLevel", label: "Experience Level", options: ["Fresher", "Fresher/Experience", "6th Months to 1 Year", "1 to 3 Years", "6+ Years"] },
            ].map(({ name, label, options }) => (
              <div key={name} className="relative">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="relative">
                  <select
                    name={name}
                    value={filters[name]}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-red-500 focus:border-red-500 appearance-none"
                  >
                    <option value="">Select</option>
                    {options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {filters[name] && (
                    <FaTimes
                      className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-red-500"
                      onClick={() => clearFilterField(name)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-2">
            <button onClick={applyFilters} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Apply Filters
            </button>
            <button onClick={removeFilters} className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
              Reset Filters
            </button>
          </div>
        </div>
 
        {/* Job Listings */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length === 0 ? (
            <p className="col-span-3 text-center text-lg font-semibold text-gray-600">
              No jobs found
            </p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-300 flex flex-col justify-between"
              >
                {/* Job Title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {job.title}
                </h3>

                {/* Job Info */}
                <div className="text-gray-700 space-y-2 text-sm flex-grow">
                  <p className="flex items-center">
                    📍 <strong className="mx-1">Location:</strong> {job.location}
                  </p>
                  <p className="flex items-center">
                    📅 <strong className="mx-1">Posted On:</strong> {job.postedOn}
                  </p>
                  <p className="flex items-center">
                    ⏳ <strong className="mx-1">Shift:</strong> {job.shift || "N/A"}
                  </p>
                  <p className="flex items-center">
                    🎓 <strong className="mx-1">Qualification:</strong> {job.minQualification}
                  </p>
                  <p className="flex items-center">
                    💼 <strong className="mx-1">Experience Level:</strong> {job.experience}
                  </p>
                </div>

                {/* Apply Button */}
                <div className="mt-4">
                  <Link
                    to={`/Jobdescription/${job.id}`}
                    className="block text-center bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CareersPage;
