import React from "react";
import { motion } from "framer-motion";

const Services = () => {
  const services = [
    {
      title: "Lead Generation",
      features: [
        "Targeting the right audience through strategic marketing and data-driven insights to identify high-potential prospects.",
      ],
    },
    {
      title: "Customer Acquisition",
      features: [
        "Converting prospects into customers by crafting compelling value propositions and delivering exceptional sales experiences. ",
      ],
    },
    {
      title: "Upselling and Cross-Selling",
      features: [
        "Enhancing revenue by identifying opportunities to introduce additional services or upgrades to existing customers. ",
      ],
    },
    {
      title: "Retention Strategies",
      features: [
        "Building long-term customer loyalty by implementing effective follow-up and support mechanisms. ",
      ],
    },
    {
      title: "Market Penetration",
      features: [
        "Expanding your footprint by tapping into new regions, industries, or demographics.",
      ],
    },
  ];

  const benefits = [
    {
      title: "Market Insights",
      description:
        "With deep industry expertise, we provide actionable insights to help you stay ahead of trends and competition.",
    },
    {
      title: "Scalable Solutions",
      description:
        "Whether you’re scaling up operations or launching new products, our flexible services adapt to your needs.",
    },
    {
      title: "Cost Efficiency",
      description:
        "Achieve superior outcomes without overextending your resources, thanks to our streamlined and optimized sales processes.",
    },
    {
      title: "Enhanced Customer Experience",
      description:
        "Strengthen your brand by delivering exceptional service and building lasting customer relationships.",
    },
    {
      title: "Comprehensive Support",
      description:
        "From onboarding to post-sale engagement, our team supports your sales journey every step of the way.",
    },
    {
      title: "Telecom Growth",
      description:
        " we empower telecom businesses to unlock their potential, surpass customer expectations, and achieve ambitious growth goals.",
    },
  ];

  
  const whywe = [
    {
      title: "Expertise",
      description:
        "A team with extensive experience in telecom sales and a track record of delivering results. ",
    },
    {
      title: "Customization",
      description:
        "Solutions designed to align with your business needs, customer expectations, and industry trends.",
    },
    {
      title: "Innovation",
      description:
        "Leveraging the latest technologies and methodologies to stay ahead in a competitive landscape. ",
    },
    {
      title: "Collaboration",
      description:
        "A partnership-driven approach that aligns our efforts with your vision and goals.",
    },
    
  ];

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div
        className="relative bg-cover bg-center h-80 flex items-center justify-center shadow-lg"
        style={{
          backgroundImage: `url('/assets/list-of-top-10-telesales-service-providers-in-india-and-apac_1729019613.jpg')`, // Replace with actual path
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-transparent opacity-70"></div>
        <motion.h1
          className="relative text-white text-5xl font-extrabold tracking-wide text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Telecom Sales Solutions
        </motion.h1>
      </div>

      {/* Intro Section */}
      <div className="container mx-auto px-6 py-12 text-justify">
        <h2 className="text-gray-600 max-w-full mx-auto">
        The telecommunications industry is a cornerstone of modern connectivity, enabling communication and innovation in every sphere of life. As competition intensifies and customer demands evolve, businesses in this dynamic sector require robust, customer-centric sales strategies to thrive. At Vahlay Consulting, we offer comprehensive telecom sales solutions designed to enhance customer acquisition, retention, and revenue generation. 

 
        </h2>
        <p className="text-gray-600 max-w-full mx-auto">
        Our expertise spans the entire telecom sales lifecycle, ensuring that your business achieves sustainable growth and delivers unmatched value to customers.
        </p>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gradient-to-b from-red-500 to-red-950 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 p-6"
          >
            <h3 className="text-xl text-center font-bold text-white mb-4">
              {service.title}
            </h3>
            <ul className=" text-white  text-center  space-y-2">
              {service.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 py-12 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Benefits of Partnering with Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-6 border-t-4 border-red-500"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-center">{benefit.description}</p>
            </div>
          ))}
          
        </div>
      </div>

        {/* Why Choose Us?  Section */}
      <div className="container mx-auto px-6 py-12 bg-gray-100 rounded-lg shadow-md m-5">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Why Choose Us? 
        </h2>
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whywe.map((whywe, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-6 border-t-4 border-red-500"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {whywe.title}
              </h3>
              <p className="text-gray-600 text-center">{whywe.description}</p>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default Services;
