import React from 'react';

const IndustryCard = ({ title, icon, description }) => {
  return (
    <div className="flex items-start p-4 bg-white shadow-lg rounded-lg">
      <div className="text-red-600 text-4xl mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-red-700">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default IndustryCard;
