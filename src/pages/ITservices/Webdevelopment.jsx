// import { FaDesktop, FaMobileAlt, FaSearch, FaRocket, FaShieldAlt, FaCheckCircle, FaUsers } from "react-icons/fa";

// const WebDevelopmentPage = () => {
//   return (
//     <div className="bg-gray-50">
//       {/* Hero Section */}
//       <div 
//         className="relative h-screen flex items-center justify-center text-white text-center"
//         style={{ backgroundImage: "url('/path-to-your-image.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
//       >
//         <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
//         <div className="relative p-10 rounded-lg max-w-4xl">
//           <h1 className="text-5xl md:text-6xl font-extrabold">Build Stunning Websites</h1>
//           <p className="text-lg mt-4">High-Performance | Scalable | User-Centric</p>
//           <p className="text-md mt-3 text-gray-300">We offer a full spectrum of website development solutions, ensuring that every project we undertake is innovative, efficient, and results-driven.</p>
//           <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">Get a Free Consultation</button>
//         </div>
//       </div>

//       {/* Services Section */}
//       <div className="container mx-auto py-20 px-6">
//         <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Web Development Services</h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
//           {[
//             { icon: FaDesktop, title: "Custom Website Development", desc: "Tailored, fast, and user-friendly websites." },
//             { icon: FaMobileAlt, title: "E-Commerce Development", desc: "Feature-rich online stores optimized for conversion." },
//             { icon: FaSearch, title: "CMS Development", desc: "Flexible and scalable content management solutions." },
//             { icon: FaRocket, title: "UI/UX Design", desc: "Engaging, conversion-optimized designs." },
//             { icon: FaShieldAlt, title: "Website Maintenance", desc: "Ongoing support to keep your site secure and fast." }
//           ].map((service, index) => (
//             <div key={index} className="p-8 border rounded-xl shadow-md bg-white text-center hover:shadow-lg transition-all">
//               <service.icon className="text-5xl text-red-500 mx-auto mb-4" />
//               <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
//               <p className="text-gray-600">{service.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Why Choose Us Section */}
//       <div className="bg-red-500 py-20 px-6 text-white text-center">
//         <h2 className="text-4xl font-bold mb-12">Why Choose Us?</h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
//           {[
//             { icon: FaCheckCircle, title: "Expert-Led Development", desc: "Crafting cutting-edge websites." },
//             { icon: FaSearch, title: "SEO Optimized", desc: "Ensuring high rankings and smooth performance." },
//             { icon: FaRocket, title: "Scalable Solutions", desc: "Tailored to your business growth." },
//             { icon: FaShieldAlt, title: "Security First", desc: "Keeping your website and data protected." },
//             { icon: FaMobileAlt, title: "Mobile-First Approach", desc: "Optimized for all devices." },
//             { icon: FaUsers, title: "Client-Centric Focus", desc: "Your business goals are our priority." }
//           ].map((feature, index) => (
//             <div key={index} className="p-6 border rounded-xl shadow-md flex items-start space-x-4 bg-white text-gray-900">
//               <feature.icon className="text-4xl text-red-500" />
//               <div>
//                 <h3 className="text-xl font-bold">{feature.title}</h3>
//                 <p className="text-gray-700">{feature.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Call to Action Section */}
//       <div className="bg-gray-800 text-white py-16 text-center">
//         <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Online Presence?</h2>
//         <p className="text-lg">Get in touch with us today and let's create something amazing together.</p>
//         <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">Start Your Project</button>
//       </div>
//     </div>
//   );
// };

// export default WebDevelopmentPage;





import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaDesktop, FaMobileAlt, FaSearch, FaRocket, FaShieldAlt, FaCheckCircle, FaUsers } from "react-icons/fa";

const WebDevelopmentPage = () => {
  const { serviceId } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping configuration
  const iconMap = {
    desktop: FaDesktop,
    mobile: FaMobileAlt,
    search: FaSearch,
    rocket: FaRocket,
    shield: FaShieldAlt,
    check: FaCheckCircle,
    users: FaUsers
  };

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Validate required fields
          if (!data.subservices || !data.whyChooseUs) {
            throw new Error("Invalid service data structure");
          }
          setServiceData(data);
        } else {
          setError("Service not found");
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!serviceData) return <div className="text-center py-20">Service not found</div>;

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center text-white text-center"
        style={{ 
          backgroundImage: `url('${serviceData.heroImage || ''}')`,
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
        <div className="relative p-10 rounded-lg max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold">{serviceData.heroTitle || 'Service Title'}</h1>
          <p className="text-lg mt-4">{serviceData.heroSubtitle || 'Service Subtitle'}</p>
          <p className="text-md mt-3 text-gray-300">{serviceData.heroDescription || 'Service description'}</p>
          <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">
            {serviceData.ctaButton || 'Get Started'}
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          {serviceData.servicesTitle || 'Our Services'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {serviceData.subservices?.map((service, index) => {
            const Icon = iconMap[service.icon] || FaDesktop;
            
            return (
              <div key={index} className="p-8 border rounded-xl shadow-md bg-white text-center hover:shadow-lg transition-all">
                <Icon className="text-5xl text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">{service.title || 'Service Title'}</h3>
                <p className="text-gray-600">{service.subtitle || 'Service description'}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-red-500 py-20 px-6 text-white text-center">
        <h2 className="text-4xl font-bold mb-12">{serviceData.whyChooseUsTitle || 'Why Choose Us?'}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {serviceData.whyChooseUs?.map((feature, index) => {
            const FeatureIcon = iconMap[feature.icon] || FaCheckCircle;

            return (
              <div key={index} className="p-6 border rounded-xl shadow-md flex items-start space-x-4 bg-white text-gray-900">
                <FeatureIcon className="text-4xl text-red-500" />
                <div>
                  <h3 className="text-xl font-bold">{feature.title || 'Feature Title'}</h3>
                  <p className="text-gray-700">{feature.subtitle || 'Feature description'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-800 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">{serviceData.finalCtaTitle || 'Ready to Start?'}</h2>
        <p className="text-lg">{serviceData.finalCtaSubtitle || 'Get in touch with us today'}</p>
        <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">
          {serviceData.finalCtaButton || 'Contact Us'}
        </button>
      </div>
    </div>
  );
};

export default WebDevelopmentPage;