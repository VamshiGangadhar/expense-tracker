// API Configuration
const API_CONFIG = {
  // Use local development server by default
  // Change to production URL when deploying
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://expense-tracker-backend-delta-seven.vercel.app"
      : "http://localhost:3004",
};

export default API_CONFIG;
