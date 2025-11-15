// @ts-nocheck
'use client';

import { useState } from 'react';
import { MissionBoard, quickWinMissions, createMissionFromTemplate } from '@/components/missions';
import { EvidencePanel } from '@/components/evidence';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Mission Board Demo Page
 *
 * Interactive demonstration of the mission management system
 */
export default function MissionBoardDemoPage() {
  // Sample missions with various states
  const [missions, setMissions] = useState([
    // Active mission - Schema Health Check
    createMissionFromTemplate(quickWinMissions[0], {
      status: 'active',
      progress: 65,
      confidence: 0.92,
      startedAt: Date.now() - 90000, // Started 1.5 min ago
      evidence: {
        count: 12,
        lastUpdated: Date.now() - 15000,
      },
    }),

    // Queued mission - AI Visibility
    createMissionFromTemplate(quickWinMissions[1], {
      status: 'queued',
    }),

    // Additional available missions
    {
      id: 'mission-review-monitor',
      title: 'Review Response Audit',
      description: 'Analyze your review response rate and quality across all platforms',
      agentId: 'review-monitor',
      agentName: 'Review Monitor',
      category: 'strategic' as const,
      estimatedTime: '15 min',
      impact: 'high' as const,
      status: 'available' as const,
    },
    {
      id: 'mission-competitor-watch',
      title: 'Competitor Positioning Analysis',
      description: 'Track how competitors appear in AI search vs. your dealership',
      agentId: 'competitor-watch',
      agentName: 'Competitor Watch',
      category: 'strategic' as const,
      estimatedTime: '10 min',
      impact: 'medium' as const,
      status: 'available' as const,
    },
    {
      id: 'mission-schema-maintenance',
      title: 'Monthly Schema Validation',
      description: 'Automated check to ensure schema markup stays valid',
      agentId: 'schema-king',
      agentName: 'Schema King',
      category: 'maintenance' as const,
      estimatedTime: '5 min',
      impact: 'medium' as const,
      status: 'available' as const,
    },

    // Completed mission
    {
      id: 'mission-completed-gbp',
      title: 'GBP Optimization Check',
      description: 'Analyzed Google Business Profile for optimization opportunities',
      agentId: 'gbp-optimizer',
      agentName: 'GBP Optimizer',
      category: 'quick-win' as const,
      estimatedTime: '3 min',
      impact: 'high' as const,
      status: 'completed' as const,
      confidence: 0.89,
      completedAt: Date.now() - 3600000, // 1 hour ago
      evidence: {
        count: 8,
        lastUpdated: Date.now() - 3600000,
      },
    },
  ]);

  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false);
  const [selectedMissionForEvidence, setSelectedMissionForEvidence] = useState<string | null>(null);

  // Sample evidence data
  const sampleEvidence = [
    {
      id: 'ev-1',
      type: 'url' as const,
      title: 'Homepage Schema Detected',
      description: 'Found existing LocalBusiness schema on homepage',
      timestamp: Date.now() - 120000,
      validated: true,
      validationScore: 0.95,
      source: 'Schema King',
      missionId: 'quick-win-schema-health',
      data: {
        url: 'https://example-dealership.com',
      },
    },
    {
      id: 'ev-2',
      type: 'code' as const,
      title: 'Missing Automotive Business Schema',
      description: 'No AutomotiveBusiness schema found',
      timestamp: Date.now() - 90000,
      validated: true,
      validationScore: 0.88,
      source: 'Schema King',
      missionId: 'quick-win-schema-health',
      data: {
        code: `{
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "name": "Your Dealership",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  }
}`,
      },
    },
    {
      id: 'ev-3',
      type: 'validation' as const,
      title: 'Schema Validation Results',
      description: 'Ran 5 validation checks on existing markup',
      timestamp: Date.now() - 60000,
      validated: true,
      validationScore: 0.92,
      source: 'Schema King',
      missionId: 'quick-win-schema-health',
      data: {
        validationDetails: {
          checks: [
            { name: 'Valid JSON-LD syntax', passed: true, message: 'All JSON-LD is well-formed' },
            { name: 'Required properties present', passed: true, message: 'Name, address, telephone present' },
            { name: 'Schema.org vocabulary', passed: true, message: 'Using correct schema.org types' },
            { name: 'Automotive-specific markup', passed: false, message: 'Missing AutomotiveBusiness type' },
            { name: 'Opening hours structured', passed: true, message: 'OpeningHoursSpecification found' },
          ],
        },
      },
    },
  ];

  const handleLaunchMission = (missionId: string) => {
    console.log('Launching mission:', missionId);

    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: 'active' as const,
              startedAt: Date.now(),
              progress: 0,
            }
          : m
      )
    );

    // Simulate progress
    const interval = setInterval(() => {
      setMissions((prev) =>
        prev.map((m) => {
          if (m.id === missionId && m.status === 'active') {
            const newProgress = (m.progress || 0) + Math.random() * 20;
            if (newProgress >= 100) {
              clearInterval(interval);
              return {
                ...m,
                status: 'completed' as const,
                progress: 100,
                confidence: 0.85 + Math.random() * 0.15,
                completedAt: Date.now(),
                evidence: {
                  count: Math.floor(Math.random() * 15) + 5,
                  lastUpdated: Date.now(),
                },
              };
            }
            return { ...m, progress: newProgress };
          }
          return m;
        })
      );
    }, 2000);
  };

  const handlePauseMission = (missionId: string) => {
    console.log('Pausing mission:', missionId);
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, status: 'queued' as const } : m
      )
    );
  };

  const handleViewDetails = (missionId: string) => {
    console.log('Viewing mission details:', missionId);
    // In production, open mission details modal/panel
  };

  const handleViewEvidence = (missionId: string) => {
    console.log('Viewing mission evidence:', missionId);
    setSelectedMissionForEvidence(missionId);
    setEvidencePanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#1e293b]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Mission Board Demo</h1>
              <p className="text-sm text-white/60">Interactive task management for Cognitive Ops</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Board */}
      <div className="max-w-7xl mx-auto">
        <MissionBoard
          missions={missions}
          onLaunchMission={handleLaunchMission}
          onPauseMission={handlePauseMission}
          onViewDetails={handleViewDetails}
          onViewEvidence={handleViewEvidence}
        />
      </div>

      {/* Info Panel */}
      <div className="fixed bottom-6 right-6 max-w-sm bg-black/40 backdrop-blur-md rounded-lg p-4 border border-white/10">
        <div className="text-xs text-white/60 mb-2">DEMO INFO</div>
        <div className="text-sm text-white/80 space-y-2">
          <p>Try launching an available mission to see progress simulation.</p>
          <p>Click evidence count badges to view the evidence panel.</p>
          <p className="text-xs text-white/60">
            In production, missions run real agents that analyze your dealership data.
          </p>
        </div>
      </div>

      {/* Evidence Panel */}
      {selectedMissionForEvidence && (
        <EvidencePanel
          missionId={selectedMissionForEvidence}
          missionTitle={
            missions.find((m) => m.id === selectedMissionForEvidence)?.title ||
            'Mission Evidence'
          }
          evidence={sampleEvidence.filter(
            (e) => e.missionId === selectedMissionForEvidence
          )}
          isOpen={evidencePanelOpen}
          onClose={() => setEvidencePanelOpen(false)}
          onDownloadReport={() => {
            console.log('Downloading report...');
          }}
        />
      )}
    </div>
  );
}
