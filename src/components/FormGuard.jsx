import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Routes that are always accessible (even without form completion)
const ALWAYS_ALLOWED = [
  "/login",
  "/signup",
  "/forgotpassword",
  "/multistepform",
  "/unauthorize",
  "/terms",
  "/privacy",
];

// Any role other than 'user' bypassed the form

/**
 * FormGuard wraps the app layout and forces regular users
 * to complete the MultiStepForm before accessing any other page.
 */
const FormGuard = ({ children }) => {
  const [status, setStatus] = useState("loading"); // 'loading' | 'needs-form' | 'ok'
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in — let normal routes & redirects handle it
        setStatus("ok");
        return;
      }

      try {
        const emailKey = (user.email || "").toLowerCase().trim();
        
        // 1) Check users collection
        const userRef = doc(db, "users", emailKey);
        const userSnap = await getDoc(userRef);
        
        let role = "user";
        let userDocExists = false;
        if (userSnap.exists()) {
          role = String(userSnap.data()?.role || "user").toLowerCase();
          userDocExists = true;
        }

        // 2) Fallback to jobApplications
        let data = {};
        const jobAppsRef = collection(db, "jobApplications");
        const q = query(jobAppsRef, where("email", "==", emailKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          data = querySnapshot.docs[0].data();
          if (!userDocExists) {
            role = String(data?.role || "user").toLowerCase();
          }
        }

        // formCompleted flag OR legacy: user already has a firstName (filled form before flag was added)
        const formCompleted = !!data?.formCompleted || !!data?.firstName;

        // Exempt if not a standard user OR form completed
        if (role !== "user" || formCompleted) {
          setStatus("ok");
        } else {
          setStatus("needs-form");
        }
      } catch (e) {
        console.error("FormGuard error:", e);
        // On error, don't block the user
        setStatus("ok");
      }
    });

    return () => unsubscribe();
  }, [auth, location.pathname]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const currentPath = location.pathname.toLowerCase();
  const isAllowedPath = ALWAYS_ALLOWED.some((p) =>
    currentPath.startsWith(p.toLowerCase())
  );

  if (status === "needs-form" && !isAllowedPath) {
    return <Navigate to="/multistepform" replace />;
  }

  // If form is already done and user tries to revisit the form page, redirect to profile
  if (status === "ok" && currentPath === "/multistepform") {
    const auth = getAuth();
    const user = auth.currentUser;
    // Only redirect logged-in users away from form (not unauthenticated)
    if (user) {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

export default FormGuard;
