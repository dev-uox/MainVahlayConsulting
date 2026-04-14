import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Partners = () => {
  const partners = [
    {
      name: "Spectrum Business",
      description:
        "Provides a complete portfolio of secure connectivity solutions including internet over hybrid fiber-coax and 100% fiber, video and voice solutions including phone and mobile for businesses of all sizes.",
      logo: "/assets/Spectrum-logo.jpg",
    },
    {
      name: "RingCentral",
      description:
        "Specializes in cloud-based communications, offering VoIP, video conferencing, team messaging, and contact center solutions.",
      logo: "/assets/RingCentral.png",
    },
    {
      name: "AT&T Business",
      description:
        "Delivers fiber internet, advanced IoT solutions, and robust cybersecurity services for businesses of all sizes.",
      logo: "/assets/AT&T.png",
    },
    {
      name: "AT&T / ACC Business",
      description:
        "Delivers reliable, secure, and scalable high-speed fiber connectivity to keep your business running fast and connected.",
      logo: "/assets/ATT_logo.png",
    },
    {
      name: "Rogers",
      description:
        "Communications is a leading Canadian telecom company, offering fast business internet, mobile phone systems, and IoT connectivity tools.",
      logo: "/assets/download.png",
    },
    {
      name: "Comcast Business",
      description:
        "Comcast Business offers a broad suite of technology solutions to keep businesses of all sizes ready for what's next.",
      logo: "/assets/ComcastBusiness.png",
    },
    {
      name: "Spectrum Voip",
      description:
        "Crystal-clear business communications and faster internet to robust network management and advanced surveillance capabilities. Build your bundle today.",
      logo: "/assets/SpectrumVoip.avif",
    },
  ];

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden font-sans text-slate-900">
      
      {/* --- Background Ambient Animation --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <motion.div 
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        
        {/* --- Header --- */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeInUp} 
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
            Strategic Alliances
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
            Our Partners<span className="text-red-600">.</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            We collaborate with industry leaders to deliver world-class connectivity and technology solutions to your business.
          </p>
        </motion.div>

        {/* --- Grid Layout --- */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              /* UPDATED: Added border-red-200 and shadow-xl shadow-red-500/10 permanently */
              className="group relative flex flex-col bg-white border border-red-200 rounded-[2rem] p-8 shadow-xl shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Top Accent Line - UPDATED: Now permanently visible */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent" />

              {/* Logo Container */}
              <div className="h-24 w-full flex items-center justify-start mb-6 border-b border-slate-50 pb-6">
                <div className="relative p-2 rounded-xl bg-white shadow-sm border border-slate-100">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    /* UPDATED: Removed grayscale so it is always full color */
                    className="h-16 w-auto object-contain transition-all duration-300"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors">
                  {partner.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {partner.description}
                </p>
              </div>

              {/* Decorative Corner Blob - UPDATED: Visible permanently but subtle */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-50 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Partners;