import React, { useState } from "react";
import { Link } from "react-router-dom"; // Remove or change if you don't use react-router

const TestimonialsPage = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  const testimonials = [
    {
      rating: 5,
      quote:
        "Working with Vahlay Consulting has transformed our business. Their expertise, strategic insights, and tailored solutions have streamlined operations, boosted efficiency, and driven sustainable growth. Professional, responsive, and results-driven, they are a trusted partner in business consulting. Highly recommended!",
      name: "Sujay Pal",
      image: "/assets/TESTIMONIALS.webp",
    },
    {
      rating: 4,
      quote:
        "Vahlay Consulting has been a trusted partner in our staffing needs, delivering top talent with efficiency and precision. Their expertise, professionalism, and commitment to finding the right fit have made our hiring process seamless. Highly recommended!",
      name: "Manish Jadon",
      image: "/assets/TESTIMONIALS.webp",
    },
    {
      rating: 5,
      quote:
        "Vahlay Consulting has been instrumental in optimizing our business operations with strategic insights and expert guidance. Their professionalism and tailored approach have helped drive efficiency and growth. A truly reliable partner!",
      name: "Manan Patel",
      image: "/assets/TESTIMONIALS.webp",
    },
  ];

  return (
    <div>
      {isPopupVisible && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-10 max-w-xl w-full text-center relative">
            {/* Border Design */}
            <div className="absolute inset-0 border-4 border-red-600 rounded-xl pointer-events-none"></div>
            {/* Popup Content */}
            <h2 className="text-3xl font-extrabold text-red-600 mb-6">
              Welcome to Our Site!
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We're currently working on this page to make it perfect. Thank you for
              visiting! Stay tuned for updates.
            </p>
            <button
              onClick={() => setIsPopupVisible(false)}
              className="bg-red-600 text-white text-lg font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition duration-300"
            >
              Enter
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isPopupVisible && (
        <>
          {/* Header Section */}
          <div
            className="relative h-[550px] bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: `url('https://res.cloudinary.com/dzdnwpocf/image/upload/v1751570866/x3jb7wl5irpxgunjkhhr.jpg')`,
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
            {/* Header Title */}
            <h2 className="relative text-5xl font-bold text-white z-10">
              Testimonials
            </h2>
          </div>

          {/* Testimonials Section */}
          <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
                What Our Customers Say
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-300 hover:scale-105 ${
                      index % 2 === 0
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    <h3
                      className={`text-2xl font-semibold ${
                        index % 2 === 0
                          ? "text-white"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {testimonial.name}
                    </h3>
                    <div
                      className={`flex justify-center gap-1 ${
                        index % 2 === 0 ? "text-yellow-300" : "text-yellow-500"
                      } mb-4`}
                    >
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i}>&#9733;</span> // Star symbol
                      ))}
                    </div>
                    <p
                      className={`text-sm ${
                        index % 2 === 0
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      "{testimonial.quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default TestimonialsPage;
