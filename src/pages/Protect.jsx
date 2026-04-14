import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const checkAuthorization = async () => {
      setLoading(true); // Start loading state
      const user = auth.currentUser;

      if (!user) {
        // Wait for Firebase to load user
        onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) {
            setLoading(false);
            return; // No user, redirect to login
          }
          await verifyUser(currentUser);
        });
      } else {
        await verifyUser(user);
      }
    };

    const verifyUser = async (user) => {
      if (adminOnly) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData.isAdmin) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          } else {
            setIsAuthorized(false);
          }
        } catch (error) {
          console.error("Error verifying admin status:", error);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(true);
      }
      setLoading(false);
    };

    checkAuthorization();
  }, [auth, adminOnly]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;