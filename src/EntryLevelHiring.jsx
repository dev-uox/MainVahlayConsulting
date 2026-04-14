import React from 'react';

const EntryLevelHiring = () => {
  const hiringSteps = [
    { title: 'Requirement Analysis', description: 'Understand client needs to tailor our approach to finding the best-fit candidates.' },
    { title: 'Screening & Shortlisting', description: 'Filter candidates based on skills, culture fit, and growth potential.' },
    { title: 'Skill Assessment', description: 'Conduct technical and aptitude assessments to ensure candidate quality.' },
    { title: 'Interview Coordination', description: 'Arrange interviews, manage schedules, and provide feedback for optimal hiring experience.' },
    { title: 'Onboarding Support', description: 'Facilitate a smooth transition for candidates, ensuring they’re ready to succeed.' },
  ];

  return (
    <div className="container mx-auto py-16 px-6">
      {/* Page Header */}
      <section className="text-center mb-12 bg-gradient-to-r from-red-500 to-red-700 py-16 rounded-lg shadow-md text-white">
        <h2 className="text-5xl font-bold">Entry Level Hiring</h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto">
          Discover how we connect talent with opportunities by offering entry-level hiring solutions tailored to meet your company's unique needs.
        </p>
      </section>

      {/* Hiring Steps Section */}
      <section className="mb-12">
        <h3 className="text-4xl font-bold text-center text-red-600 mb-8">Our Hiring Process</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {hiringSteps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 text-center transform transition-transform hover:scale-105">
              <h4 className="text-2xl font-semibold text-red-700 mb-4">{step.title}</h4>
              <p className="text-gray-700">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="text-center mb-12">
        <h3 className="text-4xl font-bold text-red-600 mb-6">Why Partner With Us for Entry-Level Hiring</h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
          With our comprehensive process and network, we help you identify and onboard the best entry-level talent who are ready to grow with your company.
        </p>
        <ul className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-6">
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Dedicated Talent Pool</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Thorough Screening</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Seamless Onboarding</li>
        </ul>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-gray-50 py-12 rounded-lg shadow-md">
        <h3 className="text-4xl font-bold text-red-600 text-center mb-6">What Our Clients Say</h3>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="bg-white p-6 rounded-lg shadow-md mb-6">
            "Vahlay Consulting helped us find dedicated entry-level talent that has brought a fresh perspective to our team."
            <br />
            <span className="font-semibold">- Alicia Green, HR Manager</span>
          </blockquote>
          <blockquote className="bg-white p-6 rounded-lg shadow-md">
            "Their entry-level hiring solutions allowed us to quickly fill roles with skilled candidates who are eager to grow."
            <br />
            <span className="font-semibold">- Robert King, Operations Lead</span>
          </blockquote>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center mt-12">
        <h3 className="text-4xl font-bold text-red-600 mb-4">Ready to Hire Fresh Talent?</h3>
        <p className="text-lg text-gray-700 mb-6">Contact us today to discuss how we can help with your entry-level hiring needs.</p>
        <a href="/contact" className="bg-red-600 text-white px-8 py-3 rounded-full text-lg hover:bg-red-700 transition">
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default EntryLevelHiring;
