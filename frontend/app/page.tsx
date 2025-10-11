"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NoiseChart } from "@/components/noise-chart"
import { NoiseMetrics } from "@/components/noise-metrics"

export default function DashboardPage() {
  const [currentNoise, setCurrentNoise] = useState(45)
  const [noiseHistory, setNoiseHistory] = useState<{ time: string; value: number }[]>([])

  useEffect(() => {
    // Simular datos de ruido en tiempo real
    const interval = setInterval(() => {
      const newNoise = Math.floor(Math.random() * 40) + 30 // Entre 30 y 70 dB
      const now = new Date()
      const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      setCurrentNoise(newNoise)
      setNoiseHistory((prev) => {
        const updated = [...prev, { time: timeString, value: newNoise }]
        // Mantener solo los últimos 20 puntos
        return updated.slice(-20)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Ruido</h1>
          <p className="text-muted-foreground">Monitoreo en tiempo real de niveles de sonido</p>
        </header>

        <NoiseMetrics currentNoise={currentNoise} />

        <Card>
          <CardHeader>
            <CardTitle>Historial de Niveles</CardTitle>
            <CardDescription>Últimas mediciones de ruido en decibeles (dB)</CardDescription>
          </CardHeader>
          <CardContent>
            <NoiseChart data={noiseHistory} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
