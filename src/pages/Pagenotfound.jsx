import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-white px-6 text-center md:text-left">
      {/* 404 Image */}
     

      {/* 404 Text Section */}
      <div className=" flex flex-col items-center md:items-start mx-8">
        <h1 className="text-8xl font-bold text-gray-900">Vahlay Consulting </h1>
        <h1 className="text-5xl md:text-7xl font-extrabold text-red-500 drop-shadow-lg">
          404
        </h1>

        <p className="text-2xl md:text-3xl font-semibold text-gray-900 mt-4">
          Oops! Page Not Found
        </p>
        <p className="text-md md:text-lg text-gray-600 max-w-lg mt-2">
          The page you're looking for doesn’t exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="mt-6 px-8 py-3 text-lg font-semibold text-white bg-red-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-600 hover:shadow-lg"
        >
          Go Back to Home
        </Link>
      </div>
      <div className="flex justify-center ">
        <img
          src="/assets/pagenoyfound.png"
          alt="404 - Page Not Found"
          className="w-64 md:w-96 h-auto ml-6 md:mb-0 drop-shadow-lg"
        />
      </div>
    </div>
  );
};

export default PageNotFound;
