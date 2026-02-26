import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust as needed
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Side_bar from "../../components/Side_bar";

// Helper function to create a complete download URL from a file path.
function createDownloadLink(filePath) {
  if (!filePath || filePath === "N/A") return "#";

  // If the file path is already a full URL, return it.
  if (filePath.startsWith("https://firebasestorage.googleapis.com")) {
    return filePath;
  }

  // Otherwise, build the URL from the Firebase Storage path.
  const baseUrl =
    "https://firebasestorage.googleapis.com/v0/b/vahlay1.appspot.com/o/";
  let cleanedPath = filePath.replace("gs://vahlay1.appspot.com/", "");
  cleanedPath = cleanedPath.replace(/\/+/g, "/").replace(/\/$/, ""); // Clean extra slashes
  const encodedFilePath = encodeURIComponent(cleanedPath);
  const downloadUrl = `${baseUrl}${encodedFilePath}?alt=media`;

  return downloadUrl;
}

const InterestedCandidates = () => {
  // States for candidate data, filtering, and pagination
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobTitle, setSelectedJobTitle] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch candidates from Firestore on component mount.
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const collectionName = "jobIntrested"; // Ensure this matches your Firestore collection name.
        const querySnapshot = await getDocs(collection(db, collectionName));
        let fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort candidates by application date descending (most recent first)
        fetchedData.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );

        setCandidates(fetchedData);
        setFilteredCandidates(fetchedData);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Compute unique job titles for the dropdown filter.
  const jobTitles = [
    "All",
    ...new Set(
      candidates.map((candidate) => candidate.jobTitle).filter(Boolean)
    ),
  ];

  // Update filtered candidates when selected job title changes.
  useEffect(() => {
    if (selectedJobTitle === "All") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter(
        (candidate) => candidate.jobTitle === selectedJobTitle
      );
      setFilteredCandidates(filtered);
    }
    setCurrentPage(1); // Reset to first page when filter changes.
  }, [selectedJobTitle, candidates]);

  // Pagination calculations.
  const totalRecords = filteredCandidates.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Pagination handlers.
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
        
  <div className="min-h-screen bg-gray-100 flex">
      
      <main className="flex-1">
        
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
          {" "}
           Interested Candidates
        </h1>

       
          {/* Filter Dropdown for Job Title */}
          <div className="mb-4">
            <label className="font-semibold text-gray-700 mr-2">
              Filter by Job Title:
            </label>
            <select
              value={selectedJobTitle}
              onChange={(e) => setSelectedJobTitle(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-1 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {jobTitles.map((title, index) => (
                <option key={index} value={title} className="text-gray-700">
                  {title}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop/Table View */}
          <div className="hidden sm:block bg-white shadow rounded overflow-x-auto">
            <table className="min-w-full text-xs table-auto text-left">
              <thead className="bg-red-100 text-red-800">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Application Date
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Name
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Email
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Job Title
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Experience
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase">
                    Resume
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedCandidates.map((candidate) => {
                  const nameToShow =
                    candidate.name ||
                    `${candidate.firstName || ""} ${
                      candidate.lastName || ""
                    }`.trim();
                  return (
                    <tr
                      key={candidate.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {candidate.applicationDate || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {nameToShow || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {candidate.email || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {candidate.jobTitle || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {candidate.experienceLevel || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {candidate.resumeUrl ? (
                          <a
                            href={createDownloadLink(candidate.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          "No Resume"
                        )}
                      </td>
                    </tr>
                  );
                })}
                {displayedCandidates.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-3 px-4 text-center text-gray-500"
                    >
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Card View */}
          <div className="block sm:hidden space-y-4">
            {displayedCandidates.map((candidate) => {
              const nameToShow =
                candidate.name ||
                `${candidate.firstName || ""} ${
                  candidate.lastName || ""
                }`.trim();
              return (
                <div
                  key={candidate.id}
                  className="border rounded shadow bg-white p-4"
                >
                  <p>
                    <span className="font-bold text-gray-700">
                      Application Date:
                    </span>{" "}
                    {candidate.applicationDate || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Name:</span>{" "}
                    {nameToShow || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Email:</span>{" "}
                    {candidate.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Job Title:</span>{" "}
                    {candidate.jobTitle || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Experience:</span>{" "}
                    {candidate.experienceLevel || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Resume:</span>{" "}
                    {candidate.resumeUrl ? (
                      <a
                        href={createDownloadLink(candidate.resumeUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "No Resume"
                    )}
                  </p>
                </div>
              );
            })}
            {displayedCandidates.length === 0 && (
              <p className="text-center text-gray-500">No candidates found.</p>
            )}
          </div>

          {/* Pagination Bar */}
          <div className="bg-white mt-4 p-4 rounded shadow flex flex-col sm:flex-row items-center justify-between">
            {/* Rows per page */}
            <div className="flex items-center mb-2 sm:mb-0">
              <label
                htmlFor="rowsPerPage"
                className="mr-2 text-gray-700 font-medium"
              >
                Rows per page:
              </label>
              <select
                id="rowsPerPage"
                className="border border-gray-300 rounded p-1 text-gray-700"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>

            {/* Range Indicator */}
            <div className="text-gray-700 mb-2 sm:mb-0">
              {totalRecords === 0
                ? "0"
                : `${startIndex + 1} - ${Math.min(
                    endIndex,
                    totalRecords
                  )} of ${totalRecords}`}
            </div>

            {/* Pagination Icons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border border-gray-300 text-gray-700 font-medium focus:outline-none ${
                  currentPage === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Previous Page"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded border border-gray-300 text-gray-700 font-medium focus:outline-none ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Next Page"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterestedCandidates;
