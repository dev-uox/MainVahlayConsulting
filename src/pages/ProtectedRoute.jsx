import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Props:
 *  - roles?: string[]   // e.g. ["admin"], ["recruiter"], ["admin","recruiter"]
 * If roles is omitted, any authenticated user is allowed.
 *
 * Redirects:
 *  - Not signed in  -> /login
 *  - Signed in but unauthorized -> /unauthorize
 */
const ProtectedRoute = ({ children, roles, permission }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const emailKey = (user.email || "").toLowerCase().trim();
        const userRef = doc(db, "users", emailKey);
        const userSnap = await getDoc(userRef);

        let userRole = null;
        if (userSnap.exists()) {
          userRole = String(userSnap.data()?.role || "user").toLowerCase();
        } else {
          // Fallback: Query jobApplications by email field
          const q = query(collection(db, "jobApplications"), where("email", "==", emailKey));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userRole = String(querySnapshot.docs[0].data()?.role || "user").toLowerCase();
          }
        }

        if (!userRole) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Admin always has access to everything for safety
        if (userRole === "admin") {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // 1. Check if specific permission is required
        if (permission) {
          const roleRef = doc(db, "roles", userRole);
          const roleSnap = await getDoc(roleRef);
          if (roleSnap.exists()) {
            const permissions = roleSnap.data()?.permissions || [];
            setIsAuthorized(permissions.includes(permission));
          } else {
            setIsAuthorized(false);
          }
        } 
        // 2. Fallback to hardcoded roles list if provided
        else if (roles && roles.length > 0) {
          setIsAuthorized(roles.map((r) => r.toLowerCase()).includes(userRole));
        } 
        // 3. No specific role or permission required -> just authenticated is enough
        else {
          setIsAuthorized(true);
        }

      } catch (e) {
        console.error("ProtectedRoute error:", e);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, roles, permission]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  // Not signed in -> send to login
  if (!auth.currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but role not allowed
  if (!isAuthorized) {
    return <Navigate to="/unauthorize" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
