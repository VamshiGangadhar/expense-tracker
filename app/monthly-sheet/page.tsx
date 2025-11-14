"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AuthWrapper from "@/components/auth/AuthWrapper";
import MonthlyExpenseSheet from "@/components/monthly-expense-sheet";

export default function MonthlySheet() {
  const [authToken, setAuthToken] = useState<string | null>(null);

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
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  const handleAuthSuccess = (token: string) => {
    console.log("Auth success in monthly sheet");
    setAuthToken(token);
  };

  return (
    <AuthWrapper onAuthSuccess={handleAuthSuccess}>
      <MonthlyExpenseSheet />
    </AuthWrapper>
  );
}
