import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);

  const socialLinks = [
    { icon: FaFacebook, url: "https://www.facebook.com/vahlayinc/", color: "hover:text-blue-600" },
    { icon: FaXTwitter, url: "https://x.com/vahlayinc", color: "hover:text-gray-900" }, // X (Twitter) black/dark gray
    { icon: FaInstagram, url: "https://www.instagram.com/vahlayinc", color: "hover:text-pink-600" },
    { icon: FaYoutube, url: "https://www.youtube.com/@vahlayinc", color: "hover:text-red-600" },
    { icon: FaLinkedin, url: "https://www.linkedin.com/in/vahlay-inc-0a28162b8/", color: "hover:text-blue-700" },
  ];

  const sitemapLinks = [
    { label: "About Us", path: "/about_us" },
    { label: "Services", path: "/services" },
    { label: "Solutions", path: "/solutions" },
    { label: "Our Projects", path: "/Projects" },
    { label: "Our Partners", path: "/partners" },
    { label: "Careers", path: "/careers" },
    { label: "Campus Drive", path: "/assessmentlogin" },
    { label: "Co-Managed By", path: "/copartners" },
    { label: "Case Studies", path: "/case-studies" },
    { label: "Give Feedback to Trainer", path: "/feedbacktotrainer" },
  ];

  const locations = [
    {
      country: "USA Office",
      address: "8 The Green Suite A, Dover, DE 19901, USA",
      url: "https://www.google.com/maps/place/8+The+Green+Suite+A,+Dover,+DE+19901,+USA",
      flag: "/assets/USA flag.png",
    },
    {
      country: "Canada Office",
      address: "235 Ferguson Ave, Cambridge, ON N1R 6G1, Canada",
      url: "https://www.google.com/maps/place/235+Ferguson+Ave,+Cambridge,+ON+N1R+6G1,+Canada",
      flag: "/assets/Canada Flag.png",
    },
    {
      country: "Bharat Office",
      address: "C 515, Dev Aurum Commercial Complex, Prahlad Nagar, Ahmedabad, Gujarat 380015",
      url: "https://maps.app.goo.gl/hw6RLAKHRzr73hL39",
      flag: "/assets/India Flag.jpg",
    },
  ];

  // Helper for smoother list animations
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-gray-200 text-gray-700 font-sans border-t border-gray-200">
      {/* --- Desktop View --- */}
      <div className="hidden md:block container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand & About Column (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold uppercase text-gray-900">Vahlay Consulting</h2>
              </div>
            </Link>

            <p className="text-sm w-[80%] leading-relaxed text-gray-600">
              Vahlay Consulting is a premier global consultancy firm. We empower enterprises across the USA, Canada, and Bharat with innovative, scalable, and sustainable solutions in Telecom and IT.
            </p>

            <div className="flex gap-3 pt-2">
              <Link to="/contact_us">
                <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Get in Touch
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-5 py-2.5 bg-white border border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700 text-sm font-semibold rounded-full transition-all shadow-sm hover:shadow-md">
                  Join Us
                </button>
              </Link>
            </div>

            <div className="pt-6">
              <p className="text-md font-bold text-gray-600 uppercase tracking-wider mb-3">Connect With Us</p>
              <div className="flex gap-4">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-2xl text-gray-600 transition-colors duration-300 ${s.color}`}
                  >
                    <s.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sitemap Column (Span 3) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b-2 border-red-600 inline-block pb-1">
              Quick Links
            </h3>
            <motion.ul
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {sitemapLinks.map((link, i) => (
                <motion.li key={i} variants={itemVariants}>
                  <Link
                    to={link.path}
                    className="text-md text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Contact & Locations Column (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b-2 border-red-600 inline-block pb-1">
                Contact Us
              </h3>
              <div className="space-y-8">
                <a href="mailto:info@vahlayconsulting.com" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <FaEnvelope size={14} />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-red-600 font-medium transition-colors">
                    info@vahlayconsulting.com
                  </span>
                </a>

                <div className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-600 mt-1">
                    <FaPhoneAlt size={14} />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-semibold text-gray-800">USA/Canada:</span> +1 (408) 372-5981</p>
                    <p><span className="font-semibold text-gray-800">Bharat:</span> +91 79492 17538</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Offices */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Global Presence</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locations.map((loc, i) => (
                  <a
                    key={i}
                    href={loc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
                  >
                    <div className="w-8 h-5 flex-shrink-0 rounded overflow-hidden shadow-sm mt-1">
                      <img src={loc.flag} alt={loc.country} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 group-hover:text-red-600 transition-colors">{loc.country}</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1 line-clamp-2">{loc.address}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Vahlay Consulting Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors">Terms & Conditions</Link>
            <Link to="/sitemap" className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* --- Mobile View --- */}
      <div className="md:hidden bg-white">
        {/* Mobile Header Brand */}
        <div className="px-6 py-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-xl font-bold uppercase text-gray-900">Vahlay Consulting</h3>
          </div>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Empowering global businesses with next-gen solutions.
          </p>

          <div className="flex justify-center gap-6 mt-6">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 text-2xl transition-colors">
                <s.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Accordion Menu */}
        <div className="px-4 py-6 space-y-2">
          {/* Sitemap Toggle */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsSitemapOpen(!isSitemapOpen)}
              className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">EXPLORE</span>
              <span className={`text-red-600 transition-transform duration-300 ${isSitemapOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <AnimatePresence>
              {isSitemapOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-gray-50"
                >
                  <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                    {sitemapLinks.map((link, i) => (
                      <Link key={i} to={link.path} className="text-sm text-gray-600 hover:text-red-600 font-medium flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Info Card */}
          <div className="bg-red-100 rounded-xl p-5 border border-red-100">
            <h4 className="text-xs font-bold text-red-800 uppercase mb-3">Get in Touch</h4>
            <div className="space-y-3">
              <a href="mailto:info@vahlayconsulting.com" className="flex items-center gap-3 text-sm text-gray-700">
                <FaEnvelope className="text-red-500" /> info@vahlayconsulting.com
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <FaPhoneAlt className="text-red-500 mt-1" />
                <div>
                  <p>US: +1 (408) 372-5981</p>
                  <p>IN: +91 79492 17538</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Cards Scroll */}
          <div className="pt-4 overflow-x-auto pb-2 flex gap-3 no-scrollbar">
            {locations.map((loc, i) => (
              <a key={i} href={loc.url} target="_blank" rel="noreferrer" className="min-w-[200px] bg-white border border-gray-200 p-3 rounded-lg flex gap-3 items-center shadow-sm">
                <img src={loc.flag} alt={loc.country} className="w-8 h-5 rounded shadow-sm object-cover" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{loc.country}</p>
                  <p className="text-[10px] text-gray-500 truncate w-24">View Map</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Bottom */}
        <div className="bg-gray-900 text-gray-400 py-6 px-6 text-center space-y-4">
          <div className="flex justify-center gap-4 text-xs font-medium">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="text-[10px] opacity-60">© {new Date().getFullYear()} Vahlay Consulting. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;