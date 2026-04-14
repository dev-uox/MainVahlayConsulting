import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
const ProtectedRoute = ({ children, roles }) => {
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

        // No specific role required -> any signed-in user can pass
        if (!roles || roles.length === 0) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Load role from Firestore at users/{emailLower}
        const emailKey = (user.email || "").toLowerCase();
        const userRef = doc(db, "users", emailKey);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const role = String(snap.data()?.role || "user").toLowerCase();
        setIsAuthorized(roles.map((r) => r.toLowerCase()).includes(role));
      } catch (e) {
        console.error("ProtectedRoute error:", e);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, roles]);

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
