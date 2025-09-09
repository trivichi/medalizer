import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">About</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Blood Report Analyzer is an advanced AI-powered tool designed to make
            understanding your blood test results easier. Our system combines
            cutting-edge technology with medical expertise to provide accurate and
            actionable insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
            <p className="text-gray-600">
              We aim to empower individuals with better understanding of their
              health by making medical reports more accessible and comprehensible.
              Our AI technology helps identify potential health concerns early and
              tracks your progress over time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900">Technology</h3>
            <p className="text-gray-600">
              Using advanced OCR, NER, and Machine Learning algorithms, we process
              and analyze blood reports with high accuracy. Our system
              continuously learns and improves with each analysis.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
