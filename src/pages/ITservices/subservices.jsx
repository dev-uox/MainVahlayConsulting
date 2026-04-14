import React, { useEffect, useState, useMemo, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";
import PhoneInput from "react-phone-number-input";
import Select from "react-select";
import countries from "world-countries";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FaCheckCircle, FaStar, FaArrowRight, FaRocket, FaShieldAlt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import "react-phone-number-input/style.css";
import slugify from "slugify";

// --- GLOBAL CACHE ---
// Persists data across navigations to prevent re-fetching
const subserviceCache = new Map();

// --- ASSET PRELOADING ---
const preloadImages = () => {
  const imageUrls = [
    "/assets/services/web-development-bg.jpg",
    "/assets/services/mobile-app-bg.jpg",
    "/assets/services/design-bg.jpg",
    "/assets/services/digital-marketing-bg.jpg",
    "/assets/services/technology-bg.jpg",
    "/assets/services/business-bg.jpg",
    "/assets/services/default-service-bg.jpg"
  ];
  imageUrls.forEach(url => { const img = new Image(); img.src = url; });
};

if (typeof window !== 'undefined') setTimeout(preloadImages, 0);

// --- STATIC DATA & VARIANTS ---
const formattedCountries = countries.map((c) => ({
  value: c.name.common,
  label: c.name.common,
}));

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

// --- HELPER: Determine Background & Gradient ---
const resolveVisuals = (subData, serviceData, catData) => {
  let bgImage = "/assets/services/default-service-bg.jpg";
  let gradient = "bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40";

  // 1. Background Image Logic
  if (subData?.backgroundImage) bgImage = subData.backgroundImage;
  else if (serviceData?.backgroundImage) bgImage = serviceData.backgroundImage;
  else if (catData?.backgroundImage) bgImage = catData.backgroundImage;
  else {
    const sName = serviceData?.name?.toLowerCase() || "";
    const cName = catData?.name?.toLowerCase() || "";
    if (sName.includes("web") || sName.includes("development")) bgImage = "/assets/services/web-development-bg.jpg";
    else if (sName.includes("mobile") || sName.includes("app")) bgImage = "/assets/services/mobile-app-bg.jpg";
    else if (sName.includes("design") || sName.includes("ui")) bgImage = "/assets/services/design-bg.jpg";
    else if (sName.includes("marketing") || sName.includes("seo")) bgImage = "/assets/services/digital-marketing-bg.jpg";
    else if (cName.includes("tech") || cName.includes("software")) bgImage = "/assets/services/technology-bg.jpg";
    else if (cName.includes("business")) bgImage = "/assets/services/business-bg.jpg";
  }

  // 2. Gradient Logic
  const sName = serviceData?.name?.toLowerCase() || "";
  if (sName.includes("web")) gradient = "bg-gradient-to-t from-slate-900 via-blue-900/80 to-blue-900/40";
  else if (sName.includes("mobile")) gradient = "bg-gradient-to-t from-slate-900 via-purple-900/80 to-purple-900/40";
  else if (sName.includes("design")) gradient = "bg-gradient-to-t from-slate-900 via-pink-900/80 to-pink-900/40";
  else if (sName.includes("marketing")) gradient = "bg-gradient-to-t from-slate-900 via-green-900/80 to-green-900/40";
  else if (sName.includes("data")) gradient = "bg-gradient-to-t from-slate-900 via-indigo-900/80 to-indigo-900/40";

  return { bgImage, gradient };
};

const SubserviceDetailPage = () => {
  const { categorySlug, serviceSlug, subserviceSlug } = useParams();

  // --- STATE ---
  // Consolidated data state to avoid multiple re-renders
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "", companyName: "" });
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `${categorySlug}/${serviceSlug}/${subserviceSlug}`;

    const loadContent = async () => {
      try {
        setError(null);

        // 1. CACHE CHECK
        if (subserviceCache.has(cacheKey)) {
          console.log("⚡ Loaded Subservice from Cache");
          if (isMounted) {
            setPageData(subserviceCache.get(cacheKey));
            setLoading(false);
          }
          return;
        }

        if (isMounted) setLoading(true);

        // 2. RESOLVE CATEGORY
        let catDoc = null;
        const catRef = collection(db, "categories");
        const catQ = query(catRef, where("slug", "==", categorySlug), limit(1));
        const catSnap = await getDocs(catQ);

        if (!catSnap.empty) catDoc = catSnap.docs[0];
        else {
          const allCats = await getDocs(catRef);
          catDoc = allCats.docs.find(doc => slugify(doc.data().name, { lower: true }) === categorySlug);
        }
        if (!catDoc) throw new Error("Category not found");
        const categoryData = { id: catDoc.id, ...catDoc.data() };

        // 3. RESOLVE SERVICE
        let serviceDoc = null;
        const servRef = collection(db, `categories/${catDoc.id}/services`);
        const servQ = query(servRef, where("slug", "==", serviceSlug), limit(1));
        const servSnap = await getDocs(servQ);

        if (!servSnap.empty) serviceDoc = servSnap.docs[0];
        else {
          const allServs = await getDocs(servRef);
          serviceDoc = allServs.docs.find(doc => slugify(doc.data().name, { lower: true }) === serviceSlug);
        }
        if (!serviceDoc) throw new Error("Service not found");
        const serviceData = { id: serviceDoc.id, ...serviceDoc.data() };

        // 4. RESOLVE SUBSERVICE
        let subDoc = null;
        const subRef = collection(db, `categories/${catDoc.id}/services/${serviceDoc.id}/subservices`);
        const subQ = query(subRef, where("slug", "==", subserviceSlug), limit(1));
        const subSnap = await getDocs(subQ);

        if (!subSnap.empty) subDoc = subSnap.docs[0];
        else {
          const allSubs = await getDocs(subRef);
          subDoc = allSubs.docs.find(doc => slugify(doc.data().name, { lower: true }) === subserviceSlug);
        }
        if (!subDoc) throw new Error("Subservice not found");
        const subserviceData = { id: subDoc.id, ...subDoc.data() };

        // 5. PROCESS DATA
        const whyChooseUs = subserviceData.whyChooseUs || serviceData.whyChooseUs || [];
        const visuals = resolveVisuals(subserviceData, serviceData, categoryData);

        const compositeData = {
          category: categoryData,
          service: serviceData,
          subservice: subserviceData,
          whyChooseUs,
          visuals
        };

        // 6. UPDATE CACHE & STATE
        subserviceCache.set(cacheKey, compositeData);
        if (isMounted) {
          setPageData(compositeData);
        }

      } catch (err) {
        console.error("Error loading subservice:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadContent();

    return () => { isMounted = false; };
  }, [categorySlug, serviceSlug, subserviceSlug]);

  // Preload resolved background image
  useEffect(() => {
    if (pageData?.visuals?.bgImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = pageData.visuals.bgImage;
    }
  }, [pageData]);

  // Form Handlers
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePhoneChange = (value) => setPhone(value);
  const handleCountryChange = (selectedOption) => setSelectedCountry(selectedOption);
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: "success", message: "Form submitted successfully!" });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !pageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Page</h2>
        <p className="text-slate-500 mb-6">{error || "Content not found"}</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const { subservice, service, category, whyChooseUs, visuals } = pageData;

  return (
    <>
      <Helmet>
        <title>{subservice.seoTitle || subservice.name}</title>
        <meta name="description" content={subservice.seoDescription || ""} />
        {visuals.bgImage && <link rel="preload" href={visuals.bgImage} as="image" />}
      </Helmet>

      <div className="bg-white font-sans text-slate-900 overflow-hidden">

        {/* --- HERO SECTION --- */}
        <div className="relative h-[350px] md:h-[400px] flex items-center justify-center bg-slate-900 overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            {/* Placeholder Gradient */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              style={{ background: 'linear-gradient(45deg, #0f172a, #1e293b)' }}
            />
            {/* Actual Image */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              style={{ backgroundImage: `url('${visuals.bgImage}')` }}
            />
          </div>

          {/* Gradient & Pattern Overlays */}
          <div className={`absolute inset-0 ${visuals.gradient} z-0 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-black/30 z-0" />
          <div
            className="absolute inset-0 opacity-10 z-0"
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`, backgroundSize: '20px 20px' }}
          />

          {/* Hero Content */}
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="container relative z-10 px-4 text-center max-w-3xl mx-auto mt-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md mb-4 shadow-sm">
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                {service.name || "Professional"} Service
              </span>
            </motion.div>

            {/* RESPONSIVE TEXT: Scales from text-3xl to text-5xl based on screen */}
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
              {subservice.name} <span className="text-red-500">Services</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-sm sm:text-base md:text-lg text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              {subservice.description}
            </motion.p>
          </motion.div>
        </div>

        {/* --- KEY FEATURES --- */}
        {subservice.keyFeatures?.length > 0 && (
          // Adjusted padding for mobile (py-12) vs desktop (md:py-16)
          <section className="py-12 md:py-16 bg-white relative border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center mb-10">
                <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Capabilities</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Key Features</h2>
              </div>

              {/* RESPONSIVE GRID: 1 column mobile, 2 columns tablet, 4 columns desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subservice.keyFeatures.map((feature, index) => (
                  <KeyFeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- WHY CHOOSE & FORM --- */}
        <section className="py-12 md:py-16 bg-slate-50 relative">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            {/* Stacks vertically on mobile/tablet, side-by-side on large desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Left Column */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Why Choose Us?</h2>
                  <p className="text-slate-500 text-sm">We deliver excellence through innovation, dedication, and expertise.</p>
                </div>
                <div className="space-y-4">
                  {whyChooseUs.map((point, index) => (
                    <WhyChooseCard key={index} point={point} index={index} />
                  ))}
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Request a Consultation</h2>

                {status.message && (
                  <div className={`p-3 rounded-lg text-xs font-bold mb-4 text-center ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* RESPONSIVE GRID for Names: Stacks on very small screens, 2 cols on small+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name*" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" required />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name*" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" required />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Work Email*" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" required />

                  {/* Stacks vertically on mobile, 2 columns on medium+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PhoneInput defaultCountry="US" placeholder="Phone Number*" value={phone} onChange={handlePhoneChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all [&_input]:bg-transparent [&_input]:border-none [&_input]:outline-none [&_input]:py-3 [&_input]:flex-1" />
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company*" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-red-500 outline-none focus:ring-1 focus:ring-red-500 transition-all" required />
                  </div>

                  <Select options={formattedCountries} value={selectedCountry} onChange={handleCountryChange} placeholder="Select Country" className="text-sm" styles={{ control: (base) => ({ ...base, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '0.5rem', padding: '2px', minHeight: '42px' }) }} />
                  <textarea name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:border-red-500 outline-none resize-none" required />

                  <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 group active:scale-95 duration-200">
                    {status.type === 'success' ? "Submitted!" : "Submit Request"}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
};

// --- SUBCOMPONENTS (Memoized) ---
const KeyFeatureCard = memo(({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
    className="group bg-slate-50 border border-slate-100 p-5 rounded-xl flex items-start gap-3 hover:border-red-100 hover:shadow-md transition-all duration-300"
  >
    <FaCheckCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{feature}</span>
  </motion.div>
));

const WhyChooseCard = memo(({ point, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -15 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.08, duration: 0.3 }}
    className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-red-200 transition-colors"
  >
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 shrink-0">
      {index % 3 === 0 ? <FaRocket /> : index % 3 === 1 ? <FaShieldAlt /> : <FaChartLine />}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{point.title || point}</h3>
      {point.description && <p className="text-xs text-slate-500 leading-relaxed">{point.description}</p>}
    </div>
  </motion.div>
));

export default SubserviceDetailPage;