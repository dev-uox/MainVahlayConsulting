



// import { useState, useEffect } from "react";
// import { db, storage } from "../../firebaseConfig"; // Ensure correct Firebase import
// import Side_bar from "../../components/Side_bar";
// import {
//     collection,
//     getDocs,
//     updateDoc,
//     doc,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { v4 as uuidv4 } from "uuid";

// const ManageSubservices = () => {
//     const [services, setServices] = useState([]);
//     const [selectedService, setSelectedService] = useState("");
//     const [newSubservice, setNewSubservice] = useState({
//         name: "",
//         title: "",
//         description: "",
//         list: [""],
//         impact: "",
//         icon: "",
//     });
//     const [editingSubserviceIndex, setEditingSubserviceIndex] = useState(null);
//     const [loading, setLoading] = useState(false);

//     // Fetch all services and subservices from Firestore
//     useEffect(() => {
//         const fetchServices = async () => {
//             try {
//                 const querySnapshot = await getDocs(collection(db, "services"));
//                 const servicesData = querySnapshot.docs.map((doc) => ({
//                     id: doc.id,
//                     ...doc.data(),
//                     subservices: doc.data().subservices || [], // Ensure subservices array exists
//                 }));
//                 setServices(servicesData);
//             } catch (error) {
//                 console.error("Error fetching services:", error);
//             }
//         };

//         fetchServices();
//     }, []);

//     // Upload image to Firebase Storage and get URL
//     const uploadImage = async (file) => {
//         if (!file) return ""; // Return empty string if no file is uploaded
//         const storageRef = ref(storage, `subservices/${uuidv4()}-${file.name}`);
//         await uploadBytes(storageRef, file);
//         return getDownloadURL(storageRef);
//     };

//     // Add or Update Subservice
//     const handleSubmit = async () => {
//         if (!selectedService || !newSubservice.name || !newSubservice.title || !newSubservice.description || !newSubservice.impact) {
//             alert("Please fill in all fields.");
//             return;
//         }

//         setLoading(true);
//         let iconUrl = newSubservice.icon;

//         if (newSubservice.icon instanceof File) {
//             iconUrl = await uploadImage(newSubservice.icon);
//         }

//         const serviceRef = doc(db, "services", selectedService);
//         const serviceData = services.find((s) => s.id === selectedService);
//         let updatedSubservices = serviceData.subservices || [];

//         if (editingSubserviceIndex !== null) {
//             updatedSubservices[editingSubserviceIndex] = { ...newSubservice, icon: iconUrl };
//         } else {
//             updatedSubservices.push({ ...newSubservice, icon: iconUrl });
//         }

//         await updateDoc(serviceRef, { subservices: updatedSubservices });

//         setServices((prev) =>
//             prev.map((s) =>
//                 s.id === selectedService ? { ...s, subservices: updatedSubservices } : s
//             )
//         );

//         setNewSubservice({ name: "", title: "", description: "", list: [""], impact: "", icon: "" });
//         setEditingSubserviceIndex(null);
//         setLoading(false);
//     };

//     // Delete Subservice
//     const deleteSubservice = async (index) => {
//         const serviceRef = doc(db, "services", selectedService);
//         const serviceData = services.find((s) => s.id === selectedService);
//         const updatedSubservices = serviceData.subservices.filter((_, i) => i !== index);

//         await updateDoc(serviceRef, { subservices: updatedSubservices });

//         setServices((prev) =>
//             prev.map((s) =>
//                 s.id === selectedService ? { ...s, subservices: updatedSubservices } : s
//             )
//         );
//     };

//     // Edit Subservice
//     const editSubservice = (index) => {
//         const service = services.find((s) => s.id === selectedService);
//         if (!service || !service.subservices) return;
//         const subserviceToEdit = service.subservices[index];

//         setNewSubservice({
//             name: subserviceToEdit.name || "",
//             title: subserviceToEdit.title || "",
//             description: subserviceToEdit.description || "",
//             list: subserviceToEdit.list || [""],
//             impact: subserviceToEdit.impact || "",
//             icon: subserviceToEdit.icon || "",
//         });

//         setEditingSubserviceIndex(index);
//     };
//     // Handle bullet point list update
//     const updateListItem = (index, value) => {
//         const updatedList = [...newSubservice.list];
//         updatedList[index] = value;
//         setNewSubservice({ ...newSubservice, list: updatedList });
//     };

