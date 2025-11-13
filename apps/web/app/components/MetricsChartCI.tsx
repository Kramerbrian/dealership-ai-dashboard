'use client'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from 'recharts'
export default function MetricsChartCI({ data }:{ data: Array<{ bucket:string; ctr:number; ctr_lo:number; ctr_hi:number }>}){
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket"/>
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="ctr_lo" stackId="1" />
          <Area type="monotone" dataKey="ctr_hi" stackId="1" />
          <Line type="monotone" dataKey="ctr" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
