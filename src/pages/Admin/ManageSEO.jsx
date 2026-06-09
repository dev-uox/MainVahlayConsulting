import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust path as needed
import { FaEdit, FaTrash } from 'react-icons/fa';
import AdminPageShell, { AdminCard, AdminTable, adminInputClass, adminBtnPrimary } from "../../components/common/AdminPageShell";

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
    <AdminPageShell title="SEO Management" subtitle="Manage meta titles, descriptions, and keywords for site pages">
      <AdminCard title={editingEntry ? "Edit SEO Entry" : "Add New SEO Entry"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Page URL or Slug</label>
            <input type="text" name="page" value={formData.page} onChange={handleChange} placeholder="/about, /contact, etc." required className={adminInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Title</label>
            <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="Enter meta title" required className={adminInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="Enter meta description" required className={adminInputClass} rows={3} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Keywords (comma separated)</label>
            <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="e.g. react, seo, javascript" className={adminInputClass} />
          </div>
          <button type="submit" className={adminBtnPrimary}>
            {editingEntry ? "Update Entry" : "Add Entry"}
          </button>
        </form>
      </AdminCard>

      <AdminCard title="Existing SEO Entries" className="hidden md:block" noPadding>
        <AdminTable>
          <thead>
            <tr>
              <th>Page</th>
              <th>Meta Title</th>
              <th>Meta Description</th>
              <th>Keywords</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seoEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.page}</td>
                <td>{entry.metaTitle}</td>
                <td>{entry.metaDescription}</td>
                <td>{entry.keywords}</td>
                <td>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(entry)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button" aria-label="Edit">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button" aria-label="Delete">
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {seoEntries.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">No SEO entries found.</td>
              </tr>
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      <div className="space-y-4 md:hidden">
        <h2 className="text-lg font-semibold text-slate-900">Existing SEO Entries</h2>
        {seoEntries.length > 0 ? (
          seoEntries.map((entry) => (
            <AdminCard key={entry.id}>
              <p className="mb-1"><span className="font-medium">Page:</span> {entry.page}</p>
              <p className="mb-1"><span className="font-medium">Meta Title:</span> {entry.metaTitle}</p>
              <p className="mb-1"><span className="font-medium">Meta Description:</span> {entry.metaDescription}</p>
              <p className="mb-1"><span className="font-medium">Keywords:</span> {entry.keywords}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleEdit(entry)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button"><FaEdit size={18} /></button>
                <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button"><FaTrash size={18} /></button>
              </div>
            </AdminCard>
          ))
        ) : (
          <p className="py-4 text-center text-gray-500">No SEO entries found.</p>
        )}
      </div>
    </AdminPageShell>
  );
};

export default SeoManagePage;
