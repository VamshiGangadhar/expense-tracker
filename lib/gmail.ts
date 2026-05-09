import axios from "axios";
import API_CONFIG from "./api-config";

/**
 * Fetches Gmail messages within a specific date range.
 * @param {string} startDate - Format: YYYY/MM/DD (e.g., "2024/05/01")
 * @param {string} endDate - Format: YYYY/MM/DD (e.g., "2024/05/09")
 */
export const fetchEmails = async (startDate?: string, endDate?: string) => {
  try {
    const token = localStorage.getItem("expense_tracker_token");
    
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
  } catch (error: any) {
    console.error("Error fetching emails:", error.response?.data || error.message);
    throw error;
  }
};
