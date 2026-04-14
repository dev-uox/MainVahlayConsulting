import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { db } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const ManageJoiningDates = () => {
  const collectionRef = collection(db, "dateList");

  const [dateTime, setDateTime] = useState({ date: "", time: "" });
  const [dateList, setDateList] = useState([]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDateTime((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDate = async () => {
    const { date, time } = dateTime;

    if (!date) {
      alert("Please select a date.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time || "00:00"}`);
    const now = new Date();

    if (!time) {
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);

      const todayOnly = new Date();
      todayOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly < todayOnly) {
        alert("You cannot add a past date.");
        return;
      }
    } else {
      if (selectedDateTime < now) {
        alert("You cannot add a past date and time.");
        return;
      }
    }

    // Duplicate check
    const q = query(
      collectionRef,
      where("date", "==", date),
      where("time", "==", time || "")
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("This date and time already exists.");
      return;
    }

    const docRef = await addDoc(collectionRef, {
      date,
      time: time || "",
    });

    setDateList((prev) => [...prev, { id: docRef.id, date, time: time || "" }]);
    setDateTime({ date: "", time: "" });
  };

  useEffect(() => {
    const fetchDates = async () => {
      const snapshot = await getDocs(collectionRef);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const validDates = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const docDate = new Date(`${data.date}T${data.time || "00:00"}`);

        if (docDate >= today) {
          validDates.push({
            id: docSnap.id,
            date: data.date,
            time: data.time || "",
          });
        }
      });

      validDates.sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || "00:00"}`) -
          new Date(`${b.date}T${b.time || "00:00"}`)
      );

      setDateList(validDates);
    };

    fetchDates();
  }, []);

  const handleremoveDate = async (idToRemove) => {
    await deleteDoc(doc(db, "dateList", idToRemove));
    setDateList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  return (
  <div className="min-h-screen bg-gray-100 ">
      
      <main className="flex-1">
        
        <div className=" md:w-full w-[21rem]  px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
          Manage Joining Dates
        </h1>

        {/* Add Date Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add Joining Date & Time
          </label>

          <div className="flex flex-col gap-3">
            <input
              type="date"
              name="date"
              value={dateTime.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            />

            <input
              type="time"
              name="time"
              value={dateTime.time}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            />

            {/* 🔥 FULL WIDTH BUTTON */}
            <button
              type="button"
              onClick={handleAddDate}
              className="bg-blue-600 text-white w-full py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Date List */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow space-y-3">
          {dateList.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-3">
              No upcoming dates found.
            </p>
          ) : (
            dateList.map(({ id, date, time }) => (
              <div
                key={id}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <span className="text-gray-700 text-sm">
                  {date} {time && `- ${time}`}
                </span>

                <FaTrash
                  className="text-red-500 cursor-pointer hover:text-red-600"
                  onClick={() => handleremoveDate(id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default ManageJoiningDates;
