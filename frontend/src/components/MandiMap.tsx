import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Leaflet icon fix for React
const mandiIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom user icon (blue marker)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom truck icon (orange marker)
const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to dynamically change map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Mandi {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  available: number;
  distance?: number;
  optimal?: boolean;
}

interface Truck {
  id: number;
  driverName: string;
  vehicleNumber: string;
  type: string;
  capacity: number;
  lat: number;
  lng: number;
  pricePerKm: number;
  distance?: number;
}

interface MandiMapProps {
  userLocation: { lat: number; lng: number } | null;
  mandis: Mandi[];
  trucks?: Truck[];
  onBookTruck?: (truck: Truck) => void;
}

export default function MandiMap({ userLocation, mandis, trucks = [], onBookTruck }: MandiMapProps) {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // Ensure map only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[500px] w-full bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />;

  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [26.4609, 80.3217];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <MapUpdater center={center} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="font-sans">
              <div className="font-bold text-blue-600">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Mandis Markers */}
        {mandis.map((mandi) => (
          <Marker key={mandi.id} position={[mandi.lat, mandi.lng]} icon={mandiIcon}>
            <Popup className="text-zinc-900 font-sans min-w-[200px]">
              <div className="font-bold text-lime-600 text-base mb-1">
                {mandi.name} {mandi.optimal && '⭐'}
              </div>
              <div className="text-sm border-b border-zinc-200 pb-2 mb-2">
                <span className="block text-zinc-600">Capacity: {mandi.capacity} Qtl</span>
                <span className="block font-medium text-emerald-600">Available: {mandi.available} Qtl</span>
                {mandi.distance && <span className="block text-zinc-500 mt-1">Distance: {mandi.distance} km</span>}
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/booking?mandi=${encodeURIComponent(mandi.name)}`)}
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Book Slot Here
              </Button>
            </Popup>
          </Marker>
        ))}

        {/* Trucks Markers */}
        {trucks.map((truck) => (
          <Marker key={`truck-${truck.id}`} position={[truck.lat, truck.lng]} icon={truckIcon}>
            <Popup className="text-zinc-900 font-sans min-w-[200px]">
              <div className="font-bold text-orange-600 text-base mb-1">
                🚛 {truck.vehicleNumber}
              </div>
              <div className="text-sm border-b border-zinc-200 pb-2 mb-2">
                <span className="block font-medium text-zinc-800">{truck.driverName}</span>
                <span className="block text-zinc-600">{truck.type} (Cap: {truck.capacity} Qtl)</span>
                <span className="block font-semibold text-emerald-600 mt-1">₹{truck.pricePerKm}/km</span>
                {truck.distance && <span className="block text-zinc-500 text-xs mt-1">{truck.distance} km away</span>}
              </div>
              <Button 
                size="sm" 
                onClick={() => onBookTruck && onBookTruck(truck)}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                Book Truck
              </Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}