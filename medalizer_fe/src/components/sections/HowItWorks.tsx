import { motion } from "framer-motion";

const steps = [
  { title: "Upload Report", description: "Upload your blood report in PDF or image format", icon: "📄" },
  { title: "AI Analysis", description: "Our AI system analyzes the report data", icon: "🤖" },
  { title: "Get Insights", description: "Review detailed analysis and insights", icon: "📊" },
  { title: "Track Progress", description: "Compare with previous reports to track changes", icon: "📈" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">Simple steps to analyze your blood report</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center mx-auto text-2xl mb-6 shadow-lg">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{s.title}</h3>
              <p className="text-gray-600 text-center">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
