import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  status?: 'excellent' | 'good' | 'fair' | 'poor'
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  label,
  value,
  change,
  status = 'good',
  icon,
  className
}: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    if (!change) return null
    switch (change.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = () => {
    if (!change) return 'text-gray-500'
    switch (change.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {label}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-gray-400">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={getStatusColor(status)}>
            {value}
          </span>
        </div>
        {change && (
          <div className="flex items-center space-x-1 text-xs">
            {getChangeIcon()}
            <span className={getChangeColor()}>
              {change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}
              {Math.abs(change.value)}
            </span>
            <span className="text-gray-500">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
