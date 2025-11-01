'use client';

import { useState } from 'react';
import { FileBarChart, Download, Calendar, Filter, Mail } from 'lucide-react';

export default function ReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      name: 'Monthly AI Visibility Report',
      type: 'Monthly',
      generatedAt: '2025-11-01',
      size: '2.4 MB',
      format: 'PDF',
    },
    {
      id: 2,
      name: 'Competitor Analysis Report',
      type: 'Weekly',
      generatedAt: '2025-10-28',
      size: '1.8 MB',
      format: 'PDF',
    },
    {
      id: 3,
      name: 'Revenue at Risk Analysis',
      type: 'Monthly',
      generatedAt: '2025-11-01',
      size: '3.1 MB',
      format: 'Excel',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">Generate and download executive reports</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FileBarChart className="w-5 h-5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Executive Summary', description: 'High-level overview of AI visibility metrics' },
          { name: 'Competitive Analysis', description: 'Detailed competitor comparison report' },
          { name: 'Revenue Impact', description: 'Revenue at risk and opportunity analysis' },
        ].map((template, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
              <FileBarChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Generate
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileBarChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.format}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span>{report.generatedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

