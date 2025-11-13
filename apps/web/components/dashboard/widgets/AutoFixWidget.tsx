/**
 * Auto-Fix Widget
 * Shows pending, active, and completed auto-fix jobs
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AutoFixWidgetProps {
  jobs: Array<{
    job_id: string;
    dealer_id: string;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    status: 'pending' | 'generating' | 'deploying' | 'verifying' | 'verified' | 'failed';
    estimated_confidence: number;
    created_at: string;
    updated_at: string;
  }>;
  onApprove?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
}

export default function AutoFixWidget({ jobs, onApprove, onRetry }: AutoFixWidgetProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => ['generating', 'deploying', 'verifying'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'verified');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'generating': return RefreshCw;
      case 'deploying': return Play;
      case 'verifying': return RefreshCw;
      case 'verified': return CheckCircle;
      case 'failed': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'generating': return 'text-blue-600';
      case 'deploying': return 'text-blue-600';
      case 'verifying': return 'text-blue-600';
      case 'verified': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingJobs.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{failedJobs.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Fix Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job, idx) => {
              const StatusIcon = getStatusIcon(job.status);
              
              return (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    selectedJob === job.job_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setSelectedJob(selectedJob === job.job_id ? null : job.job_id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-6 h-6 ${getStatusColor(job.status)}`} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {job.issues.length} issue{job.issues.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">
                        {Math.round(job.estimated_confidence * 100)}% confidence
                      </span>
                      {job.status === 'pending' && onApprove && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(job.job_id);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {job.status === 'failed' && onRetry && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(job.job_id);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {selectedJob === job.job_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <div className="space-y-2">
                        {job.issues.map((issue, iIdx) => (
                          <div key={iIdx} className="p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{issue.type}</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {issue.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
            
            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No auto-fix jobs yet</p>
                <p className="text-sm">Run a trust scan to discover issues</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

