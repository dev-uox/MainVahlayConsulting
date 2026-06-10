/**
 * ImpactSection — "By The Numbers" home section.
 *
 * Design system:
 *  - Colors   : red-600 accent, slate-900 headings, white surface, slate-50 bg
 *  - Motion   : framer-motion (whileInView, spring, stagger) — mirrors Home.jsx
 *  - Spacing  : py-14 section, container mx-auto, rounded-[1.2rem] cards
 *  - Pattern  : radial-gradient dot grid + ambient red blobs (from Home.jsx)
 */

import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

/* ── DATA ────────────────────────────────────────────────── */
const STATS = [
  {
    id: "stat-projects",
    value: "200+",
    label: "Projects Delivered",
    sub: "Across IT, Sales & Marketing",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "stat-roi",
    value: "4.8×",
    label: "Average Client ROI",
    sub: "Measured across all engagements",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: "stat-retention",
    value: "96%",
    label: "Client Retention Rate",
    sub: "Long-term partnerships built on trust",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "stat-countries",
    value: "3",
    label: "Countries Served",
    sub: "USA · Canada · Bharat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const PROOF_POINTS = [
  {
    id: "proof-it",
    icon: "💻",
    title: "IT Services",
    description:
      "From SaaS builds to legacy modernisation — we deliver scalable digital products on time.",
    link: "/categories/it-services",
  },
  {
    id: "proof-sales",
    icon: "📞",
    title: "Tele Sales",
    description:
      "High-performance outbound teams that qualify, convert, and close — at enterprise scale.",
    link: "/categories/sales",
  },
  {
    id: "proof-marketing",
    icon: "📈",
    title: "Digital Marketing",
    description:
      "Data-led SEO, paid media, and content strategies that compound results month over month.",
    link: "/services",
  },
  {
    id: "proof-staffing",
    icon: "🤝",
    title: "Talent & Staffing",
    description:
      "Pre-vetted engineers and sales professionals placed across Fortune 500 firms in 18 days avg.",
    link: "/careers",
  },
];

/* ── ANIMATION VARIANTS (mirror Home.jsx) ─────────────────── */
const staggerParent = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 150 },
  },
};

/* ── STAT CARD ────────────────────────────────────────────── */
const StatCard = ({ stat }) => (
  <motion.div variants={slideUp} className="group h-full">
    <div
      id={stat.id}
      className="card relative h-full flex flex-col bg-white rounded-[1.1rem] p-6 border border-red-200
        shadow-[0_5px_20px_-10px_rgba(0,0,0,0.03)]
        hover:border-red-100 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)]
        hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
    >
      {/* Animated top border (mirrors Home.jsx cards) */}
      <div className="absolute top-0 left-0 h-0.5 w-0 bg-red-600 transition-all duration-500 ease-out group-hover:w-full" />

      {/* Icon */}
      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-red-200
          transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 mb-5">
        {stat.icon}
      </div>

      {/* Value */}
      <p className="text-4xl font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-300 mb-1">
        {stat.value}
      </p>

      {/* Label */}
      <h3 className="text-sm font-bold text-slate-700 mb-1">{stat.label}</h3>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{stat.sub}</p>

      {/* Decorative circle (mirrors Home.jsx) */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-50 rounded-full opacity-100 pointer-events-none" />
    </div>
  </motion.div>
);

/* ── PROOF CARD ───────────────────────────────────────────── */
const ProofCard = ({ item }) => (
  <motion.div variants={slideUp} className="group">
    <Link to={item.link} id={item.id}>
      <div
        className="relative flex items-start gap-4 p-5 bg-white rounded-[1.1rem] border border-slate-100
          shadow-[0_2px_12px_-6px_rgba(0,0,0,0.04)]
          hover:border-red-200 hover:shadow-[0_15px_30px_-10px_rgba(220,38,38,0.08)]
          hover:-translate-y-1 transition-all duration-400"
      >
        {/* Emoji icon */}
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0
            group-hover:bg-red-50 transition-colors duration-300">
          {item.icon}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors duration-300">
            {item.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
        </div>

        {/* Arrow */}
        <motion.span
          whileHover={{ x: 3 }}
          className="ml-auto shrink-0 text-slate-300 group-hover:text-red-600 transition-colors duration-300 self-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </motion.span>
      </div>
    </Link>
  </motion.div>
);

/* ── MAIN COMPONENT ───────────────────────────────────────── */
const ImpactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      id="impact-section"
      className="relative py-14 md:py-20 bg-slate-50 overflow-hidden"
    >
      {/* Same dot-grid pattern as Home.jsx */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      {/* Ambient glow blobs (mirror Home.jsx Services section) */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px] pointer-events-none"
      />

      <div className="container relative mx-auto px-4 md:px-8 lg:px-12 z-10">

        {/* Section header — same style as Home.jsx */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Impact By The Numbers<span className="text-red-600">.</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
            Numbers that speak for themselves — from the projects we've built, the revenue we've driven, and the teams we've placed.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12"
        >
          {STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </motion.div>

        {/* Proof points — capability signals */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-12"
        >
          {PROOF_POINTS.map((item) => (
            <ProofCard key={item.id} item={item} />
          ))}
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/case-studies">
            <motion.button
              id="impact-cta-case-studies"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-8 py-3.5 bg-red-600 text-white rounded-full
                font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors
                shadow-lg hover:shadow-red-500/25"
            >
              View Case Studies
              <span
                className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center
                  group-hover:bg-white group-hover:text-red-600 transition-colors duration-300"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </motion.button>
          </Link>

          <Link to="/contact_us">
            <motion.button
              id="impact-cta-contact"
              whileHover={{ x: 3 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest
                text-slate-600 hover:text-red-600 transition-colors duration-300 px-4 py-3.5"
            >
              Discuss Your Project
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default ImpactSection;
