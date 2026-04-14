import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig"; // Ensure this path is correct
import ClearableInput from "../../components/common/ClearableInput";
 
const Forgetpassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
 
  // Handle email input change
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
 
    try {
      if (!email) {
        setError("Please enter a valid email address.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
    } catch (err) {
      // Display a readable error message
      const errorMessage = err.message.includes("auth/user-not-found")
        ? "No user found with this email address."
        : "Error: " + err.message;
      setError(errorMessage);
    }
  };
 
  return (
    <div>
      <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Reset Password</h2>
 
          {/* Input for Email */}
          <ClearableInput
            id="forgot-password-email"
            type="email"
            placeholder="Enter Your Registered Email"
            value={email}
            onChange={handleChange}
            className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            aria-label="Email"
          />
 
          {/* Display error message if any */}
          {error && (
            <p className="text-white bg-red-500 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}
 
          {/* Display success message if any */}
          {message && (
            <p className="text-white bg-green-500 p-2 rounded mb-4 text-sm">
              {message}
            </p>
          )}
 
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-700 transition duration-300"
          >
            Reset Password
          </button>
 
          {/* Link to go back to login page */}
          <p className="text-center text-gray-300 mt-4">
           
            <a href="/login" className="text-white underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default Forgetpassword;
 