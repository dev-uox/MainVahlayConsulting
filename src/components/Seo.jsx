import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SEO = () => {
  const location = useLocation();
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const seoRef = collection(db, "seo");
        // Adjust the query according to your Firestore schema.
        const q = query(seoRef, where("page", "==", location.pathname));
        const seoSnapshot = await getDocs(q);
        if (!seoSnapshot.empty) {
          const seoDoc = seoSnapshot.docs[0].data();
          setSeoData(seoDoc);
        } else {
          setSeoData(null);
        }
      } catch (err) {
        console.error("Error fetching SEO data:", err);
      }
    };

    fetchSeoData();
  }, [location.pathname]);

  return (
    seoData && (
      <Helmet>
        <title>{seoData.metaTitle || "Default Title"}</title>
        <meta name="description" content={seoData.metaDescription || "Default description"} />
        <meta name="keywords" content={seoData.keywords || "default, keywords"} />
      </Helmet>
    )
  );
};

export default SEO;
