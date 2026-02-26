const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

// Replace with your Gmail & App Password
const GMAIL_USER = "cloudvahlay@gmail.com";
const GMAIL_PASS = "jhko cidj adxn vtjj";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

exports.sendApplicationPDF = functions
  .runWith({ memory: "256MB" }) // optional
  .https.onRequest((req, res) => {

  cors(req, res, async () => {
    try {
      const { email, name, base64Pdf } = req.body;

      const mailOptions = {
        from: `"Vahlay Team" <${GMAIL_USER}>`,
        to: email,
        subject: "Your Job Application PDF",
        text: `Hi ${name},\n\nThank you for submitting your job application. Find your attached PDF below.`,
        attachments: [
          {
            filename: `${name.replace(/\s+/g, "_")}_Application.pdf`,
            content: base64Pdf,
            encoding: "base64",
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).send({ success: true, message: "Email sent!" });
    } catch (error) {
      console.error("Email error:", error);
      return res.status(500).send({ success: false, message: error.message });
    }
  });
});
