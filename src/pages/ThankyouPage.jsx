// src/components/ThankYouPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-green-600 mb-4">Thank You!</h1>
        <p className="text-gray-700 mb-6">
          Your assessment has been submitted successfully. We appreciate your time and effort.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
