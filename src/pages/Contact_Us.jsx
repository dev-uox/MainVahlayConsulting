import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ClearableInput from '../components/common/ClearableInput';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSent, setIsSent] = useState(false);
  const [isError, setIsError] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formEndpoint = 'https://api.web3forms.com/submit';
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    const data = {
      access_key: accessKey,
      ...formData
    };

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setIsSent(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      <Helmet>
        <title>Contact Vahlay Consulting | Let’s Work Together</title>
        <meta
          name="description"
          content="Get in touch with Vahlay Consulting for tailored tech, marketing, and sales solutions. Serving businesses across the USA, Canada, and India."
        />
        <meta name="keywords" content="contact Vahlay Consulting, business inquiry, consulting services contact, tech solutions partner" />
        <link rel="canonical" href="https://vahlayconsulting.com/contact_us" />
      </Helmet>

      {/* --- HERO SECTION --- */}
      <div className="relative h-[350px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 opacity-90 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0" />
        
        <div className="container relative z-10 px-4 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
              Get In Touch
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Contact Us
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
              We'd love to hear from you. Whether you have a question about features, pricing, or need a demo, our team is ready to answer all your questions.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Let's start a conversation</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Reach out to us for any inquiries or assistance. We are here to help you grow your business with our expert solutions.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="space-y-8">
              {/* USA Office */}
              {/* UPDATED: Added border-red-200 and shadow-lg shadow-red-500/10 permanently */}
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-red-200 shadow-lg shadow-red-500/10 transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div className="w-full">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">USA Office</h4>
                  <p className="text-slate-600 text-sm mb-3">8 The Green Suite, Dover, DE 19901, USA</p>
                  
                  {/* Embedded Map */}
                  {/* UPDATED: Removed grayscale filter so map colors are always visible */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3067.5647703352726!2d-75.5246796846243!3d39.15934497953259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c77a4a2b9a7f3b%3A0x8c7a4a2b9a7f3b!2s8%20The%20Green%2C%20Dover%2C%20DE%2019901%2C%20USA!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      className="border-0 hover:opacity-90 transition-opacity duration-300"
                      allowFullScreen=""
                      loading="lazy"
                      title="USA Office Map"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Other Locations Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* UPDATED: Added border-red-200 and shadow-xl shadow-red-500/10 */}
                <div className="p-5 bg-white border border-red-200 rounded-xl shadow-xl shadow-red-500/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <h4 className="font-bold text-slate-900">Canada</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    235 Ferguson Ave, Cambridge, ON N1R 6G1
                  </p>
                </div>

                {/* UPDATED: Added border-red-200 and shadow-xl shadow-red-500/10 */}
                <div className="p-5 bg-white border border-red-200 rounded-xl shadow-xl shadow-red-500/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <h4 className="font-bold text-slate-900">Bharat (India)</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    C 515, Dev Aurum Commercial Complex, Ahmedabad, Gujarat 380015
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Email Us</p>
                    {/* UPDATED: Changed text to permanent Red */}
                    <a href="mailto:info@vahlayconsulting.com" className="text-sm font-bold text-red-600 transition-colors">
                      info@vahlayconsulting.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Call Us</p>
                    {/* UPDATED: Changed text to permanent Red */}
                    <a href="tel:+14083725981" className="text-sm font-bold text-red-600 transition-colors">
                      +1 (408) 372-5981
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* RIGHT COLUMN: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            /* UPDATED: Added border-red-200 and shadow-xl shadow-red-500/10 to form container */
            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-red-500/10 border border-red-200 relative overflow-hidden"
          >
            {/* Top Red Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400" />

            <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>

            {isSent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 border border-green-100">
                <FaCheckCircle /> Thank you! Your message has been sent successfully.
              </motion.div>
            )}
            
            {isError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 border border-red-100">
                <FaExclamationCircle /> Oops! Something went wrong. Please try again later.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <ClearableInput
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <ClearableInput
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                  <ClearableInput
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 h-32 resize-none"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-xs" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;