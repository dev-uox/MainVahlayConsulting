import React, { useState, useEffect, useRef } from "react";
import { MdCall } from "react-icons/md";
import { FaBars, FaTimes, FaChevronDown, FaAngleRight } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import SearchComponent from "../pages/SearchComponent";
import slugify from "slugify";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false); // Desktop use
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false); // Mobile use
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpenServiceId, setMobileOpenServiceId] = useState(null);

  const auth = getAuth();
  const mobileMenuRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop: Auto-select first service
  useEffect(() => {
    if (isServicesOpen && services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [isServicesOpen, services]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        checkUserRole(authUser.email);
      } else {
        setUser(null);
        setRole("user");
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserRole = async (email) => {
    try {
      const userDocSnapshot = await getDoc(doc(db, "users", email));
      if (userDocSnapshot.exists()) {
        const userRole = userDocSnapshot.data().role || "user";
        setRole(userRole);
        setIsAdmin(userRole === "admin");
      }
    } catch (err) {
      console.error("Role fetch error:", err);
    }
  };

  // Fetch Firebase Data
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const servicesData = [];
        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryId = categoryDoc.id;
          const categoryName = categoryDoc.data().name;
          const servicesSnap = await getDocs(
            collection(db, `categories/${categoryId}/services`),
          );

          for (const serviceDoc of servicesSnap.docs) {
            const subSnap = await getDocs(
              collection(
                db,
                `categories/${categoryId}/services/${serviceDoc.id}/subservices`,
              ),
            );
            servicesData.push({
              id: serviceDoc.id,
              name: serviceDoc.data().name,
              categoryId,
              categoryName,
              subservices: subSnap.docs.map((s) => ({ id: s.id, ...s.data() })),
            });
          }
        }
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(e.target)
      )
        setIsServicesOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        isMenuOpen
      )
        toggleMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "auto";
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-red-600 font-semibold"
      : "hover:text-red-600 text-gray-800";

  // Slug Generator Helper
  const getSlugLink = (service, sub) => {
    const catSlug = slugify(service.categoryName, { lower: true });
    const servSlug = slugify(service.name, { lower: true });
    const subSlug = slugify(sub.name, { lower: true });
    return `/categories/${catSlug}/services/${servSlug}/subservices/${subSlug}`;
  };

  return (
    <>
      <nav
        className={`bg-white py-2 px-4 md:px-8 sticky top-0 z-[60] transition-all duration-300 w-full ${scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-white"}`}
      >
        <div className="mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <motion.div className="relative" whileHover={{ scale: 1.02 }}>
              <img
                src="/assets/logo1.png"
                alt="Logo"
                className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              />
              <img
                src="/assets/logorings.png"
                className="h-12 md:h-14 lg:h-16 w-auto absolute top-0 left-0 logoRingsSpin object-contain"
                alt="Rings"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${isActive("/")}`}
            >
              Home
            </Link>

            <div className="relative" ref={servicesDropdownRef}>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all whitespace-nowrap ${isServicesOpen ? "text-red-600 bg-red-50" : "text-gray-800 hover:bg-gray-50"}`}
              >
                Services{" "}
                <FaChevronDown
                  className={`ml-1 text-[10px] transition-transform ${isServicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    // Added max-w and overflow adjustments for smaller laptop screens
                    className="absolute left-0 mt-4 w-[800px] max-w-[90vw] bg-white shadow-2xl rounded-2xl p-6 z-[70] border border-gray-100 flex overflow-hidden"
                  >
                    <div className="w-1/3 border-r pr-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 sticky top-0 bg-white z-10 py-1">
                        Categories
                      </h3>
                      <ul className="space-y-1">
                        {services.map((s) => (
                          <li
                            key={s.id}
                            onClick={() => setSelectedService(s)}
                            className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedService?.id === s.id ? "bg-red-600 text-white shadow-md" : "hover:bg-gray-100 text-gray-700"}`}
                          >
                            <span className="text-sm font-semibold truncate">
                              {s.name}
                            </span>
                            <FaAngleRight className="text-[10px] shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-2/3 pl-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 sticky top-0 bg-white z-10 py-1">
                        {selectedService?.name} Solutions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService?.subservices.map((sub) => (
                          <Link
                            key={sub.id}
                            to={getSlugLink(selectedService, sub)}
                            onClick={() => setIsServicesOpen(false)}
                            className="flex items-center p-3 rounded-xl hover:bg-red-50 group transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-red-100 shrink-0">
                              <img
                                src={sub.icon}
                                alt=""
                                className="w-4 h-4 object-contain"
                              />
                            </div>
                            <span className="text-sm text-gray-700 font-medium group-hover:text-red-600 line-clamp-2 leading-tight">
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/solutions"
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${isActive("/solutions")}`}
            >
              Solutions
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${isActive("/projects")}`}
            >
              Projects
            </Link>
            <Link
              to="/blogs"
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${isActive("/blogs")}`}
            >
              Blogs
            </Link>
            <Link
              to="/about_us"
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${isActive("/about_us")}`}
            >
              About Us
            </Link>
            <Link
              to="/contact_us"
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${isActive("/contact_us")}`}
            >
              Contact Us
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <SearchComponent />
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={role === "admin" ? "/jobs" : "/profile"}
                  className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black transition-all whitespace-nowrap"
                >
                  {role === "admin" ? "Admin Portal" : "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 font-bold text-sm px-4 whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-gray-800 text-sm font-bold px-4 hover:text-red-600 whitespace-nowrap"
                >
                  Join Us
                </Link>
                <Link
                  to="/careers"
                  className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-red-700 shadow-lg transition-all whitespace-nowrap"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <SearchComponent mobile={true} />
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[90] lg:hidden flex flex-col shadow-2xl"
              ref={mobileMenuRef}
            >
              <div className="p-6 flex justify-between items-center border-b">
                <img
                  src="/assets/logo1.png"
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={toggleMenu}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {user && (
                  <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shrink-0">
                      {user.email.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {user.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-red-600 font-bold uppercase">
                        {role}
                      </p>
                    </div>
                  </div>
                )}

                <Link
                  to="/"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Home
                </Link>

                {/* Mobile Services Accordion */}
                <div className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() =>
                      setIsMobileServicesOpen(!isMobileServicesOpen)
                    }
                    className="flex justify-between items-center w-full p-4 text-gray-800 font-bold"
                  >
                    Services{" "}
                    <FaChevronDown
                      className={`transition-transform ${isMobileServicesOpen ? "rotate-180 text-red-600" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileServicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-2 space-y-1"
                      >
                        {loading ? (
                          <div className="p-4 text-center text-sm text-gray-400">
                            Loading services...
                          </div>
                        ) : (
                          services.map((service) => (
                            <div
                              key={service.id}
                              className="bg-gray-50 rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setMobileOpenServiceId(
                                    mobileOpenServiceId === service.id
                                      ? null
                                      : service.id,
                                  )
                                }
                                className="flex justify-between items-center w-full p-4 text-sm font-bold text-gray-700"
                              >
                                {service.name}
                                <FaChevronDown
                                  className={`text-[10px] transition-transform ${mobileOpenServiceId === service.id ? "rotate-180" : ""}`}
                                />
                              </button>
                              <AnimatePresence>
                                {mobileOpenServiceId === service.id && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-white px-2 pb-2"
                                  >
                                    {service.subservices.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={getSlugLink(service, sub)}
                                        onClick={toggleMenu}
                                        className="flex items-center p-3 text-sm text-gray-600 hover:text-red-600 font-medium border-b border-gray-50 last:border-0"
                                      >
                                        <img
                                          src={sub.icon}
                                          alt=""
                                          className="w-4 h-4 mr-3 opacity-60 object-contain"
                                        />
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/solutions"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Solutions
                </Link>
                <Link
                  to="/projects"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Projects
                </Link>
                <Link
                  to="/blogs"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Blogs
                </Link>
                <Link
                  to="/about_us"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  About Us
                </Link>
                <Link
                  to="/contact_us"
                  onClick={toggleMenu}
                  className="block p-4 text-gray-800 font-bold hover:bg-gray-50 rounded-xl"
                >
                  Contact Us
                </Link>

                {/* Mobile Specific Links */}
                {!user ? (
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <Link
                      to="/signup"
                      onClick={toggleMenu}
                      className="text-center py-3 bg-gray-100 rounded-xl text-gray-800 font-bold text-sm"
                    >
                      Join Us
                    </Link>
                    <Link
                      to="/careers"
                      onClick={toggleMenu}
                      className="text-center py-3 bg-red-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-red-200"
                    >
                      Apply Now
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    <Link
                      to={role === "admin" ? "/jobs" : "/profile"}
                      onClick={toggleMenu}
                      className="block text-center py-3 bg-gray-900 text-white rounded-xl font-bold"
                    >
                      {role === "admin" ? "Admin Portal" : "My Profile"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center py-3 border-2 border-red-600 text-red-600 rounded-xl font-bold"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Mobile Call Request */}
                <div className="p-4">
                  <button
                    onClick={() => setIsCallOpen(!isCallOpen)}
                    className="w-full p-4 bg-red-600 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-red-100"
                  >
                    <span className="flex items-center font-bold">
                      <MdCall className="mr-2" /> Request A Call
                    </span>
                    <FaChevronDown
                      className={`transition-transform ${isCallOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isCallOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-2 overflow-hidden"
                      >
                        <div className="p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 text-center border">
                          USA/Canada: +1 (408) 372-5981
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 text-center border">
                          India: +91 79492 17538
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
