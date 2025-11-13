'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Table, 
  Image, 
  Share2, 
  Mail, 
  Calendar,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  format: 'pdf' | 'csv' | 'excel' | 'json' | 'image';
  size: string;
  estimatedTime: string;
  features: string[];
}

interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  downloadUrl?: string;
}

export default function ExportManager() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scheduleExport, setScheduleExport] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  const exportOptions: ExportOption[] = [
    {
      id: 'comprehensive-report',
      name: 'Comprehensive Report',
      description: 'Complete analysis with charts, insights, and recommendations',
      icon: FileText,
      format: 'pdf',
      size: '2-5 MB',
      estimatedTime: '30-60 seconds',
      features: ['Executive Summary', 'Detailed Analytics', 'AI Insights', 'Charts & Graphs', 'Recommendations']
    },
    {
      id: 'raw-data',
      name: 'Raw Data Export',
      description: 'All metrics and data points for further analysis',
      icon: Table,
      format: 'csv',
      size: '1-3 MB',
      estimatedTime: '10-30 seconds',
      features: ['All Metrics', 'Time Series Data', 'Competitor Data', 'Performance Scores']
    },
    {
      id: 'dashboard-snapshot',
      name: 'Dashboard Snapshot',
      description: 'Visual dashboard export as high-quality image',
      icon: Image,
      format: 'image',
      size: '500KB - 2MB',
      estimatedTime: '15-45 seconds',
      features: ['High Resolution', 'All Widgets', 'Current State', 'Branded Layout']
    },
    {
      id: 'api-data',
      name: 'API Data Export',
      description: 'Structured data for integration with other systems',
      icon: Settings,
      format: 'json',
      size: '1-2 MB',
      estimatedTime: '5-15 seconds',
      features: ['JSON Format', 'API Ready', 'Structured Data', 'Metadata Included']
    }
  ];

  const startExport = async (option: ExportOption) => {
    const job: ExportJob = {
      id: Date.now().toString(),
      name: option.name,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };

    setExportJobs(prev => [...prev, job]);

    // Simulate export process
    const interval = setInterval(() => {
      setExportJobs(prev => prev.map(j => {
        if (j.id === job.id) {
          const newProgress = Math.min(j.progress + Math.random() * 20, 100);
          const newStatus = newProgress >= 100 ? 'completed' : 'processing';
          
          if (newStatus === 'completed') {
            clearInterval(interval);
            return {
              ...j,
              progress: 100,
              status: 'completed',
              endTime: new Date(),
              downloadUrl: `/api/export/${option.format}/${job.id}`
            };
          }
          
          return { ...j, progress: newProgress, status: 'processing' };
        }
        return j;
      }));
    }, 500);
  };

  const downloadFile = (job: ExportJob) => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, '_blank');
    }
  };

  const shareViaEmail = (job: ExportJob) => {
    if (emailRecipients) {
      // Implementation for email sharing
      console.log(`Sharing ${job.name} with ${emailRecipients}`);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Export & Share</h1>
                <p className="text-sm text-gray-500">Export your data and share insights</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Export Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exportOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl p-6 border cursor-pointer transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  } hover:shadow-lg`}
                  onClick={() => startExport(option)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <option.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{option.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Format:</span>
                          <span className="font-medium uppercase">{option.format}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Size:</span>
                          <span className="font-medium">{option.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium">{option.estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {option.features.map((feature, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Export Jobs & Settings */}
          <div className="space-y-6">
            {/* Export Jobs */}
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Export Jobs</h3>
              
              {exportJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No export jobs yet</p>
                  <p className="text-sm text-gray-400">Start an export to see progress here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportJobs.map((job) => (
                    <div key={job.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{job.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {job.progress.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            job.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      
                      {job.status === 'completed' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadFile(job)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => shareViaEmail(job)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Settings */}
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
              
              <div className="space-y-4">
                {/* Schedule Export */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Schedule Exports</p>
                    <p className="text-sm text-gray-500">Automatically export reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleExport}
                      onChange={(e) => setScheduleExport(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Email Recipients */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Recipients</label>
                  <input
                    type="email"
                    placeholder="Enter email addresses..."
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                {/* Export Format Preferences */}
                <div>
                  <label className="block text-sm font-medium mb-2">Default Format</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pdf">PDF Report</option>
                    <option value="csv">CSV Data</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
