import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Section3SellingSkills() {
  const navigate = useNavigate();
  const TOTAL_TIME = 10 * 60;   // 10 minutes to complete
  const RECORD_TIME = 5 * 60;   // 5 minutes to record

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [recordTimeLeft, setRecordTimeLeft] = useState(RECORD_TIME);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Global countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-submit on global timeout
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) stopAndSubmit(true);
  }, [timeLeft, submitted]);

  // Auto-submit on tab switch
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && !submitted) stopAndSubmit(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [submitted]);

  // Recording countdown
  useEffect(() => {
    let recTimer;
    if (recording) {
      recTimer = setInterval(() => setRecordTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(recTimer);
  }, [recording]);

  // Auto-stop recording when RECORD_TIME expires
  useEffect(() => {
    if (recordTimeLeft <= 0 && recording) stopAndSubmit();
  }, [recordTimeLeft, recording]);

  const formatTime = (secs) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  const startRecording = async () => {
    if (recording || submitted) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = uploadRecording;
    mr.start();
    setRecording(true);
  };

  const stopAndSubmit = (isAuto = false) => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else if (isAuto && !recording) {
      uploadRecording();
    } else if (!recording) {
      alert("Please record your answer before submitting.");
    }
  };

  const uploadRecording = async () => {
    setRecording(false);
    setSubmitted(true);

    // assemble audio if present
    let audioData = null;
    if (chunksRef.current.length) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      audioData = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    try {
      const assessmentId = localStorage.getItem("assessmentId");
      if (!assessmentId) throw new Error("Missing assessmentId");

      await addDoc(
        collection(db, "assessments", assessmentId, "selling"),
        {
          audio: audioData,
          timeTaken: TOTAL_TIME - Math.max(timeLeft, 0),
          recordedAt: Timestamp.now(),
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      navigate("/problemsolvingtest");
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", padding: 20, maxWidth: 600, margin: "auto" }}
    >
      <h2 className="text-2xl font-bold mb-4">Section 3: Selling Skills (20 Marks)</h2>

      <div className="mb-4 font-mono">
        <strong>Global Time Left:</strong> {formatTime(timeLeft)}
      </div>

      <p className="mb-4">
        You are meeting with a small business owner who is interested in switching their
        internet service provider but has concerns about reliability.
      </p>
      <p className="mb-6">
        <strong>Task:</strong>
        <ul className="list-disc ml-6">
          <li>Introduce the Spectrum Business Internet Package.</li>
          <li>List three objections and your responses.</li>
          <li>Provide a closing statement to secure the sale.</li>
        </ul>
      </p>

      {/* Recording indicator */}
      {recording && (
       <div className="flex flex-col mb-4">
                    <div className="flex items-center">
                        <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse mr-2" />
                        <span className="font-semibold">Recording…</span></div>

                    <span className=" font-mono">Recording will stop in {formatTime(recordTimeLeft)}</span>
                </div>
      )}

      {!recording && !submitted && (
        <button
          onClick={startRecording}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Start Recording Answer
        </button>
      )}

      {recording && (
        <button
          onClick={() => stopAndSubmit()}
          className="mt-4 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Stop &amp; Submit
        </button>
      )}

      {submitted && (
        <p className="mt-6 text-green-700 font-medium">
          Your response has been recorded and submitted.
        </p>
      )}
    </div>
  );
}
