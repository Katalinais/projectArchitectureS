"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NoiseChart } from "@/components/noise-chart"
import { NoiseMetrics } from "@/components/noise-metrics"

const API_URL = "http://localhost:5173"

interface SensorData {
  value: number
  samples: number
  timestamp: string | null
}

export default function DashboardPage() {
  const [currentNoise, setCurrentNoise] = useState<number | null>(null)
  const [noiseHistory, setNoiseHistory] = useState<{ time: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("No data available yet")
            setLoading(false)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: SensorData = await response.json()
        
        if (data.value !== undefined) {
          setCurrentNoise(data.value)
          setError(null)
          
          // Add to history for chart
          if (data.timestamp) {
            const timestamp = new Date(data.timestamp)
            const timeString = timestamp.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
            
            setNoiseHistory((prev) => {
              const updated = [...prev, { time: timeString, value: data.value }]
              // Keep only the last 20 points
              return updated.slice(-20)
            })
          }
        }
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchData()

    // Then fetch every 2 seconds (matching backend window)
    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Ruido</h1>
          <p className="text-muted-foreground">Monitoreo en tiempo real de niveles de sonido</p>
        </header>

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {currentNoise !== null && !error && (
          <NoiseMetrics currentNoise={currentNoise} />
        )}

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
