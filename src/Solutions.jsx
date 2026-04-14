import React, { useEffect, useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Check your path
import { Helmet } from 'react-helmet-async';
import slugify from "slugify";
import { FaArrowRight, FaRocket, FaExclamationTriangle } from "react-icons/fa";
const SolutionsBg = "/assets/BusinessSolutionsBG.png";

// --- GLOBAL CACHE ---
// Stores the fully assembled data structure (Categories + Services)
let solutionsCache = null;

// --- STATIC VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const Solutions = () => {
  // --- STATE ---
  const [categories, setCategories] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setError(null);

        // 1. CACHE CHECK
        if (solutionsCache) {
          console.log("⚡ Loaded Solutions from Cache");
          if (isMounted) {
            setCategories(solutionsCache);
            setLoading(false);
          }
          return;
        }

        // 2. FETCH FROM NETWORK
        if (isMounted) setLoading(true);
        console.log("🌐 Fetching Solutions from Firestore...");

        const categoriesSnapshot = await getDocs(collection(db, "categories"));

        // Optimization: Fetch all sub-collections in PARALLEL using Promise.all
        // This is much faster than a standard for-loop
        const dataPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
          const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };

          // Fetch services for this specific category
          const servicesSnapshot = await getDocs(collection(db, `categories/${categoryDoc.id}/services`));
          const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          return { ...categoryData, services };
        });

        const resolvedData = await Promise.all(dataPromises);

        // 3. SAVE TO CACHE & STATE
        solutionsCache = resolvedData;

        if (isMounted) {
          setCategories(resolvedData);
        }

      } catch (err) {
        console.error("Error fetching solutions:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Solutions</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      <Helmet>
        <title>Business Solutions | Vahlay Consulting Services</title>
        <meta name="description" content="Explore Vahlay Consulting’s expert solutions in application development, website creation, digital marketing, and telesales that driving growth globally." />
        <meta name="keywords" content="business solutions, application development, website design, digital marketing services, telesales outsourcing, IT consulting, Vahlay Consulting" />
        <link rel="canonical" href="https://vahlayconsulting.com/solutions" />
      </Helmet>

      {/* --- HERO SECTION --- */}
      <div className="relative h-[430px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${SolutionsBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-0" />

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Business Solutions
            </motion.h1>
            <motion.div variants={fadeInUp} className="h-1 w-20 bg-red-600 mx-auto rounded-full mt-6" />
          </motion.div>
        </div>
      </div>

      {/* --- SOLUTIONS CONTENT --- */}
      <div className="py-20 bg-white relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">

          {/* Intro Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-10 text-center text-white shadow-xl shadow-red-100"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Explore Exclusive Solutions</h2>
            <p className="text-red-100 text-lg max-w-2xl mx-auto">
              Unlock cutting-edge strategies designed to elevate your business performance and drive sustainable growth.
            </p>
          </motion.div>

          {/* Categories & Services */}
          {categories.map((category) => (
            <div key={category.id} className="mb-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h2 className="text-3xl font-black text-slate-900">{category.name}</h2>
              </motion.div>

              <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {category.services.length > 0 ? (
                  category.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      categoryName={category.name}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 italic col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No services currently available in this category.
                  </p>
                )}
              </motion.div>
            </div>
          ))}

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[2rem] p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-black text-white mb-4">Ready to Transform Your Business?</h3>
              <p className="text-slate-400 text-lg mb-8">
                Let's discuss how our tailored solutions can drive your success in today's competitive landscape.
              </p>
              <Link to="/contact_us">
                <button className="bg-red-600 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 mx-auto">
                  Start Conversation <FaRocket />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENT (Memoized for Performance) ---
const ServiceCard = memo(({ service, categoryName }) => {
  return (
    <motion.div variants={fadeInUp} className="group h-full">
      <Link
        to={`/categories/${encodeURIComponent(slugify(categoryName, { replacement: "-", lower: true }))}/services/${encodeURIComponent(slugify(service.name, { replacement: "-", lower: true }))}`}
        className="flex flex-col h-full bg-white border border-red-200 rounded-2xl overflow-hidden shadow-xl shadow-red-500/10 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-transparent z-10" />
          <img
            src={service.image || "/assets/placeholder.png"}
            alt={service.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
            {service.name}
          </h4>
          <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">
            {service.title || "Tailored solutions for your specific business needs."}
          </p>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 mt-auto">
            Details <FaArrowRight className="text-[10px]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default Solutions;