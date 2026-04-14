import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const CATEGORIES = ["All", "IT Services", "Tele Sales", "Digital Marketing", "Staffing"];

const CASE_STUDIES = [
  {
    id: 1,
    category: "IT Services",
    tag: "Application Development",
    title: "Scaled a Logistics SaaS from 0 to 10,000 Users",
    client: "TransCore Logistics",
    country: "USA",
    flag: "/assets/USA flag.png",
    challenge:
      "The client had a legacy desktop-only dispatch system that couldn't scale. Field agents were losing hours to manual data entry and missed pickups.",
    solution:
      "We designed and developed a cross-platform SaaS application with real-time GPS tracking, automated dispatch, and a mobile-first driver app — delivered in 14 weeks.",
    results: [
      { label: "Operational Cost Reduction", value: "38%" },
      { label: "User Adoption in 90 Days", value: "10K+" },
      { label: "Dispatch Accuracy Improvement", value: "94%" },
    ],
    color: "from-red-50 to-rose-50",
    accentColor: "bg-red-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    category: "Digital Marketing",
    tag: "SEO & Growth",
    title: "3× Revenue Growth via Integrated Digital Strategy",
    client: "MedWell Clinics",
    country: "Canada",
    flag: "/assets/Canada Flag.png",
    challenge:
      "A multi-location healthcare brand with near-zero online visibility. Competitors dominated search rankings despite inferior services.",
    solution:
      "Built a full-funnel digital strategy: technical SEO overhaul, geo-targeted Google Ads, LinkedIn B2B content, and conversion-optimised landing pages per location.",
    results: [
      { label: "Organic Traffic Growth", value: "220%" },
      { label: "Cost-per-Lead Reduction", value: "52%" },
      { label: "Revenue Increase in 6 Months", value: "3×" },
    ],
    color: "from-blue-50 to-indigo-50",
    accentColor: "bg-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 3,
    category: "Tele Sales",
    tag: "Outbound Sales",
    title: "Built a $2M ARR Sales Pipeline in 4 Months",
    client: "FinEdge Insurance",
    country: "USA",
    flag: "/assets/USA flag.png",
    challenge:
      "The client's in-house sales team had hit a ceiling — poor lead qualification, low call-to-close ratios, and no structured follow-up system.",
    solution:
      "Deployed a dedicated Vahlay tele-sales squad of 12 reps with structured playbooks, CRM integration, live coaching, and a custom lead-scoring algorithm.",
    results: [
      { label: "Annual Recurring Revenue Generated", value: "$2M+" },
      { label: "Call-to-Appointment Rate", value: "31%" },
      { label: "Close Rate Improvement", value: "2.4×" },
    ],
    color: "from-green-50 to-emerald-50",
    accentColor: "bg-emerald-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    id: 4,
    category: "IT Services",
    tag: "Website Development",
    title: "Redesigned E-commerce Platform — 60% Bounce Rate Drop",
    client: "OrganicLeaf Co.",
    country: "Bharat",
    flag: "/assets/India Flag.jpg",
    challenge:
      "An outdated WooCommerce store with painfully slow load times (7s+), poor mobile UX, and a 72% cart abandonment rate.",
    solution:
      "Migrated to a custom React + Node.js stack. Rebuilt UI from scratch with performance-first architecture, micro-interactions, and Razorpay/Stripe dual checkout.",
    results: [
      { label: "Page Load Time Reduction", value: "78%" },
      { label: "Cart Abandonment Rate Drop", value: "60%" },
      { label: "Monthly Revenue Lift", value: "₹18L+" },
    ],
    color: "from-orange-50 to-amber-50",
    accentColor: "bg-orange-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 5,
    category: "Staffing",
    tag: "Talent Acquisition",
    title: "Placed 120 Engineers Across 8 Fortune 500 Firms",
    client: "Various Fortune 500 Clients",
    country: "USA",
    flag: "/assets/USA flag.png",
    challenge:
      "Critical skill gaps in cloud and DevOps roles across multiple enterprise clients. Traditional recruiters took 90+ days to fill senior positions.",
    solution:
      "Leveraged Vahlay's pre-assessed engineering talent pool, ran parallel interview tracks, and embedded a dedicated sourcing team per client — average time-to-offer: 18 days.",
    results: [
      { label: "Engineers Placed", value: "120+" },
      { label: "Avg. Time-to-Hire", value: "18 Days" },
      { label: "Client Retention Rate", value: "97%" },
    ],
    color: "from-purple-50 to-violet-50",
    accentColor: "bg-violet-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 6,
    category: "Digital Marketing",
    tag: "Brand Strategy",
    title: "Zero to 50K Instagram Followers in 5 Months",
    client: "LuxeCraft Jewellery",
    country: "Canada",
    flag: "/assets/Canada Flag.png",
    challenge:
      "A premium jewellery brand with no social media presence and an ad budget of $3K/month — trying to compete against well-funded incumbents.",
    solution:
      "Crafted a high-aesthetic Reels strategy, ran micro-influencer collaborations (5K–50K tier), and built a Meta retargeting funnel targeting high-intent audiences.",
    results: [
      { label: "Instagram Followers Gained", value: "50K+" },
      { label: "ROAS on Meta Ads", value: "6.2×" },
      { label: "DM-to-Sale Conversion Rate", value: "24%" },
    ],
    color: "from-pink-50 to-rose-50",
    accentColor: "bg-pink-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS  (mirror Home.jsx patterns)
───────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 24, stiffness: 140 },
  },
};

