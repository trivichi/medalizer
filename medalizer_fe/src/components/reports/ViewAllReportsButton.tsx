import React from 'react';
import { FileText, BarChart3 } from 'lucide-react';

interface ViewAllReportsButtonProps {
  onClick: () => void;
  reportCount: number;
  isLoggedIn: boolean;
}

const ViewAllReportsButton: React.FC<ViewAllReportsButtonProps> = ({ 
  onClick, 
  reportCount,
  isLoggedIn 
}) => {
  // Don't show if not logged in
  if (!isLoggedIn) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-24 right-6 bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 z-40 flex items-center gap-2"
    >
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 p-2 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">View All Reports</p>
          <p className="text-xs text-gray-500">
            {reportCount} report{reportCount !== 1 ? 's' : ''} uploaded
          </p>
        </div>
      </div>
    </button>
  );
};

export default ViewAllReportsButton;