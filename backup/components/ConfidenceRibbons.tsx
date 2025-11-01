'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ConfidenceRibbonsProps {
  data: Array<{
    date: string;
    value: number;
    yhat_lower: number;
    yhat_upper: number;
    confidence: number;
  }>;
  title: string;
  color?: string;
}

export default function ConfidenceRibbons({ data, title, color = '#3b82f6' }: ConfidenceRibbonsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-4">{title}</div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: any, name: string) => [
                name === 'value' ? `${value.toFixed(1)}` : 
                name === 'yhat_lower' ? `${value.toFixed(1)} (lower)` :
                name === 'yhat_upper' ? `${value.toFixed(1)} (upper)` :
                `${value.toFixed(1)}`,
                name === 'value' ? 'Prediction' :
                name === 'yhat_lower' ? 'Lower Bound' :
                name === 'yhat_upper' ? 'Upper Bound' :
                'Confidence'
              ]}
            />
            
            {/* Confidence Ribbon */}
            <Area
              type="monotone"
              dataKey="yhat_upper"
              stackId="1"
              stroke="none"
              fill={color}
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="yhat_lower"
              stackId="1"
              stroke="none"
              fill={color}
              fillOpacity={0.1}
            />
            
            {/* Main Prediction Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Confidence Legend */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-gray-600">Prediction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color, opacity: 0.3 }}></div>
            <span className="text-gray-600">95% Confidence</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Avg Confidence: {data.reduce((sum, d) => sum + d.confidence, 0) / data.length * 100}%
        </div>
      </div>
    </div>
  );
}
