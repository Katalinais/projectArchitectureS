"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { Device } from "@/types/device"

// 🚀 Cargamos react-leaflet de forma dinámica (sin SSR)
const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
)
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
)
const CircleMarker = dynamic(
  async () => (await import("react-leaflet")).CircleMarker,
  { ssr: false }
)
const Tooltip = dynamic(
  async () => (await import("react-leaflet")).Tooltip,
  { ssr: false }
)

// También cargamos los estilos después de montar
export function MapView({ devices, selectedDevice, onDeviceSelect }: {
  devices: Device[]
  selectedDevice: Device | null
  onDeviceSelect: (device: Device) => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    import("leaflet/dist/leaflet.css")
    setMounted(true)
  }, [])

  if (!mounted) return <div className="text-sm text-gray-400 p-4">Cargando mapa...</div>

  return (
    <div className="relative h-[400px] w-full rounded-lg border border-border overflow-hidden">
      <MapContainer
        center={[5.5353, -73.3678]}
        zoom={13}
        className="h-full w-full"
        style={{ borderRadius: "8px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {devices
          .filter((d) => d.lat && d.lng)
          .map((device) => {
            const color = getNoiseColor(device.noiseLevel)
            const isSelected = selectedDevice?.id === device.id

            return (
              <CircleMarker
                key={device.id}
                center={[device.lat, device.lng]}
                radius={isSelected ? 12 : 8}
                color="#fff"
                fillColor={color}
                fillOpacity={0.9}
                weight={2}
                eventHandlers={{
                  click: () => onDeviceSelect(device),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                  <div>
                    <strong>{device.name}</strong> <br />
                    {Math.round(device.noiseLevel)} dB
                  </div>
                </Tooltip>
              </CircleMarker>
            )
          })}
      </MapContainer>

      <div className="absolute top-4 left-4 rounded-md bg-background/95 p-3 shadow-md border border-border">
        <div className="text-xs font-semibold mb-2">Nivel de Ruido</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
            <span>{"< 40 dB (Bajo)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            <span>40-70 dB (Medio)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <span>{"> 70 dB (Alto)"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getNoiseColor(noiseLevel: number): string {
  if (noiseLevel < 40) return "#10b981" // Verde
  if (noiseLevel < 70) return "#f59e0b" // Amarillo
  return "#ef4444" // Rojo
}