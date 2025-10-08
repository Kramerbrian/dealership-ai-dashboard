'use client'

import { useState, useEffect } from 'react'
import { Save, User, Mail, Calendar, Building2 } from 'lucide-react'
import { api } from '@/lib/trpc-client'

export default function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  })

  const { data: profile, isLoading } = api.settings.getProfile.useQuery()
  const updateProfile = api.settings.updateProfile.useMutation()

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          <p className="text-sm text-slate-500">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile?.fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{profile?.fullName || 'No name set'}</h3>
            <p className="text-slate-600">{profile?.email}</p>
            <p className="text-sm text-slate-500 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your full name"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{profile?.fullName || 'Not set'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your email"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{profile?.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 capitalize">{profile?.role?.replace('_', ' ')}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Organization</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization Name
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{profile?.tenant?.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization Type
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 capitalize">{profile?.tenant?.type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
