import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc 
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Assessment() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const email = search.get("email");

  const [userDocId, setUserDocId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [section, setSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Correct keys that match Firestore fields
  const SECTION_KEYS = [
    "personalBackground",
    "listening",
    "speaking",
    "selling",
    "problemSolving",
    "aptitude",
  ];

  // Disable copy, paste, cut, right-click
  useEffect(() => {
    const block = (e) => e.preventDefault();
    ["copy", "paste", "cut", "contextmenu"].forEach((evt) =>
      document.addEventListener(evt, block)
    );
    return () => {
      ["copy", "paste", "cut", "contextmenu"].forEach((evt) =>
        document.removeEventListener(evt, block)
      );
    };
  }, []);

  // 1️⃣ Fetch userDocId + profile
  useEffect(() => {
    (async () => {
      if (!email) {
        navigate("/register");
        return;
      }
      const campusRef = collection(db, "campusDrive");
      const q = query(campusRef, where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("No registered user found for " + email);
        navigate("/register");
        return;
      }
      const docId = snap.docs[0].id;
      setUserDocId(docId);
      const profileSnap = await getDoc(doc(db, "campusDrive", docId));
      if (profileSnap.exists()) {
        setUserData(profileSnap.data());
      }
    })();
  }, [email, navigate]);

  // 2️⃣ Determine next section by reading root document
  useEffect(() => {
    if (!userDocId) return;
    (async () => {
      const refDoc = doc(db, "campusDrive", userDocId);
      const snap = await getDoc(refDoc);
      const data = snap.data() || {};

      // If recruiter has locked this test, we just show locked screen
      if (data.isLocked) {
        setSection(-1); // special "locked" section
        return;
      }

      // Find first missing section (based on field existence)
      for (let i = 0; i < SECTION_KEYS.length; i++) {
        if (!data[SECTION_KEYS[i]]) {
          setSection(i + 1); // 1-based section index
          return;
        }
      }
      // All sections present -> go to results/thank you screen
      setSection(SECTION_KEYS.length + 1);
    })();
  }, [userDocId]);

  // ⏳ Global submitting overlay
  if (submitting)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <p className="text-white text-xl">Submitting…</p>
      </div>
    );

  if (section === null) return <p className="text-center mt-12">Loading…</p>;

  // 🔒 If recruiter locked the test, show lock message
  if (section === -1 || userData?.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Assessment Locked
          </h1>
          <p className="text-gray-700 mb-4">
            Your assessment is now locked and cannot be attempted again.
          </p>
          <p className="text-gray-600 mb-6">
            If you believe this is a mistake, please contact the HR / Recruitment
            team of Vahlay Consulting.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const next = () => setSection((s) => s + 1);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 text-gray-900">
      {/* — User Profile */}
      {userData && (
        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h2 className="text-xl font-medium">Welcome, {userData.name}</h2>
          <p className="text-sm text-gray-600">{userData.email}</p>
        </div>
      )}

      {/* Section 1: Personal Background */}
      {section === 1 && (
        <SectionPersonalBackground
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
        />
      )}

      {/* Section 2: Listening */}
      {section === 2 && (
        <Section1
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
        />
      )}

      {/* Section 3: Speaking */}
      {section === 3 && (
        <VoiceSection
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
          title="Speaking"
        >
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow-md">
            {/* Introduction Document */}
            <h1 className="text-4xl font-bold text-center mb-4">
              Introduction to Spectrum Business Internet & Phone Services
            </h1>

            <h2 className="text-2xl font-semibold mt-6">Purpose</h2>
            <p>
              This overview outlines the key features, benefits, and value
              proposition of Spectrum Business Internet and Phone services for
              small and midsize enterprises. It is designed to help business
              owners, IT managers, and procurement teams evaluate how a unified
              connectivity and voice solution can streamline operations, reduce
              costs, and scale with growth.
            </p>

            <h2 className="text-xl font-semibold mt-6">1. Background</h2>
            <p>
              In today’s digital-first environment, seamless Internet
              connectivity and flexible voice communications are critical to
              daily operations. Spectrum Business (a division of Charter
              Communications) delivers high-performance Internet alongside a
              full suite of VoIP features— without data caps, hidden fees, or
              long-term contracts.
            </p>

            <h2 className="text-xl font-semibold mt-6">2. Service Overview</h2>
            <h3 className="text-xl font-semibold mt-4">
              Internet Tiers & Performance
            </h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Premier:</strong> Up to 500 Mbps
              </li>
              <li>
                <strong>Ultra:</strong> Up to 750 Mbps
              </li>
              <li>
                <strong>Gig:</strong> Up to 1 Gbps (select markets up to 2 Gbps)
              </li>
              <li>
                <strong>Unlimited Data:</strong> No usage caps; consistent
                speeds
              </li>
              <li>
                <strong>Advanced Wi-Fi:</strong> Security Shield, guest
                networks, and optional wireless backup
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">
              Phone (VoIP) Features
            </h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Unlimited Calling:</strong> Local & long-distance in the
                U.S. and Canada
              </li>
              <li>
                <strong>Premium Call Controls:</strong> Hold, transfer,
                auto-attendant, on-hold music, voicemail-to-email, call
                forwarding, and 35+ more
              </li>
              <li>
                <strong>Scalable Platform:</strong> Digital delivery reduces
                hardware and maintenance costs
              </li>
              <li>
                <strong>Unified Communications:</strong> Seamless integration
                with Spectrum Business Connect for messaging and video
                conferencing
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">3. Key Benefits</h2>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Simplified Billing:</strong> One invoice for Internet
                and voice
              </li>
              <li>
                <strong>Cost Efficiency:</strong> Bundle discounts and VoIP
                savings; no surprise fees
              </li>
              <li>
                <strong>Reliability & Support:</strong> 24/7 U.S.-based
                technical assistance and robust SLAs
              </li>
              <li>
                <strong>Scalability:</strong> Add users or upgrade speeds
                without contract penalties
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">
              4. Reliability & Support
            </h2>
            <p>
              Spectrum Business commits to industry-leading uptime and rapid
              resolution times. Premium SLA packages are available for customers
              with mission-critical requirements.
            </p>

            {/* Speaking Skills Section */}
            <div className="border-l-4 border-yellow-400 pl-4 py-4 mt-8">
              <p className="mt-2 text-gray-700 font-medium">
                <strong>Question:</strong> Imagine you’re cold-calling a busy,
                hesitant prospect. In under 2 minutes, pitch Spectrum Business
                Internet & Phone services to demonstrate how you’d engage them
                and address their needs.
              </p>
              <p className="mt-2 text-gray-600 italic">
                (You may refer to the introduction document for service
                highlights. Aim for clarity, confidence, and a strong value
                proposition.)
              </p>
            </div>
          </div>
        </VoiceSection>
      )}

      {/* Section 4: Selling */}
      {section === 4 && (
        <VoiceSection
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
          title="Selling"
        >
          <div className="border-l-4 pl-4">
            <p className="font-medium">
              <strong>Question:</strong> You are meeting with a small business
              owner who is interested in switching their internet service
              provider but has concerns about reliability.
            </p>
            <ol className="list-decimal list-inside mt-4">
              <strong>Task:</strong>
              <li>
                How would you introduce the Spectrum Business Internet Package?
              </li>
              <li>
                Explain three objections the customer might raise and your
                responses to handle them.
              </li>
              <li>Conclude with a closing statement to secure the sale.</li>
            </ol>
          </div>
        </VoiceSection>
      )}

      {/* Section 5: Problem Solving */}
      {section === 5 && (
        <VoiceSection
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
          title="ProblemSolving"
        >
          <div className="border-l-4 pl-4">
            <p className="font-medium">
              <strong>Question:</strong> You’re dealing with an upset customer
              who complains that their internet service has been unreliable for
              weeks.
            </p>
            <ol className="list-decimal list-inside mt-4">
              <strong>Task:</strong>
              <li>
                Explain how you would handle this situation to retain the
                customer’s business.
              </li>
              <li>
                Suggest an upselling strategy to offer them a better package
                while addressing their concerns.
              </li>
            </ol>
          </div>
        </VoiceSection>
      )}

      {/* Section 6: Aptitude */}
      {section === 6 && (
        <Section5
          userDocId={userDocId}
          onNext={next}
          setSubmitting={setSubmitting}
        />
      )}

      {/* Section 7: Final Thank You */}
      {section === 7 && <Results userDocId={userDocId} />}
    </div>
  );
}



