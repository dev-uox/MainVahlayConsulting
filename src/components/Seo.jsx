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
        <title>{seoData.metaTitle || "Vahlay Consulting | Global BPO & IT Solutions"}</title>
        <meta name="description" content={seoData.metaDescription || "Vahlay Consulting offers premium BPO, IT solutions, and strategic consulting services globally."} />
        <meta name="keywords" content={seoData.keywords || "BPO, IT Solutions, Consulting, Vahlay, Business Growth"} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={seoData.metaTitle || "Vahlay Consulting"} />
        <meta property="og:description" content={seoData.metaDescription || "Premium Global Solutions"} />
        <meta property="og:image" content="/assets/logo1.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={seoData.metaTitle || "Vahlay Consulting"} />
        <meta property="twitter:description" content={seoData.metaDescription || "Premium Global Solutions"} />
        <meta property="twitter:image" content="/assets/logo1.png" />
      </Helmet>
    )
  );
};

export default SEO;
