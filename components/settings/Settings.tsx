"use client";

import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "@/lib/api-config";

export default function Settings() {
  const [loading, setLoading] = useState(false);

  const handleConnectGmail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("expense_tracker_token");
      // Calling the backend we just updated
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/google/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: unknown) {
      console.error("Error fetching Google Auth URL:", error);
      alert("Failed to connect to Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Google Integration</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Connect your Gmail to allow the app to read expense emails and receipts.
        </p>
        <button
          onClick={handleConnectGmail}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700
      disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect Gmail"}
        </button>
      </div>
    </div>
  );
}