// ── VoiceSection: Speaking / Selling / Problem-Solving ──────────────────────
function VoiceSection({ userDocId, onNext, setSubmitting, title, children }) {
  const SECTION_DURATION = 10 * 60;
  const RECORD_DURATION = 5 * 60;
  const key = title.charAt(0).toLowerCase() + title.slice(1);

  const [sectionTime, setSectionTime] = useState(SECTION_DURATION);
  const [recordTime, setRecordTime] = useState(RECORD_DURATION);

  const [recording, setRecording] = useState(false);
  const [already, setAlready] = useState(false);
  const [autoFired, setAutoFired] = useState(false);

  const [micChecked, setMicChecked] = useState(false);
  const [micAllowed, setMicAllowed] = useState(null);
  const [micError, setMicError] = useState("");

  const [audioLevel, setAudioLevel] = useState(0);
  const [audioStatus, setAudioStatus] = useState("Listening...");

  // 🔥 LIVE TRANSCRIPT
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const micRef = useRef(null);
  const chunks = useRef([]);
  const sectionTimerRef = useRef();
  const recordTimerRef = useRef();
  const audioStreamRef = useRef(null);
  const analyserRef = useRef(null);

  // ------------------------------------
  // ALREADY SUBMITTED CHECK
  // ------------------------------------
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "campusDrive", userDocId));
      const data = snap.data() || {};
      if (data[key]) setAlready(true);
    })();
  }, [key, userDocId]);

  // ------------------------------------
  // SECTION TIMER
  // ------------------------------------
  useEffect(() => {
    sectionTimerRef.current = setInterval(() => {
      setSectionTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(sectionTimerRef.current);
  }, []);

  // ------------------------------------
  // RECORD TIMER
  // ------------------------------------
  useEffect(() => {
    if (!recording) return;
    recordTimerRef.current = setInterval(() => {
      setRecordTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(recordTimerRef.current);
  }, [recording]);

  // ------------------------------------
  // AUTO STOP + UPLOAD
  // ------------------------------------
  useEffect(() => {
    if ((sectionTime <= 0 || recordTime <= 0) && !autoFired) {
      if (recording) stopRecording();
      else {
        uploadRecording();
        setAutoFired(true);
      }
    }
  }, [sectionTime, recordTime, recording, autoFired]);

  // ------------------------------------
  // INIT MICROPHONE
  // ------------------------------------
  const initMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicAllowed(true);
      startAudioAnalyser(stream);
    } catch (err) {
      setMicAllowed(false);
      setMicError("Microphone blocked. Enable mic permissions.");
    }
    setMicChecked(true);
  };

  useEffect(() => {
    initMic();
    initSpeechRecognition();
    return () => {
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  // ------------------------------------
  // LIVE SPEECH RECOGNITION
  // ------------------------------------
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscript(text.trim());
    };

    recognition.onerror = (e) => {
      console.warn("SpeechRecognition error:", e);
    };

    recognitionRef.current = recognition;
  };

  // ------------------------------------
  // AUDIO ANALYSER BAR
  // ------------------------------------
  const startAudioAnalyser = (stream) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setAudioLevel(Math.min(100, (avg / 255) * 100));
      requestAnimationFrame(update);
    };
    update();
  };

  // ------------------------------------
  // START RECORDING
  // ------------------------------------
  const startRecording = async () => {
    if (!micAllowed) return alert("Microphone required.");
    if (already || recording) return;

    setRecordTime(RECORD_DURATION);
    setAudioStatus("Recording...");
    setTranscript("");

    // Start speech recognition
    recognitionRef.current?.start();

    const stream =
      audioStreamRef.current ||
      (await navigator.mediaDevices.getUserMedia({ audio: true }));

    const recorder = new MediaRecorder(stream);
    micRef.current = recorder;
    chunks.current = [];

    recorder.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    recorder.onstop = uploadRecording;

    recorder.start();
    setRecording(true);
  };

  // ------------------------------------
  // STOP RECORDING
  // ------------------------------------
  const stopRecording = () => {
    recognitionRef.current?.stop();

    if (micRef.current?.state === "recording") micRef.current.stop();
    setRecording(false);
    setAudioStatus("Processing...");
  };

  // ------------------------------------
  // UPLOAD AUDIO + TRANSCRIPT
  // ------------------------------------
  const uploadRecording = async () => {
    if (already) {
      onNext();
      return;
    }

    setSubmitting(true);
    const blob = new Blob(chunks.current, { type: "audio/webm" });

    const path = `campusDrive/${userDocId}/${key}.webm`;
    const refObj = storageRef(storage, path);

    await uploadBytes(refObj, blob);

    await updateDoc(doc(db, "campusDrive", userDocId), {
      [key]: {
        audioPath: path,
        transcript: transcript,
        submittedAt: serverTimestamp(),
      },
    });

    setSubmitting(false);
    onNext();
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // ------------------------------------
  // BLOCK RE-ATTEMPT
  // ------------------------------------
  if (already) {
    return (
      <div className="p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-semibold capitalize">{title}</h2>
        <p className="mt-4">You already submitted this section.</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          onClick={onNext}
        >
          Continue
        </button>
      </div>
    );
  }

  // ------------------------------------
  // MAIN UI
  // ------------------------------------
  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-red-600 text-3xl text-center">{title} Skill</h1>

      <div className="flex justify-between font-mono">
        <span>{title} Time Left:</span>
        <span>{fmt(sectionTime)}</span>
      </div>

      {children}

      {/* ---------------- LIVE TRANSCRIPT ---------------- */}
      <div className="border p-3 rounded bg-gray-50">
        <h3 className="font-semibold">Live Transcript</h3>
        <p className="mt-2 text-gray-700 min-h-[80px] whitespace-pre-wrap">
          {transcript || "Speak something..."}
        </p>
      </div>

      {/* MICROPHONE STATUS AND BAR */}
      <div className="p-3 border rounded bg-gray-50">
        <h3 className="font-semibold">Microphone</h3>

        {!micChecked && <p>Checking microphone...</p>}
        {micAllowed === true && <p className="text-green-600">✅ Mic Detected</p>}
        {micAllowed === false && (
          <p className="text-red-600">{micError}</p>
        )}

        <div className="h-4 w-full bg-gray-300 rounded mt-2">
          <div
            className="h-full bg-green-500"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>

      {recording && (
        <div className="flex justify-between font-mono mt-2">
          <span>Recording Time Left:</span>
          <span>{fmt(recordTime)}</span>
        </div>
      )}

      {recording ? (
        <button
          className="w-full px-4 py-2 bg-red-600 text-white rounded"
          onClick={stopRecording}
        >
          Stop & Submit
        </button>
      ) : (
        <button
          className={`w-full px-4 py-2 rounded text-white ${
            micAllowed ? "bg-red-600" : "bg-gray-400"
          }`}
          onClick={micAllowed ? startRecording : null}
        >
          Start Recording
        </button>
      )}
    </div>
  );
}


