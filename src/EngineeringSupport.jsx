// src/EngineeringSupport.js
import React from 'react';

const EngineeringSupport = () => {
  const engineeringServices = [
    { title: 'Technical Consulting', description: 'Providing technical guidance to optimize your engineering projects.' },
    { title: 'System Design & Analysis', description: 'Designing efficient systems with expert analysis and planning.' },
    { title: 'Equipment Selection & Maintenance', description: 'Assisting in selecting the right equipment and maintaining them for peak performance.' },
    { title: 'Quality Control & Assurance', description: 'Ensuring that projects meet industry standards and quality benchmarks.' },
    { title: 'Project Implementation', description: 'Offering on-ground support for successful project execution and implementation.' },
  ];

  return (
    <div className="container mx-auto py-16 px-4">
      {/* Page Header */}
      {/* <section className="text-center mb-12 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 py-16 rounded-lg shadow-md text-white"> */}
      <section className="text-center mb-12 bg-gradient-to-r from-red-500 to-red-700 py-16 rounded-lg shadow-md text-white">
        <h2 className="text-5xl font-bold">Engineering Support</h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto">
          Our engineering support services are designed to provide comprehensive solutions for technical challenges, system design, and quality assurance in various engineering projects.
        </p>
      </section>

      {/* Core Services Section */}
      <section className="mb-12">
        <h3 className="text-4xl font-bold text-center text-red-600 mb-6">Our Engineering Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {engineeringServices.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center transform transition hover:scale-105">
              <h4 className="text-2xl font-semibold text-red-600 mb-4">{service.title}</h4>
              <p className="text-gray-700">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="text-center mb-12">
        <h3 className="text-4xl font-bold text-red-600 mb-6">Why Choose Us for Engineering Support</h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
          With a team of seasoned engineers and project managers, Vahlay Consulting ensures seamless project execution, adherence to industry standards, and consistent quality at every stage.
        </p>
        <ul className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-6">
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Comprehensive Project Support</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Experienced Engineering Team</li>
          <li className="p-4 bg-red-100 rounded-lg shadow-md text-gray-800">Commitment to Quality</li>
        </ul>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-gray-100 py-12 rounded-lg shadow-md">
        <h3 className="text-4xl font-bold text-red-600 text-center mb-6">What Our Clients Say</h3>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="bg-white p-6 rounded-lg shadow-md mb-6">
            "The engineering support team at Vahlay Consulting provided us with invaluable insights and helped streamline our project implementation. Highly recommend!"
            <br />
            <span className="font-semibold">- Sarah Johnson, Project Manager</span>
          </blockquote>
          <blockquote className="bg-white p-6 rounded-lg shadow-md">
            "Vahlay Consulting’s expertise in quality control and assurance was instrumental in maintaining the standards we needed."
            <br />
            <span className="font-semibold">- Michael Lee, Operations Head</span>
          </blockquote>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center mt-12">
        <h3 className="text-4xl font-bold text-red-600 mb-4">Need Engineering Support for Your Project?</h3>
        <p className="text-lg text-gray-700 mb-6">Reach out today to learn how we can add value to your engineering projects.</p>
        <a href="/contact" className="bg-red-600 text-white px-8 py-3 rounded-full text-lg hover:bg-red-700 transition">
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default EngineeringSupport;
