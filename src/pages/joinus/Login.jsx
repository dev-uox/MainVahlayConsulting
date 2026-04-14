import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import "../../backgroundImage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ClearableInput from "../../components/common/ClearableInput";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  const validateInputs = () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) return;

    setLoading(true);
    try {
      // 1) Auth sign-in
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // 2) Read role from jobApplications/{email} (replaces 'users' collection)
      const emailKey = (user.email || "").toLowerCase();
      // UPDATED: Now targeting the "jobApplications" collection
      const userDocRef = doc(db, "jobApplications", emailKey);
      const snap = await getDoc(userDocRef);

      // Note: If you want to block users who don't have a document here,
      // you can uncomment the snap.exists() check below.
      // if (!snap.exists()) {
      //   await signOut(auth);
      //   setError("No profile found for this email. Please contact support or sign up.");
      //   return;
      // }

      const role = String(snap.data()?.role || "user").toLowerCase();

      // 3) Route by role
      if (role === "admin") {
        alert("Welcome Admin!");
        navigate("/jobs"); // admin portal
      } else if (role === "recruiter") {
        alert("Welcome Recruiter!");
        navigate("/result"); // recruiter portal
      } else {
        alert("Login successful!");
        navigate("/MultiStepForm"); // regular user
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
      <form
        onSubmit={handleEmailLogin}
        className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md m-4"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Log In</h2>

        <ClearableInput
          id="email-login"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
          aria-label="Email"
          autoComplete="email"
        />

        <div className="relative mb-4">
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-white"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-2 pl-10 pr-3 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            aria-label="Password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 mt-4 font-semibold rounded-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <p className="text-center text-gray-300 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-white underline">
            Sign Up
          </a>
        </p>

        <p className="text-center text-gray-300 mt-4">
          <a href="/forgotpassword" className="text-white underline">
            Forget Password?{" "}
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
