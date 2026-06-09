import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import ClearableInput from "../../components/common/ClearableInput";
import AdminPageShell, { AdminCard } from "../../components/common/AdminPageShell";

const AdminBlogPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [metatitle, setMetatitle] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [headerparagraph, setHeaderParagraph] = useState("");
  const [beforeSectionParagraph, setBeforeSectionParagraph] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sheduleBlog, setSheduleBlog] = useState("");
  const [removeSheduling, setremoveSheduling] = useState(false);
  const [seoKeywords, setSeokeywords] = useState("");

  const [sections, setSections] = useState([]);
  const [tempHeading, setTempHeading] = useState("");
  const [tempParagraph, setTempParagraph] = useState("");
  const [tempBullets, setTempBullets] = useState([]);
  const [tempParagraph2, setTempParagraph2] = useState("");
  const [bulletText, setBulletText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchBlogsForCategory = async (catId) => {
    setLoadingBlogs(true);
    try {
      const snap = await getDocs(collection(db, "categories", catId, "blogs"));
      setAllBlogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoadingBlogs(false);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setAllBlogs([]);
    setEditingBlogId(null);
    if (catId) fetchBlogsForCategory(catId);
  };

  const uploadImageFile = async (file) => {
    if (!file) return "";
    const storageRef = ref(storage, `blogImages/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await new Promise((resolve, reject) => {
      uploadTask.on("state_changed", null, (err) => reject(err), () => resolve());
    });
    return getDownloadURL(storageRef);
  };

  const handleSaveBlog = async () => {
    if (!selectedCategory) return alert("Select a category.");
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) finalImageUrl = await uploadImageFile(imageFile);

      let scheduleTimestamp = null;
      if (!removeSheduling && sheduleBlog) {
        scheduleTimestamp = Timestamp.fromDate(new Date(sheduleBlog));
      }

      const blogData = {
        title,
        subtitle,
        headerparagraph,
        image: finalImageUrl,
        beforesectionparagraph: beforeSectionParagraph,
        sections,
        conclusion,
        scheduledTime: scheduleTimestamp,
        metatitle,
        metadescription,
        seoKeywords: seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        createdAt: Timestamp.now(),
      };

      if (editingBlogId) {
        await updateDoc(doc(db, "categories", selectedCategory, "blogs", editingBlogId), blogData);
        setEditingBlogId(null);
      } else {
        await addDoc(collection(db, "categories", selectedCategory, "blogs"), blogData);
      }

      // Reset fields
      setTitle(""); setSubtitle(""); setHeaderParagraph(""); setBeforeSectionParagraph("");
      setImageFile(null); setImageUrl(""); setSections([]); setConclusion("");
      setSheduleBlog(""); setMetatitle(""); setMetadescription(""); setSeokeywords("");
      fetchBlogsForCategory(selectedCategory);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOrUpdateSection = () => {
    if (!tempHeading.trim()) return;
    const newSection = { heading: tempHeading, paragraph: tempParagraph, bullets: tempBullets, paragraph2: tempParagraph2 };
    if (editingIndex !== null) {
      const updated = [...sections];
      updated[editingIndex] = newSection;
      setSections(updated);
      setEditingIndex(null);
    } else {
      setSections([...sections, newSection]);
    }
    setTempHeading(""); setTempParagraph(""); setTempBullets([]); setTempParagraph2("");
  };

  return (
    <AdminPageShell title="Manage Blogs" subtitle="Create and manage blog posts by category">
        <AdminCard title="Select Category" subtitle="Choose a category to manage blog posts.">
          <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full max-w-2xl rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">- Choose a Category -</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name || cat.title || "Unnamed Category"}
              </option>
            ))}
          </select>
        </AdminCard>

        <AdminCard title="Create New Blog" subtitle="Fill in the blog details and add sections below.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Blog Title</label>
              <ClearableInput
                placeholder="My Complete Blog"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Blog Subtitle</label>
              <ClearableInput
                placeholder="Subtitle text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Meta Title</label>
              <ClearableInput
                placeholder="Meta title"
                value={metatitle}
                onChange={(e) => setMetatitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">SEO Keywords (comma separated)</label>
              <ClearableInput
                placeholder="e.g. marketing, ecommerce, web development"
                value={seoKeywords}
                onChange={(e) => setSeokeywords(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Enter a concise meta description (up to 155 characters)"
                value={metadescription}
                onChange={(e) => setMetadescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Header Paragraph</label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Small paragraph text near the header..."
                value={headerparagraph}
                onChange={(e) => setHeaderParagraph(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Main Blog Image</label>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files?.[0])}
                  className="text-sm text-gray-700"
                />
                <span className="text-sm text-gray-500">
                  {imageFile ? imageFile.name : "Choose file · No file chosen"}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Paragraph before sections</label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Text that appears before the list of sections..."
                value={beforeSectionParagraph}
                onChange={(e) => setBeforeSectionParagraph(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={removeSheduling}
                onChange={(e) => setremoveSheduling(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Remove scheduling
            </label>
            {!removeSheduling && (
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:w-auto"
                value={sheduleBlog}
                onChange={(e) => setSheduleBlog(e.target.value)}
              />
            )}
          </div>
        </AdminCard>

        <AdminCard title="Add New Section" subtitle="Build your article with structured sections and optional bullet points.">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Heading</label>
              <ClearableInput
                placeholder="Invest in Comprehensive Agent Training..."
                value={tempHeading}
                onChange={(e) => setTempHeading(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Main Paragraph</label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Some text about why it matters..."
                value={tempParagraph}
                onChange={(e) => setTempParagraph(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bullet Points (optional)</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder="Bullet item"
                  value={bulletText}
                  onChange={(e) => setBulletText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!bulletText.trim()) return;
                    setTempBullets([...tempBullets, bulletText.trim()]);
                    setBulletText("");
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Add
                </button>
              </div>
              {tempBullets.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tempBullets.map((bullet, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {bullet}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Conclusion paragraph (optional)</label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Wrap-up text for this section..."
                value={tempParagraph2}
                onChange={(e) => setTempParagraph2(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddOrUpdateSection}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Add Section
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Final Conclusion & Save" subtitle="Add the overall conclusion before saving the full blog.">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Overall Conclusion Paragraph</label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="Concluding paragraph for the entire blog..."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveBlog}
              className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Save Entire Blog
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Blogs in Selected Category" subtitle="Manage existing blogs after selecting a category.">
          {loadingBlogs ? (
            <p className="text-sm text-gray-500">Loading blogs...</p>
          ) : allBlogs.length === 0 ? (
            <p className="text-sm text-gray-500">Please select a category to view its blogs.</p>
          ) : (
            <div className="space-y-4">
              {allBlogs.map((blog) => (
                <div key={blog.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                      <p className="text-sm text-gray-600">{blog.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {new Date(blog.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
    </AdminPageShell>
  );
};

export default AdminBlogPage;
