import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Link } from "react-router-dom";
import slugify from "slugify";
import { Helmet } from 'react-helmet-async';
import { motion } from "framer-motion";
import { FaCalendarAlt, FaUser, FaArrowRight } from "react-icons/fa";
const BlogsBG = "/assets/BlogsBG.png";

// Helper to truncate text
const truncateText = (text, wordLimit = 15) => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const slugifyText = (text) =>
  slugify(text || "", {
    lower: true,
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    strict: true,
    trim: true,
  });

const BlogsPage = () => {
  const [categoryName, setCategoryName] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        if (cats.length > 0 && !selectedCategory) {
          setSelectedCategory(cats[0].id);
          setCategoryName(cats[0].name);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Load blogs when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(
          collection(db, "categories", selectedCategory, "blogs")
        );
        const now = Date.now();

        const blogsData = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((blog) => {
            if (!blog.scheduledTime || typeof blog.scheduledTime.toDate !== "function") {
              return true;
            }
            const blogTime = blog.scheduledTime.toDate().getTime();
            return blogTime <= now;
          });

        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory]);

  return (
    <div className="relative w-full min-h-screen bg-white font-sans text-slate-900">
      <Helmet>
        <title>Vahlay Consulting Blogs | Expert Insights</title>
        <meta
          name="description"
          content="Stay informed with expert insights from Vahlay Consulting. Explore blogs on tech trends, digital marketing, sales strategy, and business growth tips."
        />
        <meta name="keywords" content="Vahlay Consulting blog, business insights, digital marketing trends, technology updates, sales strategies" />
      </Helmet>

      {/* --- HERO SECTION --- */}
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${BlogsBG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-0" />

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Insights & News
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Explore the latest trends, strategies, and updates from the world of business and technology.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- CATEGORY TABS --- */}
      <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 md:justify-center min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCategoryName(cat.name);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${selectedCategory === cat.id
                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-white hover:text-red-600 hover:border-red-200"
                  }`}
              >
                {cat.name || cat.title || "Category"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- BLOG GRID --- */}
      <div className="container mx-auto px-4 py-12 md:py-16 min-h-[50vh]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">No blogs found in this category yet.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                variants={fadeInUp}
                /* UPDATED: Applied permanent Red Border and Red Shadow */
                className="group flex flex-col h-full bg-white rounded-2xl border border-red-200 shadow-xl shadow-red-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Image */}
                <Link
                  to={`/blogs/${encodeURIComponent(slugifyText(categoryName))}/${encodeURIComponent(slugifyText(blog.title))}`}
                  className="relative h-56 overflow-hidden bg-slate-100 block"
                >
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <span className="text-4xl font-bold opacity-20">Vahlay</span>
                    </div>
                  )}
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow-sm flex items-center gap-1.5">
                    <FaCalendarAlt className="text-red-500" />
                    {blog.date || "Latest"}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <FaUser className="text-red-400" />
                    <span>{blog.author || "Vahlay Team"}</span>
                  </div>

                  <Link
                    to={`/blogs/${encodeURIComponent(slugifyText(categoryName))}/${encodeURIComponent(slugifyText(blog.title))}`}
                    className="block group-hover:text-red-600 transition-colors"
                  >
                    <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight line-clamp-2" title={blog.title}>
                      {blog.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {truncateText(blog.subtitle || blog.content, 25)}
                  </p>

                  {/* Footer */}
                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                    <Link
                      to={`/blogs/${encodeURIComponent(slugifyText(categoryName))}/${encodeURIComponent(slugifyText(blog.title))}`}
                      /* UPDATED: Changed text to permanent Red-600 */
                      className="text-xs font-bold uppercase tracking-widest text-red-600 transition-colors flex items-center gap-2"
                    >
                      Read Article <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;