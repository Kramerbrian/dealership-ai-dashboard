export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    grid: string;
  };
}

export const defaultChartConfig: ChartConfig = {
  width: 800,
  height: 200,
  padding: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40,
  },
  colors: {
    primary: '#10b981',
    secondary: '#3b82f6',
    background: '#ffffff',
    grid: '#e2e8f0',
  },
};

export function generateSmoothPath(points: ChartDataPoint[], config: ChartConfig): string {
  if (points.length < 2) return '';

  const { width, height, padding } = config;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min/max values for scaling
  const xValues = points.map(p => p.x);
  const yValues = points.map(p => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  // Scale points to chart coordinates
  const scaledPoints = points.map(point => ({
    x: padding.left + ((point.x - xMin) / (xMax - xMin)) * chartWidth,
    y: padding.top + ((yMax - point.y) / (yMax - yMin)) * chartHeight,
  }));

  // Generate smooth curve using quadratic Bézier curves
  let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  
  for (let i = 1; i < scaledPoints.length; i++) {
    const prev = scaledPoints[i - 1];
    const curr = scaledPoints[i];
    const next = scaledPoints[i + 1];
    
    if (next) {
      // Control point for smooth curve
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = curr.x - (next.x - curr.x) / 2;
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    } else {
      // Last point - simple line
      path += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
}

export function generateAreaPath(points: ChartDataPoint[], config: ChartConfig): string {
  const linePath = generateSmoothPath(points, config);
  const { width, height, padding } = config;
  
  // Close the area by adding bottom line
  const bottomY = height - padding.bottom;
  const startX = padding.left;
  const endX = width - padding.right;
  
  return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
}

export function generateGridLines(config: ChartConfig, xTicks: number = 5, yTicks: number = 5): string[] {
  const { width, height, padding } = config;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const lines: string[] = [];
  
  // Vertical grid lines
  for (let i = 0; i <= xTicks; i++) {
    const x = padding.left + (i / xTicks) * chartWidth;
    lines.push(`M ${x} ${padding.top} L ${x} ${height - padding.bottom}`);
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (i / yTicks) * chartHeight;
    lines.push(`M ${padding.left} ${y} L ${width - padding.right} ${y}`);
  }
  
  return lines;
}

export function formatChartValue(value: number, type: 'number' | 'percentage' | 'currency' = 'number'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    default:
      return value.toLocaleString();
  }
}

export function getChartColor(index: number, palette: string[] = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']): string {
  return palette[index % palette.length];
}
