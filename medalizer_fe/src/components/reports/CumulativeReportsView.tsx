// src/components/reports/CumulativeReportsView.tsx
import React, { useState } from 'react';
import { FileText, X, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';

interface Report {
  id: string;
  filename: string;
  date: string;
  results: Array<{
    name: string;
    value: number;
    unit: string;
    normal: [number, number];
  }>;
  rawData: Record<string, any>;
}

interface CumulativeReportsViewProps {
  history: Report[];
  isOpen: boolean;
  onClose: () => void;
}

const CumulativeReportsView: React.FC<CumulativeReportsViewProps> = ({ 
  history, 
  isOpen, 
  onClose 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate cumulative metrics
  const getCumulativeMetrics = () => {
    if (history.length === 0) return {};

    const metrics: Record<string, {
      values: number[];
      dates: string[];
      unit: string;
      normal: [number, number];
      trend: 'up' | 'down' | 'stable';
      status: 'normal' | 'warning' | 'critical';
    }> = {};

    // Collect all metrics across all reports
    history.forEach((report) => {
      report.results.forEach((result) => {
        if (!metrics[result.name]) {
          metrics[result.name] = {
            values: [],
            dates: [],
            unit: result.unit,
            normal: result.normal,
            trend: 'stable',
            status: 'normal'
          };
        }
        metrics[result.name].values.push(result.value);
        metrics[result.name].dates.push(report.date);
      });
    });

    // Calculate trends and status
    Object.keys(metrics).forEach((metricName) => {
      const metric = metrics[metricName];
      const latest = metric.values[metric.values.length - 1];
      const previous = metric.values.length > 1 ? metric.values[metric.values.length - 2] : latest;

      // Determine trend
      if (latest > previous * 1.05) {
        metric.trend = 'up';
      } else if (latest < previous * 0.95) {
        metric.trend = 'down';
      } else {
        metric.trend = 'stable';
      }

      // Determine status
      if (latest < metric.normal[0] || latest > metric.normal[1]) {
        const deviation = latest < metric.normal[0] 
          ? (metric.normal[0] - latest) / metric.normal[0]
          : (latest - metric.normal[1]) / metric.normal[1];
        
        metric.status = deviation > 0.2 ? 'critical' : 'warning';
      } else {
        metric.status = 'normal';
      }
    });

    return metrics;
  };

  const cumulativeMetrics = getCumulativeMetrics();
  const metricNames = Object.keys(cumulativeMetrics);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">All Reports Overview</h2>
              <p className="text-sm opacity-90">
                {history.length} report{history.length !== 1 ? 's' : ''} analyzed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            // No Reports State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-500 max-w-md">
                You haven't uploaded any blood reports yet. Upload your first report to see comprehensive health insights and track your progress over time.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Reports</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{history.length}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Metrics Tracked</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">{metricNames.length}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Latest Report</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">
                    {history[0]?.date || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Cumulative Metrics Table */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Cumulative Health Metrics
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Metric
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Latest Value
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Normal Range
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Trend
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {metricNames.map((metricName) => {
                        const metric = cumulativeMetrics[metricName];
                        const latestValue = metric.values[metric.values.length - 1];

                        return (
                          <tr
                            key={metricName}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => setSelectedMetric(metricName)}
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {metricName}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {latestValue.toFixed(2)} {metric.unit}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {metric.normal[0]} - {metric.normal[1]} {metric.unit}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm text-gray-600 capitalize">
                                  {metric.trend}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}
                              >
                                {metric.status === 'normal' ? '✓ Normal' : 
                                 metric.status === 'warning' ? '⚠ Warning' : 
                                 '⚠ Critical'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metric Detail View */}
              {selectedMetric && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900">
                      {selectedMetric} History
                    </h4>
                    <button
                      onClick={() => setSelectedMetric(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {cumulativeMetrics[selectedMetric].values.map((value, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white rounded px-3 py-2"
                      >
                        <span className="text-sm text-gray-600">
                          {cumulativeMetrics[selectedMetric].dates[idx]}
                        </span>
                        <span className="font-medium text-gray-800">
                          {value.toFixed(2)} {cumulativeMetrics[selectedMetric].unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report List */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Individual Reports
                </h3>
                <div className="space-y-3">
                  {history.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{report.filename}</h4>
                          <p className="text-sm text-gray-500">{report.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {report.results.length} tests
                          </p>
                          <p className={`text-xs ${
                            report.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {report.status === 'warning' ? '⚠ Some abnormal' : '✓ All normal'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-600 text-center">
            This overview shows cumulative data from all your uploaded reports. 
            For detailed analysis, please select individual reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CumulativeReportsView;