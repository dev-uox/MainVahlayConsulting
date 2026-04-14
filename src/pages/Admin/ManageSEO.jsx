import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust path as needed
import Side_bar from "../../components/Side_bar";
import { FaEdit, FaTrash } from 'react-icons/fa';

const SeoManagePage = () => {
  // State for existing SEO entries
  const [seoEntries, setSeoEntries] = useState([]);
  // State for the entry being edited (null means creating a new one)
  const [editingEntry, setEditingEntry] = useState(null);
  // Form state for SEO details
  const [formData, setFormData] = useState({
    page: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  });

  // Fetch existing SEO entries on component mount
  useEffect(() => {
    const fetchSeoEntries = async () => {
      try {
        const seoCollection = collection(db, 'seo');
        const snapshot = await getDocs(seoCollection);
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSeoEntries(entries);
      } catch (error) {
        console.error('Error fetching SEO entries:', error);
      }
    };

    fetchSeoEntries();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Set up the form for editing an entry
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      page: entry.page,
      metaTitle: entry.metaTitle,
      metaDescription: entry.metaDescription,
      keywords: entry.keywords,
    });
  };

  // Function to save or update the SEO entry in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        // Update existing entry
        const docRef = doc(db, 'seo', editingEntry.id);
        await updateDoc(docRef, formData);
      } else {
        // Create a new SEO entry
        await addDoc(collection(db, 'seo'), formData);
      }
      // Refresh the list of SEO entries
      const seoCollection = collection(db, 'seo');
      const snapshot = await getDocs(seoCollection);
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeoEntries(entries);
      // Clear the form
      setFormData({
        page: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      });
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving SEO entry:', error);
    }
  };

  // Delete an entry
  const handleDelete = async (entryId) => {
    try {
      await deleteDoc(doc(db, 'seo', entryId));
      // Refresh the SEO entries list
      const seoCollection = collection(db, 'seo');
      const snapshot = await getDocs(seoCollection);
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeoEntries(entries);
    } catch (error) {
      console.error('Error deleting SEO entry:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/5 shadow-lg">
        <Side_bar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-4/5 p-6 md:m-6">
        <h1 className="text-3xl font-bold mb-4">SEO Management</h1>

        {/* Form Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingEntry ? 'Edit SEO Entry' : 'Add New SEO Entry'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Page URL or Slug</label>
              <input
                type="text"
                name="page"
                value={formData.page}
                onChange={handleChange}
                placeholder="/about, /contact, etc."
                required
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="Enter meta title"
                required
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="Enter meta description"
                required
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Keywords (comma separated)</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g. react, seo, javascript"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </button>
          </form>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Existing SEO Entries</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Page</th>
                <th className="px-4 py-2 text-left">Meta Title</th>
                <th className="px-4 py-2 text-left">Meta Description</th>
                <th className="px-4 py-2 text-left">Keywords</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {seoEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-4 py-2">{entry.page}</td>
                  <td className="px-4 py-2">{entry.metaTitle}</td>
                  <td className="px-4 py-2">{entry.metaDescription}</td>
                  <td className="px-4 py-2">{entry.keywords}</td>
                  <td className="px-4 py-2 text-center">
                    <div className=' flex '>
                    <button
                      onClick={() => handleEdit(entry)}
                      className=" text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors"
                    >
                      <FaEdit size={20} className='text-red-600' />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className=" text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                     <FaTrash size={20} className='text-red-600' />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              {seoEntries.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No SEO entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Card Layout */}
        <div className="block md:hidden space-y-4">
          <h2 className="text-xl font-semibold mb-4">Existing SEO Entries</h2>
          {seoEntries.length > 0 ? (
            seoEntries.map(entry => (
              <div key={entry.id} className="bg-white p-4 rounded-lg shadow">
                <p className="mb-1"><span className="font-medium">Page:</span> {entry.page}</p>
                <p className="mb-1"><span className="font-medium">Meta Title:</span> {entry.metaTitle}</p>
                <p className="mb-1"><span className="font-medium">Meta Description:</span> {entry.metaDescription}</p>
                <p className="mb-1"><span className="font-medium">Keywords:</span> {entry.keywords}</p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className=" text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                  >
                   <FaEdit size={20} className='text-red-600' />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className=" text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    <FaTrash size={20} className='text-red-600' />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No SEO entries found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoManagePage;
