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
import AuthModal from "./components/auth/AuthModal"; // new

const theme = createTheme({
  palette: {
    primary: { main: "#0087ff" },
    secondary: { main: "#ffffff" },
  },
});

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false); //  modal state

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleAnalyze = (file: File | null) => {
    if (!file) return;
    setLoading(true);

    setTimeout(() => {
      const newResults = [
        { name: "Hemoglobin", value: 13, normal: [12, 16] },
        { name: "WBC", value: 11, normal: [4, 10] },
        { name: "Platelets", value: 180, normal: [150, 400] },
      ]; // dummy data

      const newRecs = [
        "Stay hydrated and maintain a balanced diet.",
        "Consider consulting a doctor about WBC count.",
        "Regular exercise can help improve overall blood health.",
      ];

      const newReport = {
        id: Date.now().toString(),
        filename: file.name,
        date: new Date().toLocaleDateString(),
        summary: "Some metrics slightly out of range.",
        status: newResults.some(
          (r) => r.value < r.normal[0] || r.value > r.normal[1]
        )
          ? "warning"
          : "normal",
        results: newResults,
        recommendations: newRecs,
      };

      setResults(newResults);
      setRecommendations(newRecs);
      setHistory((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport.id);

      setLoading(false);
    }, 5000);
  };

  const handleSelectReport = (report: any) => {
    setResults(report.results);
    setRecommendations(report.recommendations);
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
      setSelectedReportId(null);
    }
  };

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LoadingOverlay visible={loading} />

          <div className="min-h-screen w-full relative overflow-hidden">
            <AnimatedBackground />
            <Header onOpenAuth={() => setAuthModalOpen(true)} /> {/*  pass handler */}
            <main className="pt-24">
              <Hero onAnalyze={handleAnalyze} loading={loading} />
              {results.length > 0 && (
                <div ref={resultsRef}>
                  <ResultsSection
                    results={results}
                    recommendations={recommendations}
                    progressRef={progressRef}
                    filename={
                      history.find((r) => r.id === selectedReportId)?.filename
                    }
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

          {/*  Global Auth Modal */}
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
