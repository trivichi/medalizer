import { forwardRef } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Report = {
  id: string;
  filename: string;
  date: string;
  results: { name: string; value: number; normal: [number, number] }[];
};

interface ProgressSectionProps {
  history: Report[];
}

const ProgressSection = forwardRef<HTMLDivElement, ProgressSectionProps>(
  ({ history }, ref) => {
    if (history.length < 2) return null;

    const metrics = Array.from(
      new Set(history.flatMap((report) => report.results.map((r) => r.name)))
    );

    const chartData = history
      .slice()
      .reverse()
      .map((report) => {
        const row: any = { date: report.date };
        report.results.forEach((r) => {
          row[r.name] = r.value;
        });
        return row;
      });

    return (
      <section id="progress" className="py-20 bg-white/50" ref={ref}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="p-8 md:p-10 rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-white/20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Health Progress Over Time
            </h2>

            <div className="w-full h-96">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {metrics.map((metric, idx) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={["#0087ff", "#82ca9d", "#ff7300", "#ff4d4d"][idx % 4]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1200}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
);

export default ProgressSection;
