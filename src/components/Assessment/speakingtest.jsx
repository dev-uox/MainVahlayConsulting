import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Section2SpeakingSkills() {
    const navigate = useNavigate();
    const TOTAL_TIME = 10 * 60;   // 10 minutes for the section
    const RECORD_TIME = 5 * 60;   // 5 minutes to record

    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [recLeft, setRecLeft] = useState(RECORD_TIME);
    const [scriptAnswer, setScriptAnswer] = useState("");
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
        const onVisChange = () => {
            if (document.hidden && !submitted) stopAndSubmit(true);
        };
        document.addEventListener("visibilitychange", onVisChange);
        return () => document.removeEventListener("visibilitychange", onVisChange);
    }, [submitted]);

    // Recording countdown
    useEffect(() => {
        let recTimer;
        if (recording) {
            recTimer = setInterval(() => setRecLeft((t) => t - 1), 1000);
        }
        return () => clearInterval(recTimer);
    }, [recording]);

    // Auto-stop recording when record time expires
    useEffect(() => {
        if (recLeft <= 0 && recording) stopAndSubmit();
    }, [recLeft, recording]);

    const formatTime = (secs) =>
        `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

    const startRecording = async () => {
        if (recording || submitted) return;
        // require the script to be present before recording

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
            alert("Please record your pitch before submitting.");
        }
    };

    const uploadRecording = async () => {
        setRecording(false);
        setSubmitted(true);

        // bundle audio if any
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
                collection(db, "assessments", assessmentId, "speaking"),
                {
                    scriptAnswer,
                    audio: audioData,
                    timeTaken: TOTAL_TIME - Math.max(timeLeft, 0),
                    recordedAt: Timestamp.now(),
                }
            );
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            navigate("/sellingtest");
        }
    };

    return (
        <div
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: "none", maxWidth: 700, margin: "auto", padding: 20 }}
        >
            <h2 className="text-2xl font-bold mb-4">Section 2: Speaking Skills (15 Marks)</h2>

            <div className="mb-4 font-mono">
                <strong>Section Time Left:</strong> {formatTime(timeLeft)}
            </div>

            <div className="mb-6 p-4 border rounded max-h-60 overflow-y-auto" style={{ backgroundColor: "#f9fafb" }}>
                <h3 className="font-semibold mb-2">Introduction to Spectrum Business Internet and Phone Services</h3>
                {/* ... intro content ... */}
            </div>

            <p className="mb-4">
                Imagine you are making a cold call to a potential customer. Your task is to introduce yourself and pitch Spectrum Business internet and phone services in under 2 minutes.
            </p>
            <p className="mb-6">
                <strong>Scenario:</strong> The customer is busy and hesitant but wants better service.
            </p>



            {/* Recording indicator */}
            {recording && (
                <div className="flex flex-col mb-4">
                    <div className="flex items-center">
                        <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse mr-2" />
                        <span className="font-semibold">Recording…</span></div>

                    <span className=" font-mono">Recording will stop in {formatTime(recLeft)}</span>
                </div>
            )}

            {!recording && !submitted && (
                <button
                    onClick={startRecording}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Start Recording Answer
                </button>
            )}

            {recording && (
                <button
                    onClick={() => stopAndSubmit()}
                    className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
