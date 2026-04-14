import React from "react";
import { motion } from "framer-motion";

const Services = () => {
  const services = [
    {
      title: "Strategic Planning",
      features: [
        "Crafting actionable plans that align with your vision, values, and long-term objectives.",
      ],
    },
    {
      title: "Operational Efficiency",
      features: [
        "Streamlining processes to maximize productivity and minimize waste.",
      ],
    },
    {
      title: "Financial Management",
      features: [
        "Ensuring robust budgeting, cost control, and financial planning for sustainable growth.",
      ],
    },
    {
      title: "Team Leadership",
      features: [
        "Enhancing team performance through effective management and motivational practices.",
      ],
    },
    {
      title: "Risk Management",
      features: [
        "Identifying and mitigating risks to safeguard business continuity.",
      ],
    },
  ];

  const whywe = [
    {
      title: "Expert Guidance",
      description:
        "Our experienced consultants bring a wealth of knowledge across industries and business functions.",
    },
    {
      title: "Customized Solutions",
      description:
        "We understand that one size does not fit all. Our solutions are tailored to your specific needs and goals. .",
    },
    {
      title: "Holistic Approach",
      description:
        "Leveraging the latest technologies and methodologies to stay ahead in a competitive landscape.",
    },
    {
      title: "Data-Driven Decisions",
      description:
        "From planning to execution, we cover every aspect of business management to drive sustainable success.  ",
    },
    {
      title: "Scalable Services",
      description:
        "Whether you’re a small business or a growing enterprise, our services are designed to evolve with you. ",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div
        className="relative bg-cover bg-center h-80 flex items-center justify-center shadow-lg"
        style={{
          backgroundImage: `url('/assets/Business_mangementservices.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-transparent opacity-70"></div>
        <motion.h1
          className="relative text-white text-5xl font-extrabold tracking-wide text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Business Management Services
        </motion.h1>
      </div>

      {/* Intro Section */}
      <div className="container mx-auto px-6 py-12 text-justify bg-white rounded-lg shadow-lg mt-5 mb-10">
        <h2 className="text-gray-600">
          In today’s fast-paced and highly competitive business environment,
          effective management is the foundation for long-term success.{" "}
          <strong>At Vahlay Consulting</strong>, we specialize in providing
          comprehensive business management solutions that empower organizations
          to streamline operations, optimize performance, and achieve strategic
          goals.
        </h2>
        <p className="text-gray-600 mt-4">
          From startups to established enterprises, our services are tailored
          to address the diverse challenges of modern businesses, enabling them
          to focus on growth and innovation while we handle the complexities of
          management.
        </p>
      </div>

      {/* Services Section */}
      <div className="text-center text-3xl text-gray-900 font-extrabold tracking-wide">
        Our Business Management Expertise
      </div>
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gradient-to-b from-red-500 to-red-900 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 p-6"
          >
            <h3 className="text-xl text-center font-bold text-white mb-4">
              {service.title}
            </h3>
            <ul className="text-white text-center space-y-2">
              {service.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-6 py-12 bg-gray-100 rounded-lg shadow-md m-5">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {whywe.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-6 border-t-4 border-red-500"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {item.title}
              </h3>
              <p className="text-gray-600 text-center">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
