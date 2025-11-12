'use client';

import React, { useState } from 'react';
import { 
  Search, Schema, MapPin, MessageSquare, 
  Gauge, Building2, Award, TrendingUp 
} from 'lucide-react';

interface AgentNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical' | 'idle';
  description: string;
}

const agentNodes: AgentNode[] = [
  {
    id: 'aeo',
    label: 'AEO',
    icon: <Search className="w-5 h-5" />,
    status: 'healthy',
    description: 'AI Ecosystem Optimization — Visibility across AI platforms'
  },
  {
    id: 'schema',
    label: 'Schema',
    icon: <Schema className="w-5 h-5" />,
    status: 'warning',
    description: 'JSON-LD markup coverage and validation'
  },
  {
    id: 'geo',
    label: 'GEO',
    icon: <MapPin className="w-5 h-5" />,
    status: 'healthy',
    description: 'Geographic trust and local presence'
  },
  {
    id: 'ugc',
    label: 'UGC',
    icon: <MessageSquare className="w-5 h-5" />,
    status: 'healthy',
    description: 'User-generated content and review health'
  },
  {
    id: 'cwv',
    label: 'CWV',
    icon: <Gauge className="w-5 h-5" />,
    status: 'idle',
    description: 'Core Web Vitals performance metrics'
  },
  {
    id: 'nap',
    label: 'NAP',
    icon: <Building2 className="w-5 h-5" />,
    status: 'healthy',
    description: 'Name, Address, Phone consistency'
  },
  {
    id: 'piqr',
    label: 'PIQR',
    icon: <Award className="w-5 h-5" />,
    status: 'healthy',
    description: 'Platform Inclusion & Quality Rate'
  },
  {
    id: 'qai',
    label: 'QAI',
    icon: <TrendingUp className="w-5 h-5" />,
    status: 'warning',
    description: 'Quality Authority Index'
  }
];

interface AgentRailProps {
  onNodeClick?: (nodeId: string) => void;
  onNodeLongPress?: (nodeId: string) => void;
}

export default function AgentRail({ onNodeClick, onNodeLongPress }: AgentRailProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = (nodeId: string) => {
    const timer = setTimeout(() => {
      onNodeLongPress?.(nodeId);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getStatusColor = (status: AgentNode['status']) => {
    switch (status) {
      case 'healthy': return 'bg-[#39D98A]/20 border-[#39D98A]/50';
      case 'warning': return 'bg-[#FFB020]/20 border-[#FFB020]/50';
      case 'critical': return 'bg-[#F97066]/20 border-[#F97066]/50';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const getStatusDot = (status: AgentNode['status']) => {
    switch (status) {
      case 'healthy': return 'bg-[#39D98A]';
      case 'warning': return 'bg-[#FFB020]';
      case 'critical': return 'bg-[#F97066]';
      default: return 'bg-[#9BB2C9]';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {agentNodes.map((node) => {
        const nodeHovered = hoveredNode === node.id;
        return (
          <div key={node.id} className="relative">
            <button
              onClick={() => onNodeClick?.(node.id)}
              onMouseDown={() => handleMouseDown(node.id)}
              onMouseUp={handleMouseUp}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`group relative w-12 h-12 rounded-xl border-2 ${getStatusColor(node.status)} flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg ${getStatusDot(node.status)}/20`}
              aria-label={node.label}
            >
              <div className={`text-[#E6EEF7] group-hover:text-white transition-colors ${nodeHovered ? 'text-white' : ''}`}>
                {node.icon}
              </div>
              
              {/* Status dot */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusDot(node.status)} border-2 border-[#0F141A]`} />

              {/* Tooltip on hover */}
              {nodeHovered && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-2 rounded-lg bg-[#0F141A] border border-white/10 shadow-xl whitespace-nowrap">
                  <div className="text-sm font-semibold text-[#E6EEF7] mb-1">{node.label}</div>
                  <div className="text-xs text-[#9BB2C9]">{node.description}</div>
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#0F141A] border-l border-b border-white/10 rotate-45" />
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

