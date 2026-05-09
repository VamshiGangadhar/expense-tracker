"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import Signup from "./Signup";
import Settings from "../settings/Settings"; // Import the new component

interface AuthWrapperProps {
  onAuthSuccess: (token: string) => void;
  children: React.ReactNode;
}

export default function AuthWrapper({ onAuthSuccess, children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("expense_tracker_token");
      if (token) {
        setIsAuthenticated(true);
        onAuthSuccess(token);
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
    setIsAuthenticated(false);
  };

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {currentView === "login" ? (
          <Login onSwitchToSignup={() => setCurrentView("signup")} onLoginSuccess={handleAuthSuccess} />
        ) : (
          <Signup onSwitchToLogin={() => setCurrentView("login")} onSignupSuccess={handleAuthSuccess} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Updated Navbar with Settings */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            💰 Expense Tracker
          </h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`text-sm font-medium ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              Settings
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-500 text-sm font-medium hover:underline">
          Logout
        </button>
      </nav>

      {/* Conditional Rendering */}
      <main>
        {activeTab === "settings" ? <Settings /> : children}
      </main>
    </div>
  );
}
