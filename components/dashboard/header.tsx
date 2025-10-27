import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { Bell, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SessionCounter } from './SessionCounter'

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">DealershipAI</h1>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <SessionCounter />
            <div className="text-sm text-gray-600">
              <span className="font-medium">QAI Score:</span> 87
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Rank:</span> #2 of 8
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
