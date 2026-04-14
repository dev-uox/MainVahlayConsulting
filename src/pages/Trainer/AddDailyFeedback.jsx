import React, { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const AddDailyFeedback = ({ batchId, dayNumber }) => {
  const [candidates, setCandidates] = useState([
    { name: "", attendance: "", behaviour: "", attitude: "", communication: "", learningSpeed: "", callFeedback: "", testScore: "", approval: "NA" }
  ]);

  const addCandidate = () => {
    setCandidates([...candidates, {
      name: "", attendance: "", behaviour: "", attitude: "", communication: "",
      learningSpeed: "", callFeedback: "", testScore: "", approval: "NA"
    }]);
  };

  const handleInput = (index, field, value) => {
    const data = [...candidates];
    data[index][field] = value;
    setCandidates(data);
  };

  const saveFeedback = async () => {
    for (const c of candidates) {
      await addDoc(
        collection(db, "batches", batchId, "days", String(dayNumber), "candidates"),
        c
      );
    }
    alert("Daily Feedback Saved!");
  };

  return (
    <div>
      <h2>Day {dayNumber} – Candidate Feedback</h2>

      {candidates.map((c, i) => (
        <div key={i} style={{ border: "1px solid black", padding: 10, margin: 10 }}>
          <h3>Candidate {i + 1}</h3>
          <input placeholder="Name" onChange={(e) => handleInput(i, "name", e.target.value)} />

          <select onChange={(e) => handleInput(i, "attendance", e.target.value)}>
            <option>Present</option>
            <option>Absent</option>
            <option>Sick (Informed)</option>
          </select>

          <input placeholder="Behaviour" onChange={(e) => handleInput(i, "behaviour", e.target.value)} />
          <input placeholder="Attitude Observation" onChange={(e) => handleInput(i, "attitude", e.target.value)} />
          <input placeholder="Communication" onChange={(e) => handleInput(i, "communication", e.target.value)} />
          <input placeholder="Learning Speed" onChange={(e) => handleInput(i, "learningSpeed", e.target.value)} />
          <input placeholder="Call Practice Feedback" onChange={(e) => handleInput(i, "callFeedback", e.target.value)} />
          <input placeholder="Test Score (e.g. Q1-6/20)" onChange={(e) => handleInput(i, "testScore", e.target.value)} />

          <select onChange={(e) => handleInput(i, "approval", e.target.value)}>
            <option>NA</option>
            <option>Approve</option>
            <option>Disapprove</option>
          </select>
        </div>
      ))}

      <button onClick={addCandidate}>+ Add Another Candidate</button>
      <button onClick={saveFeedback}>Save</button>
    </div>
  );
};

export default AddDailyFeedback;
