import { FaSearch, FaFacebook, FaBullhorn, FaCopy, FaPaintBrush, FaChartLine } from "react-icons/fa";

const DigitalMarketingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-screen flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}
      >
        <div className="bg-black bg-opacity-60 p-8 rounded-lg text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold">Comprehensive Digital Marketing Services</h1>
          <p className="text-lg mt-4">Elevate Your Brand with Data-Driven Strategies & Engaging Content</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto py-16 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Our Digital Marketing Solutions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaSearch className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Search Engine Optimization (SEO)</h3>
              <p className="text-gray-700">Boost rankings, drive organic traffic, and enhance online visibility.</p>
            </div>
          </div>

          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaFacebook className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Social Media Marketing</h3>
              <p className="text-gray-700">Engage audiences and build brand loyalty with data-driven campaigns.</p>
            </div>
          </div>

          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaBullhorn className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Pay-Per-Click (PPC) & Advertising</h3>
              <p className="text-gray-700">Generate leads and drive sales with highly targeted paid campaigns.</p>
            </div>
          </div>

          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaCopy className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Content Marketing & Copywriting</h3>
              <p className="text-gray-700">Craft compelling, value-driven content to engage and convert audiences.</p>
            </div>
          </div>

          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaPaintBrush className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Graphic Design & Video Marketing</h3>
              <p className="text-gray-700">Create stunning visuals and videos that enhance brand storytelling.</p>
            </div>
          </div>

          <div className="p-6 border rounded-xl shadow-md flex items-start space-x-4">
            <FaChartLine className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold">Website Analytics & Performance Tracking</h3>
              <p className="text-gray-700">Leverage data insights to optimize and refine marketing strategies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalMarketingPage;
