// components/dashboard/DeploymentProgress.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader, AlertCircle, Download, Mail } from 'lucide-react';

interface DeploymentProgressProps {
  workflowId: string;
}

interface Workflow {
  id: string;
  workflow_type: string;
  status: string;
  current_step: number;
  total_steps: number;
  user_time_required: string;
  estimated_completion?: string;
  completed_at?: string;
}

interface Step {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  is_automated: boolean;
  status: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  output?: any;
  error_message?: string;
}

export function DeploymentProgress({ workflowId }: DeploymentProgressProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/deployment/${workflowId}`);
        const data = await response.json();
        
        setWorkflow(data.workflow);
        setSteps(data.steps || []);

        // Stop polling if completed or failed
        if (['completed', 'failed', 'ready'].includes(data.workflow?.status)) {
          setPolling(false);
        }
      } catch (error) {
        console.error('Failed to fetch deployment progress:', error);
      }
    };

    fetchProgress();

    if (polling) {
      const interval = setInterval(fetchProgress, 3000);
      return () => clearInterval(interval);
    }
  }, [workflowId, polling]);

  if (!workflow) {
    return <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />;
  }

  const progress = workflow.total_steps > 0 
    ? (workflow.current_step / workflow.total_steps) * 100 
    : 0;
  const nextUserStep = steps.find(s => !s.is_automated && s.status === 'pending');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                    dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r 
                      from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              ⚡ Auto-Deploy: {getWorkflowTitle(workflow.workflow_type)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getWorkflowDescription(workflow.workflow_type)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(workflow.status)}`}>
            {workflow.status === 'completed' ? '✓ Complete' :
             workflow.status === 'failed' ? '✗ Failed' :
             workflow.status === 'ready' ? '⏸ Waiting for You' :
             '⟳ In Progress'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all 
                       duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {workflow.status === 'generating' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 
                              to-transparent animate-shimmer" />
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>{Math.round(progress)}% Complete</span>
            <span>
              {workflow.status === 'ready' 
                ? `Your turn: ${workflow.user_time_required}`
                : workflow.estimated_completion 
                  ? `Est. completion: ${formatTime(workflow.estimated_completion)}`
                  : 'Calculating...'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6 space-y-4">
        {steps.map((step, idx) => (
          <StepItem key={step.id} step={step} index={idx} />
        ))}
      </div>

      {/* Next Action Required */}
      {nextUserStep && (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 
                        dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                ⏸ Your action needed
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                {nextUserStep.description}
              </p>
              
              {/* Download Assets */}
              {workflow.workflow_type === 'schema' && (
                <DeploymentAssets workflowId={workflowId} />
              )}

              <button className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white 
                               rounded-lg font-semibold transition-colors">
                View Instructions →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion */}
      {workflow.status === 'completed' && (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 border-t border-green-200 
                        dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                ✓ Deployment Complete!
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your AIV score will update within 24 hours. Expected gain: +18 points.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepItem({ step, index }: { step: Step; index: number }) {
  const iconMap: Record<string, JSX.Element> = {
    completed: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
    running: <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />,
    pending: <Circle className="w-5 h-5 text-gray-400" />,
    failed: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">
        {iconMap[step.status] || iconMap.pending}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {step.step_name}
            {!step.is_automated && (
              <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 
                             text-blue-700 dark:text-blue-300 rounded-full">
                You do this
              </span>
            )}
          </h4>
          
          {step.duration_seconds && (
            <span className="text-xs text-gray-500">
              {step.duration_seconds}s
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {step.description}
        </p>

        {step.error_message && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 
                        dark:text-red-300">
            Error: {step.error_message}
          </div>
        )}

        {step.output && step.status === 'completed' && (
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-xs">
            <pre className="text-gray-600 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(step.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentAssets({ workflowId }: { workflowId: string }) {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/deployment/${workflowId}/assets`)
      .then(r => r.json())
      .then(data => setAssets(data.assets || []))
      .catch(() => {});
  }, [workflowId]);

  if (assets.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {assets.map((asset: any) => (
        <a
          key={asset.id}
          href={asset.file_url}
          download
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg 
                   border border-gray-200 dark:border-gray-700 hover:bg-gray-50 
                   dark:hover:bg-gray-700 transition-colors group"
        >
          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 
                             group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {asset.file_name}
            </p>
            <p className="text-xs text-gray-500">
              {asset.asset_type === 'wordpress_plugin' ? 'WordPress Plugin' :
               asset.asset_type === 'schema_json' ? 'Schema Markup' :
               'Asset'}
            </p>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:underline">
            Download →
          </span>
        </a>
      ))}
    </div>
  );
}

function getWorkflowTitle(type: string): string {
  const titles: Record<string, string> = {
    schema: 'Schema Markup Implementation',
    review_automation: 'Review Response Automation',
    content: 'AI Content Generation',
    technical: 'Technical SEO Fixes'
  };
  return titles[type] || 'Deployment';
}

function getWorkflowDescription(type: string): string {
  const descriptions: Record<string, string> = {
    schema: 'Adding AI-optimized structured data to your website',
    review_automation: 'Setting up automated review responses',
    content: 'Generating and publishing SEO-optimized content',
    technical: 'Fixing technical issues affecting AI visibility'
  };
  return descriptions[type] || '';
}

function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    ready: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    scanning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    generating: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  };
  return styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hours`;
}

