"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Bell,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  status: 'active' | 'inactive';
  lastActive: string;
  tasksCompleted: number;
  tasksAssigned: number;
  performance: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  estimatedHours: number;
  actualHours?: number;
  comments: TaskComment[];
}

interface TaskComment {
  id: string;
  author: string;
  authorName: string;
  content: string;
  timestamp: string;
}

interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  tasksCompleted: number;
  tasksOverdue: number;
  averageCompletionTime: string;
  teamPerformance: number;
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as const,
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  });

  // New member form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'user' as const
  });

  useEffect(() => {
    // Mock data - in production, this would come from your API
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@dealership.com',
        role: 'admin',
        status: 'active',
        lastActive: '2024-12-15T10:30:00Z',
        tasksCompleted: 24,
        tasksAssigned: 8,
        performance: 92
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@dealership.com',
        role: 'manager',
        status: 'active',
        lastActive: '2024-12-15T09:15:00Z',
        tasksCompleted: 18,
        tasksAssigned: 12,
        performance: 87
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily@dealership.com',
        role: 'user',
        status: 'active',
        lastActive: '2024-12-15T08:45:00Z',
        tasksCompleted: 15,
        tasksAssigned: 6,
        performance: 78
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david@dealership.com',
        role: 'user',
        status: 'inactive',
        lastActive: '2024-12-10T16:20:00Z',
        tasksCompleted: 12,
        tasksAssigned: 4,
        performance: 65
      }
    ];

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Optimize Google My Business listing',
        description: 'Update business hours, add photos, and respond to recent reviews',
        assignee: '1',
        assigneeName: 'Sarah Johnson',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-12-20',
        createdAt: '2024-12-10T10:00:00Z',
        updatedAt: '2024-12-15T14:30:00Z',
        tags: ['SEO', 'Google My Business'],
        estimatedHours: 4,
        actualHours: 2.5,
        comments: [
          {
            id: '1',
            author: '1',
            authorName: 'Sarah Johnson',
            content: 'Started working on this. Photos are uploaded, working on review responses.',
            timestamp: '2024-12-15T14:30:00Z'
          }
        ]
      },
      {
        id: '2',
        title: 'Create Q1 marketing campaign',
        description: 'Develop comprehensive marketing strategy for Q1 2025 including digital and traditional channels',
        assignee: '2',
        assigneeName: 'Mike Chen',
        priority: 'urgent',
        status: 'todo',
        dueDate: '2024-12-25',
        createdAt: '2024-12-12T09:00:00Z',
        updatedAt: '2024-12-12T09:00:00Z',
        tags: ['Marketing', 'Q1 Planning'],
        estimatedHours: 16,
        comments: []
      },
      {
        id: '3',
        title: 'Update website content',
        description: 'Refresh homepage content and add new vehicle inventory',
        assignee: '3',
        assigneeName: 'Emily Rodriguez',
        priority: 'medium',
        status: 'completed',
        dueDate: '2024-12-18',
        createdAt: '2024-12-08T11:00:00Z',
        updatedAt: '2024-12-14T16:45:00Z',
        tags: ['Website', 'Content'],
        estimatedHours: 6,
        actualHours: 5.5,
        comments: [
          {
            id: '2',
            author: '3',
            authorName: 'Emily Rodriguez',
            content: 'Completed! All content updated and new inventory added.',
            timestamp: '2024-12-14T16:45:00Z'
          }
        ]
      }
    ];

    const mockMetrics: TeamMetrics = {
      totalMembers: 4,
      activeMembers: 3,
      tasksCompleted: 57,
      tasksOverdue: 2,
      averageCompletionTime: '2.3 days',
      teamPerformance: 80
    };

    setTeamMembers(mockMembers);
    setTasks(mockTasks);
    setMetrics(mockMetrics);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const createTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
      assigneeName: teamMembers.find(m => m.id === newTask.assignee)?.name || '',
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newTask.tags,
      estimatedHours: newTask.estimatedHours,
      comments: []
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      estimatedHours: 0,
      tags: []
    });
    setShowCreateTask(false);
  };

  const createMember = () => {
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'active',
      lastActive: new Date().toISOString(),
      tasksCompleted: 0,
      tasksAssigned: 0,
      performance: 0
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', email: '', role: 'user' });
    setShowCreateMember(false);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'review': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      case 'todo': return <Target className="h-4 w-4 text-gray-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.status.includes('completed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600">Manage your team and track task progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateMember(true)}>
            <User className="h-4 w-4" />
            Add Member
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.activeMembers}/{metrics.totalMembers}</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.tasksCompleted}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.tasksOverdue}</div>
                  <div className="text-sm text-gray-600">Overdue Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.teamPerformance}%</div>
                  <div className="text-sm text-gray-600">Team Performance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-6">
          {/* Task Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {isOverdue(task.dueDate) && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assigneeName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h estimated
                        </div>
                        {task.actualHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.actualHours}h actual
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {task.comments.length} comments
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Select 
                        value={task.status} 
                        onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium capitalize">{member.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Completed:</span>
                      <span className="font-medium">{member.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Assigned:</span>
                      <span className="font-medium">{member.tasksAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance:</span>
                      <span className="font-medium">{member.performance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="font-medium">
                        {new Date(member.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="task-hours">Estimated Hours</Label>
                <Input
                  id="task-hours"
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                Cancel
              </Button>
              <Button onClick={createTask}>
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>
              
              <div>
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="member-role">Role</Label>
                <Select value={newMember.role} onValueChange={(value: any) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateMember(false)}>
                Cancel
              </Button>
              <Button onClick={createMember}>
                Add Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}