// src/TermsAndConditions.js
import React from 'react';

const TermsAndConditions = () => {
  const handleAgree = () => {
    alert('Thank you for applying!');
    // You may redirect or perform any action here
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Terms and Conditions</h2>
      <div className="text-black mb-4">
                <p><strong>Terms and Conditions</strong></p>
 
                <p>Dear Candidate,</p>
                <p>We are thrilled about the opportunity to have you join Vahlay Consulting Inc! Before we move forward with issuing your formal offer letter, please take the following important steps to ensure a smooth onboarding process.</p>
 
                <p><strong>Salary Revision:</strong> Your salary will be reviewed after 1 year from your last increment, or at such other time as the Management may decide. Salary revisions adiscretionary and                 based on effective performance. You may be asked to justify your salary by completing your monthly targets. The appraisal will be considered ashike in the CTC, and promotions will be based on                 one year of work. Both appraisals and promotions are at the Management's discretion.</p>
 
                <p><strong>Working Hours:</strong> Working hours will be from 07:00/08:00 PM to 05:00/06:00 AM, and may change as per Management's decision. The company typically operates six daa week, but you                 will work five days a week, with Sunday as your weekly off. You may be required to work on weekends when necessary, and shifts will be assigned your supervisor.</p>
 
                <p><strong>Absence/Leave Rule:</strong> If you are absent for a continuous period of 3 days without prior approval, or if you overstay on leave or training, it will lead automatic termination                 of your employment without notice. You will not be entitled to salary or benefits, and no claims for dues or compensation will be entertain</p>
 
                <p><strong>Probation/Confirmation:</strong> You will be on probation for three months. Based on your performance, your services may be confirmed in writing. During probation, yoservices can be                 terminated with seven days' notice on either side. After confirmation, the termination period extends to two months' notice on either side. Tprobation period may be extended at the Management’s                 discretion, and you will remain on probation until a confirmation order is issued. Once confirmed, you aexpected to work exclusively for the company, and you must seek written permission from                 the Board of Directors for any other work or public membership.</p>
 
                 <p><strong>Confidentiality:</strong> You are not allowed to publish any articles, statements, or make any communications related to the company’s products or matters without priwritten                 permission. Confidential information, including technical, commercial, or proprietary data, must not be disclosed during or after your employment unlerequired by law.</p>
 
                <p><strong>Intellectual Property:</strong> Any new methods or improvements developed by you during your employment will remain the sole property of the company. You must maintaconfidentiality                 regarding project documents, designs, cost estimations, software packages, company policies, and employee profiles. The use of personal USB drivand CDs within the organization is prohibited.</p>
 
                <p><strong>Responsibilities & Duties:</strong> You are required to adhere to the company’s rules and regulations and perform effectively to ensure desired results.</p>
 
                <p><strong>Past Records:</strong> If any information provided by you is found to be false, or if material information is suppressed, you may be removed from service without notice.</p>
 
                <p><strong>Notice Period:</strong> Upon confirmation, your appointment may be terminated by either party with two months' notice or two months' salary in lieu of the notice period. If you resign, the company may accept your resignation with immediate effect or up to the end of the notice period. The salary for the served notice period will be credited within 45 days of your last working day.</p>
 
                <p><strong>No Benefits if Leaving Without Notice:</strong> Employees leaving without serving the agreed notice period will not receive salary slips, experience letters, or any other formal documentation.</p>
 
                <p><strong>Termination of Employment:</strong> During probation, either party may terminate the employment with one week’s notice or salary in lieu thereof. After confirmation, termination requires one month's notice or salary in lieu thereof. Upon termination, all company property must be returned immediately, and no copies of company data should be retained. Violations of company rules or misconduct will result in immediate termination without notice, salary, or benefits.</p>
              </div>
      <button
        onClick={handleAgree}
        className="w-full bg-red-600 text-white py-3 rounded-lg mt-6 hover:bg-red-700 transition"
      >
        I Agree
      </button>
    </div>
  );
};

export default TermsAndConditions;
