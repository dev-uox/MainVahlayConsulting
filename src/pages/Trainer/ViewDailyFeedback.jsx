import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const ViewDailyFeedback = ({ batchId, dayNumber }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(
        collection(db, "batches", batchId, "days", String(dayNumber), "candidates")
      );
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return (
    <div>
      <h2>Day {dayNumber} - Results</h2>
      {list.map((c, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h3>{c.name}</h3>
          <p>Attendance: {c.attendance}</p>
          <p>Behaviour: {c.behaviour}</p>
          <p>Attitude Observation: {c.attitude}</p>
          <p>Communication: {c.communication}</p>
          <p>Learning Speed: {c.learningSpeed}</p>
          <p>Call Practice Feedback: {c.callFeedback}</p>
          <p>Test Score: {c.testScore}</p>
          <p>Approval: {c.approval}</p>
        </div>
      ))}
    </div>
  );
};

export default ViewDailyFeedback;
