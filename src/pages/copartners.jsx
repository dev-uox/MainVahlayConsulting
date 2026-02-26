import React from "react";

const CoPartners = () => {
  const partners = [
    {
      name: "Vahlay Astro",
      description:
        "Vahlay Astro offers personalized astrology insights, expert consultations, and interactive courses to deepen your understanding of the cosmos. Discover advanced tools and resources that bridge ancient wisdom with modern life, empowering your journey of self-awareness and spiritual growth.",
      logo: "/assets/Astrologo.png",
      link: "https://vahlayastro.com/",
    },
    {
      name: "Lakshya",
      description:
        "Lakshya Samaj Seva Charitable Trust is dedicated to uplifting communities through impactful initiatives in education, healthcare, and social welfare. Join us in making a difference and creating a brighter future for those in need.",
      logo: "/assets/Lakshya_logo-removebg-preview.png",
      link: "#",
    },
  ];

  return (
  
    <div className="bg-gradient-to-b from-red-500 via-red-600 to-red-800 py-12 px-4 md:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wide">
          Our Co-Partners
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-200 max-w-3xl mx-auto">
          Meet our esteemed partners who share our vision and commitment to excellence. Together, we strive to achieve extraordinary milestones.
        </p>
      </div>

      {/* Partners Section - Optimized for Mobile */}
      <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-6 md:gap-8">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 w-full  flex flex-col md:flex-row items-center text-center md:text-left transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            {/* Partner Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-white rounded-full shadow-md flex-shrink-0 mb-4 md:mb-0">
              <img src={partner.logo} alt={`${partner.name} Logo`} className="w-20 h-20 md:w-28 md:h-28 object-contain" />
            </div>

            {/* Partner Details */}
            <div className="ml-0 md:ml-6">
              <h2 className="text-xl md:text-2xl font-bold text-red-600">{partner.name}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{partner.description}</p>
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-5 md:px-6 py-2 md:py-3 text-white bg-red-600 font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Visit Website
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Our Co-Managed By Section */}
      <section className="py-12 md:py-16 bg-gray-50 mt-12 md:mt-16 shadow-inner">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <header className="mb-10 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-red-700">
              Our Co-Managed By
            </h2>
            <p className="mt-2 text-base md:text-lg text-gray-600">Managed in partnership with</p>
          </header>

          {/* Co-Managed By Card */}
          <div className="flex justify-center">
            <div className="w-full md:w-3/4 lg:w-1/2 bg-gradient-to-br from-red-700 via-red-600 to-red-700 text-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
                {/* Logo with White Circular Background */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md mb-4">
                  <img
                    src="/assets/NexaLOGbg.png"
                    alt="Nexa IT Solutions Logo"
                    className="object-contain w-20 h-20 md:w-28 md:h-28"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Nexa IT Solutions</h3>
                <p className="text-sm md:text-lg text-white/90 mb-4">Delivering top-notch services and seamless operations.</p>
                {/* Visit Website Button */}
                <a
                  href="https://nexaitsolutions.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 md:px-6 py-2 md:py-3 bg-white text-red-800 font-semibold rounded-lg hover:bg-red-100 transition"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoPartners;
