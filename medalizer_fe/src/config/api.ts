// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backendofhack.onrender.com";
// export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

console.log("[CONFIG] API Base URL:", API_BASE_URL);

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGIN: `${API_BASE_URL}/login`,
  EXTRACT: `${API_BASE_URL}/extract`,
  REPORTS: `${API_BASE_URL}/reports`,
} as const;

console.log("[CONFIG] API Endpoints configured:", API_ENDPOINTS);

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  console.log("[CONFIG] Getting auth header, token exists:", !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};