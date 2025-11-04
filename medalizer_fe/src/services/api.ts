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

export const apiService = {
  async signup(data: SignupData) {
    const response = await axios.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  async extractReport(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axios.post(API_ENDPOINTS.EXTRACT, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async getReports(): Promise<ReportsResponse> {
    const response = await axios.get<ReportsResponse>(API_ENDPOINTS.REPORTS, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};