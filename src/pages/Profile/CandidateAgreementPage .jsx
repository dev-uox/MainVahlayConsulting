import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const TRAINING_DAYS = 15;

const CandidateAgreementPage = () => {
  const { appId } = useParams();
  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState(null);
  const [candidateSignature, setCandidateSignature] = useState("");
  const [candidateSignatureImage, setCandidateSignatureImage] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "agreements", appId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert("Agreement not found.");
          return;
        }
        const data = snap.data();
        setAgreement(data);

        const f = data.fields || {};
        setCandidateSignature(f.candidateSignature || "");
        setHasAgreed(Boolean(data.candidateHasSigned));

        if (data.candidateSignatureImage) {
          setCandidateSignatureImage(data.candidateSignatureImage);
        }
      } catch (e) {
        console.error(e);
        alert("Error loading agreement.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appId]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCandidateSignatureImage(reader.result); // base64
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidateSignature || !candidateSignatureImage || !hasAgreed) {
      alert("Please type your name, upload signature image and tick I agree.");
      return;
    }

    try {
      setSaving(true);

      // Upload the PDF after signing
      const pdfUrl = await uploadPdf();

      // Save the signature and PDF URL in Firestore
      const ref = doc(db, "agreements", appId);
      await updateDoc(ref, {
        "fields.candidateSignature": candidateSignature,
        candidateSignatureImage: candidateSignatureImage,
        candidateHasSigned: true,
        candidateSignedAt: new Date(),
        pdfUrl: pdfUrl, // Store the PDF URL
      });

      alert("Agreement signed successfully.");
      navigate("/profile");
    } catch (e) {
      console.error(e);
      alert("Error saving signature.");
    } finally {
      setSaving(false);
    }
  };

  // Function to upload the generated PDF to Firebase Storage
  const uploadPdf = async () => {
    const f = agreement.fields || {};
    const managerSignatureImage = agreement.managerSignatureImage || null;

    const content = [
      // Company name + main heading
      {
        text: f.companyName || "Vahlay Consulting",
        style: "body",
        alignment: "center",
        margin: [0, 0, 0, -10],
      },
      {
        text: "EMPLOYMENT AGREEMENT",
        style: "title",
        alignment: "center",
        margin: [0, 10, 0, 20],
      },
      // The rest of the content will remain the same...
       

      // Dear line + intro
      {
        text: `Dear ${f.candidateFullName || "[Candidate Name]"},`,
        style: "bodyBold",
        margin: [0, 0, 0, 8],
      },
      {
        text: `Thank you for investing your time and effort in completing the interview process with us. We are pleased to inform you that we wish to move forward with your hiring under the following terms and conditions:`,
        style: "body",
        margin: [0, 0, 0, 12],
      },

      // 1. Position Details (compensation + security deposit explained here only)
      {
        text: "1. Position Details",
        style: "sectionHeader",
      },
      {
        style: "body",
        margin: [0, 0, 0, 12],
        ul: [
          `Position: ${f.jobTitle || "[Job Title]"}`,
          `Joining Date: ${f.joiningDate || "[Joining Date]"}`,
          `Compensation: ₹${f.baseSalary || "[Base Salary]"} + ₹${
            f.securityDepositAmount || "[Security Deposit Amount]"
          } (Security Deposit Amount)`,
          `Note: An additional ₹${
            f.securityDepositAmount || "[Security Deposit Amount]"
          } will be considered a security deposit, retained during the probation/training period and adjusted or refunded as per company policy upon successful completion of the initial term.`,
        ],
      },

      // 2. Training Period (15 days fixed)
      {
        text: "2. Training Period",
        style: "sectionHeader",
      },
      {
        text: `Duration: ${TRAINING_DAYS} days. The training period is designed to evaluate your understanding of our products/services and your competency in real work scenarios.`,
        style: "body",
        margin: [0, 0, 0, 6],
      },
      {
        text: `Day 1 will include product knowledge training followed by mock sessions and live call observation.`,
        style: "body",
        margin: [0, 0, 0, 6],
      },
      {
        text: `Continuation of your employment after the training period will depend on your satisfactory performance during this time.`,
        style: "body",
        margin: [0, 0, 0, 12],
      },
        {
        text: "Note: During the initial 8-day training period, either the trainer or the candidate may decide whether the candidate will continue or discontinue based on performance, interest, and suitability for the role. These 8 days will remain unpaid unless the candidate successfully completes the full 8-day training and receives confirmation of completion from the trainer/management. Once confirmed, the 8 training days will be paid in full.",
        style: "body",
        margin: [0, 0, 0, 12],
      },

      // 3. Performance Targets & Salary Structure (separate installations + sales)
      {
        text: "3. Performance Targets & Salary Structure",
        style: "sectionHeader",
      },
      {
        text: `To qualify for the full package of ₹${
          f.fullPackage || "[Full Package]"
        } per month, you are expected to achieve a minimum of ${monthlyInstallations} installations or ${monthlySales} sales per month.`,
        style: "body",
        margin: [0, 0, 0, 8],
      },

      // First month
      {
        text: "First Month:",
        style: "bodyBold",
        margin: [0, 0, 0, 4],
      },
      {
        ul: [
          `You will receive ₹${f.baseSalary || "[Base Salary]"} + ₹${
            f.securityDepositAmount || "[Security Deposit Amount]"
          } (including the security deposit), provided you achieve at least ${initialInstallations} installations or ${initialSales} sales.`,
          `If you are unable to meet this target, your package will be revised to the fresher salary bracket based on your performance.`,
        ],
        style: "body",
        margin: [0, 0, 0, 8],
      },

      // Second month onward
      {
        text: "From the Second Month Onward:",
        style: "bodyBold",
        margin: [0, 0, 0, 4],
      },
      {
        ul: [
          `Consistent achievement of ${regularInstallations} installations or ${regularSales} sales per month will confirm the ₹${
            f.fullPackage || "[Full Package]"
          } salary package.`,
          `If you are unable to meet this target, your package will be revised accordingly, based on your performance and company policy.`,
        ],
        style: "body",
        margin: [0, 0, 0, 12],
      },

      // 4. Declaration
      {
        text: "4. Declaration by the Candidate",
        style: "sectionHeader",
      },
      {
        text: `I, ${
          f.candidateFullName || "[Candidate Full Name]"
        }, hereby confirm that I have carefully read, understood, and agreed to the above-mentioned terms and conditions of employment. I accept this offer and confirm that all information shared by me during the recruitment process is true and correct to the best of my knowledge.`,
        style: "body",
        margin: [0, 0, 0, 8],
      },
      {
        text: `I understand that any false information or violation of company policies may lead to disciplinary action, including termination of my employment. I also acknowledge that I am aware of the performance expectations and company policies as discussed during the interview process.`,
        style: "body",
        margin: [0, 0, 0, 16],
      },

      // Signature block
      {
        columns: [
          {
            width: "50%",
            stack: [
              candidateSignatureImage && {
                image: candidateSignatureImage,
                width: 100,
                margin: [0, 0, 0, 4],
              },
              {
                text:
                  candidateSignature ||
                  f.candidateSignature ||
                  f.candidateFullName ||
                  " ",
                style: "body",
                margin: [0, 12, 0, 0],
              },
              {
                text: "Employee Name & Signature",
                style: "smallLabel",
              },
              {
                text: `Date: ${f.agreementDate || "________"}`,
                style: "smallLabel",
                margin: [0, 4, 0, 0],
              },
            ],
          },
          {
            width: "50%",
            stack: [
              managerSignatureImage && {
                image: managerSignatureImage,
                width: 100,
                alignment: "right",
                margin: [0, 0, 0, 4],
              },
              {
                text: f.managerName
                  ? `Mr. ${f.managerName}`
                  : "Authorized Signatory",
                style: "body",
                alignment: "right",
                margin: [0, 4, 0, 0],
              },
              {
                text: "Manager",
                style: "smallLabel",
                alignment: "right",
              },
              {
                text: f.companyName || "Vahlay Consulting",
                style: "smallLabel",
                alignment: "right",
              },
              {
                text: `Date: ${f.agreementDate || "________"}`,
                style: "smallLabel",
                alignment: "right",
                margin: [0, 4, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },

      // Hardcoded note
      {
        text: "Note from HR/Management: Welcome to aboard.",
        style: "body",
        margin: [0, 20, 0, 0],
      },
    ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 50, 40, 60],

      background: function (currentPage, pageSize) {
        return {
          canvas: [
            {
              type: "rect",
              x: 20,
              y: 20,
              w: pageSize.width - 40,
              h: pageSize.height - 40,
              r: 0,
              lineWidth: 1,
            },
          ],
        };
      },

      content,
      styles: {
        title: {
          fontSize: 16,
          bold: true,
        },
        body: {
          fontSize: 11,
          lineHeight: 1.35,
        },
        bodyBold: {
          fontSize: 11,
          bold: true,
          lineHeight: 1.35,
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 8, 0, 4],
        },
        smallLabel: {
          fontSize: 9,
          italics: true,
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    // Convert PDF to Blob
    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBlob(async (blob) => {
        try {
          // Upload PDF Blob to Firebase Storage
          const storagePath = `agreements/${appId}/signed_agreement.pdf`;
          const fileRef = storageRef(storage, storagePath);
          await uploadBytes(fileRef, blob);
          const downloadUrl = await getDownloadURL(fileRef);
          resolve(downloadUrl); // Return the download URL of the uploaded PDF
        } catch (error) {
          reject("Error uploading PDF: " + error.message);
        }
      });
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!agreement) return <div>No agreement found.</div>;

  const f = agreement.fields || {};
  const managerSignatureImage = agreement.managerSignatureImage || null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Employment Agreement</h1>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="px-4 py-2 rounded-full text-xs font-medium text-white bg-slate-800 hover:bg-slate-900"
        >
          Download PDF
        </button>
      </div>

      {/* AGREEMENT BODY */}
      <div className="border rounded-xl p-6 bg-white mb-6 text-sm leading-relaxed shadow-sm">
        {/* Agreement content */}
        <div className="text-center mb-4">
          <div className="text-xs font-semibold tracking-wide text-slate-600">
            {f.companyName || "Vahlay Consulting"}
          </div>
          <div className="mt-1 text-lg font-bold tracking-wide">
            EMPLOYMENT AGREEMENT
          </div>
        </div>
        <h1 className="text-xs font-bold mb-1">
            Dear {f.candidateFullName || "[Candidate Name]"},
          </h1>
          <p className="text-xs text-slate-600 mb-3">
            Thank you for taking the time to complete the interview process with
            us. We are pleased to inform you that we would like to move forward
            with your hiring under the following terms and conditions:
          </p>

          {/* 1. Position Details */}
          <h2 className="text-xs font-bold underline mb-1">
            1. Position Details
          </h2>
          <ul className="list-disc pl-4 text-xs text-slate-600 mb-3 space-y-1">
            <li>
              Position:{" "}
              <span className="font-semibold">
                {f.jobTitle || "[Job Title]"}
              </span>
            </li>
            <li>
              Joining Date:{" "}
              <span className="font-semibold">
                {f.joiningDate || "[Joining Date]"}
              </span>
            </li>
            <li>
              Compensation:{" "}
              <span className="font-semibold">
                ₹{f.baseSalary || "[Base Salary]"} + ₹
                {f.securityDepositAmount || "[Security Deposit Amount]"}
              </span>{" "}
              (Security Deposit Amount)
            </li>
            <li>
              Note: An additional{" "}
              <span className="font-semibold">
                ₹{f.securityDepositAmount || "[Security Deposit Amount]"}
              </span>{" "}
              will be considered a security deposit, retained during the
              probation/training period and adjusted or refunded as per company
              policy upon successful completion of the initial term.
            </li>
          </ul>

          {/* 2. Training Period (15 days fixed) */}
          <h2 className="text-xs font-bold underline mb-1">
            2. Training Period
          </h2>
          <p className="text-xs text-slate-600 mb-2">
            Duration:{" "}
            <span className="font-semibold">{TRAINING_DAYS}</span> days. The
            training period is designed to evaluate your understanding of our
            products/services and your competency in real work scenarios.
          </p>
          <p className="text-xs text-slate-600 mb-2">
            Day 1 will include product knowledge training followed by mock
            sessions and live call observation.
          </p>
          <p className="text-xs text-slate-600 mb-3">
            Continuation of your employment after the training period will
            depend on your satisfactory performance during this time.
          </p>

          {/* 3. Performance Targets & Salary Structure */}
          <h2 className="text-xs font-bold underline mb-1">
            3. Performance Targets &amp; Salary Structure
          </h2>
          <p className="text-xs text-slate-600 mb-2">
            To qualify for the full package of{" "}
            <span className="font-semibold">
              ₹{f.fullPackage || "[Full Package]"}
            </span>{" "}
            per month, you are expected to achieve a minimum of{" "}
            <span className="font-semibold">{monthlyInstallations}</span>{" "}
            installations and{" "}
            <span className="font-semibold">{monthlySales}</span> sales per
            month.
          </p>

          <p className="text-xs font-semibold mb-1">First Month:</p>
          <ul className="list-disc pl-4 text-xs text-slate-600 mb-2 space-y-1">
            <li>
              You will receive{" "}
              <span className="font-semibold">
                ₹{f.baseSalary || "[Base Salary]"} + ₹
                {f.performanceIncentive || "[Performance Incentive]"}
              </span>{" "}
              (including the security deposit), provided you achieve at least{" "}
              <span className="font-semibold">{initialInstallations}</span>{" "}
              installations and{" "}
              <span className="font-semibold">{initialSales}</span> sales.
            </li>
            <li>
              If you are unable to meet this target, your package will be
              revised to the fresher salary bracket based on your performance.
            </li>
          </ul>

          <p className="text-xs font-semibold mb-1">
            From the Second Month Onward:
          </p>
          <ul className="list-disc pl-4 text-xs text-slate-600 mb-3 space-y-1">
            <li>
              Consistent achievement of{" "}
              <span className="font-semibold">{regularInstallations}</span>{" "}
              installations and{" "}
              <span className="font-semibold">{regularSales}</span> sales per
              month will confirm the{" "}
              <span className="font-semibold">
                ₹{f.fullPackage || "[Full Package]"}
              </span>{" "}
              salary package.
            </li>
            <li>
              If you are unable to meet this target, your package will be
              revised accordingly, based on your performance and company policy.
            </li>
          </ul>

          {/* 4. Declaration */}
          <h2 className="text-xs font-bold underline mb-1">
            4. Declaration by the Candidate
          </h2>
          <p className="text-xs text-slate-600 mb-2">
            I,{" "}
            <span className="font-semibold">
              {f.candidateFullName || "[Candidate Full Name]"}
            </span>
            , hereby confirm that I have carefully read, understood, and agreed
            to the above-mentioned terms and conditions of employment. I accept
            this offer and confirm that all information shared by me during the
            recruitment process is true and correct to the best of my knowledge.
          </p>
          <p className="text-xs text-slate-600 mb-6">
            I understand that any false information or violation of company
            policies may lead to disciplinary action, including termination of
            my employment. I also acknowledge that I am aware of the performance
            expectations and company policies as discussed during the interview
            process.
          </p>

          {/* SIGNATURE BLOCK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Employee side */}
            <div>
              <p className="text-xs font-semibold mb-2">Employee:</p>
              {candidateSignatureImage && (
                <img
                  src={candidateSignatureImage}
                  alt="Employee signature"
                  className="h-16 object-contain border border-slate-300 rounded mb-2"
                />
              )}
              <p className="text-xs text-slate-700">
                {candidateSignature || f.candidateFullName || " "}
              </p>
              <p className="text-[11px] italic text-slate-500">
                Employee Name &amp; Signature
              </p>
              <p className="text-[11px] italic text-slate-500 mt-1">
                Date: {f.agreementDate || "________"}
              </p>
            </div>

            {/* Company side */}
            <div className="text-right">
              <p className="text-xs font-semibold mb-2">For the Company:</p>
              {managerSignatureImage && (
                <img
                  src={managerSignatureImage}
                  alt="Manager signature"
                  className="ml-auto h-16 object-contain border border-slate-300 rounded mb-2"
                />
              )}
              <p className="text-xs text-slate-700">
                {f.managerName ? `Mr. ${f.managerName}` : "Authorized Signatory"}
              </p>
              <p className="text-[11px] italic text-slate-500">Manager</p>
              <p className="text-[11px] italic text-slate-500">
                {f.companyName || "Vahlay Consulting"}
              </p>
              <p className="text-[11px] italic text-slate-500 mt-1">
                Date: {f.agreementDate || "________"}
              </p>
            </div>
          </div>

          {/* Hardcoded note */}
          <p className="text-xs text-slate-600 mt-6">
            <span className="font-semibold">Note from HR/Management: </span>
            Welcome to aboard.
          </p>
        </div>
        
      

      {/* SIGN / UPLOAD FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Sign this agreement
        </h2>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Type your full name (digital signature)
          </span>
          <input
            type="text"
            value={candidateSignature}
            onChange={(e) => setCandidateSignature(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Upload your signature image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-1 text-xs"
          />
          {candidateSignatureImage && (
            <img
              src={candidateSignatureImage}
              alt="Your signature"
              className="mt-2 h-16 border rounded object-contain"
            />
          )}
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
          />
          <span>I have read and agree to the terms of this agreement.</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-full text-sm font-medium text-white bg-red-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit Signature"}
        </button>
      </form>
    </div>
  );
};

export default CandidateAgreementPage;
