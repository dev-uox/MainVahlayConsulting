import { useState, useEffect, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import ClearableInput from "../../components/common/ClearableInput";
import PageHeader from "../../components/common/PageHeader";

const ManageHierarchyPage = () => {
  // ==============================
  // 1) STATE: CATEGORIES
  // ==============================
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [newCategory, setNewCategory] = useState({
    name: "",
    title: "",
    description: "",
    image: null,
    seoKeywords: "",
    seoTitle: "",
    seoDescription: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ==============================
  // 2) STATE: SERVICES
  // ==============================
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  const [newService, setNewService] = useState({
    name: "",
    title: "",
    description: "",
    image: null,
    whyChooseUs: [],
    seoKeywords: "",
    seoTitle: "",
    seoDescription: "",
  });
  const [newServiceBullet, setNewServiceBullet] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);

  // ==============================
  // 3) STATE: SUBSERVICES
  // ==============================
  const [subservices, setSubservices] = useState([]);

  const [newSubservice, setNewSubservice] = useState({
    name: "",
    title: "",
    description: "",
    icon: null,
    impact: "",
    keyFeatures: [],
    seoKeywords: "",
    seoTitle: "",
    seoDescription: "",
  });
  const [newSubserviceBullet, setNewSubserviceBullet] = useState("");
  const [editingSubserviceId, setEditingSubserviceId] = useState(null);
  const [subserviceLoading, setSubserviceLoading] = useState(false);

  // ==============================
  // 4) FILE INPUT REFS
  // ==============================
  const categoryImageRef = useRef(null);
  const serviceImageRef = useRef(null);
  const subserviceIconRef = useRef(null);

  // ==============================
  // 5) HELPERS
  // ==============================
  const uploadFile = async (file, folder) => {
    if (!file) return "";
    const storageRef = ref(storage, `${folder}/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const resetCategoryForm = () => {
    setNewCategory({
      name: "",
      title: "",
      description: "",
      image: null,
      seoKeywords: "",
      seoTitle: "",
      seoDescription: "",
    });
    setEditingCategoryId(null);
    if (categoryImageRef.current) categoryImageRef.current.value = null;
  };

  const resetServiceForm = () => {
    setNewService({
      name: "",
      title: "",
      description: "",
      image: null,
      whyChooseUs: [],
      seoKeywords: "",
      seoTitle: "",
      seoDescription: "",
    });
    setNewServiceBullet("");
    setEditingServiceId(null);
    if (serviceImageRef.current) serviceImageRef.current.value = null;
  };

  const resetSubserviceForm = () => {
    setNewSubservice({
      name: "",
      title: "",
      description: "",
      icon: null,
      impact: "",
      keyFeatures: [],
      seoKeywords: "",
      seoTitle: "",
      seoDescription: "",
    });
    setNewSubserviceBullet("");
    setEditingSubserviceId(null);
    if (subserviceIconRef.current) subserviceIconRef.current.value = null;
  };

  // ==============================
  // 6) FETCH CATEGORIES
  // ==============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // ==============================
  // 7) FETCH SERVICES
  // ==============================
  useEffect(() => {
    if (!selectedCategory) {
      setServices([]);
      setSelectedService("");
      setSubservices([]);
      return;
    }

    const fetchServices = async () => {
      try {
        const servicesRef = collection(doc(db, "categories", selectedCategory), "services");
        const snapshot = await getDocs(servicesRef);
        setServices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setSelectedService("");
        setSubservices([]);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [selectedCategory]);

  // ==============================
  // 8) FETCH SUBSERVICES
  // ==============================
  useEffect(() => {
    if (!selectedService) {
      setSubservices([]);
      return;
    }

    const fetchSubservices = async () => {
      try {
        const subRef = collection(
          doc(db, "categories", selectedCategory),
          "services",
          selectedService,
          "subservices"
        );
        const snapshot = await getDocs(subRef);
        setSubservices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching subservices:", error);
      }
    };

    fetchSubservices();
  }, [selectedCategory, selectedService]);

  // ==============================
  // CATEGORY HANDLERS
  // ==============================
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.title || !newCategory.description) return;

    setCategoryLoading(true);
    try {
      let imageUrl = newCategory.image;
      if (newCategory.image instanceof File) {
        imageUrl = await uploadFile(newCategory.image, "categories");
      }

      const seoArr = newCategory.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newCategory.name,
        title: newCategory.title,
        description: newCategory.description,
        image: imageUrl || "",
        seoKeywords: seoArr,
        seoTitle: newCategory.seoTitle || "",
        seoDescription: newCategory.seoDescription || "",
      };

      const docRef = await addDoc(collection(db, "categories"), payload);

      setCategories((prev) => [...prev, { id: docRef.id, ...payload }]);
      resetCategoryForm();
    } catch (e) {
      console.error("Error adding category:", e);
    }
    setCategoryLoading(false);
  };

  const handleEditCategory = (cat) => {
    setNewCategory({
      name: cat.name || "",
      title: cat.title || "",
      description: cat.description || "",
      image: cat.image || null,
      seoKeywords: (cat.seoKeywords || []).join(", "),
      seoTitle: cat.seoTitle || "",
      seoDescription: cat.seoDescription || "",
    });
    setEditingCategoryId(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;

    setCategoryLoading(true);
    try {
      let imageUrl = newCategory.image;
      if (newCategory.image instanceof File) {
        imageUrl = await uploadFile(newCategory.image, "categories");
      }

      const seoArr = newCategory.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newCategory.name,
        title: newCategory.title,
        description: newCategory.description,
        image: imageUrl || "",
        seoKeywords: seoArr,
        seoTitle: newCategory.seoTitle || "",
        seoDescription: newCategory.seoDescription || "",
      };

      await updateDoc(doc(db, "categories", editingCategoryId), payload);

      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategoryId ? { id: c.id, ...payload } : c))
      );

      resetCategoryForm();
    } catch (e) {
      console.error("Error updating category:", e);
    }
    setCategoryLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategory === id) {
        setSelectedCategory("");
        setServices([]);
        setSelectedService("");
        setSubservices([]);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // ==============================
  // SERVICE HANDLERS
  // ==============================
  const handleAddService = async () => {
    if (!selectedCategory || !newService.name || !newService.title || !newService.description) return;

    setServiceLoading(true);
    try {
      let imageUrl = newService.image;
      if (newService.image instanceof File) {
        imageUrl = await uploadFile(newService.image, "services");
      }

      const seoArr = newService.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newService.name,
        title: newService.title,
        description: newService.description,
        image: imageUrl || "",
        whyChooseUs: newService.whyChooseUs || [],
        seoKeywords: seoArr,
        seoTitle: newService.seoTitle || "",
        seoDescription: newService.seoDescription || "",
      };

      const docRef = await addDoc(
        collection(doc(db, "categories", selectedCategory), "services"),
        payload
      );

      setServices((prev) => [...prev, { id: docRef.id, ...payload }]);
      resetServiceForm();
    } catch (e) {
      console.error("Error adding service:", e);
    }
    setServiceLoading(false);
  };

  const handleEditService = (svc) => {
    setNewService({
      name: svc.name || "",
      title: svc.title || "",
      description: svc.description || "",
      image: svc.image || null,
      whyChooseUs: svc.whyChooseUs || [],
      seoKeywords: (svc.seoKeywords || []).join(", "),
      seoTitle: svc.seoTitle || "",
      seoDescription: svc.seoDescription || "",
    });
    setEditingServiceId(svc.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateService = async () => {
    if (!editingServiceId) return;

    setServiceLoading(true);
    try {
      let imageUrl = newService.image;
      if (newService.image instanceof File) {
        imageUrl = await uploadFile(newService.image, "services");
      }

      const seoArr = newService.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newService.name,
        title: newService.title,
        description: newService.description,
        image: imageUrl || "",
        whyChooseUs: newService.whyChooseUs || [],
        seoKeywords: seoArr,
        seoTitle: newService.seoTitle || "",
        seoDescription: newService.seoDescription || "",
      };

      await updateDoc(
        doc(db, "categories", selectedCategory, "services", editingServiceId),
        payload
      );

      setServices((prev) =>
        prev.map((s) => (s.id === editingServiceId ? { id: s.id, ...payload } : s))
      );

      resetServiceForm();
    } catch (e) {
      console.error("Error updating service:", e);
    }
    setServiceLoading(false);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    await deleteDoc(doc(db, "categories", selectedCategory, "services", id));
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (selectedService === id) {
      setSelectedService("");
      setSubservices([]);
    }
  };

  const handleAddServiceBullet = () => {
    if (!newServiceBullet.trim()) return;
    setNewService((prev) => ({
      ...prev,
      whyChooseUs: [...(prev.whyChooseUs || []), newServiceBullet.trim()],
    }));
    setNewServiceBullet("");
  };

  const handleRemoveServiceBullet = (index) => {
    setNewService((prev) => ({
      ...prev,
      whyChooseUs: (prev.whyChooseUs || []).filter((_, i) => i !== index),
    }));
  };

  // ==============================
  // SUBSERVICE HANDLERS
  // ==============================
  const handleAddSubservice = async () => {
    if (
      !selectedCategory ||
      !selectedService ||
      !newSubservice.name ||
      !newSubservice.title ||
      !newSubservice.description ||
      !newSubservice.impact
    )
      return;

    setSubserviceLoading(true);
    try {
      let iconUrl = newSubservice.icon;
      if (newSubservice.icon instanceof File) {
        iconUrl = await uploadFile(newSubservice.icon, "subservices");
      }

      const seoArr = newSubservice.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newSubservice.name,
        title: newSubservice.title,
        description: newSubservice.description,
        icon: iconUrl || "",
        impact: newSubservice.impact || "",
        keyFeatures: newSubservice.keyFeatures || [],
        seoKeywords: seoArr,
        seoTitle: newSubservice.seoTitle || "",
        seoDescription: newSubservice.seoDescription || "",
      };

      const docRef = await addDoc(
        collection(
          doc(db, "categories", selectedCategory),
          "services",
          selectedService,
          "subservices"
        ),
        payload
      );

      setSubservices((prev) => [...prev, { id: docRef.id, ...payload }]);
      resetSubserviceForm();
    } catch (error) {
      console.error("Error adding subservice:", error);
    }
    setSubserviceLoading(false);
  };

  const handleEditSubservice = (sub) => {
    setNewSubservice({
      name: sub.name || "",
      title: sub.title || "",
      description: sub.description || "",
      icon: sub.icon || null,
      impact: sub.impact || "",
      keyFeatures: sub.keyFeatures || [],
      seoKeywords: (sub.seoKeywords || []).join(", "),
      seoTitle: sub.seoTitle || "", // ✅ fixed
      seoDescription: sub.seoDescription || "", // ✅ fixed
    });
    setEditingSubserviceId(sub.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubservice = async () => {
    if (!editingSubserviceId) return;

    setSubserviceLoading(true);
    try {
      let iconUrl = newSubservice.icon;
      if (newSubservice.icon instanceof File) {
        iconUrl = await uploadFile(newSubservice.icon, "subservices");
      }

      const seoArr = newSubservice.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: newSubservice.name,
        title: newSubservice.title,
        description: newSubservice.description,
        icon: iconUrl || "",
        impact: newSubservice.impact || "",
        keyFeatures: newSubservice.keyFeatures || [],
        seoKeywords: seoArr,
        seoTitle: newSubservice.seoTitle || "",
        seoDescription: newSubservice.seoDescription || "",
      };

      await updateDoc(
        doc(
          db,
          "categories",
          selectedCategory,
          "services",
          selectedService,
          "subservices",
          editingSubserviceId
        ),
        payload
      );

      setSubservices((prev) =>
        prev.map((s) => (s.id === editingSubserviceId ? { id: s.id, ...payload } : s))
      );

      resetSubserviceForm();
    } catch (e) {
      console.error("Error updating subservice:", e);
    }
    setSubserviceLoading(false);
  };

  const handleDeleteSubservice = async (id) => {
    if (!window.confirm("Delete this subservice?")) return;
    try {
      await deleteDoc(
        doc(db, "categories", selectedCategory, "services", selectedService, "subservices", id)
      );
      setSubservices((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting subservice:", error);
    }
  };

  const handleAddSubserviceBullet = () => {
    if (!newSubserviceBullet.trim()) return;
    setNewSubservice((prev) => ({
      ...prev,
      keyFeatures: [...(prev.keyFeatures || []), newSubserviceBullet.trim()],
    }));
    setNewSubserviceBullet("");
  };

  const handleRemoveSubserviceBullet = (index) => {
    setNewSubservice((prev) => ({
      ...prev,
      keyFeatures: (prev.keyFeatures || []).filter((_, i) => i !== index),
    }));
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <PageHeader
        title="Service Hierarchy"
        breadcrumbs={[
          { label: "Admin", to: "/manage-emp" },
          { label: "Architecture" },
          { label: "Services" },
        ]}
      />

      <div className="space-y-8 mt-6">
        {/* ==================== CATEGORIES SECTION ==================== */}
        <section className="premium-card p-6 border-l-4 border-l-red-600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Master Categories</h2>
            {editingCategoryId && (
              <button
                onClick={resetCategoryForm}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category Name</label>
                <ClearableInput
                  id="category-name"
                  type="text"
                  placeholder="e.g. Technology"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Display Title</label>
                <ClearableInput
                  id="category-title"
                  type="text"
                  placeholder="e.g. IT Solutions"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="Briefly describe this business category..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Title</label>
                <ClearableInput
                  id="category-seo-title"
                  type="text"
                  placeholder="Keyword rich title"
                  value={newCategory.seoTitle}
                  onChange={(e) => setNewCategory({ ...newCategory, seoTitle: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Keywords</label>
                <ClearableInput
                  id="category-seo-keywords"
                  type="text"
                  placeholder="tech, cloud, dev (comma separated)"
                  value={newCategory.seoKeywords}
                  onChange={(e) => setNewCategory({ ...newCategory, seoKeywords: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Image Asset</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <input
                  type="file"
                  ref={categoryImageRef}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-bold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100
                    dark:file:bg-red-900/20 dark:file:text-red-400"
                  onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files?.[0] || null })}
                />
                <button
                  onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                  disabled={categoryLoading}
                >
                  {categoryLoading ? "Syncing..." : editingCategoryId ? "Update Category" : "Publish Category"}
                </button>
              </div>
            </div>
          </div>

          {/* Category browser */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Segments</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border transition-all cursor-pointer group ${
                    cat.id === selectedCategory
                      ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-400"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="text-sm font-bold">{cat.name}</span>
                  <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}
                      className={`p-1 hover:scale-110 transition-transform ${cat.id === selectedCategory ? "text-white" : "text-slate-400 hover:text-blue-500"}`}
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      className={`p-1 hover:scale-110 transition-transform ${cat.id === selectedCategory ? "text-white" : "text-slate-400 hover:text-red-500"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SERVICES SECTION ===================== */}
        {selectedCategory && (
          <section className="premium-card p-6 border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Core Services</h2>
                <p className="text-xs text-slate-400 font-medium">Managing services for <span className="text-blue-500">{categories.find(c => c.id === selectedCategory)?.name}</span></p>
              </div>
              {editingServiceId && (
                <button
                  onClick={resetServiceForm}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Name</label>
                <ClearableInput
                  id="service-name"
                  type="text"
                  placeholder="e.g. Web Development"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Title</label>
                <ClearableInput
                  id="service-title"
                  type="text"
                  placeholder="e.g. Custom Web Solutions"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Asset Upload</label>
                <input
                  type="file"
                  ref={serviceImageRef}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900/20"
                  onChange={(e) => setNewService({ ...newService, image: e.target.files?.[0] || null })}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Philosophy</label>
                <textarea
                  rows={4}
                  placeholder="Core value proposition..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Key Selling Points</label>
                <div className="flex gap-2">
                  <ClearableInput
                    id="service-bullet"
                    type="text"
                    placeholder="Add a reason to choose us"
                    value={newServiceBullet}
                    onChange={(e) => setNewServiceBullet(e.target.value)}
                    className="flex-1 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-200"
                  />
                  <button
                    onClick={handleAddServiceBullet}
                    className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {newService.whyChooseUs?.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{point}</span>
                      <button onClick={() => handleRemoveServiceBullet(idx)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Title</label>
                  <ClearableInput
                    id="service-seo-title"
                    type="text"
                    value={newService.seoTitle}
                    onChange={(e) => setNewService({ ...newService, seoTitle: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Keywords</label>
                  <ClearableInput
                    id="service-seo-keywords"
                    type="text"
                    value={newService.seoKeywords}
                    onChange={(e) => setNewService({ ...newService, seoKeywords: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
                <button
                  onClick={editingServiceId ? handleUpdateService : handleAddService}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                  disabled={serviceLoading}
                >
                  {serviceLoading ? "Processing..." : editingServiceId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </div>

            {/* Service selector */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
              <div className="flex gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className={`relative min-w-[240px] p-4 rounded-xl border transition-all cursor-pointer group ${
                      svc.id === selectedService
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 shadow-md"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 shadow-sm"
                    }`}
                    onClick={() => setSelectedService(svc.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold truncate ${svc.id === selectedService ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                        {svc.name}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditService(svc); }} className="p-1.5 text-slate-400 hover:text-blue-500"><FaEdit className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteService(svc.id); }} className="p-1.5 text-slate-400 hover:text-red-500"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{svc.description}</p>
                    {svc.id === selectedService && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================== SUBSERVICES SECTION ===================== */}
        {selectedService && (
          <section className="premium-card p-6 border-t-4 border-t-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Granular Expertise</h2>
                <p className="text-xs text-slate-400 font-medium">Specialized units for <span className="text-emerald-500">{services.find(s => s.id === selectedService)?.name}</span></p>
              </div>
              {editingSubserviceId && (
                <button
                  onClick={resetSubserviceForm}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Unit Name</label>
                <ClearableInput
                  id="sub-name"
                  type="text"
                  placeholder="e.g. React Frontend"
                  value={newSubservice.name}
                  onChange={(e) => setNewSubservice({ ...newSubservice, name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Unit Display Title</label>
                <ClearableInput
                  id="sub-title"
                  type="text"
                  placeholder="e.g. Scalable React Apps"
                  value={newSubservice.title}
                  onChange={(e) => setNewSubservice({ ...newSubservice, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Strategic Impact</label>
                <ClearableInput
                  id="sub-impact"
                  type="text"
                  placeholder="e.g. Boost conversion by 40%"
                  value={newSubservice.impact}
                  onChange={(e) => setNewSubservice({ ...newSubservice, impact: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Unit Description</label>
                <textarea
                  rows={4}
                  placeholder="Deep dive into this specialization..."
                  value={newSubservice.description}
                  onChange={(e) => setNewSubservice({ ...newSubservice, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Technical Features</label>
                <div className="flex gap-2">
                  <ClearableInput
                    id="sub-bullet"
                    type="text"
                    placeholder="Add a key feature"
                    value={newSubserviceBullet}
                    onChange={(e) => setNewSubserviceBullet(e.target.value)}
                    className="flex-1 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-emerald-200"
                  />
                  <button
                    onClick={handleAddSubserviceBullet}
                    className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {newSubservice.keyFeatures?.map((f, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{f}</span>
                      <button onClick={() => handleRemoveSubserviceBullet(i)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Icon Asset</label>
                  <input
                    type="file"
                    ref={subserviceIconRef}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100 dark:file:bg-emerald-900/20"
                    onChange={(e) => setNewSubservice({ ...newSubservice, icon: e.target.files?.[0] || null })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Title</label>
                  <ClearableInput
                    id="sub-seo-title"
                    type="text"
                    value={newSubservice.seoTitle}
                    onChange={(e) => setNewSubservice({ ...newSubservice, seoTitle: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Keywords</label>
                  <ClearableInput
                    id="sub-seo-keywords"
                    type="text"
                    value={newSubservice.seoKeywords}
                    onChange={(e) => setNewSubservice({ ...newSubservice, seoKeywords: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 p-2.5 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
                <button
                  onClick={editingSubserviceId ? handleUpdateSubservice : handleAddSubservice}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-12 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                  disabled={subserviceLoading}
                >
                  {subserviceLoading ? "Optimizing..." : editingSubserviceId ? "Update Sub-Unit" : "Define Sub-Unit"}
                </button>
              </div>
            </div>

            {/* Subservice display list */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {subservices.map((sub) => (
                <div key={sub.id} className="premium-card p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-400 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {sub.icon ? <img src={sub.icon} className="h-6 w-6 object-contain" alt="" /> : <FaEdit className="text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{sub.name}</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">{sub.impact}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditSubservice(sub)} className="p-2 text-slate-400 hover:text-blue-500"><FaEdit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteSubservice(sub.id)} className="p-2 text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ManageHierarchyPage;
