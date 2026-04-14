import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import slugify from "slugify";
import { useNav } from "../contexts/NavContext";
import { FaArrowRight } from "react-icons/fa";

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setCategoryId } = useNav();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Background Image with Red/Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dzdnwpocf/image/upload/v1751570849/kcip5tvkt0kilzirfhaq.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-0" />
        
        {/* Continuous Ambient Animation */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative z-10 px-4 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
              Global Solutions
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Our Premium Services
            </motion.h1>
            <motion.div variants={fadeInUp} className="h-1 w-20 bg-red-600 mx-auto rounded-full mt-6" />
          </motion.div>
        </div>
      </div>

      {/* --- SERVICES GRID SECTION --- */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">What We Offer</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              We offer a diverse range of specialized categories tailored to help your business grow and succeed in today’s competitive global market.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600 border-solid"></div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {categories.map((category) => (
                <motion.div 
                  key={category.id} 
                  variants={fadeInUp}
                  className="group h-full"
                >
                  <Link 
                    to={`/categories/${encodeURIComponent(slugify(category.name || "category", { replacement: "-", lower: true }))}`}
                    onClick={() => setCategoryId(category.id)}
                    /* UPDATED: Applied border-red-200 and shadow-xl shadow-red-500/10 permanently */
                    className="block h-full bg-white rounded-[2rem] overflow-hidden border border-red-200 shadow-xl shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      {/* UPDATED: Removed dark overlay so image is always bright */}
                      <div className="absolute inset-0 bg-transparent z-10" />
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <span className="text-4xl font-bold opacity-20">N/A</span>
                        </div>
                      )}
                      {/* Floating Badge */}
                      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/50">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Category</span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-8 flex flex-col flex-grow relative">
                      {/* Top Red Accent - UPDATED: Now permanently visible */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent" />
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                        {category.name || "Untitled Category"}
                      </h3>
                      
                      <p className="text-slate-500 leading-relaxed mb-6 flex-grow text-sm md:text-base">
                        {category.title || "Explore our specialized services in this category designed for maximum impact."}
                      </p>

                      {/* UPDATED: Changed text to permanent Red-600 */}
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 transition-colors mt-auto">
                        Explore Services <FaArrowRight className="text-[10px] transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;