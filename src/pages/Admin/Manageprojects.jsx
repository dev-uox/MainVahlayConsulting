import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig"; // Your Firebase config file
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ClearableInput from "../../components/common/ClearableInput";
import AdminPageShell, { AdminCard } from "../../components/common/AdminPageShell";

const ManageProjects = () => {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("live");
  const [projectImage, setProjectImage] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [services, setServices] = useState([]); // Services list
  const [selectedService, setSelectedService] = useState(""); // New state for services


  // State to hold all projects
  const [projects, setProjects] = useState([]);

  // Firebase Storage instance
  const storage = getStorage();

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchServices(); // Fetch services
  }, []);

  // 1. GET all projects from Firestore
  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // ✅ Fetch Services from Firestore
  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      const fetchedServices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Handle file selection and upload to Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      // Create a storage reference with a unique name
      const storageRef = ref(storage, `projectImages/${Date.now()}_${file.name}`);
      // Upload the file
      await uploadBytes(storageRef, file);
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      setProjectImage(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // 2. ADD or UPDATE project
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    // Prepare the project data
    const projectData = {
      title,
      description,
      status,
      projectImage,
      serviceId: selectedService, // Store selected service
      ...(status === "live" && { projectLink })
    };
    try {
      if (editId) {
        const docRef = doc(db, "projects", editId);
        await updateDoc(docRef, projectData);
        alert("Project updated!");
      } else {
        await addDoc(collection(db, "projects"), projectData);
        alert("Project added!");
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }

    // Reset form & refetch projects
    setTitle("");
    setDescription("");
    setStatus("live");
    setProjectImage("");
    setProjectLink("");
    setSelectedService("");
    setEditId(null);
    fetchProjects();
  };

  // 3. EDIT: Load project data into form
  const handleEdit = (project) => {
    setTitle(project.title || "");
    setDescription(project.description || "");
    setStatus(project.status || "live");
    setProjectImage(project.projectImage || "");
    setProjectLink(project.projectLink || "");
    setSelectedService(project.serviceId || ""); // Load selected service
    setEditId(project.id);

    // Scroll to the top of the page with a smooth effect
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. DELETE a project
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      alert("Project deleted!");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  //5. handleDragEnd


  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const status = result.source.droppableId;
    const items = projects
      .filter(p => p.status === status)
      .sort((a, b) => a.order - b.order);

    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const newOrder = index + 1;
      if (item.order !== newOrder) {
        const docRef = doc(db, "projects", item.id);
        batch.update(docRef, { order: newOrder });
      }
    });

    try {
      await batch.commit();
      fetchProjects();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to save new order");
    }
  };

  const getSortedProjects = (status) => {
    return projects
      .filter(p => p.status === status)
      .sort((a, b) => a.order - b.order);
  };


  // Separate projects by status for easy viewing
  const liveProjects = projects.filter((proj) => proj.status === "live");
  const upcomingProjects = projects.filter((proj) => proj.status === "upcoming");

  return (
    <AdminPageShell title="Manage Projects" subtitle="Add, edit, and organize live and upcoming projects">
            <AdminCard title="Project Details" subtitle="Add or update a project using the fields below.">
              <form onSubmit={handleAddOrUpdate} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                    <ClearableInput
                      id="project-title"
                      type="text"
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service / Category</label>
                    <select
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="">Choose a Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="live">Live Project</option>
                      <option value="upcoming">Upcoming Project</option>
                    </select>
                  </div>

                  {status === "live" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                      <ClearableInput
                        id="project-link"
                        type="text"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter project description"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">Choose file</div>
                      <div className="text-sm text-slate-400">{projectImage ? "Image selected" : "No file chosen"}</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-4 w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700"
                      required={!projectImage}
                    />
                    {uploading && <p className="mt-2 text-sm text-blue-500">Uploading image...</p>}
                    {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                  >
                    {editId ? "Update Project" : "Add Project"}
                  </button>
                  <p className="text-sm text-gray-500">{editId ? "Editing project. Save changes to update it." : "Add a new project to the list below."}</p>
                </div>
              </form>
            </AdminCard>

              <AdminCard title="Live Projects" subtitle="Projects currently visible to users.">
                {liveProjects.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                    No live projects currently listed.
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {liveProjects.map((proj, index) => (
                      <li key={proj.id} className="rounded-[24px] border border-gray-200 bg-gray-50 p-5 shadow-sm transition hover:border-red-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            {proj.projectImage && (
                              <img src={proj.projectImage} alt={proj.title} className="h-20 w-20 rounded-3xl object-cover border border-gray-200" />
                            )}
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900 truncate">{proj.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{proj.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {proj.serviceId && (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600 border border-gray-200">
                                {proj.serviceId}
                              </span>
                            )}
                            <button
                              onClick={() => handleEdit(proj)}
                              className="rounded-full border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(proj.id)}
                              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-600 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </AdminCard>

              <AdminCard title="Upcoming Projects" subtitle="Projects planned for future release.">
                {upcomingProjects.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                    No upcoming projects found.
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {upcomingProjects.map((proj) => (
                      <li key={proj.id} className="rounded-[24px] border border-gray-200 bg-gray-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            {proj.projectImage && (
                              <img src={proj.projectImage} alt={proj.title} className="h-16 w-16 rounded-3xl object-cover border border-gray-200" />
                            )}
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-slate-900 truncate">{proj.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{proj.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => handleEdit(proj)}
                              className="rounded-full border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(proj.id)}
                              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-600 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </AdminCard>
    </AdminPageShell>
  );
};

export default ManageProjects;
