import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { FaArrowRight, FaExternalLinkAlt, FaClock } from "react-icons/fa";

const UpcomingProjects = () => {
  const [liveProjects, setLiveProjects] = useState([]);
  const [upcomingProjects, setUpcomingProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const fetchedProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter & Sort
        const live = fetchedProjects
          .filter((p) => p.status === "live")
          .sort((a, b) => a.order - b.order);
        
        const upcoming = fetchedProjects
          .filter((p) => p.status === "upcoming")
          .sort((a, b) => a.order - b.order);

        setLiveProjects(live);
        setUpcomingProjects(upcoming);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dzdnwpocf/image/upload/v1751570865/rc3ejoyp5eigecdcjbbz.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-0" />
        
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative z-10 px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeInUp} className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
              Portfolio
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Our Projects
            </motion.h1>
            <motion.div variants={fadeInUp} className="h-1 w-20 bg-red-600 mx-auto rounded-full mt-6" />
          </motion.div>
        </div>
      </div>

      {/* --- LIVE PROJECTS SECTION --- */}
      {liveProjects.length > 0 && (
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Live Projects</h2>
              <p className="text-slate-500 text-lg">Explore our recently delivered success stories.</p>
            </motion.div>

            <div className="space-y-20">
              {liveProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${
                    index % 2 !== 0 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2">
                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={project.projectImage || "/assets/placeholder-project.jpg"}
                        alt={project.title}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {project.serviceId || "Project"}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{project.title}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed mb-8">
                      {project.description}
                    </p>
                    
                    {project.projectLink && (
                      <a
                        href={project.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/30 group"
                      >
                        View Live Site
                        <FaExternalLinkAlt className="text-xs group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- UPCOMING PROJECTS SECTION --- */}
      {upcomingProjects.length > 0 && (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Coming Soon</h2>
              <p className="text-slate-500 text-lg">Exciting innovations currently in development.</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            >
              {upcomingProjects.map((project) => (
                <motion.div 
                  key={project.id} 
                  variants={fadeInUp}
                  className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500 flex flex-col hover:-translate-y-2"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10" />
                    <img
                      src={project.projectImage || "/assets/placeholder-upcoming.jpg"}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm z-20">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        <FaClock className="text-red-500" /> In Progress
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                      {project.description}
                    </p>
                    
                    {project.projectLink ? (
                      <a
                        href={project.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors mt-auto"
                      >
                        Preview <FaArrowRight />
                      </a>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-auto">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

    </div>
  );
};

export default UpcomingProjects;