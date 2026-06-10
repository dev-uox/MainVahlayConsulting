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

  const mapToArray = (m) =>
    m && typeof m === "object" ? Object.values(m) : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-800">User Details</h1>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        <Link to="/result" className="text-red-600 hover:underline text-sm sm:text-base inline-block">
          ← Back to Dashboard
        </Link>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
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

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
              <p className="mt-1 text-sm sm:text-base break-all font-medium">{user.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
              <p className="mt-1 text-sm sm:text-base font-medium">{user.number}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</p>
              <p className="mt-1 text-sm sm:text-base font-medium">{user.city}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Religion</p>
              <p className="mt-1 text-sm sm:text-base font-medium">{user.religion || "—"}</p>
            </div>
          </div>
        </div>

        {/* Section 0: Personal Questions */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Personal Background</h3>
          </div>
          <div className="space-y-6">
            {mapToArray(questions?.personalQuitions || []).map((q, i) => (
              <div key={i} className="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                <p className="font-bold text-gray-700 text-sm mb-3">Q: {q}</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-gray-800 text-sm leading-relaxed italic">
                    "{user.personalBackground?.[i] || "Not Answered"}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Listening */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Listening Assessment</h3>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video controls className="w-full h-full">
                <source src="/assets/Listening%20test.mp4" type="video/mp4" />
                Your browser does not support video.
              </video>
            </div>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prompt Content:</p>
            <p className="font-medium text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
              {questions?.listening || "No listening prompt available."}
            </p>
            <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">User Transcription:</p>
              <p className="text-gray-800 text-sm leading-loose">
                {user.listening?.text || <span className="text-gray-400 italic">No summary provided.</span>}
              </p>
            </div>
            {user.listening?.submittedAt && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                Submitted: {formatTs(user.listening.submittedAt)}
              </p>
            )}
          </div>
        </section>

        {/* Sections 2–4: Speaking, Selling, Problem Solving */}
        {["speaking", "selling", "problemSolving"].map((sec) => {
          const prompt = questions?.[sec]?.que || questions?.[sec] || "No prompt available.";
          const tasks = questions?.[sec]?.tasks ? Object.values(questions[sec]?.tasks) : [];
          const hasAudio = Boolean(audioURLs[sec]);
          const submittedAt = user?.[sec]?.submittedAt;

          return (
            <section key={sec} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {sec.replace(/([A-Z])/g, " $1")} Assessment
                </h3>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Main Prompt:</p>
                <p className="font-bold text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mb-6">
                  {prompt}
                </p>

                {tasks.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Specific Tasks:</p>
                    <ul className="space-y-2">
                      {tasks.map((task, i) => (
                        <li key={i} className="flex gap-3 text-gray-800 text-sm leading-relaxed">
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
                    <audio controls src={audioURLs[sec]} className="w-full accent-red-600" />
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <p className="text-gray-400 text-sm italic">
                        {user?.[sec]?.audioPath ? "Processing audio..." : "No recording available."}
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

        {/* Section 5: Aptitude */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Aptitude Results</h3>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            {questions?.aptitude && questions.aptitude.length > 0 ? (
              <div className="space-y-6">
                {questions.aptitude.map((q, i) => (
                  <div key={i} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <p className="font-bold text-gray-700 text-sm mb-3">Question {i + 1}: {q}</p>
                    <p className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                      <span className="font-bold text-red-600 mr-2">Answer:</span>
                      {user.aptitude?.answers?.[i] ?? <span className="text-gray-400 italic">No answer</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No aptitude cataloged.</p>
            )}
            {user.aptitude?.submittedAt && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                Completed: {formatTs(user.aptitude.submittedAt)}
              </p>
            )}
          </div>
        </section>

        {/* Recruiter Comments */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">Evaluations</h3>
          </div>

          <div className="space-y-4 mb-10">
            {user.recruiterComments?.length > 0 ? (
              user.recruiterComments.map((c, i) => (
                <div key={i} className="border border-gray-100 bg-gray-50 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {c.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {formatTs(c.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.rating === "Excellent" ? "bg-emerald-100 text-emerald-700" :
                      c.rating === "Bad" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {c.rating}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="italic text-gray-500 text-sm">No evaluations recorded yet.</p>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Add Evaluation</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={commenter}
                onChange={(e) => setCommenter(e.target.value)}
                disabled={submitting}
                className="bg-white border border-gray-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-200 outline-none"
              >
                {RECRUITERS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                disabled={submitting}
                className="bg-white border border-gray-200 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-200 outline-none"
              >
                {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              className="bg-white border border-gray-200 p-4 rounded-xl w-full text-sm focus:ring-2 focus:ring-red-200 outline-none"
              placeholder="Deep dive observations..."
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={submitComment}
                disabled={submitting || !commentText.trim()}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  submitting || !commentText.trim() ? "bg-gray-200 text-gray-400" : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                }`}
              >
                {submitting ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}