// ── Section5: Quick aptitude ────────────────────────────────────────────────
function Section5({ userDocId, onNext, setSubmitting }) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [submitted, setSubmitted] = useState(false);

  // Check if aptitude already submitted to block retest
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "campusDrive", userDocId));
      const data = snap.data() || {};
      if (data.aptitude) {
        setSubmitted(true);
        setAnswers(data.aptitude.answers || Array(5).fill(""));
      }
    })();
  }, [userDocId]);

  useEffect(() => {
    if (submitted) return;
    const iv = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
  }, [submitted]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) submit(true);
  }, [timeLeft, submitted]);

  const prompts = [
    "Justify a Price Increase: A customer’s current plan costs $50 per month, and you’re offering a $70 plan with added features. How would you explain the $20 difference in value to the customer?",
    "Discount Calculation: A customer asks for a 10% discount on a $200 package. How much would they save, and what’s the final price?",
    "If your monthly target is 30 sales, and you’ve completed 18 sales by the 20th of the month, how many more sales do you need to close per day to meet your target?",
    "Upselling Strategy: A customer’s current plan includes basic internet at $40. You want to upsell them to a faster internet plan with phone service for $65. How would you highlight the benefits and close the deal?",
    `A customer says, "I’m happy with my current service provider." What would you say to encourage them to consider your services?`,
  ];

  const onChange = (i, v) =>
    setAnswers((a) => {
      const c = [...a];
      c[i] = v;
      return c;
    });

  async function submit(auto = false) {
    if (submitted) {
      onNext();
      return;
    }

    if (!auto) {
      for (let i = 0; i < 5; i++) {
        if (!answers[i].trim()) {
          alert(`Please answer Q${i + 1}.`);
          return;
        }
      }
    }
    setSubmitted(true);
    setSubmitting(true);
    await updateDoc(doc(db, "campusDrive", userDocId), {
      aptitude: {
        answers,
        submittedAt: serverTimestamp(),
      },
    });
    setSubmitting(false);
    onNext();
  }

  const fmt = (secs) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(
      secs % 60
    ).padStart(2, "0")}`;

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-red-600 text-5xl text-center ">
        Aptitude test Skill
      </h1>
      <div className="text-right font-mono">
        Aptitude (15:00): {fmt(timeLeft)}
      </div>

      {prompts.map((q, i) => (
        <div key={i}>
          <p className="font-medium">
            {i + 1}. {q}
          </p>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            disabled={submitted}
            value={answers[i]}
            onChange={(e) => onChange(i, e.target.value)}
          />
        </div>
      ))}
      {!submitted ? (
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded"
          onClick={() => submit(false)}
        >
          Submit & Finish
        </button>
      ) : (
        <button
          onClick={() => onNext()}
          className="px-6 py-2 bg-gray-500 text-white rounded"
        >
          Continue
        </button>
      )}
    </div>
  );
}

// ── Final Results Screen ───────────────────────────────────────────────────
function Results() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-extrabold text-green-600 mb-4">
          Thank You!
        </h1>
        <p className="text-gray-700 mb-6">
          Your assessment has been submitted successfully. We appreciate your
          effort.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

// ── Personal Background Section ────────────────────────────────────────────
function SectionPersonalBackground({ userDocId, onNext, setSubmitting }) {
  const [answers, setAnswers] = useState({});
  const [already, setAlready] = useState(false);

  const QUESTIONS = [
  // Personal info
  "Can you please tell me about yourself?",
  "What is your full name?",

  // Family
  "Please let me know about your Family Background. Who manages the expenses?",

  // Logistics / relocation
  "How much time would it take for you to relocate to Ahmedabad if you get selected?",
  "How will you manage living in Ahmedabad?",

  // Career / current job
  "What’s your current salary package, and what are your expectations?",
  "Do you have any part time job, freelancing, or studies during the day time apart from this job?",

  // Education
  "What is the highest education you’ve completed, and in which year?",

  // Career background
  "Briefly describe your total work experience.",
  "What was your last job? What were your responsibilities?",
  "Why did you leave your previous job?",
  "Are you looking for a long-term career opportunity or a short-term job?",
  "How many months or years are you planning to stay and grow in the corporate world?",
  "What does job stability mean to you?",

  // Skills
  "What skills have you learned from your past experience that will help you in this role?",
  "What are your strongest qualities that make you a good fit for a corporate environment?",
  "How comfortable are you with communication, computer usage, and learning new tools or software?",
  "What areas do you feel you need to improve, and how are you working on them?",
  "How do you handle pressure, targets, or difficult situations?",
  "Describe a situation where you took responsibility to complete a task successfully.",
  "Are you open to training and learning new things continuously?",
  "What new skills do you want to learn in the next 6–12 months?",

  // Motivation
  "Why do you want this job?",
  "What motivates you the most—money, growth, stability, or learning?",

  // Work ethics / company policies
  "Are you ready to follow company policies, attendance requirements, and performance expectations?",

  // Availability
  "Are you available for full-time work with fixed office timings?",
  "Do you have any commitments that may affect your attendance or performance?",
  "Are you comfortable working in our company for at least 1–2 years?",

  // Goals
  "What are your short-term goals (next 1 year)?",
  "What are your long-term goals (next 5 years)?",
  "How does this job fit into your career plan?",

  // Final fit
  "Why should we select you over other candidates?",
  "What makes you confident that you will stay committed and grow with us?",
  "Is there anything else you want us to know about your dedication or expectations?",
  "(Optional) Please share one personal challenge you overcame and what you learned from it.",

  // Probation / company rules
  "3 months’ probation period, so initially you would get the digital copy of offer letter and after 3 months you will get the papers.",
  "We do not approve leaves during probation period except in emergencies.",
  "We only follow US holidays and we do not follow Indian holidays.",
  "We follow attire rules for Formals & ID cards."
];

  
async function saveQuestionsToFirestore() {
  try {
    await setDoc(doc(db, "campusDriveQuitions", "quitions"), {
      personalQuitions: QUESTIONS
    });
    console.log("Questions saved successfully!");
  } catch (error) {
    console.error("Error saving questions:", error);
  }
}

useEffect(() => { 
  saveQuestionsToFirestore();
}, []);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "campusDrive", userDocId));
      const data = snap.data() || {};
      if (data.personalBackground) {
        setAlready(true);
      }
    })();
  }, [userDocId]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    setAnswers((prev) => ({
      ...prev,
      [index]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all questions
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (!answers[i] || !answers[i].trim()) {
      alert(`Please answer question ${i + 1}: "${QUESTIONS[i]}"`);
      return;
    }
  }

  const answersArray = QUESTIONS.map((_, i) => answers[i]);

  setSubmitting(true);
  try {
    await updateDoc(doc(db, "campusDrive", userDocId), {
      personalBackground: answersArray,
      personalBackgroundSubmittedAt: serverTimestamp()
    });

    alert("Personal Background Section Submitted.");
    onNext();
  } catch (error) {
    console.error(error);
    alert("Error submitting section.");
  } finally {
    setSubmitting(false);
  }
};


  if (already) {
    return (
      <div className="p-6 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Personal Background</h2>
        <p className="mt-4">You have already submitted this section.</p>
        <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded" onClick={onNext}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Personal Background</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {QUESTIONS.map((question, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-slate-700">
              {index + 1}. {question}
            </label>
            {question.toLowerCase().includes("education") || question.toLowerCase().includes("salary") ? (
              <input
                type="text"
                className="w-full p-2 border rounded mt-2"
                value={answers[index] || ""}
                onChange={(e) => handleChange(e, index)}
              />
            ) : (
              <textarea
                className="w-full p-2 border rounded mt-2"
                rows={3}
                value={answers[index] || ""}
                onChange={(e) => handleChange(e, index)}
              />
            )}
          </div>
        ))}
        <div className="mt-4 text-right">
          <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded">
            Submit & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Section 1: Listening
// ─────────────────────────────────────────────────────────────────────────────
function Section1({ userDocId, onNext, setSubmitting }) {
  const VIDEO_URL =
    "https://res.cloudinary.com/dzdnwpocf/video/upload/v1753386958/Listening_test_nu4kpn.mp4";
  const TEST_DURATION = 15 * 60; // seconds

  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [playing, setPlaying] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [started, setStarted] = useState(false); // new

  const timerRef = useRef(null);
  const playerRef = useRef(null);

  // only run timer when started
  useEffect(() => {
    if (!started) return;
    setPlaying(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  // auto-submit on timeout
  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      setPlaying(false);
      submit(true);
    }
  }, [timeLeft]);

  const handleEnded = () => {
    setHasEnded(true);
    setPlaying(false);
  };

  const handleReplay = () => {
    if (replayCount < 1 && playerRef.current) {
      playerRef.current.seekTo(0, "seconds");
      setPlaying(true);
      setReplayCount((c) => c + 1);
    }
  };

  async function submit(auto = false) {
    if (!auto && !text.trim()) {
      alert("Please transcribe before submitting.");
      return;
    }
    setSubmitting(true);
    await updateDoc(doc(db, "campusDrive", userDocId), {
      listening: { text, submittedAt: serverTimestamp() },
    });
    setSubmitting(false);
    setPlaying(false);
    onNext();
  }

  const fmt = (secs) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(
      secs % 60
    ).padStart(2, "0")}`;

  // NEW: Only show Start button until user clicks it
  if (!started) {
    return (
      <div className="p-6 bg-white rounded shadow text-center">
        <h1 className="text-red-600 text-center text-3xl">Listening Skill</h1>

        <div className="text-right font-mono">
          Test Timing ({fmt(TEST_DURATION)}): {fmt(timeLeft)}
        </div>

        <p className="text-center text-lg font-semibold mb-4">
          <strong>Question:</strong> Please watch the video (you may view it up
          to two times) and then, in your own words, provide a concise summary
          of its content
        </p>

        <p>
          When you’re ready, click Start to play the video and begin the timer.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-6 py-2 my-4 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-red-600 text-center text-3xl">Listening Skill</h1>

      <div className="text-right font-mono">
        Test Timing ({fmt(TEST_DURATION)}): {fmt(timeLeft)}
      </div>

      <div className="border-l-4 pl-4 ">
        <p className="text-center text-lg font-semibold mb-4">
          <strong>Question:</strong> Please watch the video (you may view it up
          to two times) and then, in your own words, provide a concise summary
          of its content
        </p>
      </div>
      <div>
        <ReactPlayer
          ref={playerRef}
          url={VIDEO_URL}
          playing={playing}
          controls={false}
          width="100%"
          onEnded={handleEnded}
        />

        {hasEnded && (
          <button
            onClick={handleReplay}
            disabled={replayCount >= 1}
            className={`mt-2 px-4 py-2 rounded ${
              replayCount >= 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {replayCount === 0 ? "Play Again (one-time)" : "Replay Used"}
          </button>
        )}
      </div>

      <textarea
        className="w-full h-32 p-2 border rounded"
        placeholder="Type what you hear…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={() => {
          clearInterval(timerRef.current);
          submit(false);
        }}
      >
        Submit & Continue
      </button>
    </div>
  );
}