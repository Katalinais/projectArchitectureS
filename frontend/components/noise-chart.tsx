"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface NoiseChartProps {
  data: { time: string; value: number }[]
}

export function NoiseChart({ data }: NoiseChartProps) {
  if (data.length === 0) {
    return <div className="flex h-[500px] items-center justify-center text-white">Esperando datos...</div>
  }

  // Calculate dynamic Y-axis domain based on data
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.2 || 10 // 20% padding or at least 10
  const yMin = Math.max(0, Math.floor(minValue - padding))
  const yMax = Math.ceil(maxValue + padding)

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#666" />
        <XAxis
          dataKey="time"
          className="text-xs"
          tick={{ fill: "#ffffff", fontSize: 12 }}
          stroke="#ffffff"
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "#ffffff", fontSize: 12 }}
          stroke="#ffffff"
          domain={[yMin, yMax]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #666",
            borderRadius: "8px",
            color: "#ffffff",
          }}
          labelStyle={{ color: "#ffffff" }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#ffffff" 
          strokeWidth={2} 
          dot={{ fill: "#ffffff", r: 4 }} 
          activeDot={{ r: 6, fill: "#ffffff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
