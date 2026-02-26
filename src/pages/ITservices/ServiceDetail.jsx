import { useEffect, useState, useMemo, memo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaLightbulb,
  FaPencilRuler,
  FaServer,
  FaBug,
  FaCloud,
  FaArrowRight,
  FaExclamationTriangle
} from "react-icons/fa";
import slugify from "slugify";

// --- GLOBAL CACHE (Lives outside the component) ---
// This map persists as long as the user stays on the website (SPA navigation)
const pageCache = new Map();

// --- STATIC VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const ServiceDetail = () => {
  const { categorySlug, serviceSlug } = useParams();

  // --- STATE ---
  const [categoryName, setCategoryName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [service, setService] = useState(null);
  const [subservices, setSubservices] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `${categorySlug}/${serviceSlug}`; // Unique ID for this page

    const fetchServiceData = async () => {
      try {
        setError(null);

        // --- CACHE CHECK ---
        // If we have visited this page before, use the saved data immediately.
        if (pageCache.has(cacheKey)) {
          console.log("⚡ Loaded from Cache (Instant):", cacheKey);
          const cachedData = pageCache.get(cacheKey);

          if (isMounted) {
            setCategoryName(cachedData.categoryName);
            setServiceName(cachedData.serviceName);
            setService(cachedData.service);
            setSubservices(cachedData.subservices);
            setLoading(false);
          }
          return; // STOP HERE - No network request needed!
        }

        // If not in cache, trigger loading and fetch from DB
        if (isMounted) setLoading(true);
        console.log("🌐 Fetching from Network:", cacheKey);

        // --- STEP 1: FIND CATEGORY ---
        let categoryDoc = null;
        const categoriesRef = collection(db, "categories");

        // Strategy A: Fast Lookup
        const catQuery = query(categoriesRef, where("slug", "==", categorySlug), limit(1));
        const catSnap = await getDocs(catQuery);

        if (!catSnap.empty) {
          categoryDoc = catSnap.docs[0];
        } else {
          // Strategy B: Fallback Scan
          const allCats = await getDocs(categoriesRef);
          categoryDoc = allCats.docs.find(doc =>
            slugify(doc.data().name, { lower: true }) === categorySlug
          );
        }

        if (!categoryDoc) throw new Error("Category not found");

        // --- STEP 2: FIND SERVICE ---
        let serviceDoc = null;
        const servicesRef = collection(db, `categories/${categoryDoc.id}/services`);

        // Strategy A: Fast Lookup
        const servQuery = query(servicesRef, where("slug", "==", serviceSlug), limit(1));
        const servSnap = await getDocs(servQuery);

        if (!servSnap.empty) {
          serviceDoc = servSnap.docs[0];
        } else {
          // Strategy B: Fallback Scan
          const allServices = await getDocs(servicesRef);
          serviceDoc = allServices.docs.find(doc =>
            slugify(doc.data().name, { lower: true }) === serviceSlug
          );
        }

        if (!serviceDoc) throw new Error("Service not found");

        const serviceData = { ...serviceDoc.data() };
        const serviceNameData = serviceDoc.data().name;
        const categoryNameData = categoryDoc.data().name;

        // --- STEP 3: FETCH SUBSERVICES ---
        const subSnap = await getDocs(
          collection(db, `categories/${categoryDoc.id}/services/${serviceDoc.id}/subservices`)
        );
        const subservicesData = subSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // --- SAVE TO CACHE ---
        // Store the result so next time it is instant
        pageCache.set(cacheKey, {
          categoryName: categoryNameData,
          serviceName: serviceNameData,
          service: serviceData,
          subservices: subservicesData
        });

        // --- UPDATE STATE ---
        if (isMounted) {
          setCategoryName(categoryNameData);
          setServiceName(serviceNameData);
          setService(serviceData);
          setSubservices(subservicesData);
        }

      } catch (err) {
        console.error("Error fetching service:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServiceData();

    return () => { isMounted = false; };
  }, [categorySlug, serviceSlug]);

  // --- MEMOIZED DATA ---
  const seoData = useMemo(() => {
    if (!service) return null;
    return {
      title: service.seoTitle || service.name,
      description: service.seoDescription || "",
      keywords: Array.isArray(service.seoKeywords) ? service.seoKeywords.join(", ") : ""
    };
  }, [service]);

  const processSteps = useMemo(() => [
    { icon: FaLightbulb, title: "Discovery", desc: "Research & Needs" },
    { icon: FaPencilRuler, title: "Design", desc: "Prototyping" },
    { icon: FaServer, title: "Develop", desc: "Build & Code" },
    { icon: FaBug, title: "Testing", desc: "QA & Validate" },
    { icon: FaCloud, title: "Deploy", desc: "Launch & Scale" }
  ], []);

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
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Service</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <>
      {seoData && (
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
        </Helmet>
      )}

      {service && (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-hidden">

          {/* HERO */}
          <div className="relative h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
            <div
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${service.image || '/assets/default-service.jpg'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-red-900/20 z-0" />

            <div className="container relative z-10 px-4 md:px-6 text-center max-w-3xl mx-auto mt-10">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">{categoryName}</span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                  {service.name}
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
                  {service.title}
                </motion.p>
              </motion.div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <section className="py-12 bg-white relative border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="max-w-4xl mx-auto text-center"
              >
                <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Overview</span>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                  {service.description}
                </p>
              </motion.div>
            </div>
          </section>

          {/* SUBSERVICES */}
          {subservices.length > 0 && (
            <section className="py-16 bg-slate-50 relative">
              <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Core Capabilities</h3>
                  <div className="h-0.5 w-12 bg-red-600 mx-auto" />
                </motion.div>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                  {subservices.map((sub) => (
                    <SubServiceCard key={sub.id} sub={sub} categoryName={categoryName} serviceName={serviceName} />
                  ))}
                </motion.div>
              </div>
            </section>
          )}

          {/* PROCESS */}
          <section className="py-16 bg-white relative border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12 max-w-3xl mx-auto">
                <span className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Methodology</span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Our Process</h1>
                <p className="text-sm text-slate-500">Streamlined, innovative, and results-driven development phases.</p>
              </motion.div>

              <div className="relative max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-red-100 z-0" />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
                  {processSteps.map((step, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.4 }} className="flex flex-col items-center text-center group bg-white">
                      <div className="w-16 h-16 bg-white border-2 border-red-100 rounded-full flex items-center justify-center relative mb-4 shadow-sm group-hover:border-red-600 transition-colors duration-300 z-10">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-lg shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                          <step.icon />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* WHY CHOOSE US */}
          {service.whyChooseUs && service.whyChooseUs.length > 0 && (
            <section className="py-16 bg-slate-900 relative overflow-hidden">
              <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Why Choose Us?</h3>
                  <div className="h-0.5 w-12 bg-red-600 mx-auto opacity-80" />
                </motion.div>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                  {service.whyChooseUs.map((point, index) => (
                    <motion.div key={index} variants={fadeInUp} className="group flex items-start gap-3 bg-white/[0.05] border border-white/10 rounded-xl p-4 hover:bg-white/[0.1] hover:border-red-600/50 transition-all duration-300">
                      <FaCheckCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-xs leading-relaxed font-medium group-hover:text-white transition-colors">{point}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
};

// --- SUBCOMPONENT (Memoized) ---
const SubServiceCard = memo(({ sub, categoryName, serviceName }) => (
  <motion.div variants={fadeInUp} className="h-full">
    <Link
      to={`/categories/${encodeURIComponent(slugify(categoryName, { lower: true }))}/services/${encodeURIComponent(slugify(serviceName, { lower: true }))}/subservices/${encodeURIComponent(slugify(sub.name, { lower: true }))}`}
      className="group flex flex-col h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-red-600 transition-all duration-300"
    >
      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 text-lg mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
        {sub.icon ? <img src={sub.icon} alt={sub.name} className="w-6 h-6 object-contain" /> : <FaServer />}
      </div>
      <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{sub.name}</h4>
      <p className="text-xs text-slate-500 flex-grow mb-4 leading-relaxed line-clamp-2">{sub.title}</p>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-600 opacity-80 group-hover:opacity-100 transition-opacity">
        Learn More <FaArrowRight className="text-[8px]" />
      </div>
    </Link>
  </motion.div>
));

export default memo(ServiceDetail);