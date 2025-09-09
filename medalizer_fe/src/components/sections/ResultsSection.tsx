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
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ResultItem = {
  name: string;
  value: number;
  normal: string | [number, number];
};

interface ResultsSectionProps {
  results: ResultItem[];
  recommendations: string[];
  progressRef?: React.RefObject<HTMLDivElement | null>; // fixed type
  filename?: string; //  new, so we can show uploaded file name in PDF
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
      backgroundColor: "#ffffff", // white background
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
      pdf.text("Health Progress Over Time", pageWidth / 2, 20, { align: "center" });

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
      return { label: "Low", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    if (value > max)
      return { label: "High", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    return { label: "Normal", color: "text-green-600", bg: "bg-green-50 border-green-200" };
  };

  return (
    <section id="results" className="py-20 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4">
        {/* Big Section Heading */}
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

        {/* Clean Exported Content */}
        <div ref={exportRef} className="bg-white p-6 rounded-lg">
          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {results.map((r, idx) => {
              const status = getStatus(r.value, r.normal);
              const [min, max] = normalizeRange(r.normal);
              return (
                <div
                  key={r.name + idx}
                  className={`p-5 rounded-lg border ${status.bg}`}
                >
                  <div className="text-sm text-gray-500">{r.name}</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {r.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Normal: {Array.isArray(r.normal) ? `${min} - ${max}` : r.normal}
                  </div>
                  <div className={`mt-2 text-sm font-bold ${status.color}`}>
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white border rounded-lg p-4 mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Visual Analysis
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Value" fill="url(#valueGradient)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Min" fill="#82ca9d" opacity={0.7} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Max" fill="#ffc658" opacity={0.7} radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0087ff" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#0087ff" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Recommendations
            </h3>
            <ul className="space-y-2 text-gray-700">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1">✔</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Download Button (not in PDF) */}
        <motion.div className="text-center mt-8">
          <button
            onClick={handleDownloadPDF}
            className="btn-primary px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Download PDF Report
          </button>
        </motion.div>
      </div>
    </section>
  );
}
