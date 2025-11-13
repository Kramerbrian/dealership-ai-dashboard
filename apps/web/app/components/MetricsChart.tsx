'use client'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
export default function MetricsChart({ data }:{ data: Array<{ bucket:string; ctr:number; cvr:number }>}){
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket"/>
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Line yAxisId="left" type="monotone" dataKey="ctr" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="cvr" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
