import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const RoleContext = createContext();

// Custom hook to use the role context
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    // Return default values if context is not available
    return {
      userRole: null,
      username: null,
      setUserRole: () => {},
      setUsername: () => {}
    };
  }
  return context;
};

// Provider component
export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUsername(userData.username || null);
        setUserRole(userData.role || null);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const value = {
    userRole,
    username,
    setUserRole,
    setUsername
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