//     // Add a new bullet point
//     const addListItem = () => {
//         setNewSubservice({ ...newSubservice, list: [...newSubservice.list, ""] });
//     };

//     // Remove a bullet point
//     const removeListItem = (index) => {
//         const updatedList = newSubservice.list.filter((_, i) => i !== index);
//         setNewSubservice({ ...newSubservice, list: updatedList });
//     };


//     return (
//         <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
//             {/* Sidebar */}
//             <div className="w-full md:w-1/4 bg-white shadow-lg">
//                 <Side_bar />
//             </div>

//             {/* Main Content */}
//             <div className="w-full md:w-3/4 p-8 bg-white shadow-md rounded-lg m-4">
//                 <h2 className="text-xl font-bold mb-4">Manage Subservices</h2>

//                 {/* Select Service */}
//                 <select
//                     className="p-2 border rounded w-full mb-4"
//                     onChange={(e) => setSelectedService(e.target.value)}
//                     value={selectedService}
//                 >
//                     <option value="">Select a Service</option>
//                     {services.map((service) => (
//                         <option key={service.id} value={service.id}>
//                             {service.name}
//                         </option>
//                     ))}
//                 </select>

//                 {/* Add or Edit Subservice */}
//                 <div className="grid grid-cols-1 gap-4 mb-4">
//                     <input
//                         type="text"
//                         placeholder="Subservice Name"
//                         className="p-2 border rounded w-full"
//                         value={newSubservice.name}
//                         onChange={(e) => setNewSubservice({ ...newSubservice, name: e.target.value })}
//                     />
//                     <input
//                         type="text"
//                         placeholder="Subservice Title"
//                         className="p-2 border rounded w-full"
//                         value={newSubservice.title}
//                         onChange={(e) => setNewSubservice({ ...newSubservice, title: e.target.value })}
//                     />
//                     <input
//                         type="text"
//                         placeholder="Subservice Description"
//                         className="p-2 border rounded w-full"
//                         value={newSubservice.description}
//                         onChange={(e) => setNewSubservice({ ...newSubservice, description: e.target.value })}
//                     />



//                     <div>
//                         <h3 className="font-semibold mb-2">Subservice List</h3>
//                         {newSubservice.list.map((item, index) => (
//                             <div key={index} className="flex gap-2 mb-2">
//                                 <input
//                                     type="text"
//                                     className="p-2 border rounded w-full"
//                                     value={item}
//                                     onChange={(e) => updateListItem(index, e.target.value)}
//                                 />
//                                 <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => removeListItem(index)}>X</button>
//                             </div>
//                         ))}
//                         <button className="bg-gray-500 text-white px-4 py-2 rounded mt-2" onClick={addListItem}>
//                             + Add Bullet Point
//                         </button>
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Subservice Impact"
//                         className="p-2 border rounded w-full"
//                         value={newSubservice.impact}
//                         onChange={(e) => setNewSubservice({ ...newSubservice, impact: e.target.value })}
//                     />
//                     <input
//                         type="file"
//                         className="p-2 border rounded"
//                         onChange={(e) => setNewSubservice({ ...newSubservice, icon: e.target.files[0] })}
//                     />
//                 </div>

//                 <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit} disabled={loading}>
//                     {loading ? "Saving..." : editingSubserviceIndex !== null ? "Update Subservice" : "Add Subservice"}
//                 </button>

//                 {/* List of Subservices */}
//                 {selectedService && services.find((s) => s.id === selectedService)?.subservices?.length > 0 && (
//                     <table className="w-full mt-6 border-collapse border border-gray-300">
//                         <thead>
//                             <tr className="bg-gray-100">
//                                 <th className="border p-2">Icon</th>
//                                 <th className="border p-2">Subservice Name</th>
//                                 <th className="border p-2">Title</th>
//                                 <th className="border p-2">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {services.find((s) => s.id === selectedService)?.subservices?.map((subservice, index) => (
//                                 <tr key={index} className="text-center border">
//                                     <td className="border p-2"><img src={subservice.icon || ""} alt="Icon" className="w-10 h-10 mx-auto" /></td>
//                                     <td className="border p-2">{subservice.name}</td>
//                                     <td className="border p-2">{subservice.title}</td>
//                                     <td className="border p-2">
//                                         <button

