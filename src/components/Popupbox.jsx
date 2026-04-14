import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";

const PopupBox = ({ onClose }) => {
  // Animation variants for staggered content entry
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1, // Staggers the text fade-ins
      },
    },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

        {/* 1. Backdrop with deeper blur and darker tint for focus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-all"
        />

        {/* 2. Main Modal Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5"
        >
          {/* --- Modern Background Decorations --- */}

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          {/* Top Red Ambient Glow (Spotlight effect) */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-transparent hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors duration-200 z-30"
          >
            <MdClose size={22} />
          </button>

          {/* Content Container */}
          <div className="relative z-10 px-8 pb-10 pt-12 text-center flex flex-col items-center">

            {/* Logo Area with Glow */}
            <motion.div variants={itemVariants} className="relative mb-6">
              {/* White glow behind logo to make it pop off the background */}
              <div className="absolute inset-0 bg-white/80 blur-xl rounded-full" />

              <Link to="/" className="relative flex items-center justify-center group">
                <motion.div className="relative" whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}>
                  <img src="/assets/logo1.png" alt="Logo" className="h-16 md:h-20 w-auto drop-shadow-sm" />
                  <img src="/assets/logorings.png" className="h-16 md:h-20 w-auto absolute top-0 left-0 logoRingsSpin opacity-90" alt="Rings" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Typography */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-black uppercase text-slate-900 mb-3 tracking-tight">
                W<span className="lowercase">elcome to</span> Vahlay Consulting
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-[90%] mx-auto">
                We are building the future of digital consulting. Explore our new services, innovative projects, and global solutions designed for your growth.
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div variants={itemVariants} className="w-full">
              <button
                onClick={onClose}
                className="group relative w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm uppercase tracking-wide overflow-hidden transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 flex items-center justify-center gap-2"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                <span className="relative z-10">Start Exploring</span>
                <MdArrowForward className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PopupBox;