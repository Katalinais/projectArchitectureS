"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapView } from "@/components/map-view"
import { DeviceList } from "@/components/device-list"
import { NoiseChart } from "@/components/noise-chart"
import { Activity, MapPin, Radio } from "lucide-react"
import type { Device } from "@/types/device"

const API_URL = "http://localhost:5173"

interface SensorData {
  value: number
  samples: number
  timestamp: string | null
}

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [currentNoiseLevel, setCurrentNoiseLevel] = useState<number | null>(null)
  const [noiseHistory, setNoiseHistory] = useState<Array<{ time: string; value: number }>>([])

  useEffect(() => {
    // Simular datos de dispositivos GPS (sin niveles de ruido simulados)
    const mockDevices: Device[] = [
      {
        id: "GPS-001",
        name: "Dispositivo Norte",
        lat: 40.7128,
        lng: -74.006,
        noiseLevel: 0,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-002",
        name: "Dispositivo Sur",
        lat: 40.758,
        lng: -73.9855,
        noiseLevel: 0,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-003",
        name: "Dispositivo Este",
        lat: 40.7489,
        lng: -73.968,
        noiseLevel: 0,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-004",
        name: "Dispositivo Oeste",
        lat: 40.7282,
        lng: -74.0776,
        noiseLevel: 0,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-005",
        name: "Dispositivo Centro",
        lat: 40.741,
        lng: -73.9896,
        noiseLevel: 0,
        status: "active",
        lastUpdate: new Date(),
      },
    ]

    setDevices(mockDevices)
    setSelectedDevice(mockDevices[0])
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`)
        
        if (!response.ok) {
          if (response.status === 404) {
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: SensorData = await response.json()
        
        if (data.value !== undefined) {
          setCurrentNoiseLevel(data.value)
          
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
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }

    // Fetch immediately
    fetchData()

    // Then fetch every 2 seconds (matching backend window)
    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, [])

  const avgNoiseLevel = currentNoiseLevel !== null ? Math.round(currentNoiseLevel) : 0

  const activeDevices = devices.filter((d) => d.status === "active").length
  const criticalDevices = devices.filter((d) => d.status === "critical").length

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-blue-600">Monitor de Dispositivos GPS</h1>
            <p className="text-muted-foreground">Monitoreo en tiempo real de ubicación y niveles de ruido</p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Activity className="mr-2 h-4 w-4" />
            {devices.length} Dispositivos Activos
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositivos Activos</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDevices}</div>
              <p className="text-xs text-muted-foreground">{criticalDevices} en estado crítico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nivel de Ruido Promedio</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgNoiseLevel} dB</div>
              <p className="text-xs text-muted-foreground">
                {currentNoiseLevel !== null ? "Tiempo real" : "Esperando datos..."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Operativo</div>
              <p className="text-xs text-muted-foreground">Todos los sistemas funcionando</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mapa de Ubicaciones</CardTitle>
              <CardDescription>Ubicación en tiempo real de todos los dispositivos GPS</CardDescription>
            </CardHeader>
            <CardContent>
              <MapView devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </CardContent>
          </Card>

          {/* Device List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Dispositivos</CardTitle>
              <CardDescription>Haz clic para ver detalles</CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceList devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </CardContent>
          </Card>
        </div>

        {/* Noise Chart */}
        {selectedDevice && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ruido - {selectedDevice.name}</CardTitle>
              <CardDescription>Niveles de ruido en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <NoiseChart data={noiseHistory} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
