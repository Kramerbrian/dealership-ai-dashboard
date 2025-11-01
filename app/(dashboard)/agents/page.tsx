'use client';

import { useState } from 'react';
import { Bot, Plus, Play, Pause, Settings, Trash2, Sparkles } from 'lucide-react';

export default function AgentsPage() {
  const [agents] = useState([
    {
      id: 1,
      name: 'Inventory Monitor',
      description: 'Monitors inventory changes and updates AI platforms',
      status: 'active',
      tasks: 24,
      lastRun: '2 minutes ago',
    },
    {
      id: 2,
      name: 'Review Collector',
      description: 'Automatically collects and processes customer reviews',
      status: 'active',
      tasks: 12,
      lastRun: '5 minutes ago',
    },
    {
      id: 3,
      name: 'Schema Validator',
      description: 'Validates and updates schema markup across site',
      status: 'paused',
      tasks: 0,
      lastRun: '1 hour ago',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">dAI Agents</h1>
          <p className="mt-2 text-gray-600">Automate tasks with intelligent AI agents</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Create Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.description}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {agent.status}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tasks Completed</span>
                <span className="font-medium text-gray-900">{agent.tasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Run</span>
                <span className="font-medium text-gray-900">{agent.lastRun}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                {agent.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Resume</span>
                  </>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Custom Agent</h3>
            <p className="text-sm text-gray-600 mb-4">
              Build your own AI agent to automate specific tasks for your dealership
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

