import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const DetailsPage = () => {
  const { type, id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, type === "service" ? "services" : "blogs", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchData();
  }, [type, id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button className="mb-4 bg-gray-200 p-2 rounded" onClick={() => navigate("/")}>
        ⬅ Back to Home
      </button>

      <h1 className="text-3xl font-bold mb-4">{data.name || data.title}</h1>
      <p className="text-gray-600">{data.description}</p>

      {data.subservices && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Subservices</h2>
          {data.subservices.map((sub, index) => {
            const subId = `${id}-sub-${index}`; // Unique subservice ID
            return (
              <details key={subId} className="border p-2 rounded-md mt-2">
                <summary className="cursor-pointer font-semibold">
                  {sub.name}
                </summary>
                <p className="text-gray-500">{sub.description}</p>
                <Link 
                  to={`/subservice-details/${subId}`} 
                  className="text-blue-500 underline mt-2 inline-block"
                >
                  See More
                </Link>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DetailsPage;