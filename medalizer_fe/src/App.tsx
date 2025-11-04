// src/App.tsx
import { useState, useRef, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import AnimatedBackground from "./components/backgrounds/AnimatedBackground";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import HowItWorks from "./components/sections/HowItWorks";
import About from "./components/sections/About";
import ResultsSection from "./components/sections/ResultsSection";
import ReportHistory from "./components/sections/ReportHistory";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import ProgressSection from "./components/sections/ProgressSection";

import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/auth/AuthModal";
import { apiService } from "./services/api";

const theme = createTheme({
  palette: {
    primary: { main: "#0087ff" },
    secondary: { main: "#ffffff" },
  },
});

const queryClient = new QueryClient();

// Helper function to parse test values and ranges
function parseTestData(data: Record<string, string>) {
  const results: any[] = [];
  
  Object.entries(data).forEach(([key, value]) => {
    // Try to extract numeric value and range
    const numericMatch = value.match(/(\d+\.?\d*)/);
    const rangeMatch = value.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    
    if (numericMatch) {
      const testValue = parseFloat(numericMatch[1]);
      let normalRange: [number, number] = [0, 100]; // default
      
      if (rangeMatch) {
        normalRange = [parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2])];
      } else {
        // Set default ranges based on common test names
        const keyLower = key.toLowerCase();
        if (keyLower.includes('hb') || keyLower.includes('hemoglobin')) {
          normalRange = [12, 16];
        } else if (keyLower.includes('wbc')) {
          normalRange = [4, 10];
        } else if (keyLower.includes('rbc')) {
          normalRange = [4.5, 5.5];
        } else if (keyLower.includes('platelet')) {
          normalRange = [150, 400];
        }
      }
      
      results.push({
        name: key,
        value: testValue,
        normal: normalRange,
      });
    }
  });
  
  return results;
}

// Generate AI recommendations based on results
function generateRecommendations(results: any[]): string[] {
  const recs: string[] = [];
  
  results.forEach(r => {
    if (r.value < r.normal[0]) {
      recs.push(`Your ${r.name} is below normal range. Consider consulting a healthcare provider.`);
    } else if (r.value > r.normal[1]) {
      recs.push(`Your ${r.name} is above normal range. Please consult with your doctor.`);
    }
  });
  
  if (recs.length === 0) {
    recs.push("All your test results are within normal ranges.");
    recs.push("Maintain a balanced diet and regular exercise routine.");
    recs.push("Stay hydrated and get adequate sleep.");
  } else {
    recs.push("Follow up with your healthcare provider for detailed guidance.");
    recs.push("Maintain a healthy lifestyle with proper diet and exercise.");
  }
  
  return recs;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>("");

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Load reports when user logs in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadReports();
    }
  }, []);

  const loadReports = async () => {
    try {
      const response = await apiService.getReports();
      
      const loadedHistory = response.report_history.map((reportData, idx) => {
        const parsedResults = parseTestData(reportData);
        const recs = generateRecommendations(parsedResults);
        
        return {
          id: `report_${idx}_${Date.now()}`,
          filename: `Report ${idx + 1}`,
          date: new Date().toLocaleDateString(),
          summary: parsedResults.length > 0 
            ? `${parsedResults.length} tests analyzed`
            : "No tests found",
          status: parsedResults.some(
            (r) => r.value < r.normal[0] || r.value > r.normal[1]
          )
            ? "warning"
            : "normal",
          results: parsedResults,
          recommendations: recs,
        };
      });
      
      setHistory(loadedHistory);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  const handleAnalyze = async (data: any, filename: string) => {
    const parsedResults = parseTestData(data);
    const recs = generateRecommendations(parsedResults);

    const newReport = {
      id: Date.now().toString(),
      filename: filename,
      date: new Date().toLocaleDateString(),
      summary: parsedResults.length > 0 
        ? `${parsedResults.length} tests analyzed`
        : "No tests found",
      status: parsedResults.some(
        (r) => r.value < r.normal[0] || r.value > r.normal[1]
      )
        ? "warning"
        : "normal",
      results: parsedResults,
      recommendations: recs,
    };

    setResults(parsedResults);
    setRecommendations(recs);
    setCurrentFilename(filename);
    setHistory((prev) => [newReport, ...prev]);
    setSelectedReportId(newReport.id);

    // Scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSelectReport = (report: any) => {
    setResults(report.results);
    setRecommendations(report.recommendations);
    setCurrentFilename(report.filename);
    setSelectedReportId(report.id);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteReport = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    if (selectedReportId === id) {
      setResults([]);
      setRecommendations([]);
      setCurrentFilename("");
      setSelectedReportId(null);
    }
  };

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LoadingOverlay visible={loading} />

          <div className="min-h-screen w-full relative overflow-hidden">
            <AnimatedBackground />
            <Header onOpenAuth={() => setAuthModalOpen(true)} />
            <main className="pt-24">
              <Hero 
                onAnalyze={handleAnalyze} 
                loading={loading}
                setLoading={setLoading}
              />
              {results.length > 0 && (
                <div ref={resultsRef}>
                  <ResultsSection
                    results={results}
                    recommendations={recommendations}
                    progressRef={progressRef}
                    filename={currentFilename}
                  />
                </div>
              )}
              <ReportHistory
                history={history}
                onSelect={handleSelectReport}
                onDelete={handleDeleteReport}
                selectedId={selectedReportId}
              />
              <ProgressSection ref={progressRef} history={history} />
              <Features />
              <HowItWorks />
              <About />
            </main>
            <Footer />
          </div>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;