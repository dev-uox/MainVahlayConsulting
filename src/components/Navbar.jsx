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
      try {
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
      } catch (err) {
        console.error("Error fetching services:", err);
      }
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

  const isActive = (path) => {
    return location.pathname === path
      ? "text-red-600 font-semibold"
      : "hover:text-red-600 transition-colors";
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  }, [location]);

  return (
    <>
      <nav className="bg-white py-1 px-4 md:px-8 shadow-md sticky top-0 z-50">
        <div className="mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center relative">
              <Link to="/" className="flex items-center">
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
                <button
                  className={`flex items-center text-gray-900 hover:text-red-600 transition-colors ${isActive(
                    "/services"
                  )}`}
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                >
                  <span>Services</span>{" "}
                  <FaChevronDown className={`ml-1 text-xs transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                </button>

                {isServicesOpen && (
                  <div className="absolute left-0 mt-4 w-[800px] bg-white shadow-xl rounded-lg p-6 z-50 border border-gray-100 flex">
                    <div className="w-1/3 border-r pr-4 max-h-[60vh] overflow-y-auto">
                        <ul className="space-y-2">
                        {services.map((service) => (
                           <li
                           key={service.id}
                           className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all ${selectedService?.id === service.id
                               ? "bg-red-600 text-white shadow-md"
                               : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                             }`}
                           onClick={() => setSelectedService(service)}
                         >
                           <span className="text-sm font-semibold">{service.name}</span>
                           <FaAngleRight className="text-xs" />
                         </li>
                        ))}
                        </ul>
                    </div>
                    <div className="w-2/3 pl-6 max-h-[60vh] overflow-y-auto">
                        {selectedService && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                              {selectedService.name} Solutions
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
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
                                  className="flex items-center p-2 rounded-lg hover:bg-red-50 transition-colors group"
                                  onClick={() => setIsServicesOpen(false)}
                                >
                                  <FaAngleRight className="text-red-500 text-xs mr-2 group-hover:translate-x-1 transition-transform" />
                                  <img
                                    src={sub.icon || "/assets/default-icon.png"}
                                    alt={sub.name}
                                    className="w-4 h-4 mr-2 object-contain"
                                  />
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                                    {sub.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
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
                  className={`px-3 py-2 rounded-md transition-colors ${isActive(
                    path
                  )}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <SearchComponent />

              {user ? (
                <>
                  <Link
                    to={role === "admin" ? "/jobs" : 
                        role === "recruiter" ? "/manage-emp" : 
                        role === "trainer" ? "/trainerdailyreport" : "/profile"}
                    className="bg-gray-800 text-white px-5 py-2 rounded-full hover:bg-black transition-colors text-sm font-semibold"
                  >
                    {role === "admin" ? "Admin Portal" : 
                     role === "recruiter" ? "Recruiter Panel" : 
                     role === "trainer" ? "Trainer Panel" : "My Profile"}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="border border-red-600 text-red-600 px-5 py-2 rounded-full hover:bg-red-600 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Join Us
                  </Link>
                  <Link
                    to="/careers"
                    className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-semibold shadow-md shadow-red-100"
                  >
                    Apply Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <SearchComponent mobile={true} />
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
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-hidden">
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[70]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                 <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <img src="/assets/logo1.png" alt="Logo" className="h-12 w-auto" />
                 </Link>
                 <button onClick={toggleMenu} className="text-gray-700 p-2">
                    <FaTimes size={24} />
                 </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                 {user && (
                    <div className="p-4 bg-white border-b mb-2">
                        <p className="text-gray-600 text-sm">Signed in as</p>
                        <p className="font-bold text-gray-900 truncate">{user.email}</p>
                    </div>
                 )}

                 <nav className="p-2">
                    <ul className="space-y-1">
                        <li>
                            <Link to="/" className={`block p-4 rounded-lg ${isActive("/")}`}>Home</Link>
                        </li>
                        <li>
                            <button 
                                onClick={() => setIsServicesOpen(!isServicesOpen)}
                                className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-white text-left"
                            >
                                <span>Services</span>
                                <FaChevronDown className={`transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isServicesOpen && (
                                <div className="ml-4 border-l-2 border-red-100 pl-4 space-y-1 mt-1">
                                    {services.map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => setSelectedService(selectedService?.id === s.id ? null : s)}
                                            className="block w-full text-left p-3 text-sm text-gray-700 hover:text-red-600"
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </li>
                        {["/projects", "/solutions", "/blogs", "/about_us", "/contact_us"].map(path => (
                           <li key={path}>
                             <Link to={path} className={`block p-4 rounded-lg ${isActive(path)}`}>
                                {path.replace("/", "").replace("_", " ").charAt(0).toUpperCase() + path.slice(2).replace("_", " ")}
                             </Link>
                           </li>
                        ))}
                    </ul>
                 </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-white space-y-3">
                 {user ? (
                   <>
                    <Link
                        to={role === "admin" ? "/jobs" : "/profile"}
                        className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-bold"
                    >
                        {role === "admin" ? "Admin Portal" : "My Profile"}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-center border-2 border-red-600 text-red-600 py-3 rounded-lg font-bold"
                    >
                        Logout
                    </button>
                   </>
                 ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Link to="/signup" className="text-center py-3 border-2 border-red-600 text-red-600 rounded-lg font-bold">Join Us</Link>
                        <Link to="/careers" className="text-center py-3 bg-red-600 text-white rounded-lg font-bold">Apply</Link>
                    </div>
                 )}
                 
                 <button onClick={toggleCall} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl font-bold">
                    <MdCall size={20} className="mr-2" /> Request Call
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;