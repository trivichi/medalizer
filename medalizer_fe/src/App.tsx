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

console.log("[App] Application starting");
console.log("[App] Environment:", import.meta.env.MODE);

// Helper to get unit based on metric name
function getUnit(metricName: string): string {
  const name = metricName.toLowerCase();
  if (name.includes('hb') || name.includes('hemoglobin')) return 'g/dL';
  if (name.includes('rbc')) return '×10⁶/µL';
  if (name.includes('wbc')) return '×10³/µL';
  if (name.includes('platelet')) return '×10³/µL';
  if (name.includes('mcv')) return 'fL';
  if (name.includes('mch')) return 'pg';
  if (name.includes('mchc')) return 'g/dL';
  return '';
}

// Helper to get normal range based on metric name
function getNormalRange(metricName: string): [number, number] {
  const name = metricName.toLowerCase();
  if (name.includes('hb') || name.includes('hemoglobin')) return [12, 16];
  if (name.includes('rbc')) return [4.5, 5.5];
  if (name.includes('wbc')) return [4, 10];
  if (name.includes('platelet')) return [150, 400];
  if (name.includes('mcv')) return [80, 100];
  if (name.includes('mch')) return [27, 32];
  if (name.includes('mchc')) return [32, 35];
  return [0, 100]; // default fallback
}

// Helper function to parse test values
function parseTestData(data: Record<string, string>) {
  console.log("[App] Parsing test data:", data);
  const results: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    // Extract numeric value from string
    const numericMatch = value.match(/(\d+\.?\d*)/);
    if (numericMatch) {
      const testValue = parseFloat(numericMatch[1]);
      const normalRange = getNormalRange(key);
      const unit = getUnit(key);

      results.push({
        name: key,
        value: testValue,
        unit: unit,
        normal: normalRange,
      });
    }
  });

  console.log("[App] Parsed results:", results);
  return results;
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
    console.log("[App] useEffect - checking for existing token");
    const token = localStorage.getItem("token");
    if (token) {
      console.log("[App] Token found, loading reports");
      loadReports();
    } else {
      console.log("[App] No token found, skipping report load");
    }
  }, []);

  // Updated AI recommendations function - accepts full report history
  const getAIRecommendations = async (reportHistory: Record<string, any>[]) => {
    console.log("[App] Getting AI recommendations for full report history:", reportHistory);

    try {
      // Send the full report history dictionary instead of a single testData object
      const response = await apiService.getAIRecommendations(reportHistory);

      console.log("[App] AI recommendations received:", response);

      if (response.results) {
        const recs = response.results
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-•*]\s*/, '').trim());

        return recs.length > 0 ? recs : [
          "All your test results appear within acceptable ranges.",
          "Keep maintaining your health with regular checkups and a balanced lifestyle."
        ];
      }

      return [
        "Unable to generate recommendations at this time.",
        "Please consult your healthcare provider for detailed insights."
      ];

    } catch (err) {
      console.error("[App] Failed to get AI recommendations:", err);
      return [
        "AI recommendations service is currently unavailable.",
        "Please try again later or consult your doctor."
      ];
    }
  };

  const loadReports = async () => {
    console.log("[App] loadReports called");
    try {
      const response = await apiService.getReports();
      console.log("[App] Reports loaded:", response);

      const loadedHistory = response.report_history.map((reportData, idx) => {
        const parsedResults = parseTestData(reportData);

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
          rawData: reportData,
        };
      });

      console.log("[App] History processed:", loadedHistory);
      setHistory(loadedHistory);

      // Get AI recommendations for all reports at once
      if (response.report_history.length > 0) {
        console.log("[App] Fetching AI recommendations for all reports...");
        const aiRecs = await getAIRecommendations(response.report_history);
        console.log("[App] AI recommendations received:", aiRecs);
        setRecommendations(aiRecs);
      }

    } catch (err) {
      console.error("[App] Failed to load reports:", err);
    }
  };

  const handleAnalyze = async (data: any, filename: string) => {
    console.log("[App] handleAnalyze called");
    console.log("[App] Data:", data);
    console.log("[App] Filename:", filename);

    setLoading(true);

    try {
      const parsedResults = parseTestData(data);

      // Get AI recommendations for this single report
      console.log("[App] Fetching AI recommendations for new report...");
      const aiRecs = await getAIRecommendations([data]);

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
        recommendations: aiRecs,
        rawData: data,
      };

      console.log("[App] New report created:", newReport);

      setResults(parsedResults);
      setRecommendations(aiRecs);
      setCurrentFilename(filename);
      setHistory((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport.id);

      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          console.log("[App] Scrolling to results");
          resultsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (report: any) => {
    console.log("[App] Report selected:", report);
    setLoading(true);

    try {
      // If recommendations aren't already loaded, get them
      let recs = report.recommendations;
      if (!recs && report.rawData) {
        console.log("[App] Fetching AI recommendations for selected report...");
        recs = await getAIRecommendations([report.rawData]);
      }

      setResults(report.results);
      setRecommendations(recs || []);
      setCurrentFilename(report.filename);
      setSelectedReportId(report.id);

      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    console.log("[App] Deleting report:", id);
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