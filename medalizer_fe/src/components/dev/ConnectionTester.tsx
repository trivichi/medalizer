// src/components/dev/ConnectionTester.tsx
// This component helps test backend connectivity
// Remove in production or wrap in dev-only check

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

export default function ConnectionTester() {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const testConnection = async () => {
    console.log("[ConnectionTester] Starting connection test");
    setStatus("testing");
    setMessage("Testing connection...");

    try {
      // Test 1: Check if server is reachable
      console.log("[ConnectionTester] Test 1: Checking server reachability");
      console.log("[ConnectionTester] Target URL:", API_BASE_URL);
      
      const response = await axios.get(`${API_BASE_URL}/`, {
        timeout: 10000
      });
      
      console.log("[ConnectionTester] Server response:", response.data);
      console.log("[ConnectionTester] Status code:", response.status);
      
      setStatus("success");
      setMessage(`Connected successfully! Status: ${response.status}`);
    } catch (error: any) {
      console.error("[ConnectionTester] Connection test failed");
      
      if (error.code === 'ECONNABORTED') {
        console.error("[ConnectionTester] Request timeout");
        setMessage("Connection timeout. Server might be slow or unreachable.");
      } else if (error.response) {
        console.error("[ConnectionTester] Server responded with error:", {
          status: error.response.status,
          data: error.response.data
        });
        setMessage(`Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("[ConnectionTester] No response received");
        console.error("[ConnectionTester] Request details:", error.request);
        setMessage("No response from server. Check network or CORS settings.");
      } else {
        console.error("[ConnectionTester] Request setup error:", error.message);
        setMessage(`Error: ${error.message}`);
      }
      
      setStatus("error");
    }
  };

  const testEndpoints = async () => {
    console.log("[ConnectionTester] Testing individual endpoints");
    setStatus("testing");
    
    const endpoints = [
      { name: "Signup", url: `${API_BASE_URL}/signup` },
      { name: "Login", url: `${API_BASE_URL}/login` },
      { name: "Extract", url: `${API_BASE_URL}/extract` },
      { name: "Reports", url: `${API_BASE_URL}/reports` },
    ];

    for (const endpoint of endpoints) {
      console.log(`[ConnectionTester] Testing ${endpoint.name}: ${endpoint.url}`);
      try {
        await axios.options(endpoint.url, { timeout: 5000 });
        console.log(`[ConnectionTester] ${endpoint.name} - OK`);
      } catch (error: any) {
        console.error(`[ConnectionTester] ${endpoint.name} - Failed:`, error.message);
      }
    }
    
    setStatus("idle");
    setMessage("Check console for detailed endpoint test results");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Backend Connection Tester</h3>
      <p className="text-xs text-gray-600 mb-3">Target: {API_BASE_URL}</p>
      
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={status === "testing"}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {status === "testing" ? "Testing..." : "Test Connection"}
        </button>
        
        <button
          onClick={testEndpoints}
          disabled={status === "testing"}
          className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Test All Endpoints
        </button>
      </div>

      {message && (
        <div className={`mt-3 p-2 text-xs rounded ${
          status === "success" ? "bg-green-50 text-green-700" :
          status === "error" ? "bg-red-50 text-red-700" :
          "bg-blue-50 text-blue-700"
        }`}>
          {message}
        </div>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        Check browser console for detailed logs
      </p>
    </div>
  );
}