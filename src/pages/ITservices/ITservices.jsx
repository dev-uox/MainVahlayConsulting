import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import slugify from "slugify";
import { useNav } from "../../contexts/NavContext";
import { motion } from "framer-motion";
import { FaArrowRight, FaCode, FaRocket, FaShieldAlt, FaHeadset } from "react-icons/fa";

const CategoryServicesPage = () => {
  const { categoryId, setCategoryId, setServiceId, setServiceName1, setCategoryName1 } = useNav();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Animation Variants
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

  useEffect(() => {
    const fetchCategoryAndServices = async () => {
      setLoading(true);
      setError("");

      try {
        if (!categoryId) {
           // Fallback or handle missing ID if accessed directly without context
           // In a real app, you might want to redirect or fetch based on URL slug
           setError("Category ID missing. Please navigate from the home page.");
           setLoading(false);
           return;
        }

        // Fetch category details
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
          setError("Category not found.");
          setLoading(false);
          return;
        }

        setCategory({ id: categorySnap.id, ...categorySnap.data() });

        // Fetch services
        const servicesRef = collection(db, `categories/${categoryId}/services`);
        const servicesSnapshot = await getDocs(servicesRef);

        let fetchedServices = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching category or services:", error);
        setError("Error loading services.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndServices();
  }, [categoryId]);

  if (loading) return <div className="min-h-screen bg-white" />;
  if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Background with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url(${category.image || '/assets/default-category.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-0" />
        
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-4">
               <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Category
               </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Our {category.name} <span className="text-red-500">Solutions</span>
            </motion.h1>
            
            <motion.nav variants={fadeInUp} className="text-sm font-medium text-slate-400 flex items-center justify-center gap-2">
              <Link to="/" className="hover:text-white transition-colors">Home</Link> 
              <span className="text-red-600">•</span> 
              <span className="text-white">{category.name}</span>
            </motion.nav>
          </motion.div>
        </div>
      </div>

      {/* --- SERVICES SECTION --- */}
      <section className="py-16 bg-slate-50 relative border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="text-center mb-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Our Services</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-2">
              Discover cutting-edge {category.name} solutions designed to empower your business growth.
            </p>
            <p className="text-sm text-slate-400 font-medium">
              {category.description}
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {services.map((service) => (
              <motion.div 
                key={service.id} 
                variants={fadeInUp}
                className="h-full"
              >
                <Link
                  to={
                    `/categories/${encodeURIComponent(slugify(category.name, { replacement: "-", lower: true }))}` +
                    `/services/${encodeURIComponent(slugify(service.name, { replacement: "-", lower: true }))}`
                  }
                  onClick={() => {
                    setCategoryId(categoryId);
                    setServiceId(service.id);
                    setCategoryName1(category.name);
                    setServiceName1(service.name);
                  }}
                  className="group flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.1)] hover:border-red-200 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                    <img
                      src={service.image || '/assets/default-service.jpg'}
                      alt={service.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">
                      {service.title || "Specialized solutions tailored for your business needs."}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors mt-auto">
                      Learn More <FaArrowRight className="text-[10px] transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- WHY CHOOSE US (Dark Mode) --- */}
      <section className="py-16 bg-slate-900 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="mb-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why Choose Us?</h2>
            <p className="text-slate-400 text-lg">
              We provide expert solutions and top-notch services in {category.name} to help your business thrive.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { title: "Expert Team", desc: "Skilled professionals with deep industry knowledge.", icon: FaCode },
              { title: "Latest Tech", desc: "Using cutting-edge tools & modern frameworks.", icon: FaRocket },
              { title: "Scalable", desc: "We design for long-term growth & sustainability.", icon: FaShieldAlt },
              { title: "24/7 Support", desc: "Always here whenever you need assistance.", icon: FaHeadset },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-red-500/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-red-500 text-xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default CategoryServicesPage;