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
import PageHeader from "../../components/common/PageHeader";

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
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <PageHeader
        title="Manage Projects"
        breadcrumbs={[
          { label: "Admin", to: "/manage-emp" },
          { label: "Projects" },
        ]}
      />

      <div className="w-full space-y-8">

        {/* Form Container */}
        <section className="premium-card p-6 border-l-4 border-l-red-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            {editId ? "Edit Project Details" : "Add New Project"}
          </h2>
          <form onSubmit={handleAddOrUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Title
                </label>
                <ClearableInput
                  id="project-title"
                  type="text"
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-red-200"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Service/Category
                </label>
                <select
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">Select a Service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the project..."
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="live">Live Project</option>
                  <option value="upcoming">Upcoming Project</option>
                </select>
              </div>

              {status === "live" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Link
                  </label>
                  <ClearableInput
                    id="project-link"
                    type="text"
                    className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-red-200"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Project Image
                </label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    {projectImage ? (
                      <div className="relative group">
                        <img
                          src={projectImage}
                          alt="Project"
                          className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                          <p className="text-white text-xs font-bold">Preview</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100
                        dark:file:bg-red-900/20 dark:file:text-red-400"
                      required={!projectImage}
                    />
                    {uploading && <p className="text-sm text-blue-500 mt-2 animate-pulse">🚀 Uploading image...</p>}
                    {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                    <p className="mt-2 text-xs text-slate-400">High resolution JPEG or PNG recommended.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all duration-200"
              >
                {editId ? "Update Project" : "Publish Project"}
              </button>
            </div>
          </form>
        </section>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Live Projects Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h2>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            {liveProjects.length === 0 ? (
              <div className="premium-card p-12 text-center">
                <p className="text-slate-500">No live projects currently listed.</p>
              </div>
            ) : (
              <Droppable droppableId="live">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {liveProjects.map((proj, index) => (
                      <Draggable
                        key={proj.id}
                        draggableId={proj.id}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="premium-card p-4 flex flex-col md:flex-row md:justify-between md:items-center group"
                          >
                            <div className="flex flex-col md:flex-row items-center flex-1 min-w-0">
                              <div
                                {...provided.dragHandleProps}
                                className="mr-4 p-2 text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-move transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                                </svg>
                              </div>
                              {proj.projectImage && (
                                <img
                                  src={proj.projectImage}
                                  alt={proj.title}
                                  className="w-20 h-20 object-cover rounded-lg border border-slate-100 dark:border-slate-700 mr-4 shadow-sm"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{proj.title}</h3>
                                  <span className="status-badge status-badge-blue">{proj.serviceId}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>
                                {proj.projectLink && (
                                  <a
                                    href={proj.projectLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-700 mt-2 group-hover:translate-x-1 transition-transform"
                                  >
                                    View Project <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-2 ml-auto">
                              <button
                                onClick={() => handleEdit(proj)}
                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Edit Project"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDelete(proj.id)}
                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete Project"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            )}
          </section>
        </DragDropContext>

        {/* Display Upcoming Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Future Releases</h2>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Upcoming
            </span>
          </div>
          {upcomingProjects.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <p className="text-slate-500">No upcoming projects found.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingProjects.map((proj) => (
                <li
                  key={proj.id}
                  className="premium-card p-4 flex flex-col gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {proj.projectImage && (
                      <img
                        src={proj.projectImage}
                        alt={proj.title}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{proj.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-end items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <button
                      onClick={() => handleEdit(proj)}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors tracking-widest uppercase"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors tracking-widest uppercase ml-4"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageProjects;
