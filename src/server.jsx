// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Configure Nodemailer with your email settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., use Gmail
  auth: {
    user: 'your-email@gmail.com', // replace with your email
    pass: 'your-email-password' // replace with your email password (consider using environment variables for security)
  }
});

// Route to handle form submissions
app.post('/send-email', (req, res) => {
  const {
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    email,
    phone,
    applyingFor,
    dob,
    firstJob,
    nightShift,
    coldCalls,
    underPressure,
    usSalesExperience
  } = req.body;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'your-email@gmail.com', // replace with the email you want to receive the form data
    subject: 'New Application Submission',
    text: `
      First Name: ${firstName}
      Last Name: ${lastName}
      Address: ${address}, ${city}, ${state} - ${zip}
      Email: ${email}
      Phone: ${phone}
      Applying For: ${applyingFor}
      DOB: ${dob}
      First Job: ${firstJob}
      Comfortable in Night Shift: ${nightShift}
      Comfortable with Cold Calls and Sales Process: ${coldCalls}
      Able to Work Under Pressure: ${underPressure}
      Experience in US Sales Market: ${usSalesExperience}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Application submitted successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
