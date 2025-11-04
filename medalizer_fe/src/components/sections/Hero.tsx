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
    if (acceptedFiles.length > 0) {
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
    if (!selectedFile) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first to analyze reports");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.extractReport(selectedFile);
      
      // Fetch updated reports to get the latest data
      const reportsData = await apiService.getReports();
      
      if (reportsData.report_history.length > 0) {
        const latestReport = reportsData.report_history[reportsData.report_history.length - 1];
        onAnalyze(latestReport, selectedFile.name);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Failed to analyze report. Please try again."
      );
    } finally {
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
                : "Drag & drop a PDF or PNG here, or click to select"}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || loading}
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Analyzing..." : "Analyze Report"}
        </button>
      </motion.div>
    </section>
  );
}