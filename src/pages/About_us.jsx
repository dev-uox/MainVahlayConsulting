import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaLinkedin, FaTwitter, FaQuoteLeft, FaGlobe, FaEnvelope } from "react-icons/fa";
// Ensure this path is correct based on your folder structure. 
// If it's in the public folder, you might need to use the string path in the video tag directly.
import BGVideo from "../../public/assets/AboutUsBG.mp4"

const About = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">

      {/* --- HERO SECTION --- */}
      {/* Changed absolute positioning to flex centering for perfect responsiveness */}
      <div className="relative h-[280px] sm:h-[640px] flex items-center justify-center overflow-hidden bg-gray-950">
        <video
          className="absolute inset-0 w-full h-full object-cover md:object-fill z-0"
          src={BGVideo}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Existing Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* --- NEW: White/Blue Bottom Fade Shadow --- */}
        {/* This creates the smooth transition to your white section below */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/30 to-transparent z-10" />

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Kept your exact text positioning as requested */}
            <motion.h1
              variants={fadeInUp}
              className="text-xl md:text-2xl lg:text-3xl absolute top-[-120px] sm:top-[-280px] font-gray-950 text-white drop-shadow-lg"
            >
              About Vahlay Consulting<span className="text-red-600">.</span>
            </motion.h1>
          </motion.div>
        </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT SIDEBAR (Span 4) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Founder Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-6 lg:sticky lg:top-24"
          >
            <div className="w-full aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden mb-6 shadow-inner relative">
              <img
                src="https://res.cloudinary.com/dzdnwpocf/image/upload/v1751570870/ezivmnsca0niftsu4wfs.png"
                alt="Valay Patel"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Valay Patel</h2>
              <p className="text-red-600 text-sm font-bold uppercase tracking-widest mb-6">Founder</p>

              <p className="text-slate-500 text-sm leading-relaxed mb-8 italic px-2">
                "Building partnerships that inspire progress and sustainable success."
              </p>

              <div className="space-y-3">
                <Link to="/projects" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
                  View Projects
                </Link>
                <Link to="/services" className="block w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-red-500 hover:text-red-600 transition-colors">
                  Our Services
                </Link>
                <Link to="/contact_us" className="block w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                  Get in Touch
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Links (Mobile Only - Hidden on Large Screens) */}
          <div className="lg:hidden bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Explore More</h3>
            <div className="flex flex-wrap gap-3">
              {['Blogs', 'Partners', 'Testimonials', 'Solutions'].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="px-4 py-2 bg-white rounded-lg text-sm text-slate-600 shadow-sm border border-slate-100">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER CONTENT (Span 8) */}
        <div className="lg:col-span-8 space-y-12 md:space-y-16">

          {/* Who We Are */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Introduction</span>
              <h2 className="text-3xl md:text-4xl font-gray-950 text-slate-900 mb-6">Who We Are</h2>
              <div className="prose prose-lg text-slate-600 leading-relaxed">
                <p>
                  Vahlay Consulting was founded on a passion for helping businesses thrive in a dynamic global environment. We bring together a team of seasoned professionals with expertise across industries and disciplines. With a client-first approach, we aim to empower businesses with tailored solutions that deliver real value.
                </p>
                <p>
                  Our reach extends across borders, and our insights are rooted in a deep understanding of local markets. By combining global expertise with regional insights, we help organizations overcome challenges, optimize performance, and prepare for the future.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Founder's Vision */}
          <section className="bg-slate-50 rounded-[2rem] p-8 md:p-10 border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">A Legacy of Leadership</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Valay Patel is a dynamic leader, strategist, and visionary who founded Vahlay Consulting with a mission to empower businesses and individuals through insightful guidance and innovative solutions. With years of experience in strategic consulting, he has been instrumental in helping businesses optimize operations, navigate challenges, and achieve sustainable success.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Valay’s journey is driven by an unwavering commitment to excellence and transformation. He doesn’t just offer advice—he builds meaningful partnerships that inspire progress.
              </p>
            </div>
          </section>

          {/* Mission & Vision Accordion */}
          <section className="space-y-4">
            {[
              {
                title: "Our Mission",
                content: "At Vahlay Consulting, our mission is clear: to empower businesses with innovative, sustainable, and people-focused solutions that enable growth, build resilience, and create long-term value."
              },
              {
                title: "Our Vision",
                content: "Our vision is to be a global leader in transformative business consulting, inspiring progress, elevating organizations, and fostering a sustainable future."
              }
            ].map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleDropdown(index)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <span className={`text-red-600 font-bold text-xl transition-transform duration-300 ${openDropdown === index ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                <AnimatePresence>
                  {openDropdown === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-slate-50"
                    >
                      <p className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">
                        {item.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </section>

          {/* Why Choose Us List */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Partner With Us?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Expert Team", desc: "Certified developers & PMs with years of experience." },
                { title: "Custom Solutions", desc: "Tailored strategies, never one-size-fits-all." },
                { title: "Cutting-Edge Tech", desc: "Leveraging the latest tools for future-ready results." },
                { title: "Transparent Process", desc: "Clear communication from planning to deployment." },
                { title: "Competitive Pricing", desc: "High-quality solutions at sustainable rates." },
                { title: "24/7 Support", desc: "Round-the-clock assistance for peace of mind." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-red-100 hover:shadow-sm transition-all">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* --- PARTNERS SECTION --- */}
      <section className="py-20 bg-slate-50 relative border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-gray-950 text-slate-900 mb-4">Strategic Alliances</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We collaborate with industry leaders to deliver exceptional value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Vahlay Astro", desc: "Trusted partner for astrological insights.", logo: "/assets/Astrologo.png", url: "https://vahlayastro.com/" },
              { name: "Nelson Cab Service", desc: "Safe, reliable transportation services.", logo: "/assets/NELSON.png", url: "https://encoretitlesvc.cloud/" },
              { name: "360 Solution Hub", desc: "Comprehensive IT solutions provider.", logo: "/assets/logo.png", url: "https://360solutionhub.ca/" },
            ].map((partner, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                {/* UPDATES: 
                   1. Changed h-24 to h-32 to fit bigger logos.
                   2. Changed max-h-16 to max-h-24 (bigger logos).
                   3. Removed 'filter grayscale'.
                   4. Added 'hover:scale-110' for interaction.
                */}
                <div className="h-32 flex items-center justify-center mb-6">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-24 w-auto object-contain transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{partner.desc}</p>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors">
                  Visit Website <FaArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CO-MANAGED BY --- */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-gray-950 text-white mb-12">Co-Managed By</h2>

          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-300">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-white/10">
              <img src="/assets/NexaLOGbg.png" alt="Nexa IT" className="w-16 h-16 object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Nexa IT Solutions</h3>
            <p className="text-slate-400 mb-8">Delivering top-notch services and seamless operations.</p>
            <a
              href="https://nexaitsolutions.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              Partner Website <FaGlobe />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;