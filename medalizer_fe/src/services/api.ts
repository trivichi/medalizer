// src/services/api.ts
import axios from "axios";
import { API_ENDPOINTS, getAuthHeader } from "../config/api";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface TestResult {
  [key: string]: string;
}

export interface Report {
  report_id: string;
  filename: string;
  uploaded_at: string;
  structured_data: TestResult;
}

export interface ReportsResponse {
  user_email: string;
  report_history: TestResult[];
}

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 second timeout

export const apiService = {
  async signup(data: SignupData) {
    console.log("[API] Starting signup request");
    console.log("[API] Signup endpoint:", API_ENDPOINTS.SIGNUP);
    console.log("[API] Signup data:", { name: data.name, email: data.email, password: "***" });
    
    try {
      const response = await axios.post(API_ENDPOINTS.SIGNUP, data);
      console.log("[API] Signup successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Signup failed");
      console.error("[API] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  async login(data: LoginData): Promise<LoginResponse> {
    console.log("[API] Starting login request");
    console.log("[API] Login endpoint:", API_ENDPOINTS.LOGIN);
    console.log("[API] Login data:", { email: data.email, password: "***" });
    
    try {
      const response = await axios.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
      console.log("[API] Login successful");
      console.log("[API] Token received:", response.data.access_token ? "Yes" : "No");
      return response.data;
    } catch (error: any) {
      console.error("[API] Login failed");
      console.error("[API] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  async extractReport(file: File) {
    console.log("[API] Starting extract report request");
    console.log("[API] Extract endpoint:", API_ENDPOINTS.EXTRACT);
    console.log("[API] File details:", { name: file.name, size: file.size, type: file.type });
    
    const formData = new FormData();
    formData.append("file", file);
    
    const headers = {
      ...getAuthHeader(),
      "Content-Type": "multipart/form-data",
    };
    
    console.log("[API] Request headers:", headers);
    
    try {
      const response = await axios.post(API_ENDPOINTS.EXTRACT, formData, { headers });
      console.log("[API] Extract report successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Extract report failed");
      console.error("[API] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  async getReports(): Promise<ReportsResponse> {
    console.log("[API] Starting get reports request");
    console.log("[API] Reports endpoint:", API_ENDPOINTS.REPORTS);
    
    const headers = getAuthHeader();
    console.log("[API] Request headers:", headers);
    
    try {
      const response = await axios.get<ReportsResponse>(API_ENDPOINTS.REPORTS, { headers });
      console.log("[API] Get reports successful");
      console.log("[API] Number of reports:", response.data.report_history?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error("[API] Get reports failed");
      console.error("[API] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },
};