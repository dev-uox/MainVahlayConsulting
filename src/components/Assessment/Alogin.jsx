import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";

export default function CampusDrive() {
  const navigate = useNavigate();
  const db = getFirestore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);    // ← new

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkEmailExistence = async () => {
    const q = query(
      collection(db, "campusDrive"),
      where("email", "==", formData.email)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);    // ← start loading

    if (await checkEmailExistence()) {
      alert("This email is already registered.");
      setIsSubmitting(false);
      return;
    }

    await addDoc(collection(db, "campusDrive"), {
      ...formData,
      registeredAt: new Date(),
    });

    const encodedEmail = encodeURIComponent(formData.email);
    navigate(`/assessmentt&c?email=${encodedEmail}`, { state: { formData } });
  };

  return (
    <div className="relative max-w-md mx-auto my-28 p-6 border border-red-300 rounded shadow">
      {/* Overlay while submitting */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center rounded">
          <p className="text-white text-lg">Loging...</p>
        </div>
      )}

      <h1 className="text-2xl text-red-600 font-bold mb-4">
        Campus Drive Registration
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 opacity-90">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            disabled={isSubmitting}
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            disabled={isSubmitting}
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="number"
            required
            disabled={isSubmitting}
            value={formData.number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">Your Current City</label>
          <input
            type="text"
            name="city"
            required
            disabled={isSubmitting}
            value={formData.city}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white ${
            isSubmitting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSubmitting ? "Loging…" : "Login"}
        </button>
      </form>
    </div>
  );
}
