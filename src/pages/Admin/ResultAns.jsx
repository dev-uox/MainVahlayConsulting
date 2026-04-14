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
  "Rajniel Prasad (Trainer)",
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-poppins text-gray-900">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Assessment Report
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed review of candidate performance and skill evaluation
            </p>
          </div>
          <Link
            to="/result"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Review List
          </Link>
        </div>

        {/* User Info Card */}
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
          </div>

          {/* User details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-gray-900 font-bold break-all">{user.email}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-gray-900 font-bold">{user.number}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">City / Location</p>
              <p className="text-gray-900 font-bold">{user.city}</p>
            </div>
          </div>
        </div>

        {/* Section 0: Personal Questions */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Personal Background</h3>
          </div>
          <div className="space-y-6">
            {mapToArray(questions?.personalQuitions || []).map((q, i) => (
              <div key={i} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Q: {q}</p>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 leading-relaxed shadow-inner">
                  {user.personalBackground?.[i] || <span className="text-gray-400 italic">Not Answered</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Listening */}
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
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Transcript Prompt:</p>
            <p className="text-gray-700 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
              {questions?.listening || "No listening prompt available."}
            </p>
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Candidate Response:</p>
              <p className="text-gray-900 leading-relaxed">
                {user.listening?.text || <span className="text-gray-400 italic">No transcript provided.</span>}
              </p>
            </div>
            {user.listening?.submittedAt && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                Timestamp: {formatTs(user.listening.submittedAt)}
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
            <section key={sec} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {sec.replace(/([A-Z])/g, " $1")} Assessment
                </h3>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Context & Instructions:</p>
                  <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {prompt}
                  </p>
                </div>

                {tasks.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Specific Tasks:</p>
                    <ul className="space-y-2">
                      {tasks.map((task, i) => (
                        <li key={i} className="flex gap-3 text-gray-800 leading-relaxed">
                          <span className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">{i+1}</span>
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
              </div>
            </section>
          );
        })}

        {/* Section 5: Quick Aptitude */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Logical Reasoning & Aptitude</h3>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
            {questions?.aptitude && questions.aptitude.length > 0 ? (
              <div className="space-y-6">
                {questions.aptitude.map((q, i) => (
                  <div key={i} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <p className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Q: {q}</p>
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mr-2">Candidate Output:</span>
                      <span className="text-gray-900 font-bold">{user.aptitude?.answers?.[i] || <span className="text-gray-400 font-normal italic">No answer</span>}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 italic py-4">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No aptitude questions cataloged for this test.
              </div>
            )}
            {user.aptitude?.submittedAt && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-8">
                Assessment Complete: {formatTs(user.aptitude.submittedAt)}
              </p>
            )}
          </div>
        </section>

        {/* Recruiter Comments */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Professional Evaluations</h3>
          </div>
          
          <div className="space-y-4 mb-10">
            {user.recruiterComments?.length > 0 ? (
              user.recruiterComments.map((c, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-200 p-6 rounded-2xl relative overflow-hidden"
                >
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
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      c.rating === "Excellent" ? "bg-emerald-50 text-emerald-600" : 
                      c.rating === "Bad" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {c.rating}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{c.text}"</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-gray-100 border-dashed">
                No evaluation comments documented yet.
              </div>
            )}
          </div>

          {/* Add a new comment */}
          <div className="bg-gray-50/50 border border-gray-200 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Add Assessment Feedback</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Evaluator Name</label>
                <select
                  value={commenter}
                  onChange={(e) => setCommenter(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-white border border-gray-200 p-3 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none shadow-sm"
                >
                  {RECRUITERS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Performance Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-white border border-gray-200 p-3 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none shadow-sm"
                >
                  {RATINGS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Observations</label>
              <textarea
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
                className="w-full bg-white border border-gray-200 p-4 rounded-xl text-gray-900 leading-relaxed focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none shadow-sm"
                placeholder="Document your professional opinion on the candidate's performance..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={submitComment}
                disabled={submitting}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                  submitting 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                }`}
              >
                {submitting ? "Processing..." : "Submit Assessment"}
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