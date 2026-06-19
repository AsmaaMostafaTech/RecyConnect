'use client'

import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Create a custom marker icon
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map click events
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Location marker component
function DraggableMarker({ 
  lat, 
  lng, 
  locationName,
  onLocationChange
}: { 
  lat: number
  lng: number
  locationName: string
  onLocationChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  
  // Use props as initial value, update position when props change significantly
  const currentPosition: [number, number] = position ?? [lat, lng]
  
  const handleDragEnd = useCallback((e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
    const marker = e.target
    const newPosition = marker.getLatLng()
    setPosition([newPosition.lat, newPosition.lng])
    onLocationChange(newPosition.lat, newPosition.lng)
  }, [onLocationChange])
  
  return (
    <Marker 
      position={currentPosition} 
      icon={customIcon} 
      draggable={true} 
      eventHandlers={{
        dragend: handleDragEnd
      }}
    >
      <Popup>{locationName || 'Selected Location'}</Popup>
    </Marker>
  )
}

interface LocationPickerMapProps {
  lat: number
  lng: number
  locationName: string
  onLocationChange: (lat: number, lng: number) => void
  height?: string
}

export default function LocationPickerMap({ 
  lat, 
  lng, 
  locationName, 
  onLocationChange,
  height = '200px'
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={8}
      style={{ height, width: '100%', background: 'var(--background)' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapClickHandler onLocationChange={onLocationChange} />
      <DraggableMarker lat={lat} lng={lng} locationName={locationName} onLocationChange={onLocationChange} />
    </MapContainer>
  )
}
