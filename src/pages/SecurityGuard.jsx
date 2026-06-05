import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
 
const SecurityGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
 
  useEffect(() => {
    // 🔹 1. Disable Right Click
    const disableRightClick = (event) => event.preventDefault();
 
    // 🔹 2. Block DevTools Shortcuts
    const disableShortcuts = (event) => {
      if (
        event.ctrlKey &&
        ["u", "U", "i", "I", "j", "J", "s", "S", "h", "H", "k", "K"].includes(event.key)
      ) {
        event.preventDefault();
      }
      if (event.key === "F12") {
        event.preventDefault(); // Disable F12 (DevTools)
      }
    };
 
  
 
    // 🔹 4. Hide Sensitive Data from Global Scope
    (function () {
      let secretData = "Hidden Value"; // Private variable
      window.getSecretData = function () {
        return "Access Denied";
      };
    })();
 
    // 🔹 5. Detect DevTools on Page Load (Disabled debugger)
    const detectDevToolsOnLoad = () => {
      // debugger; 
    };
    detectDevToolsOnLoad();
 
    // 🔹 6. Continuously Monitor DevTools (Disabled debugger)
    const detectDevToolsContinuous = setInterval(() => {
      // debugger;
    }, 2000);
 
    // 🔹 7. Prevent API Tampering (Fake Example)
    window.fetch = new Proxy(window.fetch, {
      apply: function (target, thisArg, argumentsList) {
        console.warn("API Request Attempted:", argumentsList);
        return target.apply(thisArg, argumentsList);
      },
    });
 
    // Attach Event Listeners
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableShortcuts);
 
    // Cleanup on Unmount
    return () => {
      clearInterval(detectDevToolsContinuous);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, [location, navigate]);
 
  return null;
};
 
export default SecurityGuard;
 