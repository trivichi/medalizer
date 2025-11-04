// export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backendofhack.onrender.com";

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGIN: `${API_BASE_URL}/login`,
  EXTRACT: `${API_BASE_URL}/extract`,
  REPORTS: `${API_BASE_URL}/reports`,
} as const;

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};