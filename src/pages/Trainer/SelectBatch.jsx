import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const SelectBatch = ({ onSelect }) => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "batches"));
      setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return (
    <div>
      <h2>Select Batch</h2>
      {batches.map((b) => (
        <button key={b.id} onClick={() => onSelect(b.id)}>
          {b.batchName}
        </button>
      ))}
    </div>
  );
};

export default SelectBatch;
