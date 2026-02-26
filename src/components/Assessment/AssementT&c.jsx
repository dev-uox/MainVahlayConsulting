import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TermsAndConditionsPage() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const email = params.get("email");

  useEffect(() => {
    if (!email) {
    
      navigate("/campusdrive");
    }
  }, [email, navigate]);

  const handleAccept = () => {
    if (accepted) {
      const encodedEmail = encodeURIComponent(email);
      navigate(`/assessment?email=${encodedEmail}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-red-600 text-center">Terms &amp; Conditions</h2>

        <div className="mb-6 space-y-4 overflow-y-auto max-h-80 pr-4">
          <section>
            <h3 className="font-semibold">1. Purpose of the Assessment</h3>
            <p>
              The assessment is conducted solely for the purpose of evaluating your skills and suitability
              for the sales position at our company. Your participation in the test does not guarantee
              employment or any formal association with the company.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">2. Confidentiality</h3>
            <p>
              All questions, scenarios, and materials provided during this assessment are proprietary
              and confidential. Candidates are not allowed to share, reproduce, or distribute any part
              of the assessment without prior written consent from the company.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">3. Honesty and Integrity</h3>
            <p>
              Candidates must complete the assessment independently without external assistance or use of
              unauthorized resources. Any evidence of malpractice or dishonest behavior may result in
              disqualification from the recruitment process.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">4. Time Management</h3>
            <p>
              The assessment must be completed within the allotted time. No extensions will be granted
              unless explicitly approved by the interviewer for legitimate reasons.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">5. Communication Skills Assessment</h3>
            <p>
              The test may include sections that require voice recordings or live speaking tasks. By
              participating in the test, you consent to these recordings being used for evaluation
              purposes only.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">6. Data Usage and Privacy</h3>
            <p>
              Personal data collected during the assessment will be used strictly for recruitment
              purposes. It will be stored securely and will not be shared with third parties without
              your explicit consent, except as required by law.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">7. Company Discretion</h3>
            <p>
              The company reserves the right to update, modify, or cancel the assessment process at its
              discretion. The decision to proceed with or reject a candidate after the assessment is
              final and at the sole discretion of the company.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">8. Acceptance of Terms</h3>
            <p>
              By proceeding with the assessment, you acknowledge and agree to these Terms &amp;
              Conditions in full. If you do not agree, you may choose not to participate in the test.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">9. Acknowledgment</h3>
            <p>
              <em>
                "I acknowledge that I have read, understood, and agree to the Terms &amp;
                Conditions of the Sales Interview Assessment."
              </em>
            </p>
          </section>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="accept"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
            className="mr-2 h-4 w-4 text-red-600"
          />
          <label htmlFor="accept" className="text-gray-700">
            I have read and agree to the Terms &amp; Conditions.
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!accepted}
          className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {accepted ? "Start Assessment" : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}
