"use client";

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Types
interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config?: any;
    status?: 'pending' | 'running' | 'completed' | 'error';
    inputs?: string[];
    outputs?: string[];
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'marketing' | 'analytics' | 'automation';
  nodes: WorkflowNode[];
  edges: Edge[];
  icon: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  results?: any;
  error?: string;
}

// Custom Node Components
const StartNode = ({ data }: { data: any }) => (
  <div className="workflow-node start-node">
    <div className="node-icon">🚀</div>
    <div className="node-content">
      <div className="node-label">{data.label}</div>
      {data.description && <div className="node-description">{data.description}</div>}
    </div>
    <div className="node-status">
      <div className={`status-indicator ${data.status || 'pending'}`}></div>
    </div>
  </div>
);

const ProcessNode = ({ data }: { data: any }) => (
  <div className="workflow-node process-node">
    <div className="node-icon">⚙️</div>
    <div className="node-content">
      <div className="node-label">{data.label}</div>
      {data.description && <div className="node-description">{data.description}</div>}
    </div>
    <div className="node-status">
      <div className={`status-indicator ${data.status || 'pending'}`}></div>
    </div>
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="workflow-node decision-node">
    <div className="node-icon">🔀</div>
    <div className="node-content">
      <div className="node-label">{data.label}</div>
      {data.description && <div className="node-description">{data.description}</div>}
    </div>
    <div className="node-status">
      <div className={`status-indicator ${data.status || 'pending'}`}></div>
    </div>
  </div>
);

const EndNode = ({ data }: { data: any }) => (
  <div className="workflow-node end-node">
    <div className="node-icon">🏁</div>
    <div className="node-content">
      <div className="node-label">{data.label}</div>
      {data.description && <div className="node-description">{data.description}</div>}
    </div>
    <div className="node-status">
      <div className={`status-indicator ${data.status || 'pending'}`}></div>
    </div>
  </div>
);

const CustomNode = ({ data }: { data: any }) => (
  <div className="workflow-node custom-node">
    <div className="node-icon">{data.icon || '📦'}</div>
    <div className="node-content">
      <div className="node-label">{data.label}</div>
      {data.description && <div className="node-description">{data.description}</div>}
    </div>
    <div className="node-status">
      <div className={`status-indicator ${data.status || 'pending'}`}></div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
  custom: CustomNode,
};

// Custom Edge Types
const SuccessEdge = ({ data }: { data: any }) => (
  <div className="edge-label success">
    {data.label || 'Success'}
  </div>
);

const ErrorEdge = ({ data }: { data: any }) => (
  <div className="edge-label error">
    {data.label || 'Error'}
  </div>
);

