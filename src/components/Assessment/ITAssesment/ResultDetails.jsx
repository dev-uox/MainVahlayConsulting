// src/components/ResultDetails.jsx
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
import { db, storage } from "../../../firebaseConfig";
import Side_bar from "../../Side_bar";




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


  const [submitting, setSubmitting] = useState(false);

  // 1) Load user responses
  useEffect(() => {
    if (!userId) return;
    async function loadUser() {
      setLoading(true);
      const snap = await getDoc(doc(db, "campusDriveIt", userId));
      if (!snap.exists()) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = snap.data();
      data.recruiterComments = data.recruiterComments || [];
      setUser(data);

      // fetch audio URLs
      const secs = ["scenario1", "scenario2", "scenario3"];
      const urls = {};
      await Promise.all(
        secs.map(async (s) => {
          if (data[s]?.audioPath) {
            try {
              urls[s] = await getDownloadURL(
                storageRef(storage, data[s].audioPath)
              );
            } catch {}
          }
        })
      );
      setAudioURLs(urls);
      setLoading(false);
    }
    loadUser();
  }, [userId]);
  console.log(userId);
  // 2) Load all prompts from campusDriveQuitions
  useEffect(() => {
    async function loadQuestions() {
      const snap = await getDocs(collection(db, "campusDriveItQuitions"));
      if (snap.empty) return;
      setQuestions(snap.docs[0].data());
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
    const docRef = doc(db, "campusDriveIt", userId);
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
      await deleteDoc(doc(db, "campusDriveIt", userId));
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
          to="/itresult"
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
    <div className="flex">
      <aside className="w-1/5 p-4 bg-gray-50">
        <Side_bar />
      </aside>
      <main className="flex-1 p-6 space-y-8">
        <Link to="/itresult" className="text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>

        {/* Section 1: Listening */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-2xl font-semibold">Listening</h3>
        
          <p className="mt-2 font-medium text-gray-700 whitespace-pre-wrap">
            {questions.listening}
          </p>
            <video src="/assets/video.mp4" controls autoPlay className="w-1/2 "></video>
          <p className="mt-2 text-gray-800">
            {user.listening?.text || "No transcript."}
          </p>
          {user.listening?.submittedAt && (
            <p className="text-sm text-gray-500 mt-2">
              Submitted: {formatTs(user.listening.submittedAt)}
            </p>
          )}
        </section>

        {/* Sections 2–3-4: scenario1, scenario2, scenario3  */}
        {["scenario1", "scenario2", "scenario3"].map((sec) => {
          const prompt = questions[sec]?.que || "";
          const tasks = questions[sec]?.tasks || [];
          const audioURL = audioURLs[sec];
          const submittedAt = user[sec]?.submittedAt;
          const audioPath = user[sec]?.audioPath;

          return (
            <section key={sec} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-2xl font-semibold capitalize">
                {sec.replace(/([A-Z])/g, " $1")}
              </h3>

              {/* 1) The main prompt */}
              <p className="mt-2 font-medium text-gray-700 whitespace-pre-wrap">
                {prompt}
              </p>

              {/* 2) The list of tasks (if any) */}
              {tasks.length > 0 && (
                <ol className="list-decimal pl-6 mt-4 space-y-1 text-gray-800">
                  {tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ol>
              )}

              {/* 3) The audio player */}
              {audioURL ? (
                <audio controls src={audioURL} className="w-full mt-4" />
              ) : audioPath ? (
                <p className="italic text-gray-500 mt-4">
                  Audio file not found or failed to load.
                </p>
              ) : (
                <p className="italic text-gray-500 mt-4">No recording.</p>
              )}

              {/* 4) Submitted timestamp */}
              {submittedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Submitted: {formatTs(submittedAt)}
                </p>
              )}
            </section>
          );
        })}

        {/* Section 5: Quick Aptitude */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-2xl font-semibold">Quick Aptitude Test</h3>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            {mapToArray(questions.aptitude.que).map((q, i) => (
              <li key={i}>
                <p className="font-medium text-gray-700">{q}</p>
                <p className="ml-4 text-gray-800">
                  {user.aptitude?.answers?.[i] ?? "—"}
                </p>
              </li>
            ))}
          </ol>
          {user.aptitude?.submittedAt && (
            <p className="text-sm text-gray-500 mt-2">
              Submitted: {formatTs(user.aptitude.submittedAt)}
            </p>
          )}
        </section>

{/* Delete record */}
        <div className="pt-4 border-t">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-700 hover:bg-gray-700 text-white rounded"
          >
            <MdDelete />
          </button>
        </div>
      </main>
    </div>
  );
}
