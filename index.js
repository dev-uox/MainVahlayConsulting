// index.js
import express from "express";
import axios from "axios";
import cors from "cors";







const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for cross-origin requests (adjust this if needed for security)
app.use(cors());

// Replace this with your actual reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = "6LdZRIAqAAAAAND6MtUdAHSDWJtjgpDxXdyC_YEq";

// POST endpoint to verify reCAPTCHA token
app.post("/verify-recaptcha", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: "Token is required" });
  }

  try {
    // Send POST request to Google's reCAPTCHA verification API
    const response = await axios.post(
      `https://www.google.com/recaptcha/enterprise.js?render=6LdZRIAqAAAAAND6MtUdAHSDWJtjgpDxXdyC_YEq`,
      {
        token: token,
        action: "LOGIN",
      }
    );

    // Check if the reCAPTCHA verification was successful
    if (response.data.tokenProperties.valid) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid reCAPTCHA token" });
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error.message);
    res.status(500).json({ success: false, error: "reCAPTCHA verification failed" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
