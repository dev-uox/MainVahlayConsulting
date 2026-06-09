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
import AdminPageShell from "../../components/common/AdminPageShell";

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
      seoTitle: sub.seoTitle || "", // Γ£à fixed
      seoDescription: sub.seoDescription || "", // Γ£à fixed
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
  // UI: Card wrapper
  // ==============================
  const Card = ({ title, right, children }) => (
    <div className="bg-white rounded-xl shadow p-4 sm:p-5">
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </div>
  );

  // ==============================
  // RENDER
  // ==============================
  return (
    <AdminPageShell title="Manage Services" subtitle="Manage categories, services, and subservices" wide>
          <div className="space-y-4 sm:space-y-6">
            {/* -------------------- CATEGORIES -------------------- */}
            <Card
              title="Categories"
              right={
                editingCategoryId ? (
                  <button
                    onClick={resetCategoryForm}
                    className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                ) : null
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="p-2.5 border rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="Category Title"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  className="p-2.5 border rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="Category Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="p-2.5 border rounded-lg w-full"
                />

                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated)"
                  value={newCategory.seoKeywords}
                  onChange={(e) => setNewCategory({ ...newCategory, seoKeywords: e.target.value })}
                  className="p-2.5 border rounded-lg w-full md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="SEO Title"
                  value={newCategory.seoTitle}
                  onChange={(e) => setNewCategory({ ...newCategory, seoTitle: e.target.value })}
                  className="p-2.5 border rounded-lg w-full"
                />
                <input
                  type="text"
                  placeholder="SEO Description"
                  value={newCategory.seoDescription}
                  onChange={(e) => setNewCategory({ ...newCategory, seoDescription: e.target.value })}
                  className="p-2.5 border rounded-lg w-full md:col-span-2"
                />

                <input
                  type="file"
                  ref={categoryImageRef}
                  className="p-2.5 border rounded-lg w-full"
                  onChange={(e) => setNewCategory({ ...newCategory, image: e.target.files?.[0] || null })}
                />

                <button
                  onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
                  className="bg-red-600 text-white px-4 py-2.5 rounded-lg w-full md:w-auto"
                  disabled={categoryLoading}
                >
                  {categoryLoading
                    ? "Saving..."
                    : editingCategoryId
                      ? "Update Category"
                      : "Add Category"}
                </button>
              </div>

              {/* Category chips (mobile horizontal scroll) */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap ${cat.id === selectedCategory
                        ? "bg-red-100 border-red-300"
                        : "bg-gray-50 border-gray-300"
                      }`}
                  >
                    <span className="underline text-gray-700">{cat.name}</span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(cat);
                      }}
                      className="text-red-500"
                      title="Edit"
                    >
                      <FaEdit />
                    </span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                      className="text-red-500 text-lg leading-none"
                      title="Delete"
                    >
                      ├ù
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* -------------------- SERVICES -------------------- */}
            {selectedCategory && (
              <Card
                title="Services"
                right={
                  editingServiceId ? (
                    <button
                      onClick={resetServiceForm}
                      className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                  ) : null
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="Service Title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="Service Description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />

                  <input
                    type="text"
                    placeholder="SEO Keywords (comma separated)"
                    value={newService.seoKeywords}
                    onChange={(e) => setNewService({ ...newService, seoKeywords: e.target.value })}
                    className="p-2.5 border rounded-lg w-full md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="SEO Title"
                    value={newService.seoTitle}
                    onChange={(e) => setNewService({ ...newService, seoTitle: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="SEO Description"
                    value={newService.seoDescription}
                    onChange={(e) => setNewService({ ...newService, seoDescription: e.target.value })}
                    className="p-2.5 border rounded-lg w-full md:col-span-2"
                  />

                  <input
                    type="file"
                    ref={serviceImageRef}
                    className="p-2.5 border rounded-lg w-full"
                    onChange={(e) => setNewService({ ...newService, image: e.target.files?.[0] || null })}
                  />

                  <div className="md:col-span-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add Why Choose Us bullet"
                      value={newServiceBullet}
                      onChange={(e) => setNewServiceBullet(e.target.value)}
                      className="p-2.5 border rounded-lg flex-1"
                    />
                    <button
                      onClick={handleAddServiceBullet}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add Bullet
                    </button>
                  </div>

                  {newService.whyChooseUs?.length > 0 && (
                    <ul className="md:col-span-3 space-y-1 bg-gray-50 p-3 rounded-lg">
                      {newService.whyChooseUs.map((b, i) => (
                        <li key={i} className="flex justify-between text-sm text-gray-700">
                          ΓÇó {b}
                          <button
                            onClick={() => handleRemoveServiceBullet(i)}
                            className="text-red-500 ml-2"
                          >
                            ├ù
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={editingServiceId ? handleUpdateService : handleAddService}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg w-full md:w-auto mt-2"
                    disabled={serviceLoading}
                  >
                    {serviceLoading
                      ? "Saving..."
                      : editingServiceId
                        ? "Update Service"
                        : "Add Service"}
                  </button>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap ${svc.id === selectedService
                          ? "bg-green-100 border-green-300 shadow-sm"
                          : "bg-gray-50 border-gray-300"
                        }`}
                    >
                      <span className="underline text-gray-700">{svc.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditService(svc);
                        }}
                        className="text-red-600"
                        title="Edit"
                      >
                        <FaEdit />
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(svc.id);
                        }}
                        className="text-red-600 text-lg leading-none"
                        title="Delete"
                      >
                        ├ù
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* -------------------- SUBSERVICES -------------------- */}
            {selectedService && (
              <Card
                title="Subservices"
                right={
                  editingSubserviceId ? (
                    <button
                      onClick={resetSubserviceForm}
                      className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                  ) : null
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Subservice Name"
                    value={newSubservice.name}
                    onChange={(e) => setNewSubservice({ ...newSubservice, name: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="Subservice Title"
                    value={newSubservice.title}
                    onChange={(e) => setNewSubservice({ ...newSubservice, title: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="Subservice Description"
                    value={newSubservice.description}
                    onChange={(e) => setNewSubservice({ ...newSubservice, description: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />

                  <input
                    type="text"
                    placeholder="Subservice Impact"
                    value={newSubservice.impact}
                    onChange={(e) => setNewSubservice({ ...newSubservice, impact: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />

                  <input
                    type="text"
                    placeholder="SEO Keywords (comma separated)"
                    value={newSubservice.seoKeywords}
                    onChange={(e) => setNewSubservice({ ...newSubservice, seoKeywords: e.target.value })}
                    className="p-2.5 border rounded-lg w-full md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="SEO Title"
                    value={newSubservice.seoTitle}
                    onChange={(e) => setNewSubservice({ ...newSubservice, seoTitle: e.target.value })}
                    className="p-2.5 border rounded-lg w-full"
                  />
                  <input
                    type="text"
                    placeholder="SEO Description"
                    value={newSubservice.seoDescription}
                    onChange={(e) => setNewSubservice({ ...newSubservice, seoDescription: e.target.value })}
                    className="p-2.5 border rounded-lg w-full md:col-span-2"
                  />

                  <input
                    type="file"
                    ref={subserviceIconRef}
                    className="p-2.5 border rounded-lg w-full"
                    onChange={(e) => setNewSubservice({ ...newSubservice, icon: e.target.files?.[0] || null })}
                  />

                  <div className="md:col-span-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add Key Feature bullet"
                      value={newSubserviceBullet}
                      onChange={(e) => setNewSubserviceBullet(e.target.value)}
                      className="p-2.5 border rounded-lg flex-1"
                    />
                    <button
                      onClick={handleAddSubserviceBullet}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add Bullet
                    </button>
                  </div>

                  {newSubservice.keyFeatures?.length > 0 && (
                    <ul className="md:col-span-3 space-y-1 bg-gray-50 p-3 rounded-lg">
                      {newSubservice.keyFeatures.map((b, i) => (
                        <li key={i} className="flex justify-between text-sm text-gray-700">
                          ΓÇó {b}
                          <button
                            onClick={() => handleRemoveSubserviceBullet(i)}
                            className="text-red-500 ml-2"
                          >
                            ├ù
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={editingSubserviceId ? handleUpdateSubservice : handleAddSubservice}
                    className="bg-purple-600 text-white px-4 py-2.5 rounded-lg w-full md:w-auto mt-2"
                    disabled={subserviceLoading}
                  >
                    {subserviceLoading
                      ? "Saving..."
                      : editingSubserviceId
                        ? "Update Subservice"
                        : "Add Subservice"}
                  </button>
                </div>

                {/* Subservice grid matches the image */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subservices.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 border rounded-xl bg-white shadow-sm relative group hover:border-purple-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 border-b-2 border-gray-100 pb-1">
                          {sub.name}
                        </h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditSubservice(sub)}
                            className="text-red-500 hover:scale-110 transition-transform"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubservice(sub.id)}
                            className="text-red-500 hover:scale-110 transition-transform text-lg leading-none"
                          >
                            ├ù
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {sub.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
    </AdminPageShell>
  );
};

export default ManageHierarchyPage;
