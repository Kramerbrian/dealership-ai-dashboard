'use client'
import { useEffect, useRef } from 'react'

export interface DataPoint {
  x: string | number
  y: number
  label?: string
}

export interface ConfidenceInterval {
  lower: number
  upper: number
}

export interface MiniLineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  showCI?: boolean
  confidenceIntervals?: ConfidenceInterval[]
  showGrid?: boolean
  showDots?: boolean
  strokeWidth?: number
  className?: string
  title?: string
  subtitle?: string
  formatY?: (value: number) => string
  formatX?: (value: string | number) => string
}

export default function MiniLineChart({
  data,
  width = 200,
  height = 100,
  color = '#3b82f6',
  showCI = false,
  confidenceIntervals = [],
  showGrid = true,
  showDots = true,
  strokeWidth = 2,
  className = '',
  title,
  subtitle,
  formatY = (value) => value.toFixed(2),
  formatX = (value) => String(value)
}: MiniLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = svgRef.current
    const margin = { top: 10, right: 10, bottom: 20, left: 30 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.innerHTML = ''

    // Find min/max values
    const yValues = data.map(d => d.y)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const yRange = yMax - yMin
    const yPadding = yRange * 0.1 // 10% padding

    const xValues = data.map((d, i) => i)
    const xMin = 0
    const xMax = data.length - 1

    // Scales
    const xScale = (value: number) => 
      margin.left + (value / xMax) * chartWidth
    
    const yScale = (value: number) => 
      margin.top + chartHeight - ((value - (yMin - yPadding)) / (yRange + 2 * yPadding)) * chartHeight

    // Create main group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'chart-content')

    // Grid lines
    if (showGrid) {
      // Horizontal grid lines
      const gridLines = 3
      for (let i = 0; i <= gridLines; i++) {
        const y = yMin - yPadding + (i / gridLines) * (yRange + 2 * yPadding)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', margin.left.toString())
        line.setAttribute('x2', (width - margin.right).toString())
        line.setAttribute('y1', yScale(y).toString())
        line.setAttribute('y2', yScale(y).toString())
        line.setAttribute('stroke', '#e5e7eb')
        line.setAttribute('stroke-width', '0.5')
        line.setAttribute('opacity', '0.5')
        g.appendChild(line)
      }
    }

    // Confidence intervals
    if (showCI && confidenceIntervals.length === data.length) {
      const ciPath = confidenceIntervals.map((ci, i) => {
        const x = xScale(i)
        const yUpper = yScale(ci.upper)
        const yLower = yScale(ci.lower)
        return `L ${x} ${yUpper} L ${x} ${yLower}`
      }).join(' ')

      const ciElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      ciElement.setAttribute('d', `M ${xScale(0)} ${yScale(confidenceIntervals[0].upper)} ${ciPath} Z`)
      ciElement.setAttribute('fill', color)
      ciElement.setAttribute('opacity', '0.1')
      g.appendChild(ciElement)
    }

    // Main line
    const pathData = data.map((d, i) => {
      const x = xScale(i)
      const y = yScale(d.y)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', strokeWidth.toString())
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    g.appendChild(path)

    // Dots
    if (showDots) {
      data.forEach((d, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', xScale(i).toString())
        circle.setAttribute('cy', yScale(d.y).toString())
        circle.setAttribute('r', '3')
        circle.setAttribute('fill', color)
        circle.setAttribute('stroke', '#ffffff')
        circle.setAttribute('stroke-width', '1')
        g.appendChild(circle)
      })
    }

    // Y-axis labels
    if (showGrid) {
      const labelCount = 3
      for (let i = 0; i <= labelCount; i++) {
        const value = yMin - yPadding + (i / labelCount) * (yRange + 2 * yPadding)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', (margin.left - 5).toString())
        text.setAttribute('y', (yScale(value) + 4).toString())
        text.setAttribute('text-anchor', 'end')
        text.setAttribute('font-size', '10')
        text.setAttribute('fill', '#6b7280')
        text.textContent = formatY(value)
        g.appendChild(text)
      }
    }

    // X-axis labels (show first, middle, last)
    if (data.length > 1) {
      const indices = [0, Math.floor(data.length / 2), data.length - 1]
      indices.forEach(i => {
        if (i < data.length) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', xScale(i).toString())
          text.setAttribute('y', (height - 5).toString())
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('font-size', '10')
          text.setAttribute('fill', '#6b7280')
          text.textContent = formatX(data[i].x)
          g.appendChild(text)
        }
      })
    }

    svg.appendChild(g)

  }, [data, width, height, color, showCI, confidenceIntervals, showGrid, showDots, strokeWidth, formatY, formatX])

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <div className="text-sm">No data</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <div className="text-sm font-medium text-gray-900">{title}</div>}
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* SVG content will be generated by useEffect */}
      </svg>
    </div>
  )
}

// Convenience component for CTR charts
export function CTRChart({ data, ...props }: Omit<MiniLineChartProps, 'formatY'>) {
  return (
    <MiniLineChart
      {...props}
      data={data}
      formatY={(value) => `${(value * 100).toFixed(1)}%`}
      color="#10b981"
      title="Click-Through Rate"
    />
  )
}

// Convenience component for CVR charts
export function CVRChart({ data, ...props }: Omit<MiniLineChartProps, 'formatY'>) {
  return (
    <MiniLineChart
      {...props}
      data={data}
      formatY={(value) => `${(value * 100).toFixed(1)}%`}
      color="#f59e0b"
      title="Conversion Rate"
    />
  )
}

// Convenience component for Revenue charts
export function RevenueChart({ data, ...props }: Omit<MiniLineChartProps, 'formatY'>) {
  return (
    <MiniLineChart
      {...props}
      data={data}
      formatY={(value) => `$${value.toLocaleString()}`}
      color="#8b5cf6"
      title="Revenue"
    />
  )
}

// Chart with confidence intervals
export function ChartWithCI({ 
  data, 
  confidenceIntervals, 
  ...props 
}: MiniLineChartProps) {
  return (
    <MiniLineChart
      {...props}
      data={data}
      showCI={true}
      confidenceIntervals={confidenceIntervals}
    />
  )
}
