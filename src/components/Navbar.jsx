import React, { useState, useEffect, useRef } from "react";
import { MdSearch, MdLocationOn, MdCall } from "react-icons/md";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaAngleRight,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import SearchComponent from "../pages/SearchComponent";
import slugify from "slugify";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [role, setRole] = useState("user");

  const auth = getAuth();
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Select the first service when dropdown opens and services are fetched
  useEffect(() => {
    if (isServicesOpen && services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [isServicesOpen, services]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await checkUserRole(authUser.email);
      } else {
        setUser(null);
        setRole("user");
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const servicesData = [];
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        const categoryName = categoryDoc.data().name;

        const servicesCol = collection(db, `categories/${categoryId}/services`);
        const servicesSnap = await getDocs(servicesCol);

        for (const serviceDoc of servicesSnap.docs) {
          const serviceId = serviceDoc.id;
          const serviceName = serviceDoc.data().name;

          const subSnap = await getDocs(
            collection(
              db,
              `categories/${categoryId}/services/${serviceId}/subservices`
            )
          );

          servicesData.push({
            id: serviceId,
            name: serviceName,
            categoryId,
            categoryName,
            subservices: subSnap.docs.map((subDoc) => ({
              id: subDoc.id,
              name: subDoc.data().name,
              icon: subDoc.data().icon,
            })),
          });
        }
      }

      setServices(servicesData);
      setLoading(false);
    };

    fetchServices();
  }, []);

  const checkUserRole = async (email) => {
    try {
      const userDocRef = doc(db, "users", email);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();
        const userRole = data.role || "user";
        setRole(userRole);
        setIsAdmin(userRole === "admin");
      } else {
        setRole("user");
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Role fetch error:", err);
      setRole("user");
      setIsAdmin(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole("user");
      setIsAdmin(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const toggleCall = () => setIsCallOpen(!isCallOpen);

  useEffect(() => {
    if (searchQuery) {
      const filtered = services.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [searchQuery, services]);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-red-600 font-semibold"
      : "hover:text-red-600";
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  }, [location]);

  return (
    <>
<<<<<<< HEAD
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
                {/* {role === "admin" && (
                  <Link
                    to="/profile"
                    className="text-gray-800 font-bold text-sm px-4 hover:text-red-600 whitespace-nowrap"
                  >
                    Profile
                  </Link>
                )} */}
                <Link
                  to={role === "admin" ? "/jobs" : "/profile"}
                  className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black transition-all whitespace-nowrap"
                >
                  {role === "admin" ? "Admin Portal" : "Profile"}
                </Link>
=======
      <nav className="bg-white py-1 px-4 md:px-8 shadow-md sticky top-0 z-50">
        <div className="mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center relative">
              <Link to="/Home" className="flex items-center">
                <div className="relative">
                  <img
                    src="/assets/logo1.png"
                    alt="Vahlay Consulting Logo"
                    className="h-16 w-auto"
                  />
                  <img
                    src="/assets/logorings.png"
                    className="h-16 w-auto absolute top-0 left-0 logoRingsSpin"
                    alt="Logo Rings"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3 text-gray-900 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md transition-colors ${isActive("/")}`}
              >
                Home
              </Link>

              <div className="relative" ref={dropdownRef}>
>>>>>>> ce7fac5 (Save work before sync)
                <button
                  className={`flex items-center text-gray-900 hover:text-red-600 transition-colors ${isActive(
                    "/services"
                  )}`}
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                >
                  <span>Services</span>{" "}
                  <FaChevronDown className="ml-1 text-xs" />
                </button>

                {isServicesOpen && (
                  <div className="absolute left-0 mt-4 w-[800px] bg-white shadow-lg rounded-lg p-6 z-50">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Services List */}
                      <div>
                        {loading ? (
                          <div className="flex justify-center items-center h-40">
                            <div
                              className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-red-500 rounded-full"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div>
                        ) : (
                          <ul className="space-y-4">
                            {services.map((service) => (
                              <li
                                key={service.id}
                                className={`p-2 py-4 text-center rounded-lg cursor-pointer text-sm transition-all ${selectedService?.id === service.id
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                onClick={() => setSelectedService(service)}
                              >
                                {service.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Subservices List */}
                      <div className="border-l-2 border-gray-200 pl-6 text-left">
                        {selectedService && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {selectedService.name} Subservices
                            </h3>
                            <ul className="text-gray-700 space-y-3 text-sm">
                              {selectedService.subservices?.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={
                                    `/categories/${encodeURIComponent(
                                      slugify(selectedService?.categoryName, {
                                        replacement: "-",
                                        lower: true,
                                      })
                                    )}` +
                                    `/services/${encodeURIComponent(
                                      slugify(selectedService?.name, {
                                        replacement: "-",
                                        lower: true,
                                      })
                                    )}` +
                                    `/subservices/${encodeURIComponent(
                                      slugify(sub.name, {
                                        replacement: "-",
                                        lower: true,
                                      })
                                    )}`
                                  }
                                  onClick={() => {
                                    setIsServicesOpen(false);
                                  }}
                                >
                                  <li className="hover:text-red-500 transition-all flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                                    <FaAngleRight className="text-red-500 text-xs" />
                                    <img
                                      src={sub.icon}
                                      alt={sub.name}
                                      className="w-4 h-4 object-contain"
                                    />
                                    <span className="text-sm font-medium">
                                      {sub.name}
                                    </span>
                                  </li>
                                </Link>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {[
                { path: "/projects", label: "Projects" },
                { path: "/solutions", label: "Solutions" },
                { path: "/blogs", label: "Blogs" },
                { path: "/about_us", label: "About Us" },
                { path: "/contact_us", label: "Contact Us" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md hover:text-red-600 transition-colors ${isActive(
                    path
                  )}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="relative flex items-center bg-gray-100 rounded-full border">
                <SearchComponent />
              </div>

              {user ? (
                <>
                  {/* Show Admin Portal button only for admin role */}
                  {role === "admin" && (
                    <Link
                      to="/jobs"
                      className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      Admin Portal
                    </Link>
                  )}

                  {/* Show other role-specific buttons */}
                  {role === "recruiter" && (
                    <Link
                      to="/manage-emp"
                      className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      Recruiter Panel
                    </Link>
                  )}

                  {role === "trainer" && (
                    <Link
                      to="/trainerdailyreport"
                      className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      Trainer Panel
                    </Link>
                  )}

                  {role === "user" && (
                    <Link
                      to="/profile"
                      className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      My Profile
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/careers"
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm"
                  >
                    Apply Now
                  </Link>

                  <Link
                    to="/signup"
                    className="border border-red-600 text-red-600 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition-colors text-sm"
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4 justify-center">
              {/* Mobile Search Icon */}
              <div className="flex max-w-xs items-center">
                <SearchComponent mobile={true} />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-red-600 transition-colors p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
          {/* Mobile Menu Content */}
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            ref={dropdownRef}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Link to="/Home" onClick={() => setIsMenuOpen(false)}>
                    <div className="relative">
                      <img
                        src="/assets/logo1.png"
                        alt="Vahlay Consulting Logo"
                        className="h-16 w-auto"
                      />
                      <img
                        src="/assets/logorings.png"
                        className="h-16 w-auto absolute top-0 left-0 logoRingsSpin"
                        alt="Logo Rings"
                      />
                    </div>
                  </Link>
                </div>
                <button
                  onClick={toggleMenu}
                  className="text-gray-700 hover:text-red-600 p-2"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* User Status Section */}
                <div className="p-4 bg-gray-50">
                  {user ? (
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Welcome, {user.email?.split("@")[0]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role === "admin" && (
                          <Link
                            to="/jobs"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 transition-colors text-xs flex-1 text-center"
                          >
                            Admin Portal
                          </Link>
                        )}
<<<<<<< HEAD
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
                    {role === "admin" && (
                      <Link
                        to="/profile"
                        onClick={toggleMenu}
                        className="block text-center py-3 border-2 border-gray-900 text-gray-900 rounded-xl font-bold"
                      >
                        My Profile
                      </Link>
                    )}
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
=======
                        {role === "recruiter" && (
                          <Link
                            to="/manage-emp"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-green-600 text-white px-3 py-2 rounded-full hover:bg-green-700 transition-colors text-xs flex-1 text-center"
                          >
                            Recruiter Panel
                          </Link>
                        )}
                        {role === "trainer" && (
                          <Link
                            to="/trainerdailyreport"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-purple-600 text-white px-3 py-2 rounded-full hover:bg-purple-700 transition-colors text-xs flex-1 text-center"
                          >
                            Trainer Panel
                          </Link>
                        )}
                        {role === "user" && (
                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-gray-700 text-white px-3 py-2 rounded-full hover:bg-gray-800 transition-colors text-xs flex-1 text-center"
                          >
                            My Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition-colors text-center text-sm"
>>>>>>> ce7fac5 (Save work before sync)
                      >
                        Join Us
                      </Link>
                      <Link
                        to="/careers"
                        onClick={() => setIsMenuOpen(false)}
                        className="border border-red-600 text-red-600 py-2 px-4 rounded-full hover:bg-red-600 hover:text-white transition-colors text-center text-sm"
                      >
                        Apply Now
                      </Link>
                    </div>
                  )}
                </div>

                {/* Call Request Section */}
                <div className="p-4 border-b">
                  <button
                    onClick={toggleCall}
                    className="flex items-center justify-center mx-auto text-red-600 font-semibold text-sm"
                  >
                    <MdCall className="mr-2" /> Requesting A Call{" "}
                    <FaChevronDown className="ml-2" />
                  </button>
                  {isCallOpen && (
                    <div className="bg-gray-100 p-3 space-y-2 rounded-lg mt-2">
                      <p className="bg-white text-gray-700 p-2 rounded text-center">
                        USA, Canada: +1 (408) 372-5981
                      </p>
                      <p className="bg-white text-gray-700 p-2 rounded text-center">
                        Bharat: +91 79492 17538
                      </p>
                    </div>
                  )}
                </div>

                {/* Location Section */}
                <div className="p-4 border-b">
                  <h3 className="text-center text-red-700 font-semibold mb-3">
                    We are located in
                  </h3>
                  <div className="flex justify-center space-x-4">
                    <a
                      href="https://www.google.com/maps/place/8+The+Green+Suite+A,+Dover,+DE+19901,+USA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/assets/USA flag.png"
                        alt="USA"
                        className="w-8 h-5 rounded-md"
                      />
                    </a>
                    <a
                      href="https://www.google.com/maps/place/235+Ferguson+Ave,+Cambridge,+ON+N1R+6G1,+Canada"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/assets/Canada Flag.png"
                        alt="Canada"
                        className="w-8 h-5 rounded-md"
                      />
                    </a>
                    <a
                      href="https://maps.app.goo.gl/hw6RLAKHRzr73hL39"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/assets/India Flag.jpg"
                        alt="India"
                        className="w-8 h-5 rounded-md"
                      />
                    </a>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-3 px-4 rounded-lg transition-colors ${isActive(
                          "/"
                        )}`}
                      >
                        Home
                      </Link>
                    </li>

                    <li>
                      <button
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                        className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>Services</span>
                        {isServicesOpen ? (
                          <FaChevronUp className="text-sm" />
                        ) : (
                          <FaChevronDown className="text-sm" />
                        )}
                      </button>

                      {isServicesOpen && (
                        <div className="mt-2 ml-4 space-y-2">
                          {loading ? (
                            <div className="text-center py-2">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                            </div>
                          ) : (
                            services.map((service) => (
                              <div key={service.id} className="space-y-1">
                                <button
                                  onClick={() =>
                                    setSelectedService(
                                      selectedService?.id === service.id
                                        ? null
                                        : service
                                    )
                                  }
                                  className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-sm">{service.name}</span>
                                  {selectedService?.id === service.id ? (
                                    <FaChevronUp className="text-xs" />
                                  ) : (
                                    <FaChevronDown className="text-xs" />
                                  )}
                                </button>

                                {selectedService?.id === service.id && (
                                  <div className="ml-3 space-y-1">
                                    {selectedService.subservices?.map(
                                      (subservice) => (
                                        <Link
                                          key={subservice.id}
                                          to={
                                            `/categories/${encodeURIComponent(
                                              slugify(service.categoryName, {
                                                replacement: "-",
                                                lower: true,
                                              })
                                            )}` +
                                            `/services/${encodeURIComponent(
                                              slugify(service.name, {
                                                replacement: "-",
                                                lower: true,
                                              })
                                            )}` +
                                            `/subservices/${encodeURIComponent(
                                              slugify(subservice.name, {
                                                replacement: "-",
                                                lower: true,
                                              })
                                            )}`
                                          }
                                          onClick={() => {
                                            setIsServicesOpen(false);
                                            setIsMenuOpen(false);
                                          }}
                                          className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                        >
                                          <FaAngleRight className="text-red-500 text-xs mr-2" />
                                          <img
                                            src={
                                              subservice.icon ||
                                              "/assets/default-icon.png"
                                            }
                                            alt={subservice.name}
                                            className="w-4 h-4 mr-2 object-contain"
                                          />
                                          <span>{subservice.name}</span>
                                        </Link>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </li>

                    {[
                      { path: "/projects", label: "Projects" },
                      { path: "/solutions", label: "Solutions" },
                      { path: "/blogs", label: "Blogs" },
                      { path: "/about_us", label: "About Us" },
                      { path: "/contact_us", label: "Contact Us" },
                    ].map(({ path, label }) => (
                      <li key={path}>
                        <Link
                          to={path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block py-3 px-4 rounded-lg transition-colors ${isActive(
                            path
                          )}`}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;