import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ResultItem = {
  name: string;
  value: number;
  unit: string;
  normal: string | [number, number];
};

interface ResultsSectionProps {
  results: ResultItem[];
  recommendations: string[];
  progressRef?: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

function normalizeRange(normal: string | [number, number]): [number, number] {
  if (Array.isArray(normal)) return normal;
  const [minStr, maxStr] = normal.split("-").map((s) => s.trim());
  return [Number(minStr), Number(maxStr)];
}

export default function ResultsSection({
  results,
  recommendations,
  progressRef,
  filename,
}: ResultsSectionProps) {
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!exportRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Blood Test Report", pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 30);

    if (filename) {
      pdf.text(`File: ${filename}`, 15, 37);
    }

    // Results page
    const resultsCanvas = await html2canvas(exportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const resultsImg = resultsCanvas.toDataURL("image/png");
    const resultsProps = pdf.getImageProperties(resultsImg);
    const resultsHeight =
      (resultsProps.height * (pageWidth - 30)) / resultsProps.width;

    pdf.addImage(resultsImg, "PNG", 15, 45, pageWidth - 30, resultsHeight);

    // Progress chart as second page
    if (progressRef?.current) {
      pdf.addPage();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Health Progress Over Time", pageWidth / 2, 20, {
        align: "center",
      });

      const progressCanvas = await html2canvas(progressRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const progressImg = progressCanvas.toDataURL("image/png");
      const progressProps = pdf.getImageProperties(progressImg);
      const progressHeight =
        (progressProps.height * (pageWidth - 30)) / progressProps.width;

      pdf.addImage(progressImg, "PNG", 15, 35, pageWidth - 30, progressHeight);
    }

    pdf.save("blood-report.pdf");
  };

  const chartData = results.map((r) => {
    const [min, max] = normalizeRange(r.normal);
    return { name: r.name, Value: r.value, Min: min, Max: max };
  });

  const getStatus = (value: number, normal: string | [number, number]) => {
    const [min, max] = normalizeRange(normal);
    if (value < min)
      return {
        label: "Low",
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        barColor: "#ef4444",
      };
    if (value > max)
      return {
        label: "High",
        color: "text-orange-600",
        bg: "bg-orange-50 border-orange-200",
        barColor: "#f97316",
      };
    return {
      label: "Normal",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      barColor: "#22c55e",
    };
  };

  return (
    <section id="results" className="py-20 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            Your Results
          </h2>
          <p className="text-lg text-gray-600">
            A breakdown of your blood report, compared to normal ranges
          </p>
        </motion.div>

        <div ref={exportRef} className="bg-white p-6 rounded-lg">
          {/* Metric cards with units */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {results.map((r, idx) => {
              const status = getStatus(r.value, r.normal);
              const [min, max] = normalizeRange(r.normal);
              return (
                <motion.div
                  key={r.name + idx}
                  className={`p-5 rounded-lg border ${status.bg}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="text-sm font-medium text-gray-700">{r.name}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {r.value}
                    </span>
                    {r.unit && (
                      <span className="text-sm text-gray-500">{r.unit}</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Normal: {min} - {max} {r.unit}
                  </div>
                  <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} border`}>
                    {status.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Bar Chart with color coding */}
          <div className="bg-white border rounded-lg p-4 mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Visual Analysis
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Value" radius={[6, 6, 0, 0]} name="Your Value">
                    {chartData.map((entry, index) => {
                      const result = results[index];
                      const status = getStatus(result.value, result.normal);
                      return <Cell key={`cell-${index}`} fill={status.barColor} />;
                    })}
                  </Bar>
                  <Bar
                    dataKey="Min"
                    fill="#82ca9d"
                    opacity={0.5}
                    radius={[6, 6, 0, 0]}
                    name="Normal Min"
                  />
                  <Bar
                    dataKey="Max"
                    fill="#ffc658"
                    opacity={0.5}
                    radius={[6, 6, 0, 0]}
                    name="Normal Max"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI-Generated Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">
                AI-Generated Recommendations
              </h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-gray-500 italic">
                ⚠️ These insights are generated by AI for educational purposes only. 
                Always consult with a qualified healthcare provider for personalized medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <motion.div className="text-center mt-8">
          <button
            onClick={handleDownloadPDF}
            className="btn-primary px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            📥 Download PDF Report
          </button>
        </motion.div>
      </div>
    </section>
  );
}