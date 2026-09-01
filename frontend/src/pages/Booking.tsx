import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, Leaf, Scale, ArrowRight, CheckCircle2, 
  MapPin, Clock, Download, Loader2, TicketCheck,
  History, XCircle, Truck
} from 'lucide-react';
import { getMyTruckBookings, createBooking, updateTruckStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { useNotificationStore } from '@/store/notificationStore';
import { useBookingStore } from '@/store/bookingStore';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const MANDIS = [
  'Kanpur Central Mandi',
  'Azadpur Mandi, Delhi',
  'Indore Choithram Mandi',
  'Vashi APMC, Mumbai',
  'Akbarpur Krishi Mandi',
  'Bilhaur Wholesale Market',
  'Unnao Sub Mandi'
];

const TIME_SLOTS = [
  '06:00 AM - 09:00 AM',
  '09:00 AM - 12:00 PM',
  '12:00 PM - 03:00 PM',
  '03:00 PM - 06:00 PM'
];

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialMandi = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const paramMandi = params.get('mandi');
    if (paramMandi && MANDIS.includes(paramMandi)) return paramMandi;
    if (paramMandi && !MANDIS.includes(paramMandi)) {
      MANDIS.push(paramMandi);
      return paramMandi;
    }
    return MANDIS[0];
  }, [location.search]);

  // Read tab from URL query params (default to upcoming)
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'expired' | 'trucks' | 'trucks_history'>(
    (queryTab as 'upcoming' | 'completed' | 'expired' | 'trucks' | 'trucks_history') || 'upcoming'
  );

  const [isBooked, setIsBooked] = useState(false);
  const [mandi, setMandi] = useState(initialMandi);
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedTruckBooking, setSelectedTruckBooking] = useState<any>(null);
  const [truckBookings, setTruckBookings] = useState<any[]>([]);

  const { bookings, getUpcomingBookings, getCompletedBookings, getExpiredBookings, fetchBookings } = useBookingStore();

  // Bookings are fetched globally by AppLayout when auth state changes
  useEffect(() => {
    if (activeTab === 'trucks' || activeTab === 'trucks_history') {
      fetchTrucks();
    }
  }, [activeTab]);

  const fetchTrucks = () => {
    getMyTruckBookings()
      .then(res => {
        if (res.success) setTruckBookings(res.bookings || []);
      })
      .catch(console.error);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateTruckStatus(id, status);
      fetchTrucks(); // refresh
      setSelectedTruckBooking(null);
      useNotificationStore.getState().fetchNotifications();
      toast.success(`Status updated to ${status}`, {
        description: `Truck successfully marked as ${status}!`
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status', {
        description: 'Please try again later.'
      });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot) {
      toast.warning('Missing Time Slot', {
        description: 'Please select a time slot to continue.'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await createBooking({
        mandiId: mandi,
        cropType: crop,
        quantity: Number(quantity),
        preferredDate: date,
        timeSlot: timeSlot
      });
      
      setTokenNumber(response.booking.virtualToken);
      setIsBooked(true);
      
      // Update notifications & bookings immediately after booking
      useNotificationStore.getState().fetchNotifications();
      fetchBookings();
      toast.success('Booking Successful', {
        description: 'Your Mandi entry pass has been generated.'
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error('Booking Failed', {
        description: `Failed to create booking: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  const qrData = JSON.stringify({
    token: tokenNumber,
    mandi,
    crop,
    qty: quantity,
    date,
    slot: timeSlot
  });

  const renderBookingsList = () => {
    if (activeTab === 'trucks' || activeTab === 'trucks_history') {
      const isHistory = activeTab === 'trucks_history';
      const filteredTrucks = truckBookings.filter(b => 
        isHistory ? b.status === 'DELIVERED' : (b.status === 'PENDING' || b.status === 'IN_TRANSIT')
      );

      if (filteredTrucks.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl border-dashed">
            <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
              <CheckCircle2 className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-zinc-300 font-semibold mb-1">No {isHistory ? 'completed' : 'active'} truck bookings found</h3>
            <p className="text-zinc-500 text-sm">When you book trucks for logistics, they will appear here.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {filteredTrucks.map(b => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={b._id} 
              onClick={() => setSelectedTruckBooking(b)}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row gap-4 justify-between group cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'} border`}>
                    {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {b.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  🚛 {b.vehicleNumber} ({b.driverName})
                </p>
                {b.pickupLocation && (
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> From: {b.pickupLocation}
                  </p>
                )}
                <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> To: {b.destinationMandi}
                </p>
                <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-lime-500" /> {b.cropType} • {b.quantity} Qtl
                </p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-zinc-800/50 pt-3 sm:pt-0 sm:pl-4">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Cost</p>
                  <p className="text-emerald-400 font-mono font-bold tracking-widest text-base bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ₹{b.cost}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    let list = [];
    if (activeTab === 'upcoming') list = getUpcomingBookings();
    else if (activeTab === 'completed') list = getCompletedBookings();
    else list = getExpiredBookings();

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl border-dashed">
          <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
            {activeTab === 'upcoming' && <CalendarDays className="h-6 w-6 text-zinc-500" />}
            {activeTab === 'completed' && <CheckCircle2 className="h-6 w-6 text-zinc-500" />}
            {activeTab === 'expired' && <XCircle className="h-6 w-6 text-zinc-500" />}
          </div>
          <h3 className="text-zinc-300 font-semibold mb-1">No {activeTab} bookings found</h3>
          <p className="text-zinc-500 text-sm">When you have {activeTab} bookings, they will appear here. (Debug: total={bookings.length})</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map(b => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={b._id} 
            onClick={() => setSelectedBooking(b)}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row gap-4 justify-between group cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {new Date(b.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {b.timeSlot?.split(' - ')[0] || b.timeSlot}
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {b.mandiId}
              </p>
              <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-lime-500" /> {b.cropType} • {b.quantity} Qtl
              </p>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-zinc-800/50 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Token</p>
                <p className="text-lime-400 font-mono font-bold tracking-widest text-base bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                  {b.virtualToken}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-full relative overflow-hidden flex justify-center">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="relative z-10 w-full max-w-6xl mt-2 md:mt-4 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start"
      >
        {/* Left Column: Form / Success state */}
        <div className="flex flex-col items-center lg:items-start w-full">
          <motion.div variants={itemVariants} className="text-center lg:text-left mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Slot Booking</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">Reserve your mandi slot to bypass physical queues.</p>
          </motion.div>

          {!isBooked ? (
            <motion.div variants={itemVariants} className="w-full">
              <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-zinc-100 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-lime-500" />
                    Mandi Entry Pass
                  </CardTitle>
                  <CardDescription className="text-zinc-500">Fill details to secure your spot.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBooking} className="space-y-6">
                    {/* Mandi Selection */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500"/> Select Mandi
                      </Label>
                      <select 
                        required
                        value={mandi}
                        onChange={(e) => setMandi(e.target.value)}
                        className="w-full flex h-10 rounded-md border bg-zinc-950/50 border-zinc-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
                      >
                        {MANDIS.map(m => (
                          <option key={m} value={m} className="bg-zinc-900">{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Crop & Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="crop" className="text-zinc-300 flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-emerald-500"/> Crop Type
                        </Label>
                        <Input 
                          id="crop" placeholder="e.g., Wheat, Paddy" required 
                          value={crop} onChange={e => setCrop(e.target.value)}
                          className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-lime-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-zinc-300 flex items-center gap-2">
                          <Scale className="h-4 w-4 text-emerald-500"/> Quantity (Quintals)
                        </Label>
                        <Input 
                          id="quantity" type="number" min="1" placeholder="e.g., 50" required 
                          value={quantity} onChange={e => setQuantity(e.target.value)}
                          className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-lime-500" 
                        />
                      </div>
                    </div>
                    
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-zinc-300 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-500"/> Preferred Date
                      </Label>
                      <Input 
                        id="date" type="date" required 
                        value={date} onChange={e => setDate(e.target.value)}
                        className="bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-lime-500 cursor-pointer" 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-3">
                      <Label className="text-zinc-300 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-500"/> Select Time Slot
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeSlot(slot)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              timeSlot === slot 
                              ? 'bg-lime-500/10 border-lime-500 text-lime-400' 
                              : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button disabled={loading} type="submit" className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950 font-bold text-lg h-12 transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] mt-4">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                        <>Generate Virtual Token <ArrowRight className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-full mx-auto lg:mx-0"
            >
              {/* The Digital Ticket / Boarding Pass */}
              <Card className="bg-zinc-900 border-lime-500/30 shadow-[0_0_40px_rgba(132,204,22,0.15)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lime-400 to-emerald-600"></div>
                
                <CardContent className="p-0">
                  {/* Header Section */}
                  <div className="p-6 text-center space-y-2 border-b border-zinc-800 border-dashed relative">
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#09090b] rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#09090b] rounded-full"></div>
                    
                    <CheckCircle2 className="h-12 w-12 text-lime-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Booking Confirmed</h2>
                    <p className="text-zinc-500 text-sm">Present this QR code at the Mandi gate</p>
                  </div>

                  {/* QR Code Section */}
                  <div className="p-8 flex flex-col items-center justify-center bg-zinc-950/30 border-b border-zinc-800 border-dashed relative">
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#09090b] rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#09090b] rounded-full"></div>
                    
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      <QRCode value={qrData} size={160} />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Token Number</p>
                      <p className="text-3xl font-mono text-lime-400 font-bold tracking-widest">{tokenNumber}</p>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 bg-zinc-900">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Mandi</p>
                        <p className="text-zinc-200 font-medium truncate" title={mandi}>{mandi}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Crop Details</p>
                        <p className="text-zinc-200 font-medium">{crop} • {quantity} Qtl</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Date</p>
                        <p className="text-zinc-200 font-medium">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Time Slot</p>
                        <p className="text-zinc-200 font-medium">{timeSlot?.split(' - ')[0] || timeSlot}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-3">
                      <Button variant="outline" onClick={() => setIsBooked(false)} className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                        Book Another
                      </Button>
                      <Button onClick={() => window.print()} className="flex-1 bg-lime-500 hover:bg-lime-600 text-zinc-950">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: Bookings History */}
        <motion.div variants={itemVariants} className="w-full flex flex-col pt-2 lg:pt-14">
          <div className="flex items-center gap-2 mb-6 text-zinc-100 font-semibold text-lg">
            <History className="h-5 w-5 text-lime-500" /> My Bookings
          </div>
          
          {/* Custom Tabs */}
          <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/80 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'upcoming' 
                ? 'bg-zinc-800 text-lime-400 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'completed' 
                ? 'bg-zinc-800 text-emerald-400 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'expired' 
                ? 'bg-zinc-800 text-zinc-300 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setActiveTab('trucks')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'trucks' 
                ? 'bg-zinc-800 text-orange-400 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active Trucks
            </button>
            <button
              onClick={() => setActiveTab('trucks_history')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'trucks_history' 
                ? 'bg-zinc-800 text-orange-600 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Truck History
            </button>
          </div>

          {/* Bookings List Container */}
          <div className="flex-1 bg-zinc-950/20 border border-zinc-800/30 rounded-2xl p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-1"
              >
                {renderBookingsList()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="bg-zinc-900 border-lime-500/30 shadow-[0_0_40px_rgba(132,204,22,0.15)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lime-400 to-emerald-600"></div>
                
                <CardContent className="p-0">
                  <div className="p-6 text-center space-y-2 border-b border-zinc-800 border-dashed relative">
                    <div className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" onClick={() => setSelectedBooking(null)}>
                      <XCircle className="h-6 w-6" />
                    </div>
                    <TicketCheck className="h-12 w-12 text-lime-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Booking Ticket</h2>
                    <p className="text-zinc-500 text-sm">Present this QR code at the Mandi gate</p>
                  </div>

                  <div className="p-8 flex flex-col items-center justify-center bg-zinc-950/30 border-b border-zinc-800 border-dashed relative">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      <QRCode value={JSON.stringify({
                        token: selectedBooking.virtualToken,
                        mandi: selectedBooking.mandiId,
                        crop: selectedBooking.cropType,
                        qty: selectedBooking.quantity,
                        date: selectedBooking.preferredDate,
                        slot: selectedBooking.timeSlot
                      })} size={160} />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Token Number</p>
                      <p className="text-3xl font-mono text-lime-400 font-bold tracking-widest">{selectedBooking.virtualToken}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-900">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Mandi</p>
                        <p className="text-zinc-200 font-medium truncate" title={selectedBooking.mandiId}>{selectedBooking.mandiId}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Crop Details</p>
                        <p className="text-zinc-200 font-medium">{selectedBooking.cropType} • {selectedBooking.quantity} Qtl</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Date</p>
                        <p className="text-zinc-200 font-medium">{new Date(selectedBooking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Time Slot</p>
                        <p className="text-zinc-200 font-medium">{selectedBooking.timeSlot?.split(' - ')[0] || selectedBooking.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Status</p>
                        <p className={`font-medium ${selectedBooking.status === 'COMPLETED' ? 'text-emerald-400' : selectedBooking.status === 'EXPIRED' ? 'text-zinc-400' : 'text-lime-400'}`}>
                          {selectedBooking.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-3">
                      <Button className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" /> Download / Print Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Truck Ticket Modal */}
      <AnimatePresence>
        {selectedTruckBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTruckBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="bg-zinc-900 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-amber-600"></div>
                
                <CardContent className="p-0">
                  <div className="p-6 text-center space-y-2 border-b border-zinc-800 border-dashed relative">
                    <div className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" onClick={() => setSelectedTruckBooking(null)}>
                      <XCircle className="h-6 w-6" />
                    </div>
                    <TicketCheck className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Logistics Ticket</h2>
                    <p className="text-zinc-500 text-sm">Valid for {selectedTruckBooking.vehicleNumber}</p>
                  </div>

                  <div className="p-8 flex flex-col items-center justify-center bg-zinc-950/30 border-b border-zinc-800 border-dashed relative">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      <QRCode value={JSON.stringify({
                        bookingId: selectedTruckBooking._id,
                        driver: selectedTruckBooking.driverName,
                        vehicle: selectedTruckBooking.vehicleNumber,
                        pickup: selectedTruckBooking.pickupLocation,
                        dest: selectedTruckBooking.destinationMandi
                      })} size={160} />
                    </div>
                    <div className="mt-6 w-full px-6">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3 text-center">Tracking Status</p>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 z-0 rounded-full"></div>
                        <div className="absolute top-2 left-0 h-1 bg-lime-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500" style={{ width: selectedTruckBooking.status === 'DELIVERED' ? '100%' : selectedTruckBooking.status === 'IN_TRANSIT' ? '50%' : '0%' }}></div>
                        
                        <div className={`relative z-10 flex flex-col items-center gap-1`}>
                          <div className={`h-4 w-4 rounded-full border-2 border-zinc-900 ${selectedTruckBooking.status === 'PENDING' || selectedTruckBooking.status === 'IN_TRANSIT' || selectedTruckBooking.status === 'DELIVERED' ? 'bg-lime-500' : 'bg-zinc-700'}`}></div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Booked</span>
                        </div>
                        <div className={`relative z-10 flex flex-col items-center gap-1`}>
                          <div className={`h-4 w-4 rounded-full border-2 border-zinc-900 ${selectedTruckBooking.status === 'IN_TRANSIT' || selectedTruckBooking.status === 'DELIVERED' ? 'bg-lime-500' : 'bg-zinc-700'}`}></div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Onboard</span>
                        </div>
                        <div className={`relative z-10 flex flex-col items-center gap-1`}>
                          <div className={`h-4 w-4 rounded-full border-2 border-zinc-900 ${selectedTruckBooking.status === 'DELIVERED' ? 'bg-lime-500' : 'bg-zinc-700'}`}></div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Arrived</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-900">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Pickup From</p>
                        <p className="text-zinc-200 font-medium truncate" title={selectedTruckBooking.pickupLocation}>{selectedTruckBooking.pickupLocation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Deliver To</p>
                        <p className="text-zinc-200 font-medium truncate" title={selectedTruckBooking.destinationMandi}>{selectedTruckBooking.destinationMandi}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Cargo</p>
                        <p className="text-zinc-200 font-medium">{selectedTruckBooking.cropType} ({selectedTruckBooking.quantity} Qtl)</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Cost</p>
                        <p className="text-zinc-200 font-medium">₹{selectedTruckBooking.cost}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-3 flex-col sm:flex-row">
                      {selectedTruckBooking.status === 'PENDING' && (
                        <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleUpdateStatus(selectedTruckBooking._id, 'IN_TRANSIT')}>
                          <Truck className="h-4 w-4 mr-2" /> Mark as Onboard
                        </Button>
                      )}
                      {selectedTruckBooking.status === 'IN_TRANSIT' && (
                        <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleUpdateStatus(selectedTruckBooking._id, 'DELIVERED')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Delivered
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}