"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface NoiseChartProps {
  data: Array<{ time: string; value: number }>
}

export function NoiseChart({ data }: NoiseChartProps) {
  const [chartData, setChartData] = useState<Array<{ time: string; noise: number }>>([])

  // Cada vez que llegue un nuevo punto, actualiza suavemente
  useEffect(() => {
    if (data.length === 0) return

    const latest = data[data.length - 1]
    setChartData((prev) => {
      const updated = [...prev, { time: latest.time, noise: latest.value }]
      // Mantener solo los últimos 30 puntos
      return updated.slice(-30)
    })
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        Esperando datos...
      </div>
    )
  }

  const values = chartData.map((d) => d.noise)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.2 || 10
  const yMin = Math.max(0, Math.floor(minValue - padding))
  const yMax = Math.ceil(maxValue + padding)

  return (
    <div style={{ width: "100%", height: 400, background: "#fff", borderRadius: "8px", padding: "10px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#666" }} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12, fill: "#666" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="noise"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // quita animaciones entre renders
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}