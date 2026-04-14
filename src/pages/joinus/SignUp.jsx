import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import zxcvbn from "zxcvbn";
import "../../backgroundImage.css";
import { useNavigate, Link } from "react-router-dom";
import ClearableInput from "../../components/common/ClearableInput";

// 1) Map Firebase error codes → friendly messages
const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use":
    "That email is already registered. Please log in or use another address.",
  "auth/invalid-email": "That doesn’t look like a valid email address.",
  "auth/operation-not-allowed":
    "Sign-ups are temporarily disabled. Please try again later.",
  "auth/weak-password":
    "Your password is too weak. Use at least 6 characters, mixing letters & numbers.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  // …add more codes here as you encounter them
};

// 2) Helper to pick your custom text or fall back
function getFriendlyErrorMessage(
  code,
  fallback = "Something went wrong. Please try again.",
) {
  return AUTH_ERROR_MESSAGES[code] || fallback;
}

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handlePasswordChange = (pwd) => {
    setPassword(pwd);
    setPasswordScore(zxcvbn(pwd).score);
  };

  const handleSignUp = async () => {
    setError("");

    //  Basic validations
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordScore < 3) {
      setError("Password is too weak. Please choose a stronger one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // UPDATED: Create user document in the "jobApplications" collection
      await setDoc(doc(db, "jobApplications", email.toLowerCase()), {
        email: email.toLowerCase(),
        role: "user", // Default role
        status: "approved", // Auto-approve new users
        createdAt: serverTimestamp(),
      });

      // include a continueUrl if you want to redirect after verify:
      await sendEmailVerification(userCredential.user, {
        url: "https://vahlayconsulting.com/login",
        handleCodeInApp: false,
      });
      alert("Sign-up successful! Please check your email to verify.");
      navigate("/login");
    } catch (err) {
      // 3) Map the SDK error code → friendly text
      const friendly = getFriendlyErrorMessage(
        err.code,
        `Sign-up failed: ${err.message}`,
      );
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
      <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md m-4">
        <h2 className="text-3xl font-bold text-white mb-6">Sign Up</h2>

        <ClearableInput
          id="email-signup"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
        />

        <div className="relative mb-4">
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-white cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="w-full py-2 pl-10 pr-3 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
          />
        </div>

        {/* Password Strength Meter */}
        <div className="flex items-center mb-4">
          <div className="flex-1 bg-gray-300 h-2 rounded">
            <div
              className={`h-full rounded ${
                passwordScore >= 3 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${(passwordScore + 1) * 20}%` }}
            ></div>
          </div>
          <span className="ml-2 text-gray-500 text-sm">
            {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordScore]}
          </span>
        </div>

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
        />

        {error && <p className="text-red-500 mb-4">*{error}*</p>}

        {/* Terms and Conditions */}
        <div className="mb-4">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
              className="form-checkbox h-4 w-4 text-red-500"
            />
            <span className="ml-2">
              I agree to the{" "}
              <Link to="/privacy" className="underline text-white">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          onClick={handleSignUp}
          className={`w-full py-2 mt-4 font-semibold rounded-full text-white transition-colors
            ${
              !acceptedTerms || loading
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-red-500 hover:bg-red-600"
            }`}
          disabled={!acceptedTerms || loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-300 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline">
            Login
          </Link>
        </p>

        <p
          className="text-center text-white mt-4 cursor-pointer underline"
          onClick={() => setShowVideoModal(true)}
        >
          Unable to sign up? Click here for help.
        </p>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 sm:w-96 relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-2 right-2 text-red-500 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-center text-xl font-semibold mb-4">
              Sign Up & Login Help
            </h3>
            <iframe
              width="100%"
              height="315"
              src="https://res.cloudinary.com/dzdnwpocf/video/upload/v1753386948/How_to_Signup_at_Vahlay_Consulting_kacqds.mp4"
              title="Sign Up and Login Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
