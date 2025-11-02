"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import Signup from "./Signup";

interface AuthWrapperProps {
  onAuthSuccess: (token: string) => void;
  children: React.ReactNode;
}

export default function AuthWrapper({
  onAuthSuccess,
  children,
}: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("expense_tracker_token");
      
      if (token) {
        console.log("Found token in localStorage:", token.substring(0, 20) + "...");
        // For now, trust the token exists - let individual API calls handle validation
        setIsAuthenticated(true);
        onAuthSuccess(token);
      } else {
        console.log("No token found in localStorage");
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [onAuthSuccess]);

  const handleAuthSuccess = (token: string) => {
    setIsAuthenticated(true);
    onAuthSuccess(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("expense_tracker_token");
    localStorage.removeItem("expense_tracker_user");
    // Clear axios default headers
    if (axios.defaults.headers.common) {
      delete axios.defaults.headers.common['Authorization'];
    }
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {currentView === "login" ? (
            <Login
              onSwitchToSignup={() => setCurrentView("signup")}
              onLoginSuccess={handleAuthSuccess}
            />
          ) : (
            <Signup
              onSwitchToLogin={() => setCurrentView("login")}
              onSignupSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Add logout functionality to the header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold">💰 Expense Tracker</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
