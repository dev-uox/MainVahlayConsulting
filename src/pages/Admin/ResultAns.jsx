import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { MdDelete } from "react-icons/md";
import { db, storage } from "../../firebaseConfig";
import Side_bar from "../../components/Side_bar";

const RECRUITERS = [
  "Hansal Kava (CEO)",
  "Harshad Prajapati (Manager)",
  "KanakSinh Zala (CSA)",
  "Rahul Rana (STE)",

  "Rochit Joshi (Trainer)",
  "Janet Robbin(Recruiter)",
];
const RATINGS = ["Excellent", "Good", "Average", "Poor", "Bad"];

function formatTs(ts) {
  if (!ts) return "";
  if (ts.toDate) return ts.toDate().toLocaleString();
  return new Date(ts).toLocaleString();
}

export default function ResultDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [audioURLs, setAudioURLs] = useState({});
  const [loading, setLoading] = useState(true);

  const [commenter, setCommenter] = useState(RECRUITERS[0]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(RATINGS[0]);
  const [submitting, setSubmitting] = useState(false);

  // 1) Load user responses
  useEffect(() => {
    if (!userId) return;
    async function loadUser() {
      setLoading(true);
      const snap = await getDoc(doc(db, "campusDrive", userId));
      if (!snap.exists()) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = snap.data();
      data.recruiterComments = data.recruiterComments || [];
      setUser(data);

      // fetch audio URLs
      const secs = ["speaking", "selling", "problemSolving"];
      const urls = {};
      await Promise.all(
        secs.map(async (s) => {
          if (data[s]?.audioPath) {
            try {
              urls[s] = await getDownloadURL(
                storageRef(storage, data[s].audioPath)
              );
            } catch (err) {
              console.log(`Error fetching audio for ${s}:`, err);
            }
          }
        })
      );
      setAudioURLs(urls);
      setLoading(false);
    }
    loadUser();
  }, [userId]);

  // 2) Load all prompts from campusDriveQuitions
  useEffect(() => {
    async function loadQuestions() {
      const snap = await getDocs(collection(db, "campusDriveQuitions"));
      if (snap.empty) {
        console.log("No questions found!");
        return;
      }
      const data = snap.docs[0].data();
      console.log("Loaded questions:", data);
      setQuestions(data);
    }
    loadQuestions();
  }, []);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const newC = {
      name: commenter,
      rating,
      text: commentText.trim(),
      submittedAt: new Date(),
    };
    const docRef = doc(db, "campusDrive", userId);
    await updateDoc(docRef, {
      recruiterComments: [...user.recruiterComments, newC],
    });
    setUser((u) => ({
      ...u,
      recruiterComments: [...u.recruiterComments, newC],
    }));
    setCommentText("");
    setRating(RATINGS[0]);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      )
    ) {
      await deleteDoc(doc(db, "campusDrive", userId));
      navigate("/result");
    }
  };

  if (loading || !questions)
    return (
      <div className="flex justify-center items-center h-64">Loading…</div>
    );
  if (!user)
    return (
      <div className="p-6 text-center">
        User not found.
        <br />
        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );

  // Helper to turn Firestore maps into ordered arrays
  const mapToArray = (m) =>
    m && typeof m === "object" ? Object.values(m) : [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-10">
        
        <h1 className="text-lg font-semibold text-gray-800">User Details</h1>
        
        <div className="w-10"></div>
      </div>

    

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Back Link */}
        <Link to="/result" className="text-red-600 hover:underline text-sm sm:text-base inline-block">
          ← Back to Dashboard
        </Link>

        {/* User Info Card */}
<<<<<<< HEAD
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="mt-1 sm:mt-0 text-xs sm:text-sm text-gray-600">
              Registered: {formatTs(user.registeredAt)}
            </p>
=======
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Registered: {formatTs(user.registeredAt)}
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-all text-xs font-bold border border-red-100 flex items-center gap-2"
            >
              <MdDelete className="text-lg" />
              Delete Profile
            </button>
