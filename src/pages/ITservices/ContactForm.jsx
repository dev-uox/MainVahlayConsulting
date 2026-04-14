import { useState } from "react";
import ClearableInput from "../common/ClearableInput";
 
const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    companyName: "",
    companySize: "",
    service: "",
    message: "",
    access_key: "73e81c64-b8d2-46a8-8e0c-5c716bace580", // Replace with your Web3Forms Access Key
  });
 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
 
  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
 
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
 
      const result = await response.json();
      if (result.success) {
        setStatus({ type: "success", message: "Your message has been sent successfully!" });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          country: "",
          companyName: "",
          companySize: "",
          service: "",
          message: "",
          access_key: "",
        });
      } else {
        setStatus({ type: "error", message: "Something went wrong. Please try again later." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-lg mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Get in Touch</h2>
      {status.message && (
        <p className={`text-center p-2 rounded ${status.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {status.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="hidden" name="access_key" value="73e81c64-b8d2-46a8-8e0c-5c716bace580"/>
 
          <ClearableInput type="text" name="firstName" placeholder="First Name*" value={formData.firstName} onChange={handleChange} className="w-full p-3 border rounded-md" required />
          <ClearableInput type="text" name="lastName" placeholder="Last Name*" value={formData.lastName} onChange={handleChange} className="w-full p-3 border rounded-md" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClearableInput type="email" name="email" placeholder="Business Email*" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-md" required />
          <ClearableInput type="text" name="phone" placeholder="Phone Number*" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-md" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="country" value={formData.country} onChange={handleChange} className="w-full p-3 border rounded-md" required>
            <option value="">Select Your Country</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="India">India</option>
            <option value="Germany">Germany</option>
          </select>
          <ClearableInput type="text" name="companyName" placeholder="Company Name*" value={formData.companyName} onChange={handleChange} className="w-full p-3 border rounded-md" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full p-3 border rounded-md" required>
            <option value="">Company Size</option>
            <option value="1-10">1-10 Employees</option>
            <option value="11-50">11-50 Employees</option>
            <option value="51-200">51-200 Employees</option>
            <option value="201-500">201-500 Employees</option>
            <option value="500+">500+ Employees</option>
          </select>
          <select name="service" value={formData.service} onChange={handleChange} className="w-full p-3 border rounded-md" required>
            <option value="">Select Your Service</option>
            <option value="Web Development">Web Development</option>
            <option value="App Development">App Development</option>
            <option value="SEO Optimization">SEO Optimization</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        <textarea name="message" placeholder="Message*" value={formData.message} onChange={handleChange} className="w-full p-3 border rounded-md h-24" required></textarea>
        <button type="submit" className="bg-red-500 text-white font-bold py-3 px-6 rounded-md w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};
 
export default ContactForm;