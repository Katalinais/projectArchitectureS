"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface NoiseChartProps {
  data: Array<{ time: string; value: number }>
}

export function NoiseChart({ data }: NoiseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Esperando datos...
      </div>
    )
  }

  // Calculate dynamic Y-axis domain based on data
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.2 || 10 // 20% padding or at least 10
  const yMin = Math.max(0, Math.floor(minValue - padding))
  const yMax = Math.ceil(maxValue + padding)

  // Transform data to match chart format
  const chartData = data.map((item) => ({
    time: item.time,
    noise: item.value,
  }))

  return (
    <ChartContainer
      config={{
        noise: {
          label: "Nivel de Ruido (dB)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[500px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            className="text-xs" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
          />
          <YAxis 
            className="text-xs" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            domain={[yMin, yMax]} 
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="noise"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
            activeDot={{ r: 6 }}
            name="Nivel de Ruido (dB)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
