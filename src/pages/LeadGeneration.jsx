import React from "react";
import Aside from "./Aside";

const LeadGeneration = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Introduction Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Effective Lead Generation Strategies for Telecom Businesses
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            In the telecom industry, attracting high-quality leads is crucial to
            boosting sales and sustaining growth. The right lead generation
            strategies can set your business apart in a competitive market.
          </p>
        </div>

        {/* Strategies Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Strategies to Implement
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-gray-700">
              <strong>Leverage Digital Marketing:</strong> Use platforms like
              LinkedIn, Google Ads, and email marketing to target specific
              customer segments with precision.
            </li>
            <li className="text-gray-700">
              <strong>Harness Data Analytics:</strong> Analyze customer behavior
              and preferences to identify high-potential leads, ensuring targeted
              and efficient outreach.
            </li>
            <li className="text-gray-700">
              <strong>Content Marketing:</strong> Publish informative blogs,
              webinars, and case studies to establish your authority in the telecom
              space and attract interested prospects.
            </li>
            <li className="text-gray-700">
              <strong>Referral Programs:</strong> Encourage satisfied customers to
              refer new clients by offering incentives or discounts.
            </li>
            <li className="text-gray-700">
              <strong>Optimize Your Website for Lead Capture:</strong> Ensure
              your website has clear call-to-actions, forms, and chatbots to
              engage visitors and convert them into leads.
            </li>
          </ul>
        </div>

        {/* Conclusion Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-gray-700 text-lg leading-relaxed">
            By adopting these strategies, telecom businesses can create a
            consistent and effective pipeline of quality leads, fueling
            long-term success.
          </p>
        </div>
      </main>

      {/* Aside Content */}
      <Aside />
    </div>
  );
};

export default LeadGeneration;
