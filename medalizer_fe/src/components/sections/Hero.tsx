// src/components/sections/Hero.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { apiService } from "../../services/api";

interface HeroProps {
  onAnalyze: (data: any, filename: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function Hero({ onAnalyze, loading, setLoading }: HeroProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    console.log("[Hero] Files dropped:", acceptedFiles.length);
    if (acceptedFiles.length > 0) {
      console.log("[Hero] File selected:", {
        name: acceptedFiles[0].name,
        size: acceptedFiles[0].size,
        type: acceptedFiles[0].type
      });
      setSelectedFile(acceptedFiles[0]);
      setError("");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  const handleAnalyzeClick = async () => {
    console.log("[Hero] Analyze button clicked");
    
    if (!selectedFile) {
      console.log("[Hero] No file selected");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("[Hero] Checking authentication, token exists:", !!token);
    
    if (!token) {
      console.log("[Hero] User not authenticated");
      setError("Please login first to analyze reports");
      return;
    }

    console.log("[Hero] Starting analysis...");
    setLoading(true);
    setError("");

    try {
      console.log("[Hero] Calling extractReport API...");
      const response = await apiService.extractReport(selectedFile);
      console.log("[Hero] Extract report response:", response);
      
      // Fetch updated reports to get the latest data
      console.log("[Hero] Fetching updated reports...");
      const reportsData = await apiService.getReports();
      console.log("[Hero] Reports data received:", {
        historyLength: reportsData.report_history?.length || 0
      });
      
      if (reportsData.report_history.length > 0) {
        const latestReport = reportsData.report_history[reportsData.report_history.length - 1];
        console.log("[Hero] Latest report:", latestReport);
        console.log("[Hero] Calling onAnalyze with latest report");
        onAnalyze(latestReport, selectedFile.name);
      } else {
        console.log("[Hero] No reports found in history");
        setError("No reports found. Please try again.");
      }
    } catch (err: any) {
      console.error("[Hero] Analysis failed");
      console.error("[Hero] Error object:", err);
      
      let errorMessage = "Failed to analyze report. Please try again.";
      
      if (err.response) {
        console.error("[Hero] Response error:", {
          status: err.response.status,
          data: err.response.data
        });
        errorMessage = err.response.data?.detail || errorMessage;
      } else if (err.request) {
        console.error("[Hero] No response received");
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else {
        console.error("[Hero] Request setup error:", err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      console.log("[Hero] Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <section className="relative py-32 text-center">
      <motion.div
        className="max-w-3xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Analyze Your Medical Reports Instantly
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Upload your <span className="font-semibold">PDF</span> or{" "}
          <span className="font-semibold">PNG</span> reports and get AI-driven
          health insights within seconds.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 mb-6 transition-colors cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white/70"
          }`}
        >
          <input {...getInputProps()} />
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <p className="text-gray-700 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              {isDragActive
                ? "Drop the file here..."
                : "Drag and drop a PDF or PNG here, or click to select"}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || loading}
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Analyzing..." : "Analyze Report"}
        </button>
      </motion.div>
    </section>
  );
}