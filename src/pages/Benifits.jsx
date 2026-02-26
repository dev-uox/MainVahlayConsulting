import React from "react";
import Aside from "./Aside";

const Benefits = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50">
    {/* Main Content and Aside goes here */}

  
      {/* Main Content */}
      <main className="flex-1 bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Introduction Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            The Benefits of Outsourcing Business Functions for Efficiency
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            Outsourcing is becoming a go-to strategy for businesses aiming to
            focus on core activities while improving efficiency and reducing
            costs. This approach offers numerous advantages in today’s
            competitive landscape.
          </p>
        </div>

        {/* Key Benefits Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Key Benefits of Outsourcing
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-gray-700">
              <strong>Cost Savings:</strong> Outsourcing reduces expenses by
              eliminating the need for in-house teams and infrastructure for
              non-core functions.
            </li>
            <li className="text-gray-700">
              <strong>Access to Expertise:</strong> Gain access to specialized
              professionals and cutting-edge technology without the long-term
              investment.
            </li>
            <li className="text-gray-700">
              <strong>Improved Focus on Core Activities:</strong> Free up
              internal resources to concentrate on strategic priorities like
              innovation and growth.
            </li>
            <li className="text-gray-700">
              <strong>Scalability:</strong> Outsourcing partners can scale
              services up or down based on your business needs, ensuring
              flexibility.
            </li>
            <li className="text-gray-700">
              <strong>Faster Turnaround Times:</strong> With dedicated
              outsourced teams, tasks are completed efficiently, boosting
              overall productivity.
            </li>
          </ul>
        </div>

        {/* Conclusion Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-gray-700 text-lg leading-relaxed">
            Outsourcing is a strategic decision that helps businesses streamline
            operations, reduce costs, and achieve greater efficiency while
            staying focused on their long-term goals.
          </p>
        </div>
      </main>

      {/* Aside Content */}
      <Aside />
    </div>
  );
};

export default Benefits;
