"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import AuthWrapper from "@/components/auth/AuthWrapper";
import ExpenseTracker from "@/components/expense-tracker";
import { EMITracker } from "@/components/emi-tracker";
import SavingsTracker from "@/components/savings-tracker";
import LendingTracker from "@/components/lending-tracker";

export default function AuthenticatedApp() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const pathname = usePathname();

  // Initialize token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("expense_tracker_token");
    if (savedToken) {
      setAuthToken(savedToken);
    }
  }, []);

  // Set up axios interceptor to include auth token in all requests
  useEffect(() => {
    if (authToken) {
      // Set default authorization header for all axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      console.log(
        "Set authorization header:",
        `Bearer ${authToken.substring(0, 20)}...`
      );
    } else {
      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];
      console.log("Removed authorization header");
    }
  }, [authToken]);

  const handleAuthSuccess = (token: string) => {
    console.log("Auth success, setting token:", token.substring(0, 20) + "...");
    setAuthToken(token);
  };

  const renderContent = () => {
    switch (pathname) {
      case "/emi":
        return <EMITracker />;
      case "/savings":
        return <SavingsTracker />;
      case "/lending":
        return <LendingTracker />;
      default:
        return <ExpenseTracker />;
    }
  };

  return (
    <AuthWrapper onAuthSuccess={handleAuthSuccess}>
      {renderContent()}
    </AuthWrapper>
  );
}
