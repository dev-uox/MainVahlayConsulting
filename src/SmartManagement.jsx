// src/SmartManagement.js
import React from 'react';

const SmartManagement = () => {
  const managementFeatures = [
    { title: 'Data-Driven Decision Making', description: 'Empowering businesses with actionable insights and analytics for informed decision-making.' },
    { title: 'Workflow Automation', description: 'Streamlining processes through automation to increase efficiency and reduce human error.' },
    { title: 'Resource Optimization', description: 'Maximizing the use of resources to minimize waste and improve productivity.' },
    { title: 'Real-Time Monitoring', description: 'Enabling real-time data access and control over business operations.' },
    { title: 'Scalable Solutions', description: 'Flexible solutions that grow with your business, adapting to changing needs.' },
  ];

  return (
    <div className="container mx-auto py-16 px-6">
      {/* Page Header */}
      <section className="text-center mb-12 bg-gradient-to-r from-gray-700 to-blue-900 py-16 rounded-lg shadow-md text-white">
        <h2 className="text-5xl font-bold">Smart Management</h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto">
          Leverage our Smart Management solutions to streamline operations, optimize resources, and make data-driven decisions.
        </p>
      </section>

      {/* Core Features Section */}
      <section className="mb-12">
        <h3 className="text-4xl font-bold text-center text-gray-700 mb-8">Our Smart Management Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {managementFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
              <h4 className="text-2xl font-semibold text-blue-700 mb-4">{feature.title}</h4>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="text-center mb-12">
        <h3 className="text-4xl font-bold text-gray-700 mb-6">Why Choose Our Smart Management Solutions</h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
          From enhanced efficiency to cost savings, our Smart Management solutions deliver tangible benefits that align with your strategic goals.
        </p>
        <ul className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-6">
          <li className="p-4 bg-gray-100 rounded-lg shadow-md text-gray-800">Enhanced Efficiency</li>
          <li className="p-4 bg-gray-100 rounded-lg shadow-md text-gray-800">Data-Driven Insights</li>
          <li className="p-4 bg-gray-100 rounded-lg shadow-md text-gray-800">Resource Optimization</li>
        </ul>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-gray-100 py-12 rounded-lg shadow-md">
        <h3 className="text-4xl font-bold text-blue-700 text-center mb-6">Client Success Stories</h3>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="bg-white p-6 rounded-lg shadow-md mb-6">
            "The Smart Management solutions provided by Vahlay Consulting transformed our workflow, making us more efficient and data-driven."
            <br />
            <span className="font-semibold">- Lisa Brown, Operations Manager</span>
          </blockquote>
          <blockquote className="bg-white p-6 rounded-lg shadow-md">
            "Implementing Vahlay’s Smart Management tools helped us cut down on resource wastage, saving us both time and money."
            <br />
            <span className="font-semibold">- David Lee, Project Lead</span>
          </blockquote>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center mt-12">
        <h3 className="text-4xl font-bold text-gray-700 mb-4">Ready to Transform Your Management Processes?</h3>
        <p className="text-lg text-gray-700 mb-6">Contact us to explore how our Smart Management solutions can bring efficiency to your organization.</p>
        <a href="/contact" className="bg-blue-700 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-800 transition">
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default SmartManagement;