/* ─────────────────────────────────────────────────────────────
   CARD COMPONENT
───────────────────────────────────────────────────────────── */
const CaseStudyCard = ({ study, onOpen }) => (
  <motion.div variants={cardVariant} className="group h-full">
    <div
      className={`relative h-full flex flex-col bg-white rounded-[1.4rem] border border-red-100
        shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)]
        hover:shadow-[0_20px_45px_-15px_rgba(220,38,38,0.12)]
        hover:border-red-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer`}
      onClick={() => onOpen(study)}
      role="button"
      aria-label={`Read case study: ${study.title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(study)}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-500 group-hover:w-full" />

      {/* Gradient top area */}
      <div className={`bg-gradient-to-br ${study.color} px-6 pt-6 pb-4`}>
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
            {study.tag}
          </span>
          <div className="flex items-center gap-1.5">
            {study.flag && (
              <img src={study.flag} alt={study.country} className="w-5 h-3.5 rounded object-cover shadow-sm" />
            )}
            <span className="text-[10px] font-semibold text-slate-500">{study.country}</span>
          </div>
        </div>

        <h3 className="mt-4 text-lg md:text-xl font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors duration-300">
          {study.title}
        </h3>
        <p className="mt-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {study.client}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-grow px-6 py-5">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-5">
          {study.challenge}
        </p>

        {/* Results */}
        <div className="mt-auto grid grid-cols-3 gap-2">
          {study.results.map((r, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 group-hover:border-red-100 transition-colors duration-300">
              <p className="text-sm md:text-base font-bold text-red-600">{r.value}</p>
              <p className="text-[9px] text-slate-500 leading-tight mt-0.5 font-medium">{r.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ x: 4 }}
          onClick={(e) => { e.stopPropagation(); onOpen(study); }}
          className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors"
        >
          Read Full Case Study
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>
      </div>

      {/* Decorative blob */}
      <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-red-50 rounded-full opacity-80 pointer-events-none transition-opacity duration-500" />
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────── */
const StudyModal = ({ study, onClose }) => {
  if (!study) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 26, stiffness: 160 }}
        >
          {/* Header gradient */}
          <div className={`bg-gradient-to-br ${study.color} p-8 rounded-t-[2rem]`}>
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
              {study.tag}
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{study.title}</h2>
            <div className="flex items-center gap-2 mt-3">
              {study.flag && (
                <img src={study.flag} alt={study.country} className="w-6 h-4 rounded object-cover shadow-sm" />
              )}
              <p className="text-sm font-semibold text-slate-600">{study.client} · {study.country}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Challenge */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3">The Challenge</h3>
              <p className="text-slate-600 leading-relaxed">{study.challenge}</p>
            </div>

            {/* Solution */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3">Our Solution</h3>
              <p className="text-slate-600 leading-relaxed">{study.solution}</p>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">Key Results</h3>
              <div className="grid grid-cols-3 gap-3">
                {study.results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center"
                  >
                    <p className="text-xl md:text-2xl font-bold text-red-600">{r.value}</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1 font-medium">{r.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                to="/contact_us"
                onClick={onClose}
                className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/30"
              >
                Start a Similar Project
                <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
const CaseStudies = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openStudy, setOpenStudy] = useState(null);

  const filtered =
    activeCategory === "All"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((s) => s.category === activeCategory);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      <Helmet>
        <title>Case Studies | Vahlay Consulting</title>
        <meta
          name="description"
          content="Explore real-world case studies from Vahlay Consulting — proven results in IT, Tele Sales, Digital Marketing, and Staffing across the USA, Canada, and Bharat."
        />
        <meta
          name="keywords"
          content="Vahlay Consulting case studies, IT consulting results, tele sales success stories, digital marketing ROI, staffing case studies"
        />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* Ambient glows */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.25, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none"
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative container mx-auto px-4 md:px-8 py-20 md:py-28 text-center z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 bg-red-600/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-6"
            >
              Proven Results
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
            >
              Case Studies<span className="text-red-500">.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Real challenges. Real solutions. Real outcomes — from our engagements across IT, Sales, Marketing, and Talent.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-8 md:gap-16"
            >
              {[
                { label: "Projects Delivered", value: "200+" },
                { label: "Countries Served", value: "3" },
                { label: "Avg. Client ROI", value: "4.8×" },
                { label: "Client Retention", value: "96%" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade into white */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── FILTER + GRID ── */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{ backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        {/* Ambient blob */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-600/[0.05] rounded-full blur-[80px] pointer-events-none"
        />

        <div className="container relative mx-auto px-4 md:px-8 lg:px-12 z-10">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Our Work<span className="text-red-600">.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Filter by service area to explore the impact we've created for clients worldwide.
            </p>
          </motion.div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2.5 mb-12"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`filter-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-300
                  ${activeCategory === cat
                    ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-600"
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Cards grid */}
          <motion.div
            key={activeCategory}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((study) => (
              <CaseStudyCard key={study.id} study={study} onOpen={setOpenStudy} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-slate-400 text-sm">No case studies in this category yet.</div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-16 bg-slate-900 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl mx-auto bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 ring-1 ring-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-5">
              Ready to Be Our Next Success Story?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Let's Build Something<span className="text-red-500">.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
              Tell us your challenge. We'll bring the strategy, talent, and execution to turn it into a case study worth reading.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact_us">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-3 px-8 py-3.5 bg-red-600 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg"
                >
                  Start a Conversation
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </motion.button>
              </Link>
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white rounded-full font-bold text-xs uppercase tracking-widest border border-white/20 hover:border-red-500/50 transition-all"
                >
                  Explore Services
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      {openStudy && <StudyModal study={openStudy} onClose={() => setOpenStudy(null)} />}
    </div>
  );
};

export default CaseStudies;