>>>>>>> ce7fac5 (Save work before sync)
          </div>

          {/* User details grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="mt-1 text-sm sm:text-base break-all">{user.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <p className="mt-1 text-sm sm:text-base">{user.number}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 uppercase">City</p>
              <p className="mt-1 text-sm sm:text-base">{user.city}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Religion</p>
              <p className="text-gray-900 font-bold">{user.religion || <span className="text-gray-400 italic">Not Provided</span>}</p>
            </div>
          </div>
        </div>

        {/* Section 0: Personal Questions */}
        <section className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Personal Questions</h3>
          <ol className="list-decimal pl-4 sm:pl-6 mt-2 space-y-3 sm:space-y-4">
            {mapToArray(questions?.personalQuitions || []).map((q, i) => (
              <li key={i} className="pb-3 sm:pb-4 border-b last:border-b-0">
                <p className="font-medium text-gray-700 text-sm sm:text-base">{q}</p>
                <p className="mt-2 text-gray-800 text-sm sm:text-base bg-gray-50 p-3 rounded">
                  {user.personalBackground?.[i] || "Not Answered"}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 1: Listening */}
<<<<<<< HEAD
        <section className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Listening</h3>
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <video 
              controls 
              className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mt-4 rounded"
            >
              <source src="/assets/Listening%20test.mp4" type="video/mp4" />
              Your browser does not support video.
            </video>
=======
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Listening Assessment</h3>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                controls
                className="w-full h-full"
              >
                <source src="/assets/Listening%20test.mp4" type="video/mp4" />
                Your browser does not support video.
              </video>
            </div>
>>>>>>> ce7fac5 (Save work before sync)
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded">
            <p className="font-medium text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
              {questions?.listening || "No listening prompt available."}
            </p>
            <div className="mt-3 sm:mt-4 p-3 bg-white rounded border">
              <p className="text-gray-800 text-sm sm:text-base">
                {user.listening?.text || "No transcript."}
              </p>
            </div>
            {user.listening?.submittedAt && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3">
                Submitted: {formatTs(user.listening.submittedAt)}
              </p>
            )}
          </div>
        </section>

        {/* Sections 2–4: Speaking, Selling, Problem Solving */}
        {["speaking", "selling", "problemSolving"].map((sec) => {
          const prompt =
            questions?.[sec]?.que || questions?.[sec] || "No prompt available.";
          const tasks = questions?.[sec]?.tasks
            ? Object.values(questions[sec]?.tasks)
            : [];
          const hasAudio = Boolean(audioURLs[sec]);
          const submittedAt = user?.[sec]?.submittedAt;

          return (
            <section key={sec} className="bg-white shadow rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 capitalize">
                {sec.replace(/([A-Z])/g, " $1")}
              </h3>

              <div className="bg-gray-50 p-3 sm:p-4 rounded">
                {/* Main prompt */}
                <p className="font-medium text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
                  {prompt}
                </p>

                {/* Tasks list */}
                {tasks.length > 0 && (
<<<<<<< HEAD
                  <ol className="list-decimal pl-4 sm:pl-6 mt-3 sm:mt-4 space-y-2 text-gray-800 text-sm sm:text-base">
                    {tasks.map((task, i) => (
                      <li key={i} className="pb-2 last:pb-0">
                        {task}
                      </li>
                    ))}
                  </ol>
                )}

                {/* Audio player */}
                {hasAudio ? (
                  <div className="mt-4">
                    <audio 
                      controls 
                      src={audioURLs[sec]} 
                      className="w-full"
                    />
                  </div>
                ) : (
                  <p className="italic text-gray-500 mt-4 text-sm sm:text-base">
                    {user?.[sec]?.audioPath ? "Loading audio…" : "No recording."}
                  </p>
                )}

                {/* Submitted timestamp */}
                {submittedAt && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Submitted: {formatTs(submittedAt)}
                  </p>
                )}
=======
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Specific Tasks:</p>
                    <ul className="space-y-2">
                      {tasks.map((task, i) => (
                        <li key={i} className="flex gap-3 text-gray-800 leading-relaxed">
                          <span className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">{i + 1}</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 text-center">Voice Submission:</p>
                  {hasAudio ? (
                    <audio
                      controls
                      src={audioURLs[sec]}
                      className="w-full accent-red-600"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <p className="text-gray-400 text-sm font-medium italic">
                        {user?.[sec]?.audioPath ? "Processing audio recording..." : "No recording available."}
                      </p>
                    </div>
                  )}
                  {submittedAt && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center">
                      Timestamp: {formatTs(submittedAt)}
                    </p>
                  )}
                </div>
>>>>>>> ce7fac5 (Save work before sync)
              </div>
            </section>
          );
        })}

        {/* Section 5: Quick Aptitude */}
        <section className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Aptitude Test</h3>
          <div className="bg-gray-50 p-3 sm:p-4 rounded">
            {questions?.aptitude && questions.aptitude.length > 0 ? (
              <ol className="list-decimal pl-4 sm:pl-6 mt-2 space-y-3 sm:space-y-4">
                {questions.aptitude.map((q, i) => (
                  <li key={i} className="pb-3 sm:pb-4 border-b last:border-b-0">
                    <p className="font-medium text-gray-700 text-sm sm:text-base">{q}</p>
                    <p className="mt-2 text-gray-800 text-sm sm:text-base bg-white p-3 rounded">
                      <strong className="text-gray-700">Ans:</strong> {user.aptitude?.answers?.[i] ?? "—"}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
<<<<<<< HEAD
              <p className="italic text-gray-500 text-sm sm:text-base">No aptitude questions available.</p>
=======
              <div className="flex items-center gap-3 text-gray-400 italic py-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No aptitude questions cataloged for this test.
              </div>
>>>>>>> ce7fac5 (Save work before sync)
            )}
            {user.aptitude?.submittedAt && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3">
                Submitted: {formatTs(user.aptitude.submittedAt)}
              </p>
            )}
          </div>
        </section>

        {/* Recruiter Comments */}
<<<<<<< HEAD
        <section className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Recruiter Comments</h3>
          
          <div className="space-y-3 sm:space-y-4">
=======
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Professional Evaluations</h3>
          </div>

          <div className="space-y-4 mb-10">
>>>>>>> ce7fac5 (Save work before sync)
            {user.recruiterComments?.length > 0 ? (
              user.recruiterComments.map((c, i) => (
                <div
                  key={i}
                  className="border-l-4 border-red-400 bg-gray-50 p-3 sm:p-4 rounded"
                >
<<<<<<< HEAD
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{c.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatTs(c.submittedAt)}
                    </p>
=======
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-600 font-bold shadow-sm">
                        {c.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none">{c.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {formatTs(c.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${c.rating === "Excellent" ? "bg-emerald-50 text-emerald-600" :
                      c.rating === "Bad" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      }`}>
                      {c.rating}
                    </span>
>>>>>>> ce7fac5 (Save work before sync)
                  </div>
                  <p className="text-yellow-600 mt-1 text-sm sm:text-base">Rating: {c.rating}</p>
                  <p className="mt-2 text-gray-800 text-sm sm:text-base">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="italic text-gray-500 text-sm sm:text-base">No comments yet.</p>
            )}
          </div>

          {/* Add a new comment */}
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block font-medium text-sm sm:text-base mb-1">Your Name</label>
                <select
                  value={commenter}
                  onChange={(e) => setCommenter(e.target.value)}
                  disabled={submitting}
                  className="border border-gray-300 p-2 sm:p-3 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-red-200 focus:border-red-500"
                >
                  {RECRUITERS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-sm sm:text-base mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  disabled={submitting}
                  className="border border-gray-300 p-2 sm:p-3 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-red-200 focus:border-red-500"
                >
                  {RATINGS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
<<<<<<< HEAD
            
            <div>
              <label className="block font-medium text-sm sm:text-base mb-1">Comment</label>
=======

            <div className="mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Observations</label>
>>>>>>> ce7fac5 (Save work before sync)
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
                className="border border-gray-300 p-2 sm:p-3 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-red-200 focus:border-red-500"
                placeholder="Write your comment…"
              />
            </div>
<<<<<<< HEAD
            
            <div className="text-right">
              <button
                onClick={submitComment}
                disabled={submitting}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded text-white text-sm sm:text-base ${
                  submitting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                }`}
=======

            <div className="flex justify-end">
              <button
                onClick={submitComment}
                disabled={submitting}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${submitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                  }`}
>>>>>>> ce7fac5 (Save work before sync)
              >
                {submitting ? "Submitting…" : "Submit Comment"}
              </button>
            </div>
          </div>
        </section>

        {/* Delete record */}
        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={handleDelete}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-700 hover:bg-gray-700 text-white rounded flex items-center gap-2 text-sm sm:text-base"
          >
            <MdDelete className="text-base sm:text-lg" />
            <span>Delete Record</span>
          </button>
        </div>
      </main>
    </div>
  );
}