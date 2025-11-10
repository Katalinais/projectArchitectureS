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
  const [alerts, setAlerts] = useState<{ time: string; value: number }[]>([])
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [alertStartTime, setAlertStartTime] = useState<Date | null>(null)
  const ALERT_THRESHOLD = 150

  useEffect(() => {
    // Simular datos de dispositivos GPS (sin niveles de ruido simulados)
    const mockDevices: Device[] = [
      {
        id: "GPS-001",
        name: "Dispositivo UPTC",
        lat: 5.551781,
        lng: -73.355335,
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

        // Detectar alerta si supera el umbral
        if (data.value > ALERT_THRESHOLD && !isAlertActive) {
            // Nueva alerta detectada
            const timestamp = new Date(data.timestamp || Date.now())
            const timeString = timestamp.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })

            setAlerts((prev) => [...prev, { time: timeString, value: data.value }])
            setIsAlertActive(true)
            setAlertStartTime(timestamp)
            } else if (data.value > ALERT_THRESHOLD && isAlertActive) {
            // Alerta sigue activa, actualizar alertStartTime si no está seteado
            if (!alertStartTime) {
              setAlertStartTime(new Date(data.timestamp || Date.now()))
            }
          } else if (data.value <= ALERT_THRESHOLD && isAlertActive) {
            // Volvió a la normalidad
            setIsAlertActive(false)
            setAlertStartTime(null)
          }

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
  }, [isAlertActive, alertStartTime])

  const avgNoiseLevel = currentNoiseLevel !== null ? Math.round(currentNoiseLevel) : 0

  const activeDevices = devices.filter((d) => d.status === "active").length
  const criticalDevices = devices.filter((d) => d.status === "critical").length

  const alertDurationSeconds = alertStartTime ? Math.floor((Date.now() - alertStartTime.getTime()) / 1000) : 0

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
          <Card
            className={`transition-all duration-300 ${
              isAlertActive ? "border-red-500 bg-red-50" : "border-border bg-white"
            }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${
                  isAlertActive ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {isAlertActive ? "¡Alerta activa!" : "Por ahora no hay alertas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAlertActive ? (
                <p className="text-red-600">Ruido alto detectado</p>
              ) : (
                <p className="text-muted-foreground">No se detectan alertas en este momento.</p>
              )}
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
              <CardTitle className="text-sm font-medium">Última Alerta</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isAlertActive ? (
                <p className="text-xs text-red-600">
                  Alerta activa desde hace {alertDurationSeconds} segundo{alertDurationSeconds !== 1 ? "s" : ""}
                </p>
              ) : alerts.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(alerts[alerts.length - 1].value)} dB
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detectada a las {alerts[alerts.length - 1].time}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">Sin alertas</div>
                  <p className="text-xs text-muted-foreground">Todo está en orden</p>
                </>
              )}
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
