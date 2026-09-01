import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Navigation, CloudLightning, Sun, Droplets, ArrowRight, QrCode, CheckCircle2, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MandiMap from '@/components/MandiMap';
import { getNearbyMandis, bookTruck, getMyTruckBookings } from '@/lib/api';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

export default function Logistics() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mandis, setMandis] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'hubs' | 'trucks' | 'my-trucks'>('hubs');
  const [myTrucks, setMyTrucks] = useState<any[]>([]);
  const [bookingTruck, setBookingTruck] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    cropType: '',
    quantity: '',
    pickupLocation: '',
    destinationMandi: ''
  });
  const { fetchNotifications } = useNotificationStore();

  const loadMyTrucks = async () => {
    try {
      const data = await getMyTruckBookings();
      if (data.success) {
        setMyTrucks(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load my trucks', err);
    }
  };

  useEffect(() => {
    loadMyTrucks();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          try {
            const data = await getNearbyMandis(lat, lng);
            if (data.success) {
              setMandis(data.mandis);
              setTrucks(data.trucks || []);
              setWeather(data.weather);
            }
          } catch (err) {
            console.error("Failed to fetch nearby mandis:", err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  const getAIAdvisory = () => {
    if (!weather) return null;
    if (weather.humidity > 70) {
      return "High humidity detected. Ensure crops are transported in covered vehicles to prevent spoilage.";
    }
    if (weather.temp > 35) {
      return "High temperature detected. Risk of heat damage to sensitive crops. Consider temperature-controlled transit.";
    }
    return "Clear skies and optimal road conditions. Proceeding to nearest active hub is highly recommended.";
  };

  const handleBookTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTruck) return;
    setBookingLoading(true);
    try {
      const payload = {
        truckId: bookingTruck.id,
        driverName: bookingTruck.driverName,
        vehicleNumber: bookingTruck.vehicleNumber,
        cropType: bookingForm.cropType,
        quantity: Number(bookingForm.quantity),
        pickupLocation: bookingForm.pickupLocation,
        destinationMandi: bookingForm.destinationMandi,
        cost: Number(bookingForm.quantity) * bookingTruck.pricePerKm * (bookingTruck.distance || 10) // Mock cost calculation
      };
      await bookTruck(payload);
      toast.success('Truck successfully booked!', {
        description: `Your truck for ${bookingForm.pickupLocation} is confirmed.`
      });
      setBookingTruck(null);
      fetchNotifications();
      loadMyTrucks();
      setActiveTab('my-trucks');
    } catch (err) {
      toast.error('Failed to book truck', {
        description: 'Please try again later or contact support.'
      });
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-full relative overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <Truck className="h-10 w-10 text-lime-500" />
            Micro-<span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Logistics</span>
          </h1>
          <p className="text-zinc-400">Real-time geospatial tracking and AI route optimization.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="xl:col-span-2 space-y-6">
            <MandiMap userLocation={userLocation} mandis={mandis} trucks={trucks} onBookTruck={(truck) => setBookingTruck(truck)} />
            
            {/* AI Advisory Panel */}
            <AnimatePresence>
              {weather && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 border-lime-500/20 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-lime-500/5 mix-blend-overlay"></div>
                    <CardHeader className="pb-3 border-b border-white/5">
                      <CardTitle className="text-lg flex items-center gap-2 text-lime-400">
                        <CloudLightning className="h-5 w-5" /> AI Logistics Advisory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 text-zinc-300 leading-relaxed font-medium">
                        "{getAIAdvisory()}"
                      </div>
                      <div className="flex gap-4 text-sm text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                          <Sun className="h-6 w-6 text-yellow-500 mb-1" />
                          <span className="font-bold text-white">{weather.temp}°C</span>
                          <span className="text-xs">{weather.condition}</span>
                        </div>
                        <div className="w-px bg-zinc-800"></div>
                        <div className="flex flex-col items-center">
                          <Droplets className="h-6 w-6 text-blue-400 mb-1" />
                          <span className="font-bold text-white">{weather.humidity}%</span>
                          <span className="text-xs">Humidity</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Panel Section */}
          <div className="space-y-6">
            <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/80">
              <button
                onClick={() => setActiveTab('hubs')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'hubs' 
                  ? 'bg-zinc-800 text-lime-400 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Nearest Hubs
              </button>
              <button
                onClick={() => setActiveTab('trucks')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'trucks' 
                  ? 'bg-zinc-800 text-orange-400 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Available Trucks
              </button>
              <button
                onClick={() => setActiveTab('my-trucks')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'my-trucks' 
                  ? 'bg-zinc-800 text-blue-400 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Trucks
              </button>
            </div>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                  {activeTab === 'hubs' && <><MapPin className="h-5 w-5 text-lime-500" /> Nearest Active Hubs</>}
                  {activeTab === 'trucks' && <><Truck className="h-5 w-5 text-orange-500" /> Available Trucks</>}
                  {activeTab === 'my-trucks' && <><Package className="h-5 w-5 text-blue-500" /> My Truck Bookings</>}
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  {loading ? 'Locating...' : `Based on your live GPS coordinates in ${weather?.location || 'Unknown'}.`}
                </CardDescription>

              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-zinc-800/50 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {activeTab === 'hubs' && mandis.map((mandi, idx) => (
                      <motion.li 
                        key={mandi.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900 hover:bg-zinc-800/80 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-zinc-100">{mandi.name}</p>
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                              <Navigation className="h-3 w-3" /> {mandi.distance} km away
                            </p>
                          </div>
                          {mandi.optimal && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-lime-400 bg-lime-400/10 px-2 py-1 rounded-sm border border-lime-400/20">Optimal</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                          <div className="bg-zinc-950 rounded p-2 text-center">
                            <span className="block text-zinc-500">Capacity</span>
                            <span className="font-medium text-white">{mandi.capacity} Qtl</span>
                          </div>
                          <div className="bg-zinc-950 rounded p-2 text-center">
                            <span className="block text-zinc-500">Available</span>
                            <span className="font-medium text-emerald-500">{mandi.available} Qtl</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => navigate(`/booking?mandi=${encodeURIComponent(mandi.name)}`)}
                          className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950 font-semibold text-sm h-9"
                        >
                          Book Slot Here <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.li>
                    ))}

                    {activeTab === 'trucks' && trucks.map((truck, idx) => (
                      <motion.li 
                        key={truck.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900 hover:bg-zinc-800/80 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-zinc-100 flex items-center gap-1">🚛 {truck.vehicleNumber}</p>
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                              {truck.driverName} • {truck.distance} km away
                            </p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-sm border border-orange-400/20">₹{truck.pricePerKm}/km</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                          <div className="bg-zinc-950 rounded p-2 text-center">
                            <span className="block text-zinc-500">Type</span>
                            <span className="font-medium text-white">{truck.type}</span>
                          </div>
                          <div className="bg-zinc-950 rounded p-2 text-center">
                            <span className="block text-zinc-500">Capacity</span>
                            <span className="font-medium text-emerald-500">{truck.capacity} Qtl</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setBookingTruck(truck)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm h-9"
                        >
                          Book Truck <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.li>
                    ))}
                    
                    {activeTab === 'hubs' && mandis.length === 0 && !loading && (
                      <p className="text-zinc-500 text-center py-4 text-sm">No nearby mandis found.</p>
                    )}
                    {activeTab === 'trucks' && trucks.length === 0 && !loading && (
                      <p className="text-zinc-500 text-center py-4 text-sm">No nearby trucks found.</p>
                    )}
                    
                    {activeTab === 'my-trucks' && myTrucks.map((booking, idx) => (
                      <motion.li
                        key={booking._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative"
                      >
                        {/* Ticket Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                          <div className="relative z-10 text-white">
                            <h3 className="font-bold text-lg leading-tight">Ticket: {booking.virtualToken || booking.ticketId}</h3>
                            <p className="text-xs text-blue-100/80 mt-0.5">{new Date(booking.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="relative z-10 bg-white p-1.5 rounded-lg">
                            <QrCode className="h-10 w-10 text-blue-900" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 bg-zinc-900/80">
                          <div className="flex justify-between text-sm mb-4">
                            <div>
                              <p className="text-zinc-500 text-xs">Pickup</p>
                              <p className="font-medium text-zinc-200">{booking.pickupLocation}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-zinc-500 text-xs">Destination</p>
                              <p className="font-medium text-zinc-200">{booking.destinationMandi}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-zinc-800/80 pt-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-zinc-400" />
                              <span className="text-zinc-300">{booking.vehicleNumber}</span>
                            </div>
                            <div className="font-bold text-emerald-400">₹{booking.cost}</div>
                          </div>
                        </div>

                        {/* Tracker UI */}
                        <div className="px-4 pb-5 pt-2 bg-zinc-900/50">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Live Tracking</p>
                          <div className="relative border-l border-zinc-800 ml-3 space-y-4">
                            {(booking.timeline && booking.timeline.length > 0 ? booking.timeline : [{ status: booking.status, description: 'Current status', timestamp: booking.createdAt }]).map((t: any, i: number) => (
                              <div key={i} className="pl-6 relative">
                                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                                  t.status === 'DELIVERED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                                  i === (booking.timeline?.length || 1) - 1 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-zinc-600'
                                }`}></div>
                                <p className={`text-sm font-bold ${
                                  t.status === 'DELIVERED' ? 'text-emerald-400' : 
                                  i === (booking.timeline?.length || 1) - 1 ? 'text-blue-400' : 'text-zinc-300'
                                }`}>{t.status}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{t.description}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">{new Date(t.timestamp).toLocaleTimeString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                    
                    {activeTab === 'my-trucks' && myTrucks.length === 0 && !loading && (
                      <div className="text-center py-10 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                        <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 font-medium">No active bookings</p>
                        <p className="text-xs text-zinc-500 mt-1">Your booked trucks will appear here.</p>
                      </div>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Truck Booking Modal */}
      <AnimatePresence>
        {bookingTruck && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setBookingTruck(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="bg-zinc-900 border-orange-500/30 shadow-xl overflow-hidden relative">
                <CardHeader className="border-b border-zinc-800">
                  <CardTitle className="text-orange-500 flex items-center gap-2">
                    <Truck className="h-5 w-5" /> Book Truck: {bookingTruck.vehicleNumber}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Driver: {bookingTruck.driverName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleBookTruck} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Pickup Location</Label>
                      <Input 
                        required placeholder="e.g. My Farm, Village XYZ"
                        value={bookingForm.pickupLocation}
                        onChange={(e) => setBookingForm({...bookingForm, pickupLocation: e.target.value})}
                        className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-orange-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Destination Mandi</Label>
                      <select 
                        required
                        value={bookingForm.destinationMandi}
                        onChange={(e) => setBookingForm({...bookingForm, destinationMandi: e.target.value})}
                        className="w-full flex h-10 rounded-md border bg-zinc-950/50 border-zinc-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <option value="" disabled className="bg-zinc-900">Select Mandi...</option>
                        {mandis.map(m => (
                          <option key={m.id} value={m.name} className="bg-zinc-900">{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Crop Type</Label>
                        <Input 
                          required placeholder="e.g. Wheat"
                          value={bookingForm.cropType}
                          onChange={(e) => setBookingForm({...bookingForm, cropType: e.target.value})}
                          className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-orange-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Quantity (Qtl)</Label>
                        <Input 
                          required type="number" min="1" max={bookingTruck.capacity}
                          placeholder={`Max ${bookingTruck.capacity}`}
                          value={bookingForm.quantity}
                          onChange={(e) => setBookingForm({...bookingForm, quantity: e.target.value})}
                          className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-orange-500" 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-zinc-800 text-sm text-zinc-400">
                      Estimated Cost: <span className="text-emerald-400 font-bold ml-1">
                        {bookingForm.quantity ? `₹${(Number(bookingForm.quantity) * bookingTruck.pricePerKm * (bookingTruck.distance || 10)).toFixed(2)}` : 'Enter quantity'}
                      </span>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setBookingTruck(null)} className="flex-1 border-zinc-700 text-zinc-300">Cancel</Button>
                      <Button type="submit" disabled={bookingLoading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        {bookingLoading ? 'Booking...' : 'Confirm Book'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}