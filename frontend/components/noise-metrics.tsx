"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, VolumeX, Volume1 } from "lucide-react"

interface NoiseMetricsProps {
  currentNoise: number
}

export function NoiseMetrics({ currentNoise }: NoiseMetricsProps) {
  const getNoiseLevel = (db: number) => {
    if (db < 40) return { label: "Silencioso", color: "text-green-500", icon: VolumeX }
    if (db < 60) return { label: "Moderado", color: "text-yellow-500", icon: Volume1 }
    return { label: "Alto", color: "text-red-500", icon: Volume2 }
  }

  const level = getNoiseLevel(currentNoise)
  const Icon = level.icon

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nivel Actual</CardTitle>
          <Icon className={`h-4 w-4 ${level.color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentNoise} dB</div>
          <p className={`text-xs ${level.color}`}>{level.label}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio</CardTitle>
          <Volume1 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">52 dB</div>
          <p className="text-xs text-muted-foreground">Últimos 10 min</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pico Máximo</CardTitle>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">68 dB</div>
          <p className="text-xs text-muted-foreground">Hoy</p>
        </CardContent>
      </Card>
    </div>
  )
}
