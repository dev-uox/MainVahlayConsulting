import React from "react";
import Aside from "./Aside";

const TrendPage = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Introduction Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            5 Trends Shaping the Future of Telecom Sales
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            The telecom industry is evolving rapidly, driven by technological
            advancements and shifting customer demands. To stay competitive,
            businesses must embrace emerging trends that shape how sales are
            conducted in this dynamic sector.
          </p>
        </div>

        {/* Key Trends Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Key Trends
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-gray-700">
              <strong>Adoption of 5G Technology:</strong> 5G is transforming the
              telecom landscape, enabling faster connections and new services
              like IoT and smart cities. Sales teams need to align their
              strategies to highlight 5G benefits to customers.
            </li>
            <li className="text-gray-700">
              <strong>AI and Machine Learning in Sales:</strong> AI-driven
              insights are helping telecom companies understand customer
              behaviors, predict needs, and personalize sales strategies for
              better outcomes.
            </li>
            <li className="text-gray-700">
              <strong>Automation in Sales Processes:</strong> Automation tools,
              such as chatbots and CRM platforms, are streamlining workflows,
              reducing manual tasks, and improving customer engagement.
            </li>
            <li className="text-gray-700">
              <strong>Focus on Customer Experience:</strong> Customers expect
              seamless interactions. Sales teams are now emphasizing
              consultative selling and tailored experiences.
            </li>
            <li className="text-gray-700">
              <strong>Emergence of New Markets:</strong> With rural areas and
              developing countries gaining better connectivity, new customer
              bases are opening up, presenting opportunities for growth.
            </li>
          </ul>
        </div>

        {/* Conclusion Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-gray-700 text-lg leading-relaxed">
            Understanding and leveraging these trends can help telecom
            businesses remain competitive and future-ready in an ever-changing
            landscape.
          </p>
        </div>
      </main>

      {/* Aside Content */}
      <Aside />
    </div>
  );
};

export default TrendPage;
