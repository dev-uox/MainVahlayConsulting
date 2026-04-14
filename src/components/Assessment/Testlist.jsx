// src/components/Assessment.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Section1 from "./lestening_test";
import Section2 from "./speakingtest";
import Section3 from "./sellingtest";
import Section4 from "./problemsolvingtest";
import QuickAptitude from "./aptitudetest";

const SECTIONS = [
  { Component: Section1, duration: 15 * 60 },   // 15 min
  { Component: Section2, duration: 10 * 60 },   // 10 min
  { Component: Section3, duration: 10 * 60 },   // 10 min
  { Component: Section4, duration: 10 * 60 },   // 10 min
  { Component: QuickAptitude, duration: 15 * 60 }// 15 min
];

export default function Assessment({ userId, userName, userEmail, userCity }) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(SECTIONS[0].duration);

  // Countdown timer for current section
  useEffect(() => {
    if (timeLeft <= 0) return moveNext();
    const tid = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(tid);
  }, [timeLeft]);

  // When section changes, reset its timer
  useEffect(() => {
    setTimeLeft(SECTIONS[sectionIdx].duration);
  }, [sectionIdx]);

  const moveNext = () => {
    if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(idx => idx + 1);
    } else {
      submitAll();
    }
  };

  // Collect answers from each section
  const handleSectionSubmit = (sectionKey, data) => {
    setAnswers(a => ({ ...a, [sectionKey]: data }));
    moveNext();
  };

  // Final Firestore write
  const submitAll = async () => {
    await addDoc(collection(db, "assessments"), {
      userId,
      userName,
      userEmail,
      userCity,
      answers,
      createdAt: serverTimestamp()
    });
    alert("Assessment submitted!");
  };

  const ActiveSection = SECTIONS[sectionIdx].Component;
  const sectionKey = `section${sectionIdx+1}`;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between text-gray-700">
        <span>Section {sectionIdx+1} of {SECTIONS.length}</span>
        <span>Time left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
      </div>
      <ActiveSection
        onSubmit={data => handleSectionSubmit(sectionKey, data)}
      />
    </div>
  );
}
