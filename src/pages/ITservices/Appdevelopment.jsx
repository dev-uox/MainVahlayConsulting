import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaMobileAlt, FaCogs, FaCloud, FaCodeBranch, FaShieldAlt, FaRocket, FaGlobeAmericas, FaLock, FaBolt, FaSync } from "react-icons/fa";

const ApplicationDevelopmentPage = () => {
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="bg-white min-h-screen overflow-hidden font-sans text-slate-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-50">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          <motion.div 
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/60 rounded-full blur-[80px]"
            animate={{ scale: [1, 1.1, 1], x: [0, 40, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center max-w-5xl mx-auto mt-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-red-100 shadow-sm mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-red-600 uppercase">Innovation Lab</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
              Next-Gen <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-red-700">
                Applications
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Revolutionizing digital solutions for the future. We engineer scalable, secure, and high-performance applications tailored to your business vision.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all hover:scale-105">
                Get Started Today
              </button>
              <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300">
                View Portfolio
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- INTRODUCTION SECTION --- */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
              Pioneering Innovation in <span className="text-red-600">Application Development</span>
            </h2>
            <div className="h-1 w-20 bg-red-600 mx-auto rounded-full mb-8" />
            <p className="text-lg text-slate-600 leading-relaxed">
              With a focus on innovation, agility, and security, we transform ideas into reality—delivering powerful, scalable, and future-ready applications tailored to your business needs. Whether you need a complex enterprise platform or a sleek consumer app, our engineering ensures excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- EXPERTISE (SERVICES) SECTION --- */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Our Expertise</h2>
            <p className="text-slate-500">Unleashing technology-driven solutions for enterprises and startups.</p>
          </div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[ 
              { icon: FaMobileAlt, title: "AI-Powered Mobile Apps", description: "Smart applications enhanced with AI-driven capabilities for personalized user experiences." },
              { icon: FaCogs, title: "Next-Gen Web Solutions", description: "Advanced, secure, and intuitive web applications built on modern frameworks." },
              { icon: FaCodeBranch, title: "Cross-Platform Development", description: "Seamless apps that perform perfectly across iOS, Android, and web platforms." },
              { icon: FaCloud, title: "Cloud-Based Solutions", description: "Scalable cloud infrastructures optimized for performance, reliability, and speed." },
              { icon: FaShieldAlt, title: "Cybersecurity & Compliance", description: "Built-in security protocols ensuring data protection and regulatory compliance." },
            ].map((service, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)] hover:border-red-100 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 text-2xl mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <service.icon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- WHY CHOOSE US (DARK MODE) --- */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Ambient Glows for Dark Mode */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Why Choose Us?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">We don't just write code; we architect digital success stories.</p>
          </div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[ 
              { icon: FaRocket, title: "Cutting-Edge Development", desc: "Utilizing the latest technology stacks for unmatched results." },
              { icon: FaGlobeAmericas, title: "Global Reach", desc: "Applications designed for maximum scalability and accessibility." },
              { icon: FaLock, title: "Enterprise-Grade Security", desc: "Prioritizing data protection and strict compliance standards." },
              { icon: FaBolt, title: "Agile Development", desc: "Fast, iterative, and result-oriented execution cycles." },
              { icon: FaSync, title: "End-to-End Support", desc: "From concept to deployment, maintenance, and scaling." }
            ].map((point, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-red-500 text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <point.icon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{point.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-red-600 to-red-800 shadow-2xl shadow-red-900/30 px-6 py-16 md:px-12 text-center">
            {/* Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Transform Your Vision <br /> into Reality
              </h2>
              <p className="text-red-100 text-lg md:text-xl mb-10 font-medium">
                Let's build the future together. Contact us today to bring your app idea to life.
              </p>
              <button className="px-10 py-4 bg-white text-red-700 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-50 hover:scale-105 transition-all shadow-xl">
                Start Your Project
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ApplicationDevelopmentPage;