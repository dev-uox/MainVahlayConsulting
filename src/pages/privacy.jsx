import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6">
      <div className="container mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Terms and Conditions
        </h1>

        <p className="text-gray-700 mb-4">
          Welcome to Vahlay Consulting. Please read these Terms and Conditions
          carefully before using our services. By accessing or using our
          website or services, you agree to be bound by these terms. If you do
          not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-700 mb-4">
          By using our website or services, you confirm that you accept these
          Terms and Conditions and agree to comply with them. If you do not
          agree, you must not use our services.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          2. Use of Services
        </h2>
        <p className="text-gray-700 mb-4">
          Our services are provided for informational and professional purposes
          only. You agree to use our services only for lawful purposes and in
          accordance with these terms.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          3. Privacy Policy
        </h2>
        <p className="text-gray-700 mb-4">
          Please refer to our Privacy Policy for information about how we
          collect, use, and disclose your personal data.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          4. Intellectual Property
        </h2>
        <p className="text-gray-700 mb-4">
          All content, including but not limited to text, graphics, logos, and
          software, is the property of Vahlay Consulting and is protected by
          copyright and other intellectual property laws. You may not use,
          reproduce, or distribute our content without our prior written
          consent.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          5. Limitation of Liability
        </h2>
        <p className="text-gray-700 mb-4">
          Vahlay Consulting will not be liable for any damages arising out of or
          related to your use of our services. This includes, but is not limited
          to, direct, indirect, incidental, punitive, and consequential damages.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          6. Changes to Terms
        </h2>
        <p className="text-gray-700 mb-4">
          We reserve the right to update these Terms and Conditions at any time.
          Any changes will be posted on this page, and your continued use of our
          services constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          7. Contact Us
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about these Terms and Conditions, please
          contact us at:
        </p>
        <p className="text-gray-700">
          Email:{" "}
          <a
            href="mailto:info@vahlayconsulting.com"
            className="text-red-500 underline"
          >
            info@vahlayconsulting.com
          </a>
        </p>
        <p className="text-gray-700">Phone: +91 79492 17538</p>

        <p className="text-gray-700 mt-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className=" bg-red-500 text-white text-center  rounded-full p-1"> 
        <Link to="/signup">
        back to Sign Up</Link>
      </div>
      </div>
      
    </div>
  );
};

export default TermsAndConditions;
