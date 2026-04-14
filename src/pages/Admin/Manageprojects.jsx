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
import Side_bar from "../../components/Side_bar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status);
    setProjectImage(project.projectImage);
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
    <div className="min-h-screen bg-gray-100 flex">

      <main className="flex-1">

        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6 border-b-4 border-red-500 pb-2">
            Manage Project
          </h1>
          {/* Sidebar */}



          <div className="w-full ">

            {/* Form */}
            <form
              onSubmit={handleAddOrUpdate}
              className="bg-white p-4 rounded shadow mb-8"
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  required
                />
              </div>

              {/* File input for project image */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Project Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded"
                  required={!projectImage} // Required if no image URL is present
                />
                {uploading && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
                {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                {projectImage && (
                  <img src={projectImage} alt="Project" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="live">Live</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              {/* Dropdown for selecting services */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Service</label>
                <select
                  className="w-full p-2 border rounded"
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

              {/* Only show project link field when status is "live" */}
              {status === "live" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    Project Link
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="Enter project link"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                {editId ? "Update Project" : "Add Project"}
              </button>
            </form>

            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Live Projects Section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-2">Live Projects</h2>
                {liveProjects.length === 0 ? (
                  <p>No live projects found.</p>
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
                                className="bg-white rounded shadow p-4 mb-2 flex flex-col md:flex-row md:justify-between md:items-center"
                              >
                                <div className="flex flex-col md:flex-row items-center">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mr-4 cursor-move"
                                  >
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                      />
                                    </svg>
                                  </div>
                                  {proj.projectImage && (
                                    <img
                                      src={proj.projectImage}
                                      alt={proj.title}
                                      className="w-16 h-16 object-cover mr-4 mb-2 md:mb-0"
                                    />
                                  )}
                                  <div>
                                    <h3 className="font-semibold">{proj.title} <span className="text-red-500 mx-2 ">{proj.serviceId}</span></h3>
                                    <p className="text-sm text-gray-600">{proj.description}</p>
                                    {proj.projectLink && (
                                      <a
                                        href={proj.projectLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline text-sm mx-2"
                                      >
                                        Visit
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-4 flex space-x-4">
                                  <button
                                    onClick={() => handleEdit(proj)}
                                    className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(proj.id)}
                                    className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                                  >
                                    Delete
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
              <h2 className="text-xl font-bold mb-2">Upcoming Projects</h2>
              {upcomingProjects.length === 0 && <p>No upcoming projects found.</p>}
              <ul>
                {upcomingProjects.map((proj) => (
                  <li
                    key={proj.id}
                    className="bg-white rounded shadow p-4 mb-2 flex flex-col md:flex-row md:justify-between md:items-center"
                  >
                    <div className="flex flex-col md:flex-row items-center">
                      {proj.projectImage && (
                        <img
                          src={proj.projectImage}
                          alt={proj.title}
                          className="w-16 h-16 object-cover mr-4 mb-2 md:mb-0"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{proj.title}</h3>
                        <p className="text-sm text-gray-600">{proj.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleEdit(proj)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageProjects;
