'use client'

import { useState } from 'react'
import { Plus, Mail, MoreVertical, Shield, User, Calendar, Trash2, Edit } from 'lucide-react'
import { api } from '@/lib/trpc-client'

export default function TeamSettings() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user' as 'dealership_admin' | 'user',
    permissions: [] as string[]
  })

  const { data: teamMembers, isLoading } = api.settings.getTeamMembers.useQuery()
  const inviteMember = api.settings.inviteTeamMember.useMutation()
  const updateRole = api.settings.updateTeamMemberRole.useMutation()
  const removeMember = api.settings.removeTeamMember.useMutation()

  const handleInvite = async () => {
    try {
      await inviteMember.mutateAsync(inviteForm)
      setShowInviteModal(false)
      setInviteForm({ email: '', role: 'user', permissions: [] })
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'dealership_admin' | 'user') => {
    try {
      await updateRole.mutateAsync({
        userId,
        role: newRole,
        permissions: []
      })
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      await removeMember.mutateAsync({ userId })
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'dealership_admin':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getLastSeenText = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return 'Never'
    
    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return lastSeen.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Management</h2>
          <p className="text-sm text-slate-500">Manage team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold">
                {member.fullName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {member.fullName || 'No name set'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{member.email}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Last seen {getLastSeenText(member.lastSeenAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value as 'dealership_admin' | 'user')}
                className="px-3 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="user">User</option>
                <option value="dealership_admin">Admin</option>
              </select>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
                    <p className="text-sm text-slate-500">Send an invitation to join your team</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'dealership_admin' | 'user' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="user">User - View data and generate reports</option>
                  <option value="dealership_admin">Admin - Full access to settings and team</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteForm.email || inviteMember.isPending}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
