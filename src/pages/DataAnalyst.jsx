import React from "react";
import Aside from "./Aside";

const DataAnalyst = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Introduction Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            How Data Analytics Can Transform Business Management
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            Data analytics is revolutionizing how businesses operate and make
            decisions. In a data-driven world, companies that effectively
            utilize analytics gain a significant edge in efficiency and
            innovation.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Key Benefits of Data Analytics
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li className="text-gray-700">
              <strong>Improved Decision-Making:</strong> Real-time insights
              enable managers to make informed decisions based on accurate data
              rather than assumptions.
            </li>
            <li className="text-gray-700">
              <strong>Optimized Operations:</strong> Analytics helps identify
              inefficiencies, monitor performance, and streamline processes for
              maximum productivity.
            </li>
            <li className="text-gray-700">
              <strong>Enhanced Customer Understanding:</strong> By analyzing
              customer behavior and preferences, businesses can tailor services
              to meet specific needs, improving satisfaction and retention.
            </li>
            <li className="text-gray-700">
              <strong>Risk Management:</strong> Predictive analytics allows
              businesses to foresee challenges and mitigate risks proactively.
            </li>
            <li className="text-gray-700">
              <strong>Increased Revenue:</strong> Identifying trends and
              opportunities through data insights can help businesses tap into
              new markets and boost profitability.
            </li>
          </ul>
        </div>

        {/* Conclusion Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Conclusion
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Implementing data analytics tools and techniques is no longer
            optional; it’s a necessity for businesses striving to stay
            competitive and innovative. By leveraging the power of data
            analytics, businesses can unlock new opportunities, streamline
            operations, and make more informed decisions to secure long-term
            success.
          </p>
        </div>
      </main>

      {/* Aside Content */}
      <Aside />
    </div>
  );
};

export default DataAnalyst;
