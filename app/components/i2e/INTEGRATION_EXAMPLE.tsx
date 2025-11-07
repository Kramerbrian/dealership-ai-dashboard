/**
 * I2E Components Integration Example
 * 
 * This file shows how to integrate I2E components into DealershipAIDashboardLA
 * Copy and adapt these patterns to your dashboard
 */

"use client";

import React, { useState, useEffect } from 'react';
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
} from '@/components/i2e';
import { useI2EIntegration, generatePlaybookFromInsight } from './useI2EIntegration';

/**
 * Example: Add to DealershipAIDashboardLA component
 * 
 * 1. Import the components at the top:
 */
// import { PulseUpdateCardGrid, ACNContainer, ExecutionPlaybook, OneClickCorrectionList } from '@/components/i2e';

/**
 * 2. Add state for I2E components in your component:
 */
export function I2EIntegrationExample() {
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookType | null>(null);

  // Example: Fetch system updates (replace with your API call)
  const [updates, setUpdates] = useState<UpdateCard[]>([]);
  
  useEffect(() => {
    // Fetch updates from your API
    // const fetchUpdates = async () => {
    //   const response = await fetch('/api/system-updates');
    //   const data = await response.json();
    //   setUpdates(data);
    // };
    // fetchUpdates();
    
    // For demo, use sample data:
    setUpdates([
      {
        id: '1',
        title: 'New AI Model: GPT-4 Turbo',
        summary: 'Enhanced accuracy for dealership visibility tracking.',
        date: new Date(),
        type: 'model',
        ctaText: 'View Details',
        metadata: { impact: '+15% accuracy', category: 'AI Engine' }
      }
    ]);
  }, []);

  // Example: Generate ACNs from insights
  const insights = [
    {
      id: 'insight-1',
      summary: 'Churn Risk High',
      severity: 'high' as InsightSeverity,
      dataPoint: { x: 75, y: 30 },
      actionText: 'Launch Retention Protocol',
      playbookId: 'playbook-1'
    }
  ];

  const { acns, corrections } = useI2EIntegration({
    insights,
    updates,
    onACNAction: (insightId) => {
      // Generate or fetch playbook
      const playbook = generatePlaybookFromInsight(
        insights.find(i => i.id === insightId)!,
        [
          {
            title: 'Create Retention Segment',
            description: 'Segment customers showing churn signals',
            autoExecute: true,
            estimatedTime: '30s',
            action: async () => {
              // Your action here
              console.log('Creating segment...');
            }
          },
          {
            title: 'Draft Alert Email',
            description: 'Generate personalized retention email',
            autoExecute: true,
            estimatedTime: '1 min',
            action: async () => {
              console.log('Drafting email...');
            }
          }
        ]
      );
      setSelectedPlaybook(playbook);
      setPlaybookOpen(true);
    },
    onCorrectionExecute: (correctionId) => {
      console.log('Executing correction:', correctionId);
    }
  });

  return (
    <div className="space-y-6">
      {/* 
        INTEGRATION POINT 1: Add Update Cards to Overview Tab
        Place this at the top of your overview tab content
      */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Updates
        </h2>
        <PulseUpdateCardGrid 
          updates={updates}
          onUpdateClick={(update) => {
            console.log('Update clicked:', update);
            // Handle update click (e.g., open modal, navigate)
          }}
          maxItems={3}
        />
      </section>

      {/* 
        INTEGRATION POINT 2: Wrap Charts with ACNContainer
        Replace your existing chart components with this pattern
      */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Analytics Dashboard
        </h2>
        <ACNContainer
          nuggets={acns}
          onDismiss={(id) => {
            console.log('ACN dismissed:', id);
          }}
          onAction={(id) => {
            console.log('ACN action:', id);
          }}
          className="relative bg-white rounded-2xl border border-gray-200 p-6 min-h-[400px]"
        >
          {/* Your existing chart component here */}
          {/* Example: <YourChartComponent data={chartData} /> */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p>Your chart component goes here</p>
          </div>
        </ACNContainer>
      </section>

      {/* 
        INTEGRATION POINT 3: Add Correction Widgets to Sidebar or Header
        Place this in a sidebar, header, or dedicated section
      */}
      <section className="max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Quick Fixes
        </h3>
        <OneClickCorrectionList
          corrections={corrections}
          onExecute={(id) => {
            console.log('Correction executed:', id);
          }}
          onDismiss={(id) => {
            console.log('Correction dismissed:', id);
          }}
          maxItems={3}
        />
      </section>

      {/* 
        INTEGRATION POINT 4: Execution Playbook (triggered by ACNs)
        This should be at the root level of your component
      */}
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

/**
 * QUICK INTEGRATION GUIDE:
 * 
 * 1. In DealershipAIDashboardLA.tsx, add imports:
 *    import { PulseUpdateCardGrid, ACNContainer, ExecutionPlaybook, OneClickCorrectionList } from '@/components/i2e';
 * 
 * 2. Add state for playbook:
 *    const [playbookOpen, setPlaybookOpen] = useState(false);
 *    const [selectedPlaybook, setSelectedPlaybook] = useState<ExecutionPlaybook | null>(null);
 * 
 * 3. In the Overview tab section (around line 593), add:
 *    - Update cards at the top
 *    - Wrap existing charts with ACNContainer
 *    - Add correction widgets to sidebar
 * 
 * 4. Add ExecutionPlaybook at the root level (after main content)
 * 
 * 5. Connect to your data sources:
 *    - Fetch updates from API
 *    - Convert insights to ACNs
 *    - Generate playbooks from insights
 *    - Detect corrections from issues
 */

