"use client";

/**
 * I2E Components Demo & Integration Example
 * 
 * Demonstrates how to integrate all I2E components into the dashboard
 * This serves as both a demo and a reference implementation
 */

import React, { useState } from 'react';
import {
  PulseUpdateCardGrid,
  ACNContainer,
  ExecutionPlaybook,
  OneClickCorrectionList,
  UpdateCard,
  ActionableContextualNugget,
  ExecutionPlaybook as PlaybookType,
  OneClickCorrection,
  InsightSeverity
} from './index';
import { motion } from 'framer-motion';

export function I2EDemo() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookType | null>(null);
  const [playbookOpen, setPlaybookOpen] = useState(false);

  // Example: Pulse Update Cards
  const sampleUpdates: UpdateCard[] = [
    {
      id: '1',
      title: 'New AI Model: GPT-4 Turbo',
      summary: 'Enhanced accuracy for dealership visibility tracking with 40% faster processing.',
      date: new Date(),
      type: 'model',
      ctaText: 'View Details',
      ctaLink: '#',
      metadata: {
        impact: '+15% accuracy',
        category: 'AI Engine',
        tags: ['model', 'update', 'performance']
      }
    },
    {
      id: '2',
      title: 'Competitor Analysis Feature',
      summary: 'Compare your AI visibility against local competitors in real-time.',
      date: new Date(Date.now() - 86400000), // Yesterday
      type: 'feature',
      ctaText: 'Try Now',
      metadata: {
        impact: 'New Feature',
        category: 'Analytics',
        tags: ['feature', 'competitors']
      }
    },
    {
      id: '3',
      title: 'Data Sync Improved',
      summary: 'Faster data synchronization reduces latency by 60%.',
      date: new Date(Date.now() - 172800000), // 2 days ago
      type: 'improvement',
      metadata: {
        impact: '60% faster',
        category: 'Performance',
        tags: ['improvement', 'speed']
      }
    }
  ];

  // Example: Actionable Contextual Nuggets
  const sampleACNs: ActionableContextualNugget[] = [
    {
      id: 'acn-1',
      insight: 'Churn Risk High',
      ctaText: 'Launch Retention Protocol',
      ctaAction: async () => {
        console.log('Launching retention protocol...');
        // Open playbook
        setSelectedPlaybook(samplePlaybook);
        setPlaybookOpen(true);
      },
      severity: 'high',
      position: { x: 75, y: 30, anchor: 'top-right' },
      autoDismiss: false
    },
    {
      id: 'acn-2',
      insight: 'Revenue Drop Detected',
      ctaText: 'View Analysis',
      ctaAction: async () => {
        console.log('Opening revenue analysis...');
      },
      severity: 'critical',
      position: { x: 20, y: 60, anchor: 'top-left' },
      autoDismiss: true,
      dismissAfter: 10000
    }
  ];

  // Example: Execution Playbook
  const samplePlaybook: PlaybookType = {
    id: 'playbook-1',
    title: 'Retention Protocol',
    description: 'Automated sequence to address high churn risk customers',
    insightId: 'acn-1',
    autoExecuteFirst: 2,
    createdAt: new Date(),
    steps: [
      {
        id: 'step-1',
        title: 'Create Retention Segment',
        description: 'Automatically segment customers showing churn signals',
        status: 'pending',
        autoExecute: true,
        estimatedTime: '30s',
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Segment created');
        }
      },
      {
        id: 'step-2',
        title: 'Draft Alert Email',
        description: 'Generate personalized retention email for at-risk customers',
        status: 'pending',
        autoExecute: true,
        estimatedTime: '1 min',
        dependencies: ['step-1'],
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log('Email drafted');
        }
      },
      {
        id: 'step-3',
        title: 'Schedule Follow-up',
        description: 'Set up automated follow-up sequence',
        status: 'pending',
        estimatedTime: '2 min',
        dependencies: ['step-2'],
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('Follow-up scheduled');
        }
      }
    ]
  };

  // Example: One-Click Corrections
  const sampleCorrections: OneClickCorrection[] = [
    {
      id: 'correction-1',
      issue: 'Data Drift Detected',
      fix: 'Your schema has drifted from best practices. Click to auto-fix alignment.',
      severity: 'medium',
      category: 'data-drift',
      estimatedTime: '30s',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Data drift fixed');
      }
    },
    {
      id: 'correction-2',
      issue: 'Theme Approval Pending',
      fix: 'New brand theme is ready. Approve to apply across all platforms.',
      severity: 'low',
      category: 'theme',
      estimatedTime: '10s',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Theme approved');
      }
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Pulse Update Cards Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          System Updates
        </h2>
        <PulseUpdateCardGrid 
          updates={sampleUpdates}
          onUpdateClick={(update) => {
            console.log('Update clicked:', update);
          }}
        />
      </section>

      {/* Chart with ACNs Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Analytics Dashboard
        </h2>
        <ACNContainer
          nuggets={sampleACNs}
          onDismiss={(id) => {
            console.log('ACN dismissed:', id);
          }}
          onAction={(id) => {
            console.log('ACN action triggered:', id);
          }}
          className="relative bg-white rounded-2xl border border-gray-200 p-6 min-h-[400px]"
        >
          {/* Mock Chart Area */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">Chart visualization area</p>
              <p className="text-xs mt-2 text-gray-500">
                ACNs appear as overlays on data points
              </p>
            </div>
          </div>
        </ACNContainer>
      </section>

      {/* One-Click Corrections Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Quick Fixes Available
        </h2>
        <OneClickCorrectionList
          corrections={sampleCorrections}
          onExecute={(id) => {
            console.log('Correction executed:', id);
          }}
          onDismiss={(id) => {
            console.log('Correction dismissed:', id);
          }}
        />
      </section>

      {/* Execution Playbook (triggered by ACN) */}
      {selectedPlaybook && (
        <ExecutionPlaybook
          playbook={selectedPlaybook}
          isOpen={playbookOpen}
          onClose={() => {
            setPlaybookOpen(false);
            setSelectedPlaybook(null);
          }}
          onStepComplete={(stepId) => {
            console.log('Step completed:', stepId);
          }}
          onPlaybookComplete={(playbookId) => {
            console.log('Playbook completed:', playbookId);
            setTimeout(() => {
              setPlaybookOpen(false);
              setSelectedPlaybook(null);
            }, 2000);
          }}
        />
      )}
    </div>
  );
}