const edgeTypes: EdgeTypes = {
  success: SuccessEdge,
  error: ErrorEdge,
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'executions'>('builder');
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Workflow Templates
  const templates: WorkflowTemplate[] = [
    {
      id: 'seo-audit',
      name: 'SEO Audit Workflow',
      description: 'Automated SEO analysis and recommendations',
      category: 'seo',
      icon: '🔍',
      nodes: [
        {
          id: '1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start SEO Audit', description: 'Begin automated SEO analysis' }
        },
        {
          id: '2',
          type: 'process',
          position: { x: 300, y: 100 },
          data: { label: 'Crawl Website', description: 'Analyze site structure and content' }
        },
        {
          id: '3',
          type: 'process',
          position: { x: 500, y: 100 },
          data: { label: 'Check Technical SEO', description: 'Validate meta tags, schema, etc.' }
        },
        {
          id: '4',
          type: 'decision',
          position: { x: 700, y: 100 },
          data: { label: 'Issues Found?', description: 'Determine if SEO issues exist' }
        },
        {
          id: '5',
          type: 'process',
          position: { x: 700, y: 300 },
          data: { label: 'Generate Report', description: 'Create detailed SEO report' }
        },
        {
          id: '6',
          type: 'end',
          position: { x: 900, y: 200 },
          data: { label: 'Complete', description: 'SEO audit finished' }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'default' },
        { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', type: 'default' },
        { id: 'e4-5', source: '4', target: '5', type: 'success', data: { label: 'Yes' } },
        { id: 'e4-6', source: '4', target: '6', type: 'error', data: { label: 'No' } },
        { id: 'e5-6', source: '5', target: '6', type: 'default' }
      ]
    },
    {
      id: 'content-optimization',
      name: 'Content Optimization',
      description: 'AI-powered content analysis and optimization',
      category: 'marketing',
      icon: '📝',
      nodes: [
        {
          id: '1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start Content Analysis', description: 'Begin content optimization process' }
        },
        {
          id: '2',
          type: 'process',
          position: { x: 300, y: 100 },
          data: { label: 'Analyze Content', description: 'Review content quality and SEO' }
        },
        {
          id: '3',
          type: 'process',
          position: { x: 500, y: 100 },
          data: { label: 'Generate Suggestions', description: 'AI-powered optimization recommendations' }
        },
        {
          id: '4',
          type: 'end',
          position: { x: 700, y: 100 },
          data: { label: 'Complete', description: 'Content optimization finished' }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'default' },
        { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', type: 'default' }
      ]
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      description: 'Automated competitor monitoring and analysis',
      category: 'analytics',
      icon: '🏆',
      nodes: [
        {
          id: '1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start Analysis', description: 'Begin competitor monitoring' }
        },
        {
          id: '2',
          type: 'process',
          position: { x: 300, y: 100 },
          data: { label: 'Collect Data', description: 'Gather competitor metrics' }
        },
        {
          id: '3',
          type: 'process',
          position: { x: 500, y: 100 },
          data: { label: 'Compare Performance', description: 'Analyze competitive positioning' }
        },
        {
          id: '4',
          type: 'process',
          position: { x: 700, y: 100 },
          data: { label: 'Generate Insights', description: 'Create competitive intelligence report' }
        },
        {
          id: '5',
          type: 'end',
          position: { x: 900, y: 100 },
          data: { label: 'Complete', description: 'Analysis finished' }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'default' },
        { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', type: 'default' },
        { id: 'e4-5', source: '4', target: '5', type: 'default' }
      ]
    }
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setSelectedTemplate(template.id);
    setActiveTab('builder');
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: `A ${type} node in the workflow`
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) return;

    setIsExecuting(true);
    const execution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId: selectedTemplate || 'custom',
      status: 'running',
      startTime: new Date()
    };

    setExecutionHistory(prev => [execution, ...prev]);

    // Simulate workflow execution
    try {
      // Update node statuses progressively
      for (let i = 0; i < nodes.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNodes(prev => prev.map(node => 
          node.id === nodes[i].id 
            ? { ...node, data: { ...node.data, status: 'running' } }
            : node
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));

        setNodes(prev => prev.map(node => 
          node.id === nodes[i].id 
            ? { ...node, data: { ...node.data, status: 'completed' } }
            : node
        ));
      }

      // Mark execution as completed
      setExecutionHistory(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { ...exec, status: 'completed', endTime: new Date(), results: { success: true } }
          : exec
      ));

    } catch (error) {
      setExecutionHistory(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { ...exec, status: 'failed', endTime: new Date(), error: 'Workflow execution failed' }
          : exec
      ));
    } finally {
      setIsExecuting(false);
    }
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('');
    setSelectedTemplate(null);
  };

  const renderTemplates = () => (
    <div className="templates-section">
      <h3>Workflow Templates</h3>
      <div className="templates-grid">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="template-card"
            onClick={() => loadTemplate(template)}
          >
            <div className="template-icon">{template.icon}</div>
            <div className="template-content">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <div className="template-category">{template.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExecutions = () => (
    <div className="executions-section">
      <h3>Execution History</h3>
      <div className="executions-list">
        {executionHistory.length === 0 ? (
          <div className="no-executions">
            <p>No workflow executions yet.</p>
            <p>Create and run a workflow to see execution history.</p>
          </div>
        ) : (
          executionHistory.map(execution => (
            <div key={execution.id} className="execution-item">
              <div className="execution-header">
                <div className="execution-name">
                  {templates.find(t => t.id === execution.workflowId)?.name || 'Custom Workflow'}
                </div>
                <div className={`execution-status ${execution.status}`}>
                  {execution.status}
                </div>
              </div>
              <div className="execution-details">
                <div className="execution-time">
                  Started: {execution.startTime.toLocaleString()}
                </div>
                {execution.endTime && (
                  <div className="execution-duration">
                    Duration: {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s
                  </div>
                )}
                {execution.error && (
                  <div className="execution-error">
                    Error: {execution.error}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <h2>🔧 Visual Workflow Builder</h2>
        <p>Create, customize, and execute automated workflows</p>
      </div>

      <div className="workflow-tabs">
        <button 
          className={`tab-button ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          Workflow Builder
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button 
          className={`tab-button ${activeTab === 'executions' ? 'active' : ''}`}
          onClick={() => setActiveTab('executions')}
        >
          Executions
        </button>
      </div>

      <div className="workflow-content">
        {activeTab === 'builder' && (
          <div className="builder-section">
            <div className="builder-controls">
              <div className="workflow-info">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Workflow Name"
                  className="workflow-name-input"
                />
              </div>

              <div className="node-palette">
                <h4>Add Nodes</h4>
                <div className="node-buttons">
                  <button onClick={() => addNode('start')} className="node-button start">
                    🚀 Start
                  </button>
                  <button onClick={() => addNode('process')} className="node-button process">
                    ⚙️ Process
                  </button>
                  <button onClick={() => addNode('decision')} className="node-button decision">
                    🔀 Decision
                  </button>
                  <button onClick={() => addNode('end')} className="node-button end">
                    🏁 End
                  </button>
                  <button onClick={() => addNode('custom')} className="node-button custom">
                    📦 Custom
                  </button>
                </div>
              </div>

              <div className="workflow-actions">
                <button 
                  onClick={executeWorkflow} 
                  disabled={isExecuting || nodes.length === 0}
                  className="execute-button"
                >
                  {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </button>
                <button onClick={clearWorkflow} className="clear-button">
                  Clear
                </button>
              </div>
            </div>

            <div className="workflow-canvas">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={onInit}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        )}

        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'executions' && renderExecutions()}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
