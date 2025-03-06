// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";

// Create AuthContext to manage authentication state across the website
export const AuthContext = createContext();

// AuthProvider component wraps the app to provide authentication context
export const AuthProvider = ({ children }) => {
  // Initialize auth state from local storage
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  // Function to log the user in and save their data to state and local storage
  const login = (userData) => {
    setAuth(userData); // Update auth state with user data
    localStorage.setItem("auth", JSON.stringify(userData)); // Store user data in local storage
  };

  // Function to logout by clearing auth state and removing local storage data
  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  // Function to switch user roles without logging out
  const switchRole = (newRole) => {
    if (auth) {
      const updatedAuth = { ...auth, role: newRole }; // Create new auth object with updated role
      setAuth(updatedAuth);
      localStorage.setItem("auth", JSON.stringify(updatedAuth));
    }
  };

  // Provide authentication context to all child components
  return (
    <AuthContext.Provider value={{ auth, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
