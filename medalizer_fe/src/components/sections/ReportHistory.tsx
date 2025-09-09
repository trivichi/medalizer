import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Dialog } from "@headlessui/react";

type Report = {
  id: string;
  filename: string;
  date: string;
  summary: string;
  status: "normal" | "warning" | "critical";
};

interface ReportHistoryProps {
  history: Report[];
  onSelect: (report: Report) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

const statusColors: Record<Report["status"], string> = {
  normal: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export default function ReportHistory({
  history,
  onSelect,
  onDelete,
  selectedId,
}: ReportHistoryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  if (history.length === 0) return null;

  const handleConfirmDelete = () => {
    if (reportToDelete) {
      onDelete(reportToDelete.id);
      setReportToDelete(null);
      setConfirmOpen(false);
    }
  };

  return (
    <section id="history" className="py-20 bg-white/50">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="p-8 md:p-10 rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-white/20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Report History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                  selectedId === report.id
                    ? "bg-blue-50 border-blue-400 shadow-lg"
                    : "bg-white shadow-md hover:shadow-lg"
                }`}
                onClick={() => onSelect(report)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReportToDelete(report);
                    setConfirmOpen(true);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  aria-label="Delete report"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {report.filename}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[report.status]}`}
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{report.date}</p>
                <p className="mt-2 text-gray-700 text-sm">{report.summary}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {reportToDelete?.filename}
              </span>
              ? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
}
