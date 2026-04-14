import React, { createContext, useContext, useState } from 'react';

// 1. Create context at module level, with a default shape for better autocomplete
const NavContext = createContext({
  categoryId: null,
  setCategoryId: () => { },
  categoryName1: null,
  setCategoryName1: () => { },
  serviceId: null,
  setServiceId: () => { },
  serviceName1: null,
  setServiceName1: () => { },
  subServiceId: null,
  setSubServiceId: () => { },
  blogId: null,
  setblogId: () => { }
});

// 2. Provider component wraps your app/router and holds the state
export function NavProvider({ children }) {

  const [categoryId, setCategoryId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [subServiceId, setSubServiceId] = useState(null);
  const [categoryName1, setCategoryName1] = useState(null);
  const [serviceName1, setServiceName1] = useState(null);
  const [blogId, setBlogId] = useState(null);


  return (
    <NavContext.Provider
      value={{
        categoryId,
        setCategoryId,
        serviceId,
        setServiceId,
        subServiceId,
        setSubServiceId,
        categoryName1,
        setCategoryName1,
        serviceName1,
        setServiceName1,
        blogId,
        setBlogId
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

// 3. Hook for consuming the context
export function useNav() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
}