//                                             className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
//                                             onClick={() => editSubservice(index)}>Edit</button>
//                                         <button
//                                             className="bg-red-500 text-white px-2 py-1 rounded"
//                                             onClick={() => deleteSubservice(index)}>Delete</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ManageSubservices;



import { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig"; 
import Side_bar from "../../components/Side_bar";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ManageSubservices = () => {
  // List of all services (for dropdown)
  const [services, setServices] = useState([]);

  // ID of the currently selected service
  const [selectedService, setSelectedService] = useState("");

  // Subservices for the currently selected service (fetched from subcollection)
  const [subservices, setSubservices] = useState([]);

  // Form data for creating/updating a subservice
  const [newSubservice, setNewSubservice] = useState({
    name: "",
    title: "",
    description: "",
    list: [""],
    impact: "",
    icon: null, // File or URL
  });

  // The ID of the subservice we are editing (null if creating a new one)
  const [editingSubserviceId, setEditingSubserviceId] = useState(null);

  const [loading, setLoading] = useState(false);

  //---------------------------------------------
  // 1. Fetch all services (for dropdown)
  //---------------------------------------------
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const servicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  //---------------------------------------------
  // 2. Fetch subservices for the selected service
  //---------------------------------------------
  useEffect(() => {
    if (!selectedService) {
      setSubservices([]);
      return;
    }

    const fetchSubservices = async () => {
      try {
        // subcollection path: services/{selectedService}/subservices
        const subservicesRef = collection(
          doc(db, "services", selectedService),
          "subservices"
        );
        const snapshot = await getDocs(subservicesRef);
        const data = snapshot.docs.map((subDoc) => ({
          id: subDoc.id,
          ...subDoc.data(),
        }));
        setSubservices(data);
      } catch (error) {
        console.error("Error fetching subservices:", error);
      }
    };

    fetchSubservices();
  }, [selectedService]);

  //---------------------------------------------
  // 3. Upload icon image to Firebase Storage
  //---------------------------------------------
  const uploadImage = async (file) => {
    if (!file) return "";
    const storageRef = ref(storage, `subservices/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  //---------------------------------------------
  // 4. Handle Create/Update Subservice
  //---------------------------------------------
  const handleSubmit = async () => {
    if (
      !selectedService ||
      !newSubservice.name ||
      !newSubservice.title ||
      !newSubservice.description ||
      !newSubservice.impact
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Upload icon if it's a File
      let iconUrl = typeof newSubservice.icon === "string" ? newSubservice.icon : "";
      if (newSubservice.icon instanceof File) {
        iconUrl = await uploadImage(newSubservice.icon);
      }

      // Subcollection reference
      const subservicesRef = collection(
        doc(db, "services", selectedService),
        "subservices"
      );

      // If editing, update the existing doc; else create a new doc
      if (editingSubserviceId) {
        const subserviceDocRef = doc(
          db,
          "services",
          selectedService,
          "subservices",
          editingSubserviceId
        );
        await updateDoc(subserviceDocRef, {
          name: newSubservice.name,
          title: newSubservice.title,
          description: newSubservice.description,
          list: newSubservice.list,
          impact: newSubservice.impact,
          icon: iconUrl,
        });
      } else {
        await addDoc(subservicesRef, {
          name: newSubservice.name,
          title: newSubservice.title,
          description: newSubservice.description,
          list: newSubservice.list,
          impact: newSubservice.impact,
          icon: iconUrl,
        });
      }

      // Refresh the subservices list
      setNewSubservice({
        name: "",
        title: "",
        description: "",
        list: [""],
        impact: "",
        icon: null,
      });
      setEditingSubserviceId(null);
      await reloadSubservices(); // re-fetch to update UI
    } catch (error) {
      console.error("Error saving subservice:", error);
    }

    setLoading(false);
  };

  //---------------------------------------------
  // 5. Re-fetch subservices after create/update
  //---------------------------------------------
  const reloadSubservices = async () => {
    if (!selectedService) return;
    const subservicesRef = collection(
      doc(db, "services", selectedService),
      "subservices"
    );
    const snapshot = await getDocs(subservicesRef);
    const data = snapshot.docs.map((subDoc) => ({
      id: subDoc.id,
      ...subDoc.data(),
    }));
    setSubservices(data);
  };

  //---------------------------------------------
  // 6. Edit Subservice
  //---------------------------------------------
  const editSubservice = (subservice) => {
    setNewSubservice({
      name: subservice.name || "",
      title: subservice.title || "",
      description: subservice.description || "",
      list: subservice.list || [""],
      impact: subservice.impact || "",
      icon: subservice.icon || null,
    });
    setEditingSubserviceId(subservice.id);
  };

  //---------------------------------------------
  // 7. Delete Subservice
  //---------------------------------------------
  const deleteSubservice = async (subserviceId) => {
    try {
      const subserviceDocRef = doc(
        db,
        "services",
        selectedService,
        "subservices",
        subserviceId
      );
      await deleteDoc(subserviceDocRef);
      // Refresh list
      setSubservices((prev) => prev.filter((item) => item.id !== subserviceId));
    } catch (error) {
      console.error("Error deleting subservice:", error);
    }
  };

  //---------------------------------------------
  // 8. Handling bullet point list updates
  //---------------------------------------------
  const updateListItem = (index, value) => {
    const updatedList = [...newSubservice.list];
    updatedList[index] = value;
    setNewSubservice({ ...newSubservice, list: updatedList });
  };

  const addListItem = () => {
    setNewSubservice({
      ...newSubservice,
      list: [...newSubservice.list, ""],
    });
  };

  const removeListItem = (index) => {
    const updatedList = newSubservice.list.filter((_, i) => i !== index);
    setNewSubservice({ ...newSubservice, list: updatedList });
  };

  //---------------------------------------------
  // Render
  //---------------------------------------------
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-white shadow-lg">
        <Side_bar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 p-8 bg-white shadow-md rounded-lg m-4">
        <h2 className="text-xl font-bold mb-4">Manage Subservices</h2>

        {/* Select Service */}
        <select
          className="p-2 border rounded w-full mb-4"
          onChange={(e) => {
            setSelectedService(e.target.value);
            setEditingSubserviceId(null);
            setNewSubservice({
              name: "",
              title: "",
              description: "",
              list: [""],
              impact: "",
              icon: null,
            });
          }}
          value={selectedService}
        >
          <option value="">Select a Service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>

        {/* Add or Edit Subservice */}
        {selectedService && (
          <div className="grid grid-cols-1 gap-4 mb-4">
            <input
              type="text"
              placeholder="Subservice Name"
              className="p-2 border rounded w-full"
              value={newSubservice.name}
              onChange={(e) =>
                setNewSubservice({ ...newSubservice, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Subservice Title"
              className="p-2 border rounded w-full"
              value={newSubservice.title}
              onChange={(e) =>
                setNewSubservice({ ...newSubservice, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Subservice Description"
              className="p-2 border rounded w-full"
              value={newSubservice.description}
              onChange={(e) =>
                setNewSubservice({
                  ...newSubservice,
                  description: e.target.value,
                })
              }
            />

            {/* Bullet Points */}
            <div>
              <h3 className="font-semibold mb-2">Subservice List</h3>
              {newSubservice.list.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={item}
                    onChange={(e) => updateListItem(index, e.target.value)}
                  />
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => removeListItem(index)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mt-2"
                onClick={addListItem}
              >
                + Add Bullet Point
              </button>
            </div>

            <input
              type="text"
              placeholder="Subservice Impact"
              className="p-2 border rounded w-full"
              value={newSubservice.impact}
              onChange={(e) =>
                setNewSubservice({ ...newSubservice, impact: e.target.value })
              }
            />

            {/* Icon Upload */}
            <input
              type="file"
              className="p-2 border rounded"
              onChange={(e) =>
                setNewSubservice({ ...newSubservice, icon: e.target.files[0] })
              }
            />

            {/* Submit Button */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingSubserviceId
                ? "Update Subservice"
                : "Add Subservice"}
            </button>
          </div>
        )}

        {/* List of Subservices */}
        {selectedService && subservices.length > 0 && (
          <table className="w-full mt-6 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Icon</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subservices.map((sub) => (
                <tr key={sub.id} className="text-center border">
                  <td className="border p-2">
                    {sub.icon && (
                      <img
                        src={sub.icon}
                        alt="Icon"
                        className="w-10 h-10 mx-auto object-cover"
                      />
                    )}
                  </td>
                  <td className="border p-2">{sub.name}</td>
                  <td className="border p-2">{sub.title}</td>
                  <td className="border p-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                      onClick={() => editSubservice(sub)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteSubservice(sub.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageSubservices;
