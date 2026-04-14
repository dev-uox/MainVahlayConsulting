import { useEffect, useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import Navbar from "../components/Navbar";
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { GoDotFill } from "react-icons/go";
const APImage = "/assets/ApplicationDevelopmentVC.png";
const WBImage = "/assets/WebsiteDevelopmentVC.png";
const TSImage = "/assets/TeleSalesVC.png";
const VideoVC = "/assets/OfficeCommunicationVC.mp4";
const DGImage = "/assets/DigitalMarketingVC.png";
import ImpactSection from "../components/ImpactSection";

const Home = () => {
  const navigate = useNavigate(); // Add useNavigate hook

  const [servicesData, setServicesData] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState(null);
  const [homeProjects, setHomeProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const industries = [
    {
      title: "AUTOMOTIVE",
      icon: "🚗",
      description:
        "The automotive industry relies heavily on constant availability of data.",
    },
    {
      title: "FINANCE",
      icon: "💰",
      description:
        "Equipping finance professionals with secure and high-speed internet and VoIP solutions to manage sensitive transactions and client communication.",
    },
    {
      title: "HEALTHCARE",
      icon: "⚕️",
      description:
        "Supporting healthcare facilities with dependable internet and VoIP services for patient records, telemedicine, and seamless internal communication.",
    },
    {
      title: "INSURANCE",
      icon: "🛡️",
      description:
        "Providing the insurance sector with VoIP services, internet solutions, and SIP phones to ensure smooth communication and customer service.",
    },
    {
      title: "EDUCATION",
      icon: "🎓",
      description:
        "Empowering educational institutions with internet and streaming services for virtual classes, research, and student engagement.",
    },
    {
      title: "GOVERNMENT",
      icon: "🏛️",
      description:
        "Providing government organizations with robust internet and communication solutions to ensure transparency, efficiency, and connectivity.",
    },
    {
      title: "HOSPITALITY",
      icon: "🏨",
      description:
        "Enhancing the hospitality sector with internet, cable TV, and streaming services to deliver outstanding guest experiences and operational efficiency.",
    },
    {
      title: "LEGAL",
      icon: "⚖️",
      description:
        "Supporting legal professionals with secure internet and VoIP solutions for document management and client communication.",
    },
    {
      title: "PRODUCTION",
      icon: "🏭",
      description:
        "Providing production companies with high-speed internet and VoIP services to ensure smooth workflows and collaboration on projects.",
    },
    {
      title: "NAIL SALONS",
      icon: "💅",
      description:
        "Enhancing the experience at nail salons with internet and entertainment options, keeping clients engaged while supporting business operations.",
    },
    {
      title: "RESTAURANTS",
      icon: "🍴",
      description:
        "Empowering restaurants with internet and VoIP solutions to streamline reservations, manage online orders, and enhance customer interaction.",
    },
    {
      title: "HOME BUSINESSES",
      icon: "🏠",
      description:
        "Helping home-based businesses thrive with high-speed internet, VoIP services, and streaming tools, tailored for efficiency and scalability.",
    },
    {
      title: "GROCERY STORES",
      icon: "🛒",
      description:
        "Delivering robust internet and communication solutions to grocery stores, enabling inventory management, digital payment systems, and customer service excellence.",
    },
    {
      title: "CHURCHES",
      icon: "✝️",
      description:
        "Offering tailored solutions for churches, including internet and streaming services, to help connect with congregations and manage virtual gatherings seamlessly.",
    },
    {
      title: "CONVENIENCE STORES",
      icon: "🛍️",
      description:
        "Equipping convenience stores with reliable internet and communication tools to ensure smooth inventory management, customer transactions, and operational efficiency.",
    },
    {
      title: "BEAUTY SALONS",
      icon: "✂️",
      description:
        "Empowering beauty salons with seamless communication and entertainment solutions. From high-speed internet to streaming services, we ensure your salon stays connected and provides an enhanced customer experience.",
    },
    {
      title: "CHIROPRACTORS",
      icon: "🩺",
      description:
        "Providing healthcare professionals with internet and VoIP services to streamline appointments, manage patient records, and maintain connectivity with clients.",
    },
    {
      title: "TUTORING",
      icon: "📚",
      description:
        "Supporting tutoring businesses with internet and streaming services to deliver effective online and hybrid learning experiences.",
    },
    {
      title: "SWIMMING POOL SERVICE",
      icon: "🏊",
      description:
        "Offering reliable internet and communication tools to swimming pool service providers for managing client appointments and operations effectively.",
    },
    {
      title: "RETAIL",
      icon: "🛍️",
      description:
        "Enhancing retail businesses with high-speed internet and VoIP solutions to streamline point-of-sale systems, inventory management, and customer engagement for a seamless shopping experience.",
    },
    {
      title: "FITNESS CENTERS",
      icon: "🏋️",
      description:
        "Supporting fitness centers with reliable internet and streaming services for virtual classes, online booking systems, and enhanced customer connectivity.",
    },
  ];

  const col1 = industries.filter((_, i) => i % 3 == 0);
  const col2 = industries.filter((_, i) => i % 3 == 1);
  const col3 = industries.filter((_, i) => i % 3 == 2);

  const scrollSpeeds = [
    "animate-scroll-slow",
    "animate-scroll-reverse",
    "animate-scroll-fast",
  ];

  // Add CSS for scroll animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes scroll {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    @keyframes scrollReverse {
      0% { transform: translateY(-50%); }
      100% { transform: translateY(0); }
    }
    .animate-scroll-slow {
      animation: scroll 40s linear infinite;
    }
    .animate-scroll-reverse {
      animation: scrollReverse 30s linear infinite;
    }
    .animate-scroll-fast {
      animation: scroll 20s linear infinite;
    }
    .card {
      position: relative;
      overflow: hidden;
    }
    .trail {
      position: absolute;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #ef4444, transparent);
      top: 0;
      left: -100%;
      transition: left 0.5s ease;
    }
    .card:hover .trail {
      left: 100%;
    }
    .dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #ef4444;
      border-radius: 50%;
      top: -5px;
      left: -5px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .card:hover .dot {
      opacity: 1;
      animation: dotMove 0.5s ease forwards;
    }
    @keyframes dotMove {
      0% { left: -5px; }
      100% { left: calc(100% - 5px); }
    }
    .logoRingsSpin {
      animation: spin 20s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .animate-scroll-slow,
      .animate-scroll-reverse,
      .animate-scroll-fast {
        animation: scroll 60s linear infinite;
      }
    }
  `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);

        let allServices = [];

        for (const category of categoriesSnapshot.docs) {
          const categoryId = category.id;
          const servicesRef = collection(
            db,
            `categories/${categoryId}/services`
          );
          const servicesSnapshot = await getDocs(servicesRef);

          servicesSnapshot.forEach((service) => {
            const serviceData = service.data();
            allServices.push({
              id: service.id,
              categoryId: categoryId,
              title: serviceData.name || "No Title",
              description: serviceData.title || "No Description",
              image: serviceData.image || "/assets/default.jpg",
            });
          });
        }

        setServicesData(allServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  /* ── Fetch live projects for homepage preview (max 3) ── */
  useEffect(() => {
    const fetchHomeProjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, "projects"));
        const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const live = all
          .filter((p) => p.status === "live")
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
          .slice(0, 3); // max 3 on homepage
        setHomeProjects(live);
      } catch (err) {
        console.error("Error fetching home projects:", err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchHomeProjects();
  }, []);

  const slides = [
    {
      id: 1,
      title: "Application Development",
      subtitle: "Build scalable, high performance applications tailored to your business goals. From idea to deployment, we deliver reliable digital products.",
      buttonText: "Know More",
      bgColor: "bg-gradient-to-br from-red-50 via-white to-rose-50",
      image: APImage,
      pageLink: "/categories/it-services/services/application-development",
    },
    {
      id: 2,
      title: "Website Development",
      subtitle: "Build scalable, high performance websites tailored to your business goals. From idea to deployment, we deliver reliable digital products.",
      buttonText: "Know More",
      bgColor: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
      image: WBImage,
      pageLink: "/categories/it-services/services/website-development",
    },
    {
      id: 3,
      title: "Digital Marketing",
      subtitle: "Strategic digital marketing designed to scale your brand and sales online. Every campaign is built to deliver measurable ROI.",
      buttonText: "Know More",
      bgColor: "bg-gradient-to-br from-green-50 via-white to-emerald-50",
      image: DGImage,
      pageLink: "/categories/it-services/services/digital-marketing",
    },
    {
      id: 4,
      title: "Tele Sales",
      subtitle: "Professional tele sales that convert conversations into qualified revenue. Focused on closing, not just calling.",
      buttonText: "Know More",
      bgColor: "bg-gradient-to-br from-purple-50 via-white to-violet-50",
      image: TSImage,
      pageLink: "/categories/sales/services/tele-sales",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  // Handle button click to navigate to specific page
  const handleKnowMore = (pageLink) => {
    if (pageLink) {
      navigate(pageLink);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Intersection Observer for animations
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector('#partners-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const partners = [
    {
      id: 1,
      name: "Vahlay Astro",
      description: "Your trusted partner for astrological insights.",
      logo: "/assets/Astrologo.png",
      url: "https://vahlayastro.com/",
      featured: true
    },
    {
      id: 2,
      name: "Nelson Cab Service",
      description: "Provides safe, reliable transportation for customers.",
      logo: "/assets/NELSON.png",
      url: "https://encoretitlesvc.cloud/",
      featured: true
    },
    {
      id: 3,
      name: "360 Solution Hub",
      description: "Best IT Solution Provider.",
      logo: "/assets/logo.png",
      url: "https://360solutionhub.ca/",
      featured: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 150
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <div className="text-sm">
      {/* Hero Section */}
      <Helmet>
        <title>Vahlay Consulting | Tech, Marketing & Sales Experts</title>
        <meta name="description" content="Vahlay Consulting delivers innovative solutions in application development, website design, digital marketing, and telesales to fuel global business growth." />
        <meta name="keywords" content="Vahlay Consulting, business consulting services, application development company, website development services, digital marketing services, telesales outsourcing, consulting services USA, software development India, IT consulting Canada" />
      </Helmet>

      {/* Enhanced Slider Section */}
      <section
        className={`relative w-full h-auto min-h-[70vh] md:h-[calc(100vh-6rem)] overflow-hidden transition-colors duration-700 ${slides[activeSlide].bgColor}`}
      >

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
          <svg
            viewBox="0 0 3200 1800"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
          >
            {/* Animated Lines Fanning from Top-Left to Bottom-Right */}
            <g strokeWidth="2">
              {[...Array(30)].map((_, i) => {
                const delay = i * 0.05;

                return (
                  <motion.path
                    key={i}
                    initial={{
                      pathLength: 0,
                      pathOffset: 1,
                      opacity: 0
                    }}
                    animate={{
                      pathLength: 1,
                      pathOffset: 0,
                      opacity: 0.3
                    }}
                    transition={{
                      pathLength: {
                        duration: 2,
                        delay: delay,
                        ease: "easeInOut",
                        repeatDelay: 2,
                      },
                      pathOffset: {
                        duration: 2,
                        delay: delay,
                        ease: "easeInOut",
                        repeatDelay: 2,
                      },
                      opacity: {
                        duration: 2,
                        delay: delay,
                        ease: "easeInOut",
                        repeatDelay: 2,
                      }
                    }}
                    d={`M${2700 + i * 40} ${4600 - i * 80} L${300 - i * 20} ${-2900 + i * 90}`}
                    stroke={`rgb(${220 - i * 2}, ${30 + i}, ${40 + i})`}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* Glass Red Background Circles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Large primary circle */}
          <div className="absolute -bottom-32 -right-32 w-[320px] h-[320px] rounded-full bg-red-500/10 backdrop-blur-3xl" />
        </div>

        {/* Floating Background Particles */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-red-100/20 to-pink-100/20"
              style={{
                width: 40,
                height: 40,
                left: `${15 + i * 18}%`,
                top: `${20 + i * 12}%`
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block w-48 lg:w-64 h-1.5 bg-gray-200/40 rounded-full overflow-hidden">
          <motion.div
            key={activeSlide}
            className="h-full bg-red-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className="transition-transform hover:scale-110"
            >
              <GoDotFill
                className={`text-lg ${activeSlide === index ? "text-red-600" : "text-gray-400"
                  }`}
              />
            </button>
          ))}
        </div>

        {/* Mobile Indicators */}
        <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index ? "w-6 bg-red-600" : "w-2 bg-gray-400"
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full flex flex-col-reverse md:flex-row items-center px-6 md:px-16 lg:px-24 py-10 md:py-0"
          >
            {/* Text Content */}
            <div className="w-full md:w-1/2 z-20 mt-8 md:mt-0">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6"
              >
                {slides[activeSlide].title}
                <div className="h-1 w-20 bg-red-600 rounded-full mt-4" />
              </motion.h1>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-gray-600 max-w-lg mb-8"
              >
                {slides[activeSlide].subtitle}
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKnowMore(slides[activeSlide].pageLink)}
                className="px-8 py-4 bg-red-600 text-white rounded-full font-bold tracking-wide shadow-lg"
              >
                {slides[activeSlide].buttonText}
              </motion.button>
            </div>

            {/* Image Area */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-[85%] max-w-xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
              >
                <img
                  src={slides[activeSlide].image}
                  alt="Slide"
                  className="w-full h-full object-cover"
                  loading={activeSlide === 0 ? "eager" : "lazy"}
                />
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => handleKnowMore(slides[activeSlide].pageLink)}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Subtle Background Grid */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </section>

      {/* Services Section */}
      <section className="relative py-12 bg-white overflow-hidden">

        {/* --- Corrected Red Bubble Animation --- */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-red-500/10"
              style={{
                left: `${Math.random() * 100}%`, // Random horizontal position across full width
                width: `${Math.random() * 50 + 20}px`, // Random size between 20px and 70px
                height: `${Math.random() * 50 + 20}px`,
              }}
              initial={{
                top: "110%", // Start below the section
                opacity: 0,
              }}
              animate={{
                top: "-10%", // Float to above the section
                opacity: [0, 1, 0], // Fade in then out
                x: [0, Math.random() * 50 - 25, 0], // Slight horizontal wobble
              }}
              transition={{
                duration: Math.random() * 10 + 15, // Slow rising speed (15-25s)
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 20, // Random delays so they don't all start at once
              }}
            />
          ))}
        </div> */}

        {/* --- Background Ambient Layers --- */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          {/* Continuous Subtle Pulse Animation (Scaled Down) */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px]"
          />
        </div>

        <div className="container relative mx-auto px-4 md:px-8 lg:px-12 z-10">
          {/* --- Section Header --- */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center mb-10 text-center"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-gray-900 text-slate-900 tracking-tight">
              Core Expertise<span className="text-red-600">.</span>
            </h2>
          </motion.div>

          {/* --- Cards Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              {
                title: "SERVICES",
                number: "01",
                content: "Vahlay Consulting Inc. offers expert IT services, Telesales, and customer support for clients in the U.S., Canada, and Bharat.",
                link: "/Services",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "PROJECTS",
                number: "02",
                content: "We focus on HR strategies, engineering support, project management, and training solutions to optimize performance.",
                link: "/Projects",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                )
              },
              {
                title: "PARTNERS",
                number: "03",
                content: "Our partners enhance our offerings in telesales and customer service with specialized expertise and global strategy.",
                link: "/Partners",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group h-full"
              >
                <div className=" card relative h-full flex flex-col bg-white rounded-[1.1rem] p-6 border border-red-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.03)] transition-all duration-500 hover:border-red-100 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)] hover:-translate-y-1.5 overflow-hidden">
                  {/* Card Header: Icon & Number */}
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-red-200 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-gray-900 text-slate-100 group-hover:text-red-50 transition-colors duration-500 select-none">
                      {item.number}
                    </span>
                  </div>

                  {/* Animated Top Border Accent */}
                  <div className="absolute top-0 left-0 h-0.5 w-0 bg-red-600 transition-all duration-500 ease-out group-hover:w-full" />

                  {/* Text Content */}
                  <div className="relative z-10 flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-red-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed mb-6 text-xs md:text-sm font-medium">
                      {item.content}
                    </p>
                  </div>

                  {/* Call to Action */}
                  <div className="relative z-10 mt-auto">
                    <Link to={item.link} className="inline-block">
                      <motion.button
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 bg-red-600 border border-slate-200 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all duration-500 text-white group-hover:border-red-600 group-hover:shadow-sm"
                      >
                        More Info
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>
                    </Link>
                  </div>

                  {/* Decorative Background Pattern (Reveal on Hover) */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-50 rounded-full opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Projects Section ── */}
      {homeProjects.length > 0 && (
        <section className="relative py-14 bg-white overflow-hidden">

          {/* Dot grid — same as Services section */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.4]"
            style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          {/* Ambient blob top-right */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px] pointer-events-none"
          />
          {/* Ambient blob bottom-left */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px] pointer-events-none"
          />

          <div className="container relative mx-auto px-4 md:px-8 lg:px-12 z-10">

            {/* Section Header — exact same pattern as Core Expertise */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center mb-10 text-center"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-gray-900 text-slate-900 tracking-tight">
                Our Projects<span className="text-red-600">.</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base mt-3 max-w-xl leading-relaxed">
                A glimpse of what we've built — live products trusted by real businesses.
              </p>
            </motion.div>

            {/* Projects grid — skeleton while loading */}
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-[1.4rem] border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-slate-100 w-full" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
              >
                {homeProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    variants={{
                      hidden: { opacity: 0, y: 32 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 24, stiffness: 140 } }
                    }}
                    className="group h-full"
                  >
                    <div className="card relative h-full flex flex-col bg-white rounded-[1.4rem] border border-red-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-red-200 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">

                      {/* Animated top border */}
                      <div className="absolute top-0 left-0 h-0.5 w-0 bg-red-600 group-hover:w-full transition-all duration-500 ease-out z-10" />

                      {/* Project Image */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={project.projectImage || "/assets/placeholder-project.jpg"}
                          alt={project.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        {/* Dark overlay on hover release */}
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500" />

                        {/* Service badge */}
                        {project.serviceId && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-red-600 px-3 py-1 rounded-full shadow-md">
                              {project.serviceId}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="flex flex-col flex-grow p-5">
                        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-red-600 transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-5 flex-grow line-clamp-3">
                          {project.description}
                        </p>

                        {/* CTA */}
                        {project.projectLink ? (
                          <a
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:text-red-600 transition-colors duration-300 group/link"
                          >
                            View Live Site
                            <svg className="w-3 h-3 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="mt-auto text-[10px] font-bold uppercase tracking-widest text-slate-300">Live Project</span>
                        )}
                      </div>

                      {/* Decorative blob — mirrors card pattern */}
                      <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-red-50 rounded-full opacity-80 pointer-events-none" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* View All CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mt-10"
            >
              <Link to="/projects">
                <motion.button
                  id="home-projects-view-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-3 px-8 py-3.5 bg-red-600 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/25"
                >
                  View All Projects
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-white group-hover:text-red-600 transition-colors duration-300">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

          </div>
        </section>
      )}

      {/* Industries Section */}
      <section className="relative py-16 bg-slate-50 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="container mx-auto px-4 md:px-6 relative z-10">

          {/* Compact Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-gray-900 text-slate-900 mb-4">
              Industries We Serve<span className="text-red-600">.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              We offer tailored solutions to diverse industries, ensuring your business thrives with innovative expertise.
            </p>
          </div>

          {/* Desktop: 3 columns with individual scroll animations */}
          <div className="hidden md:grid grid-cols-3 gap-5 h-[550px] overflow-hidden relative">

            {/* Seamless Fade Overlays (Matches Section BG) */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />

            {[col1, col2, col3].map((col, colIndex) => (
              <div
                key={colIndex}
                className={`space-y-4 ${scrollSpeeds[colIndex]}`}
              >
                {/* Double the array for infinite seamless loop */}
                {[...col, ...col].map((industry, index) => (
                  <div
                    key={index}
                    className="group relative bg-white p-5 rounded-[1.2rem] border border-red-100 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_-10px_rgba(220,38,38,0.1)] transition-all duration-500"
                  >
                    {/* Hover Top Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-red-600 rounded-full transition-all duration-500 group-hover:w-1/2" />

                    <div className="flex justify-between items-start mb-3">
                      {/* Icon Container */}
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                        {industry.icon}
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 group-hover:text-red-600 transition-colors uppercase tracking-wide">
                      {industry.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                      {industry.description}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile: Single Column Scroll */}
          <div className="md:hidden relative h-[450px] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />

            <div className="animate-scroll-slow space-y-3">
              {[...industries, ...industries].map((industry, index) => (
                <div
                  key={index}
                  className="mx-2 relative bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3"
                >
                  <span className="text-2xl bg-slate-50 p-2 rounded-lg">{industry.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{industry.title}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {industry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* Expert Consulting Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* --- Corrected Red Bubble Animation --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/40 backdrop-blur-sm border border-white/20"
              style={{
                // Fixed random positions (will stay put)
                left: `${(i * 137.5) % 100}%`,
                top: `${(i * 157.5) % 100}%`,
                width: `${(i % 3) * 20 + 30}px`,
                height: `${(i % 3) * 20 + 30}px`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        {/* 2. Cinematic Overlays (Depth & Readability) */}
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_100%)] opacity-90" />

        {/* 3. Ambient Glows (Atmosphere) */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"
        />

        {/* 4. Main Glass Card Content */}
        <div className="relative z-10 container mx-auto px-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-[580px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl overflow-hidden ring-1 ring-white/5"
          >
            {/* Top Shine Highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

            {/* Logo Assembly */}
            <div className="flex items-center justify-center relative mb-4">
              <Link to="/Home">
                <img
                  src="/assets/logo1.png"
                  alt="Vahlay Consulting Logo"
                  className="lg:h-40 h-24 w-auto bg-white  rounded-full"
                />
                <img src="/assets/logorings.png"
                  className="lg:h-40 h-24 w-auto absolute top-0 logoRingsSpin"
                />
              </Link>
            </div>

            {/* Text Content */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-gray-900 text-white leading-tight drop-shadow-md">
                Expert Consulting<span className="text-red-600">.</span>
              </h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xs mx-auto font-medium">
                We provide expert consulting services that help businesses excel with customized solutions for sustainable growth.
              </p>
            </div>

            {/* Action Button */}
            <Link to="/about_us">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-white/10 text-white rounded-full transition-all duration-300 border border-white/20 hover:border-red-500/50"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest relative z-10">
                  Read Our Story
                </span>
                <span className="bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center relative z-10 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Our Co-Partners Section */}
      <section
        id="partners-section"
        className="relative py-14 bg-white overflow-hidden"
      >
        {/* --- Corrected Red Bubble Animation --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-red-500/10"
              style={{
                left: `${Math.random() * 100}%`, // Random horizontal position across full width
                width: `${Math.random() * 50 + 20}px`, // Random size between 20px and 70px
                height: `${Math.random() * 50 + 20}px`,
              }}
              initial={{
                top: "110%", // Start below the section
                opacity: 0,
              }}
              animate={{
                top: "-10%", // Float to above the section
                opacity: [0, 1, 0], // Fade in then out
                x: [0, Math.random() * 50 - 25, 0], // Slight horizontal wobble
              }}
              transition={{
                duration: Math.random() * 10 + 15, // Slow rising speed (15-25s)
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 20, // Random delays so they don't all start at once
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative container mx-auto px-4 md:px-6 z-10">

          {/* Section Header */}
          <motion.header
            className="mb-16 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-gray-900 text-slate-900 mb-4">
              Our Co-Partners<span className="text-red-600">.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              We collaborate with industry-leading experts to deliver exceptional, integrated solutions for your business.
            </p>
          </motion.header>

          {/* Partners Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={itemVariants}
                className="group relative"
              >
                {/* Card Body: White Background (Secondary) */}
                <div className="relative h-full bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-500 hover:border-red-200 hover:shadow-[0_25px_50px_-12px_rgba(220,38,38,0.15)] hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden">

                  {/* Top Red Accent Line (Primary) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-0 bg-red-600 rounded-b-full transition-all duration-500 group-hover:w-16" />

                  {/* Logo Container */}
                  <div className="relative w-24 h-24 mb-6">
                    {/* Red Bloom behind logo on hover */}
                    <div className="absolute inset-0 bg-red-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-full h-full bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-red-100 transition-colors duration-300">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} Logo`}
                        className="w-full h-full object-contain filter group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold mb-3 text-slate-900">
                    {partner.name}
                  </h3>

                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
                    {partner.description}
                  </p>

                  {/* Action Button: Red Primary on Hover */}
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-slate-100 hover:bg-red-800 hover:text-white hover:border-red-800 transition-all duration-300 group/btn shadow-sm z-10">
                    Visit Website
                    <svg
                      className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  {/* Decorative Background Pattern (Reveal on Hover) */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-50 rounded-full opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Co-Managed By Section */}
      <section className="relative py-14 bg-white overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        <div className="container relative mx-auto px-4 md:px-6 z-10">

          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-gray-900 text-slate-900"
            >
              Co-Managed By<span className="text-red-600">.</span>
            </motion.h2>
          </div>

          {/* Main Flagship Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="group relative bg-white rounded-[2.5rem] p-2 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-30px_rgba(220,38,38,0.15)] hover:border-red-100 transition-all duration-500">

              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 bg-slate-50/50 rounded-[2rem] p-8 md:p-10 overflow-hidden relative">

                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors duration-500" />

                {/* Left: Compact Logo & Animation */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
                  {/* Outer Pulsing Ring */}
                  <div className="absolute inset-0 border border-red-200 rounded-full scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 ease-out" />

                  {/* Main Logo Badge */}
                  <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl shadow-red-100 z-10 border border-slate-100 group-hover:border-red-100 transition-colors p-4">
                    <img
                      src="/assets/NexaLOGbg.png"
                      alt="Nexa IT Solutions"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-2xl md:text-3xl font-gray-900 text-slate-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                    Nexa IT Solutions
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 font-medium">
                    Delivering top-notch services and seamless operations with innovation. We partner to ensure your infrastructure is robust, scalable, and future-ready.
                  </p>

                  {/* Modern Red Primary Button */}
                  <a
                    href="https://nexaitsolutions.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 group/btn"
                  >
                    Visit Website
                    <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-white group-hover:text-red-600 transition-colors duration-300">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </a>
                </div>
                {/* Decorative Background Pattern (Reveal on Hover) */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-100 rounded-full opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Impact / By The Numbers Section (NEW) ── */}
      <ImpactSection />

    </div>
  );
};

export default Home;
