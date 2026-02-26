import React, { useState, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function QuickAptitudeTest() {
  const navigate = useNavigate();
  const TOTAL_TIME = 15 * 60; // 15 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [submitted, setSubmitted] = useState(false);

  // START countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // AUTO‐SUBMIT on timeout
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit(true);
    }
  }, [timeLeft, submitted]);

  // AUTO‐SUBMIT on tab switch
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

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (idx, val) => {
    setAnswers((a) => {
      const copy = [...a];
      copy[idx] = val;
      return copy;
    });
  };

  const handleSubmit = async (isAuto = false) => {
    // VALIDATE: all answers required on manual submit
    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].trim()) {
        if (!isAuto) {
          alert(`Please answer Question ${i + 1} before submitting.`);
        }
        return;
      }
    }

    setSubmitted(true);

    try {
      const assessmentId = localStorage.getItem("assessmentId");
      if (!assessmentId) throw new Error("Missing assessmentId in localStorage");

      await addDoc(
        collection(db, "assess", assessmentId, "aptitude"),
        {
          answers,
          timeTaken: TOTAL_TIME - Math.max(timeLeft, 0),
          submittedAt: Timestamp.now(),
        }
      );

      navigate("/thankyou");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ maxWidth: 700, margin: "auto", padding: 20, userSelect: "none" }}
    >
      <h2 className="text-2xl font-bold mb-4">Section 5: Quick Aptitude Test (10 Marks)</h2>
      <div className="mb-6 font-mono">Time Left: {formatTime(timeLeft)}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
      >
        {[
          `Justify a Price Increase:
A customer’s current plan costs $50 per month, and you’re offering a $70 plan with added features. How would you explain the $20 difference in value to the customer?`,
          `Discount Calculation:
A customer asks for a 10% discount on a $200 package. How much would they save, and what’s the final price?`,
          `Sales Target Calculation:
If your monthly target is 30 sales, and you’ve completed 18 sales by the 20th of the month, how many more sales do you need to close per day to meet your target?`,
          `Upselling Strategy:
A customer’s current plan includes basic internet at $40. You want to upsell them to a faster internet plan with phone service for $65. How would you highlight the benefits and close the deal?`,
          `Handling Objections:
A customer says, "I’m happy with my current service provider." What would you say to encourage them to consider your services?`,
        ].map((qText, idx) => (
          <div key={idx} className="mb-6">
            <p className="font-semibold mb-2">{idx + 1}. {qText}</p>
            <textarea
              value={answers[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              disabled={submitted}
              placeholder="Type your answer here…"
              className="w-full p-2 border rounded resize-none"
              style={{ height: 100 }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={submitted}
          className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {submitted ? "Submitted" : "Submit Test"}
        </button>
      </form>

      {submitted && (
        <p className="mt-4 text-green-700 font-medium">
          Your answers have been submitted.
        </p>
      )}
    </div>
  );
}
