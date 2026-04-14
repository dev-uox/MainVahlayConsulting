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
import { db, storage } from "../../firebaseConfig";
import ClearableInput from "../../components/common/ClearableInput";
import PageHeader from "../../components/common/PageHeader";

const AdminBlogPage = () => {
  // -----------------------------
  // 1) CATEGORY STATES
  // -----------------------------
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // -----------------------------
  // 2) BLOG FORM STATES
  // -----------------------------
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

  // SEO Keywords
  const [seoKeywords, setSeokeywords] = useState("");

  // -----------------------------
  // 3) SECTIONS (ARRAY)
  // -----------------------------
  const [sections, setSections] = useState([]);
  const [tempHeading, setTempHeading] = useState("");
  const [tempParagraph, setTempParagraph] = useState("");
  const [tempBullets, setTempBullets] = useState([]);
  const [tempParagraph2, setTempParagraph2] = useState("");
  const [bulletText, setBulletText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  // -----------------------------
  // 4) EXISTING BLOGS
  // -----------------------------
  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  // -----------------------------
  // FETCH CATEGORIES
  // -----------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const catData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(catData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // -----------------------------
  // FETCH BLOGS BY CATEGORY
  // -----------------------------
  const fetchBlogsForCategory = async (catId) => {
    setLoadingBlogs(true);
    try {
      const catBlogsSnap = await getDocs(collection(db, "categories", catId, "blogs"));
      const fetched = catBlogsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllBlogs(fetched);
    } catch (error) {
      console.error("Error fetching blogs:", error);
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

  // -----------------------------
  // UPLOAD IMAGE (fixed await)
  // -----------------------------
  const uploadImageFile = async (file) => {
    if (!file) return "";

    const storageRef = ref(storage, `blogImages/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (err) => reject(err),
        () => resolve()
      );
    });

    return getDownloadURL(storageRef);
  };

  // -----------------------------
  // SAVE BLOG
  // -----------------------------
  const handleSaveBlog = async () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) finalImageUrl = await uploadImageFile(imageFile);

      let scheduleTimestamp = null;
      if (!removeSheduling && sheduleBlog) {
        const date = new Date(sheduleBlog);
        if (!isNaN(date.getTime())) scheduleTimestamp = Timestamp.fromDate(date);
      }

      const seoArray = seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

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
        metadescription, // ✅ consistent
        seoKeywords: seoArray,
        createdAt: Timestamp.now(),
      };

      if (editingBlogId) {
        const blogRef = doc(db, "categories", selectedCategory, "blogs", editingBlogId);
        await updateDoc(blogRef, blogData);
        alert("Blog updated successfully!");
        setEditingBlogId(null);
      } else {
        await addDoc(collection(db, "categories", selectedCategory, "blogs"), blogData);
        alert("Blog saved successfully!");
      }

      // Reset
      setTitle("");
      setSubtitle("");
      setHeaderParagraph("");
      setBeforeSectionParagraph("");
      setImageFile(null);
      setImageUrl("");
      setSections([]);
      setConclusion("");
      setSheduleBlog("");
      setMetatitle("");
      setMetadescription("");
      setSeokeywords("");
      setremoveSheduling(false);

      fetchBlogsForCategory(selectedCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog. Check console for details.");
    }
  };

  // -----------------------------
  // SECTIONS
  // -----------------------------
  const handleAddOrUpdateSection = () => {
    if (!tempHeading.trim()) return alert("Section heading is required.");

    const newSection = {
      heading: tempHeading,
      paragraph: tempParagraph,
      bullets: tempBullets,
      paragraph2: tempParagraph2,
    };

    if (editingIndex !== null) {
      setSections((prev) => {
        const updated = [...prev];
        updated[editingIndex] = newSection;
        return updated;
      });
      setEditingIndex(null);
    } else {
      setSections((prev) => [...prev, newSection]);
    }

    setTempHeading("");
    setTempParagraph("");
    setTempBullets([]);
    setTempParagraph2("");
    setBulletText("");
  };

  const handleEditSection = (index) => {
    const sec = sections[index];
    setTempHeading(sec.heading || "");
    setTempParagraph(sec.paragraph || "");
    setTempBullets(sec.bullets || []);
    setTempParagraph2(sec.paragraph2 || "");
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSection = (index) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBullet = () => {
    if (!bulletText.trim()) return;
    setTempBullets((prev) => [...prev, bulletText.trim()]);
    setBulletText("");
  };

  const handleRemoveBullet = (bIndex) => {
    setTempBullets((prev) => prev.filter((_, i) => i !== bIndex));
  };

  // -----------------------------
  // EDIT / DELETE BLOG
  // -----------------------------
  const handleEditBlog = (blogItem) => {
    setEditingBlogId(blogItem.id);

    setTitle(blogItem.title || "");
    setSubtitle(blogItem.subtitle || "");
    setHeaderParagraph(blogItem.headerparagraph || "");
    setBeforeSectionParagraph(blogItem.beforesectionparagraph || "");
    setImageUrl(blogItem.image || "");
    setConclusion(blogItem.conclusion || "");
    setSections(blogItem.sections || []);
    setMetatitle(blogItem.metatitle || "");
    setMetadescription(blogItem.metadescription || ""); // ✅ fixed
    setSeokeywords((blogItem.seoKeywords || []).join(", "));

    // schedule (optional)
    if (blogItem.scheduledTime?.toDate && blogItem.scheduledTime) {
      const dt = blogItem.scheduledTime.toDate();
      const pad = (n) => String(n).padStart(2, "0");
      const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
        dt.getHours()
      )}:${pad(dt.getMinutes())}`;
      setSheduleBlog(local);
      setremoveSheduling(false);
    } else {
      setSheduleBlog("");
      setremoveSheduling(true);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBlog = async (blogId) => {
    if (!selectedCategory) return;
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await deleteDoc(doc(db, "categories", selectedCategory, "blogs", blogId));
      setAllBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog. Check console for details.");
    }
  };

  const handleDisableBlogTime = (e) => {
    const checked = e.target.checked;
    setremoveSheduling(checked);
    if (checked) setSheduleBlog("");
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <PageHeader
        title="Manage Blogs"
        breadcrumbs={[
          { label: "Admin", to: "/manage-emp" },
          { label: "Content" },
          { label: "Blogs" },
        ]}
      />

      <div className="space-y-8 mt-6">
        {/* Category Selection */}
        <section className="premium-card p-6 border-l-4 border-l-red-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Category</h2>
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Filter by Category
            </label>
            <select
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">-- Choose a Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.title || "Unnamed Category"}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Create/Edit Blog Form */}
        <section className="premium-card p-6">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingBlogId ? "Edit Article" : "Compose New Article"}
            </h2>
            {editingBlogId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBlogId(null);
                  setTitle("");
                  setSubtitle("");
                  setHeaderParagraph("");
                  setBeforeSectionParagraph("");
                  setImageFile(null);
                  setImageUrl("");
                  setSections([]);
                  setConclusion("");
                  setSheduleBlog("");
                  setMetatitle("");
                  setMetadescription("");
                  setSeokeywords("");
                  setremoveSheduling(false);
                }}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
              >
                Discard Changes
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Blog Title</label>
              <ClearableInput
                id="blog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                placeholder="Ex: The Future of AI in Design"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category Subtitle</label>
              <ClearableInput
                id="blog-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                placeholder="Ex: Emerging trends for 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SEO Meta Title</label>
              <ClearableInput
                id="meta-title"
                type="text"
                value={metatitle}
                onChange={(e) => setMetatitle(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                placeholder="Meta title for Google"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                SEO Keywords (Comma Separated)
              </label>
              <ClearableInput
                id="seo-keywords"
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeokeywords(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                placeholder="marketing, design, future"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={metadescription}
                onChange={(e) => setMetadescription(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Write a brief summary for search engines..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Article Intro Hook</label>
              <textarea
                rows={3}
                value={headerparagraph}
                onChange={(e) => setHeaderParagraph(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="The very first paragraph users will read..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Featured Cover Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                {(imageUrl || imageFile) && (
                  <img
                    src={imageUrl || URL.createObjectURL(imageFile)}
                    alt="Blog Cover"
                    className="w-32 h-32 object-cover rounded-lg border border-white dark:border-slate-700 shadow-sm"
                  />
                )}
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-bold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100
                      dark:file:bg-red-900/20 dark:file:text-red-400"
                  />
                  <p className="mt-2 text-xs text-slate-400 uppercase tracking-tighter">Recommended resolution: 1200x630px</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Main Body Opening Paragraph
              </label>
              <textarea
                rows={3}
                value={beforeSectionParagraph}
                onChange={(e) => setBeforeSectionParagraph(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Transition text before the main sections begin..."
              />
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="removeScheduling"
                  checked={removeSheduling}
                  onChange={handleDisableBlogTime}
                  className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="removeScheduling" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Publish Immediately (Disable Scheduling)
                </label>
              </div>

              {!removeSheduling && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-red-600 dark:text-red-400 mb-2">
                    Schedule Publication For:
                  </label>
                  <input
                    type="datetime-local"
                    value={sheduleBlog}
                    onChange={(e) => setSheduleBlog(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Editor & Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="premium-card p-6 border-t-4 border-t-blue-500">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editingIndex !== null ? "Edit Content Block" : "Add Content Block"}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Block Heading</label>
                <ClearableInput
                  id="section-heading"
                  type="text"
                  value={tempHeading}
                  onChange={(e) => setTempHeading(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                  placeholder="Ex: 1. Optimize for Mobile First"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Paragraph</label>
                <textarea
                  rows={4}
                  value={tempParagraph}
                  onChange={(e) => setTempParagraph(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Primary content for this block..."
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Bullet Feature List
                </label>
                <div className="flex gap-2 mb-4">
                  <ClearableInput
                    id="bullet-item"
                    type="text"
                    value={bulletText}
                    onChange={(e) => setBulletText(e.target.value)}
                    className="flex-1 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-red-200"
                    placeholder="Enter feature/step..."
                  />
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {tempBullets.length > 0 && (
                  <ul className="space-y-2">
                    {tempBullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{b}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(i)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Block Closing Note</label>
                <textarea
                  rows={2}
                  value={tempParagraph2}
                  onChange={(e) => setTempParagraph2(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Optional summary note for this block..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleAddOrUpdateSection}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  {editingIndex !== null ? "Update Content Block" : "Add to Article"}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 pb-2">Article Structure</h2>
            {sections.length === 0 ? (
              <div className="premium-card p-12 text-center bg-transparent border-dashed">
                <p className="text-slate-400">No content blocks added yet. Start writing on the left.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map((sec, idx) => (
                  <div key={idx} className="premium-card p-4 group border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex-shrink-0 h-5 w-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{sec.heading}</h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{sec.paragraph}</p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditSection(idx)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section className="premium-card p-6 border-t-4 border-t-green-600">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Final Polish</h2>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Concluding Statement
              </label>
              <textarea
                rows={3}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200 mb-6"
                placeholder="Finish strong with a final summary..."
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSaveBlog}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  {editingBlogId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </section>
          </section>
        </div>

        {/* Existing Content Browser */}
        <section className="premium-card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Existing Publications</h2>
            <div className="flex items-center gap-2">
              <span className="status-badge status-badge-blue">Total: {allBlogs.length}</span>
            </div>
          </div>

          {selectedCategory === "" ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              Pick a category above to browse its published blogs.
            </div>
          ) : loadingBlogs ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-slate-500 font-bold animate-pulse">Retrieving archived content...</p>
            </div>
          ) : allBlogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No publications found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBlogs.map((blogItem) => (
                <div
                  key={blogItem.id}
                  className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {blogItem.image && (
                      <img src={blogItem.image} alt="" className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {blogItem.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 truncate">{blogItem.subtitle}</p>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <button
                          onClick={() => handleEditBlog(blogItem)}
                          className="text-xs font-bold uppercase text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blogItem.id)}
                          className="text-xs font-bold uppercase text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminBlogPage;
