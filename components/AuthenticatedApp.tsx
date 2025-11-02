"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthWrapper from "@/components/auth/AuthWrapper";
import ExpenseTracker from "@/components/expense-tracker";

export default function AuthenticatedApp() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Set up axios interceptor to include auth token in all requests
  useEffect(() => {
    if (authToken) {
      // Set default authorization header for all axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token);
  };

  return (
    <AuthWrapper onAuthSuccess={handleAuthSuccess}>
      <ExpenseTracker />
    </AuthWrapper>
  );
}
