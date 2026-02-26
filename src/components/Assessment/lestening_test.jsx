import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function VideoAssessmentTest() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const MAX_PLAYS = 2;
  const TOTAL_TIME = 15 * 60; // seconds

  const [playCount, setPlayCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // auto‐submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit(true);
    }
  }, [timeLeft, submitted]);

  // auto‐submit on tab switch
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && !submitted) {
        handleSubmit(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [submitted]);

  const handlePlay = () => {
    if (playCount < MAX_PLAYS && videoRef.current) {
      videoRef.current.play();
      setPlayCount((c) => c + 1);
    }
  };

  // core submit function
  const handleSubmit = async (isAuto = false) => {
    // require an answer on manual submit
    if (!isAuto && !answer.trim()) {
      alert("Please type your answer before submitting.");
      return;
    }

    setSubmitted(true);
    try {
      const assessmentId = localStorage.getItem("assessmentId");
      if (!assessmentId) throw new Error("No assessmentId in localStorage");

      await addDoc(
        collection(db, "assess", assessmentId, "listening"),
        {
          answer,
          playCount,
          timeTaken: TOTAL_TIME - Math.max(timeLeft, 0),
          submittedAt: Timestamp.now(),
        }
      );

      // go back to the test list
      navigate("/speakingtest");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleManualSubmit = () => handleSubmit(false);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", padding: 20, maxWidth: 600, margin: "auto" }}
    >
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dzdnwpocf/video/upload/v1753386958/Listening_test_nu4kpn.mp4"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        style={{ width: "100%", background: "#000" }}
      />

      <button
        onClick={handlePlay}
        disabled={playCount >= MAX_PLAYS || submitted}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor:
            playCount < MAX_PLAYS && !submitted ? "pointer" : "not-allowed",
          opacity: playCount >= MAX_PLAYS || submitted ? 0.5 : 1,
        }}
      >
        {playCount < MAX_PLAYS
          ? `Play Video (${playCount + 1}/${MAX_PLAYS})`
          : "No Plays Left"}
      </button>

      <div style={{ marginTop: 8, fontFamily: "monospace" }}>
        Time Left: {formatTime(timeLeft)}
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        disabled={submitted}
        placeholder="Type your answer here…"
        style={{
          width: "100%",
          height: 120,
          marginTop: 12,
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          resize: "none",
          backgroundColor: submitted ? "#f3f4f6" : "#fff",
        }}
      />

      <button
        onClick={handleManualSubmit}
        disabled={submitted}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          backgroundColor: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: !submitted ? "pointer" : "not-allowed",
          opacity: submitted ? 0.5 : 1,
        }}
      >
        {submitted ? "Submitted" : "Submit Test"}
      </button>

      {submitted && (
        <p style={{ marginTop: 12, color: "#1e3a8a" }}>
          Your test has been submitted.
        </p>
      )}
    </div>
  );
}
