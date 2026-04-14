import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
const Signature = "/assets/sign.png";



const TRAINING_DAYS = 15; // ✅ fixed training duration

const AdminAgreementPage = () => {
  const { appId } = useParams(); // jobApplications doc id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [candidate, setCandidate] = useState(null);

  const [managerSignatureImage, setManagerSignatureImage] = useState(Signature);

  const [form, setForm] = useState({
    candidateFullName: "",
    candidateEmail: "",
    jobTitle: "",
    joiningDate: "",
    baseSalary: "",
    performanceIncentive: "",
    securityDepositAmount: "",
    fullPackage: "",
    // separate targets
    monthlyInstallationTarget: "",
    monthlySalesTarget: "",
    initialInstallationTarget: "",
    initialSalesTarget: "",
    regularInstallationTarget: "",
    regularSalesTarget: "",
    managerName: "",
    companyName: "Vahlay Consulting",
    candidateSignature: "",
    agreementDate: "",
  });

  // Load candidate data from jobApplications
  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "jobApplications", appId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Candidate application not found.");
          navigate("/manageagreements");
          return;
        }

        const data = snap.data();
        const fullName = `${data.firstName || ""} ${
          data.lastName || ""
        }`.trim();

        setCandidate({ id: snap.id, ...data });

        setForm((prev) => ({
          ...prev,
          candidateFullName: fullName || data.fullName || "",
          candidateEmail: data.email || "",
          jobTitle: data.position || "",
          joiningDate: data.joiningDate || "",
          agreementDate: new Date().toISOString().slice(0, 10),
        }));
      } catch (err) {
        console.error("Error loading candidate:", err);
        alert("Error loading candidate data.");
        navigate("/manageagreements");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [appId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerSignatureFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setManagerSignatureImage(reader.result);
    reader.readAsDataURL(file);
  };

  // TEXT PREVIEW – matches candidate agreement style
  const agreementPreview = useMemo(() => {
    const f = form;

    const monthlyInstall = f.monthlyInstallationTarget || "[Installation Target]";
    const monthlySales = f.monthlySalesTarget || "[Sales Target]";
    const initialInstall =
      f.initialInstallationTarget || "[Initial Installation Target]";
    const initialSales = f.initialSalesTarget || "[Initial Sales Target]";
    const regularInstall =
      f.regularInstallationTarget || "[Regular Installation Target]";
    const regularSales = f.regularSalesTarget || "[Regular Sales Target]";

    return `
${f.companyName || "Vahlay Consulting"}
EMPLOYMENT AGREEMENT

Dear ${f.candidateFullName || "[Candidate Name]"},

Thank you for taking the time to complete the interview process with us. We are pleased to inform you that we would like to move forward with your hiring under the following terms and conditions:

1. Position Details:
Position: ${f.jobTitle || "[Job Title]"}
Joining Date: ${f.joiningDate || "[Joining Date]"}
Compensation: ₹${f.baseSalary || "[Base Salary]"} + ₹${
      f.securityDepositAmount || "[Security Deposit Amount]"
    } (Security Deposit Amount)
Note: An additional ₹${
      f.securityDepositAmount || "[Security Deposit Amount]"
    } will be considered a security deposit, retained during the probation/training period and adjusted or refunded as per company policy upon successful completion of the initial term.

2. Training Period:
Duration: ${TRAINING_DAYS} days. The training period is designed to evaluate your understanding of our products/services and your competency in real work scenarios.
Day 1 will include product knowledge training followed by mock sessions and live call observation.
Continuation of your employment after the training period will depend on your satisfactory performance during this time.

Note:During the initial 8-day training period, either the trainer or the candidate may decide whether the candidate will continue or discontinue based on performance, interest, and suitability for the role. These 8 days will remain unpaid unless the candidate successfully completes the full 8-day training and receives confirmation of completion from the trainer/management. Once confirmed, the 8 training days will be paid in full.

3. Performance Targets and Salary Structure:
To qualify for the full package of ₹${
      f.fullPackage || "[Full Package]"
    } per month, you are expected to achieve a minimum of ${monthlyInstall} installations or ${monthlySales} sales per month.

First Month:
• You will receive ₹${f.baseSalary || "[Base Salary]"} + ₹${
      f.securityDepositAmount || "[security Deposit Amount]"
    } (including the security deposit), provided you achieve at least ${initialInstall} installations or ${initialSales} sales.
• If you are unable to meet this target, your package will be revised to the fresher salary bracket based on your performance.

From the Second Month Onward:
• Consistent achievement of ${regularInstall} installations and ${regularSales} sales per month will confirm the ₹${
      f.fullPackage || "[Full Package]"
    } salary package.
• If you are unable to meet this target, your package will be revised accordingly, based on your performance and company policy.

4. Declaration by the Candidate:
I, ${
      f.candidateFullName || "[Candidate Full Name]"
    }, hereby confirm that I have carefully read, understood, and agreed to the above-mentioned terms and conditions of employment. I accept this offer and confirm that all information shared by me during the recruitment process is true and correct to the best of my knowledge.

I understand that any false information or violation of company policies may lead to termination of my employment. I also acknowledge that I am aware of the performance expectations and company policies as discussed during the interview process.

Candidate Signature (Digital/Typed): ${
      f.candidateSignature || "___________________________"
    }
Candidate Name: ${f.candidateFullName || "[Candidate Full Name]"}
Date: ${f.agreementDate || "[Date]"}

For Company Use:
Authorized Signatory:
${f.managerName || "[Manager Name]"}
${f.companyName || "[Company Name]"}
Date: ${f.agreementDate || "[Date]"}

Note from HR/Management:
Welcome to abroad.
  `.trim();
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidate) return;

    try {
      setSaving(true);

      const agreementRef = doc(db, "agreements", appId);

      await setDoc(agreementRef, {
        applicationId: appId,
        candidateId: appId,
        candidateEmail: form.candidateEmail,
        candidateFullName: form.candidateFullName,
        fields: form,
        previewText: agreementPreview,
        managerSignatureImage: managerSignatureImage || "",
        candidateSignatureImage: "",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "jobApplications", appId), {
        agreementDone: true,
        agreementId: appId,
      });

      alert("Agreement created successfully!");
      navigate("/manageagreements");
    } catch (err) {
      console.error("Error saving agreement:", err);
      alert("Error saving agreement.");
    } finally {
      setSaving(false);
    }
  };

  // PDF – structured like candidate page
  const handleDownloadPdf = () => {
    const f = form;

    const monthlyInstall = f.monthlyInstallationTarget || "[Installation Target]";
    const monthlySales = f.monthlySalesTarget || "[Sales Target]";
    const initialInstall =
      f.initialInstallationTarget || "[Initial Installation Target]";
    const initialSales = f.initialSalesTarget || "[Initial Sales Target]";
    const regularInstall =
      f.regularInstallationTarget || "[Regular Installation Target]";
    const regularSales = f.regularSalesTarget || "[Regular Sales Target]";

    const content = [
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
      {
        text:"Offer Confirmation and Terms of Employment",
        style:"body",

        alignment:"center",
        margin:[0,-20,0,30],
      },
      

      {
        text: `Dear ${f.candidateFullName || "[Candidate Name]"},`,
        style: "bodyBold",
        margin: [0, 0, 0, 8],
      },
      {
        text: `Thank you for taking the time to complete the interview process with us. We are pleased to inform you that we would like to move forward with your hiring under the following terms and conditions:`,
        style: "body",
        margin: [0, 0, 0, 12],
      },

      // 1. Position Details
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

      // 2. Training Period – 15 days
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
        text: "Note:During the initial 8-day training period, either the trainer or the candidate may decide whether the candidate will continue or discontinue based on performance, interest, and suitability for the role. These 8 days will remain unpaid unless the candidate successfully completes the full 8-day training and receives confirmation of completion from the trainer/management. Once confirmed, the 8 training days will be paid in full.",
        style: "body",
        margin: [0, 0, 0, 12],
      },

      // 3. Performance Targets & Salary Structure
      {
        text: "3. Performance Targets & Salary Structure",
        style: "sectionHeader",
      },
      {
        text: `To qualify for the full package of ₹${
          f.fullPackage || "[Full Package]"
        } per month, you are expected to achieve a minimum of ${monthlyInstall} installations or ${monthlySales} sales per month.`,
        style: "body",
        margin: [0, 0, 0, 8],
      },

      {
        text: "First Month:",
        style: "bodyBold",
        margin: [0, 0, 0, 4],
      },
      {
        ul: [
          `You will receive ₹${f.baseSalary || "[Base Salary]"} + ₹${
            f.securityDepositAmount || "[security Deposit Amount]"
          } (including the security deposit), provided you achieve at least ${initialInstall} installations or ${initialSales} sales.`,
          `If you are unable to meet this target, your package will be revised to the fresher salary bracket based on your performance.`,
        ],
        style: "body",
        margin: [0, 0, 0, 8],
      },

      {
        text: "From the Second Month Onward:",
        style: "bodyBold",
        margin: [0, 0, 0, 4],
      },
      {
        ul: [
          `Consistent achievement of ${regularInstall} installations or ${regularSales} sales per month will confirm the ₹${
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
        text: `I understand that any false information or violation of company policies may lead to termination of my employment. I also acknowledge that I am aware of the performance expectations and company policies as discussed during the interview process.`,
        style: "body",
        margin: [0, 0, 0, 16],
      },

      // Signatures
      {
        columns: [
          {
            width: "50%",
            stack: [
              {
                text: "Employee:",
                style: "bodyBold",
                margin: [0, 16, 0, 4],
              },
              {
                text: f.candidateSignature || f.candidateFullName || " ",
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
              {
                text: "For the Company:",
                style: "bodyBold",
                margin: [0, 16, 0, 4],
                alignment: "right",
              },
              managerSignatureImage && {
                image: managerSignatureImage,
                width: 100,
                alignment: "right",
                margin: [0, 0, 0, 4],
              },
              {
                text: f.managerName || "Authorized Signatory",
                style: "body",
                alignment: "right",
                margin: [0, 4, 0, 0],
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

      {
        text: "Note from HR/Management: Welcome to abroad.",
        style: "body",
        margin: [0, 20, 0, 0],
      },
    ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [50, 70, 50, 70],
      background: function () {
        return {
          canvas: [
            {
              type: "rect",
              x: 20,
              y: 20,
              w: 555,
              h: 802,
              r: 0,
              lineWidth: 1,
            },
          ],
        };
      },
      content,
      styles: {
        title: { fontSize: 16, bold: true },
        body: { fontSize: 11, lineHeight: 1.35 },
        bodyBold: { fontSize: 11, bold: true, lineHeight: 1.35 },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 8, 0, 4],
        },
        smallLabel: { fontSize: 9, italics: true },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 text-lg">Loading candidate data...</div>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Create Agreement
            </h1>
            <p className="text-sm text-slate-500">
              Candidate: {form.candidateFullName} ({form.candidateEmail})
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded-full border border-slate-300 bg-white hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* LEFT: Form inputs */}
          <div className="space-y-5">
            {/* Candidate & Position */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Candidate & Position Details
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Candidate full name
                  </label>
                  <input
                    type="text"
                    name="candidateFullName"
                    value={form.candidateFullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Candidate email
                  </label>
                  <input
                    type="email"
                    name="candidateEmail"
                    value={form.candidateEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Job title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Joining date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Agreement date
                  </label>
                  <input
                    type="date"
                    name="agreementDate"
                    value={form.agreementDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Salary & Targets */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Salary, Deposit & Targets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Base salary (₹)
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={form.baseSalary}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
              
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Security deposit amount (₹)
                  </label>
                  <input
                    type="number"
                    name="securityDepositAmount"
                    value={form.securityDepositAmount}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Full package (₹/month)
                  </label>
                  <input
                    type="number"
                    name="fullPackage"
                    value={form.fullPackage}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    required
                  />
                </div>

                {/* Monthly targets: separate installation & sales */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Monthly installation target
                  </label>
                  <input
                    type="number"
                    name="monthlyInstallationTarget"
                    value={form.monthlyInstallationTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Monthly sales target
                  </label>
                  <input
                    type="number"
                    name="monthlySalesTarget"
                    value={form.monthlySalesTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 20"
                    required
                  />
                </div>

                {/* Initial (1st month) targets */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Initial installation target (1st month)
                  </label>
                  <input
                    type="number"
                    name="initialInstallationTarget"
                    value={form.initialInstallationTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Initial sales target (1st month)
                  </label>
                  <input
                    type="number"
                    name="initialSalesTarget"
                    value={form.initialSalesTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 12"
                    required
                  />
                </div>

                {/* Regular (2nd month onward) targets */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Regular installation target (from 2nd month)
                  </label>
                  <input
                    type="number"
                    name="regularInstallationTarget"
                    value={form.regularInstallationTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Regular sales target (from 2nd month)
                  </label>
                  <input
                    type="number"
                    name="regularSalesTarget"
                    value={form.regularSalesTarget}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., 20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Signatures
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Candidate digital signature (typed name)
                  </label>
                  <input
                    type="text"
                    name="candidateSignature"
                    value={form.candidateSignature}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Manager name
                    </label>
                    <input
                      type="text"
                      name="managerName"
                      value={form.managerName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Manager digital signature (image)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleManagerSignatureFileChange}
                    className="block w-full text-xs text-slate-600"
                    required
                  />
                  {managerSignatureImage && (
                    <div className="mt-2">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Preview:
                      </p>
                      <img
                        src={managerSignatureImage}
                        alt="Manager signature preview"
                        className="h-16 object-contain border border-slate-200 rounded"
                        
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
                >
                  Download PDF
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Agreement"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Agreement Preview
            </h2>
            <div className="h-auto overflow-auto border border-slate-100 rounded-lg bg-slate-50 p-4 text-xs">
              <pre className="whitespace-pre-wrap font-mono text-slate-800">
                {agreementPreview}
              </pre>

              {managerSignatureImage && (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Manager Digital Signature (Preview):
                  </p>
                  <div className="flex justify-end">
                    <div className="text-right">
                      <img
                        src={managerSignatureImage}
                        alt="Manager signature preview in agreement"
                        className="h-16 object-contain border border-slate-200 rounded inline-block"
                      />
                      <div className="mt-1 text-[11px] text-slate-600">
                        {form.managerName || "Authorized Signatory"}
                        <br />
                        {form.companyName || "Vahlay Consulting"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAgreementPage;
