/**
 * Team Management Component
 * Task assignment and accountability tools
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserPlus,
  Bell,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Settings,
  Filter,
  Search
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
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  category: string;
  estimatedHours: number;
  actualHours?: number;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@dealership.com',
    role: 'admin',
    status: 'active',
    lastActive: '2024-01-15T10:30:00Z',
    tasksCompleted: 12,
    tasksAssigned: 3,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@dealership.com',
    role: 'manager',
    status: 'active',
    lastActive: '2024-01-15T09:15:00Z',
    tasksCompleted: 8,
    tasksAssigned: 5,
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@dealership.com',
    role: 'user',
    status: 'active',
    lastActive: '2024-01-14T16:45:00Z',
    tasksCompleted: 15,
    tasksAssigned: 2,
  },
];

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Respond to negative Google review',
    description: 'Customer left a 2-star review about service wait time. Generate and deploy appropriate response.',
    assignee: '1',
    assigneeName: 'John Smith',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-16T17:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    category: 'Reputation',
    estimatedHours: 1,
  },
  {
    id: '2',
    title: 'Deploy FAQ schema markup',
    description: 'Add structured data to service page to improve search visibility.',
    assignee: '2',
    assigneeName: 'Sarah Johnson',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-01-18T17:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    category: 'SEO',
    estimatedHours: 3,
  },
  {
    id: '3',
    title: 'Invite service manager to platform',
    description: 'Send invitation to service manager to join the team and complete onboarding.',
    assignee: '1',
    assigneeName: 'John Smith',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-15T17:00:00Z',
    createdAt: '2024-01-14T14:00:00Z',
    category: 'Team',
    estimatedHours: 0.5,
    actualHours: 0.5,
  },
  {
    id: '4',
    title: 'Create video testimonials',
    description: 'Record and edit customer success stories for social proof.',
    assignee: '3',
    assigneeName: 'Mike Davis',
    status: 'overdue',
    priority: 'urgent',
    dueDate: '2024-01-14T17:00:00Z',
    createdAt: '2024-01-10T11:00:00Z',
    category: 'Content',
    estimatedHours: 8,
  },
];

export default function TeamManagement() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as const,
    dueDate: '',
    category: '',
    estimatedHours: 1,
  });
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'user' as const,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignee) {
      toast.error('Please fill in all required fields');
      return;
    }

    const assigneeName = teamMembers.find(m => m.id === newTask.assignee)?.name || 'Unknown';
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      assigneeName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      category: '',
      estimatedHours: 1,
    });
    setIsCreateTaskOpen(false);
    toast.success('Task created successfully!');
  };

  const handleInviteMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      status: 'active',
      lastActive: new Date().toISOString(),
      tasksCompleted: 0,
      tasksAssigned: 0,
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', email: '', role: 'user' });
    setIsInviteMemberOpen(false);
    toast.success('Team member invited successfully!');
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    toast.success('Task status updated!');
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600">Manage tasks, assignments, and team accountability</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Assign a task to a team member with clear objectives and deadlines.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Respond to negative review"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe the task in detail..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignee">Assign To *</Label>
                    <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEO">SEO</SelectItem>
                        <SelectItem value="Reputation">Reputation</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                        <SelectItem value="Team">Team</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberName">Name *</Label>
                  <Input
                    id="memberName"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="memberEmail">Email *</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@dealership.com"
                  />
                </div>
                <div>
                  <Label htmlFor="memberRole">Role</Label>
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
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Track and manage team assignments and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Assigned to: {task.assigneeName}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>Category: {task.category}</span>
                          <span>Est. {task.estimatedHours}h</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team and track individual performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {member.role}
                            </Badge>
                            <Badge variant="outline">
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <div>Tasks Completed: {member.tasksCompleted}</div>
                          <div>Tasks Assigned: {member.tasksAssigned}</div>
                          <div className="text-gray-500">
                            Last Active: {new Date(member.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
