import React from 'react';

const TrainingSolutions = () => {
  const trainingPrograms = [
    { title: 'Skill Development', description: 'Focused training sessions to enhance skills relevant to your industry.' },
    { title: 'Leadership Training', description: 'Preparing future leaders with tailored leadership and management courses.' },
    { title: 'Team Building', description: 'Workshops designed to foster teamwork and collaboration.' },
    { title: 'Technical Upskilling', description: 'Programs aimed at enhancing technical skills in line with modern standards.' },
    { title: 'Customer Service Excellence', description: 'Empowering teams with the tools to provide exceptional service.' },
  ];

  return (
    <div className="container mx-auto py-16 px-6">
      {/* Page Header */}
      <section className="text-center mb-12 bg-gradient-to-r from-red-500 to-red-700 py-16 rounded-lg shadow-md text-white">
        <h2 className="text-5xl font-bold">Training Solutions</h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto">
          Our Training Solutions are designed to empower your team with essential skills, fostering growth and excellence in the workplace.
        </p>
      </section>

      {/* Core Training Programs Section */}
      <section className="mb-12">
        <h3 className="text-4xl font-bold text-center text-red-600 mb-8">Our Training Programs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingPrograms.map((program, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center transform transition-transform hover:scale-105">
              <h4 className="text-2xl font-semibold text-red-700 mb-4">{program.title}</h4>
              <p className="text-gray-700">{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="text-center mb-12">
        <h3 className="text-4xl font-bold text-red-600 mb-6">Why Choose Our Training Solutions</h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
          Our comprehensive programs, led by experienced professionals, ensure that your team is equipped with the skills needed to excel.
        </p>
        <ul className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-6">
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Customized Programs</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Experienced Trainers</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Hands-On Learning</li>
        </ul>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-gray-50 py-12 rounded-lg shadow-md">
        <h3 className="text-4xl font-bold text-red-600 text-center mb-6">What Our Clients Say</h3>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="bg-white p-6 rounded-lg shadow-md mb-6">
            "The training provided by Vahlay Consulting improved our team's skillset, increasing productivity and team morale."
            <br />
            <span className="font-semibold">- Jane Doe, Training Manager</span>
          </blockquote>
          <blockquote className="bg-white p-6 rounded-lg shadow-md">
            "Vahlay’s technical upskilling program was exactly what we needed to stay competitive in our industry."
            <br />
            <span className="font-semibold">- Mark Smith, Operations Lead</span>
          </blockquote>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center mt-12">
        <h3 className="text-4xl font-bold text-red-600 mb-4">Ready to Enhance Your Team’s Skills?</h3>
        <p className="text-lg text-gray-700 mb-6">Contact us today to learn how our training solutions can benefit your organization.</p>
        <a href="/contact" className="bg-red-600 text-white px-8 py-3 rounded-full text-lg hover:bg-red-700 transition">
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default TrainingSolutions;
