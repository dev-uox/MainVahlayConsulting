import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Section4ProblemSolving() {
  const navigate = useNavigate();
  const TOTAL_TIME = 10 * 60;   // 10 minutes
  const RECORD_TIME = 5 * 60;   // 5 minutes to record

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [recordTimeLeft, setRecordTimeLeft] = useState(RECORD_TIME);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // global countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // auto‐submit when global time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      stopRecordingAndSubmit(true);
    }
  }, [timeLeft, submitted]);

  // auto‐submit on tab switch
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && !submitted) stopRecordingAndSubmit(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [submitted]);

  // recording countdown
  useEffect(() => {
    let recTimer;
    if (recording) {
      recTimer = setInterval(() => setRecordTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(recTimer);
  }, [recording]);

  // auto‐stop recording when RECORD_TIME expires
  useEffect(() => {
    if (recordTimeLeft <= 0 && recording) {
      stopRecordingAndSubmit();
    }
  }, [recordTimeLeft, recording]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

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

  const stopRecordingAndSubmit = (isAuto = false) => {
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

    // assemble audio if any
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
        collection(db, "assessments", assessmentId, "problemSolving"),
        {
          audio: audioData,
          timeTaken: TOTAL_TIME - Math.max(timeLeft, 0),
          recordedAt: Timestamp.now(),
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      navigate("/aptitude-test");
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", padding: 20, maxWidth: 600, margin: "auto" }}
    >
      <h2 className="text-2xl font-bold mb-4">
        Section 4: Problem-Solving Scenario (10 Marks)
      </h2>

      <div className="mb-6 font-mono">
        <strong>Global Time Left:</strong> {formatTime(timeLeft)}
      </div>

      <p className="mb-6">
        You’re dealing with an upset customer who complains that their internet service has been unreliable for weeks.
      </p>
      <p className="mb-6">
        <strong>Task:</strong>
        <ul className="list-disc ml-6">
          <li>Explain how you would retain the customer’s business.</li>
          <li>Suggest an upselling strategy addressing their concerns.</li>
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
          onClick={() => stopRecordingAndSubmit()}
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
