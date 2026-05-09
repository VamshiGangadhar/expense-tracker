import axios from "axios";
import API_CONFIG from "./api-config";

/**
 * Fetches Gmail messages within a specific date range.
 * @param {string} startDate - Format: YYYY/MM/DD (e.g., "2024/05/01")
 * @param {string} endDate - Format: YYYY/MM/DD (e.g., "2024/05/09")
 */
export const fetchEmails = async (startDate?: string, endDate?: string) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("expense_tracker_token") : null;
    
    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/google/emails`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate, // Optional
        endDate,   // Optional
      },
    });

    return response.data; // Returns { total: count, emails: [...] }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching emails:", error.response?.data || error.message);
    } else {
      console.error("Error fetching emails:", error);
    }
    throw error;
  }
};
