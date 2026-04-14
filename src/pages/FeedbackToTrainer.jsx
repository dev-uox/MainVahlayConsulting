// src/components/TraineeFeedback.js
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ClearableInput from "../components/common/ClearableInput";

export default function TraineeFeedback() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  // FORM STATES
  const [trainerName, setTrainerName] = useState("Rajnil Varun Prasad");
  const [department, setDepartment] = useState("");
  const [feedbackDate, setFeedbackDate] = useState(today);

  const [trainerCommunication, setTrainerCommunication] = useState(1);
  const [trainerKnowledge, setTrainerKnowledge] = useState(1);
  const [clarity, setClarity] = useState(1);
  const [trainingSupport, setTrainingSupport] = useState(1);
  const [trainingMaterial, setTrainingMaterial] = useState(1);

  const [confidence, setConfidence] = useState("Confident");
  const [areasHelpNeeded, setAreasHelpNeeded] = useState("");
  const [trainerSupport, setTrainerSupport] = useState("Yes");
  const [commitment, setCommitment] = useState("Yes");
  const [comments, setComments] = useState("");

  // AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, [navigate]);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      traineeName: user.displayName,
      traineeEmail: user.email,
      trainerName,
      department,
      feedbackDate,
      trainerCommunication,
      trainerKnowledge,
      clarity,
      trainingSupport,
      trainingMaterial,
      confidence,
      areasHelpNeeded,
      trainerSupport,
      commitment,
      comments,
      status: "submitted",
      submittedAt: new Date(),
    };

    try {
      await setDoc(doc(db, "traineeFeedback", user.email), data);
      alert("Your feedback has been submitted successfully!");
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-10 bg-white rounded-xl shadow-xl border border-red-300">

      {/* HEADER */}
      <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-bold">Trainee Feedback Form</h2>
        <p className="text-sm opacity-90 mt-1">Your feedback helps us improve the training quality.</p>
      </div>

      {/* USER INFO */}
      <div className="flex md:flex-row flex-col justify-between bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
        <span className="font-semibold text-red-700">
          Name: {user?.displayName}
        </span>
        <span className="font-semibold text-red-700">
          Email: {user?.email}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Trainer Name */}
        <InputBox
          label="Trainer Name"
          value={trainerName}
          disabled
          onChange={(e) => setTrainerName(e.target.value)}
        />

        {/* Department */}
        <InputBox
          label="Department / Process"
          value={department}
          required
          onChange={(e) => setDepartment(e.target.value)}
        />

        {/* Rating Section Title */}
        <h3 className="text-xl font-semibold text-red-700 border-l-4 border-red-600 pl-3 mt-4">
          Training Quality (Rate 1–5)
        </h3>

        <RateInput label="Trainer's Communication" value={trainerCommunication} setValue={setTrainerCommunication} />
        <RateInput label="Trainer's Knowledge of Process" value={trainerKnowledge} setValue={setTrainerKnowledge} />
        <RateInput label="Clarity of Explanation" value={clarity} setValue={setClarity} />
        <RateInput label="Training Environment & Support" value={trainingSupport} setValue={setTrainingSupport} />
        <RateInput label="Training Material Quality" value={trainingMaterial} setValue={setTrainingMaterial} />

        {/* Confidence */}
        <SelectBox
          label="Your Understanding / Confidence"
          value={confidence}
          options={["Not confident", "Somewhat confident", "Confident", "Very confident"]}
          onChange={setConfidence}
        />

        {/* Help Needed */}
        <TextArea
          label="Areas You Need More Help In"
          value={areasHelpNeeded}
          onChange={setAreasHelpNeeded}
        />

        {/* Supportive Trainer */}
        <SelectBox
          label="Was Trainer Supportive?"
          value={trainerSupport}
          options={["Yes", "No", "Sometimes"]}
          onChange={setTrainerSupport}
        />

        {/* Commitment */}
        <SelectBox
          label="Are you confident to perform independently?"
          value={commitment}
          options={["Yes", "No", "Need more time"]}
          onChange={setCommitment}
        />

        {/* Comments */}
        <TextArea
          label="Additional Comments (Your overall training experience)"
          value={comments}
          rows={3}
          onChange={setComments}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 shadow-lg transition"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function InputBox({ label, value, onChange, disabled, required }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <ClearableInput
        id={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type="text"
        value={value}
        required={required}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all shadow-sm"
      />
    </div>
  );
}

function SelectBox({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all shadow-sm"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 2 }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all shadow-sm"
      />
    </div>
  );
}

function RateInput({ label, value, setValue }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        min="1"
        max="5"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all shadow-sm"
      />
    </div>
  );
}
