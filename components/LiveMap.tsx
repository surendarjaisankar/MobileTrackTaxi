'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function LiveMap() {
  const [position, setPosition] = useState<[number, number]>([
    13.0827,
    80.2707,
  ])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return

    const socket = io(process.env.NEXT_PUBLIC_API_URL)

    socket.on('locationUpdate', (data: { lat: number; lng: number }) => {
      setPosition([data.lat, data.lng])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={position}>
        <Popup>Driver Location</Popup>
      </Marker>
    </MapContainer>
  )
}
