import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, XCircle, Loader2, LayoutDashboard, Keyboard, Clock, Users, TicketCheck } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent } from '@/components/ui/card';
import { scanBooking, getMandiDashboardStats, verifyBookingTime } from '@/lib/api';

interface ScanResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function MandiDashboard() {
  const [scanState, setScanState] = useState<ScanResult>({ status: 'idle' });
  const [isScannerPaused, setIsScannerPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual' | 'recent'>('scanner');
  const [manualToken, setManualToken] = useState('');
  
  const [stats, setStats] = useState({
    expectedToday: 0,
    completedToday: 0,
    pendingToday: 0,
    totalScanned: 0
  });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [logTab, setLogTab] = useState<'recent' | 'pending' | 'delayed'>('pending');

  const fetchStats = async () => {
    try {
      const res = await getMandiDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentScans(res.recentScans);
        setPendingBookings(res.pendingBookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const processToken = async (tokenNumber: string) => {
    try {
      setIsScannerPaused(true);
      setScanState({ status: 'loading', message: 'Verifying time window...' });

      // Step 1: Strict Time Verification
      await verifyBookingTime(tokenNumber);

      setScanState({ status: 'loading', message: 'Updating status...' });
      // Step 2: Actually process the scan
      const response = await scanBooking(tokenNumber);
      
      setScanState({ 
        status: 'success', 
        message: response.message || 'Status Updated Successfully!',
        data: response.booking
      });

      // Refresh stats on success
      fetchStats();

      setTimeout(() => {
        setScanState({ status: 'idle' });
        setIsScannerPaused(false);
        if (activeTab === 'manual') setManualToken('');
      }, 5000);

    } catch (error: any) {
      console.error(error);
      const errMessage = error.response?.data?.error || 'Failed to verify token.';
      setScanState({ status: 'error', message: errMessage });
      
      setTimeout(() => {
        setScanState({ status: 'idle' });
        setIsScannerPaused(false);
      }, 4000);
    }
  };

  const handleScan = useCallback(async (detectedCodes: any[]) => {
    if (isScannerPaused || detectedCodes.length === 0) return;
    const code = detectedCodes[0].rawValue;
    if (!code) return;

    let tokenNumber = code;
    try {
      const parsed = JSON.parse(code);
      if (parsed.token) tokenNumber = parsed.token;
    } catch (e) {}

    processToken(tokenNumber);
  }, [isScannerPaused]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    processToken(manualToken.trim());
  };

  return (
    <div className="p-4 md:p-8 min-h-full max-w-6xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-green-950 mb-1 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-green-600" /> Mandi Command Center
          </h1>
          <p className="text-gray-600">Manage arrivals, scan tickets, and track gate entries.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/60 border-green-200 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Today</p>
                <h3 className="text-3xl font-bold text-green-950 mt-1">{loadingStats ? '-' : stats.expectedToday}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="h-5 w-5 text-blue-500" /></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 border-green-200 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <h3 className="text-3xl font-bold text-green-950 mt-1">{loadingStats ? '-' : stats.completedToday}</h3>
              </div>
              <div className="p-3 bg-green-600/10 rounded-xl"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 border-green-200 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Today</p>
                <h3 className="text-3xl font-bold text-green-950 mt-1">{loadingStats ? '-' : stats.pendingToday}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="h-5 w-5 text-amber-500" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 border-green-200 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total All-Time</p>
                <h3 className="text-3xl font-bold text-green-950 mt-1">{loadingStats ? '-' : stats.totalScanned}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl"><TicketCheck className="h-5 w-5 text-purple-500" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
        {/* Main Processing Area */}
        <div className="space-y-4">
          <div className="flex bg-white/50 p-1.5 rounded-xl border border-green-200/80">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'scanner' ? 'bg-green-50 text-lime-400 shadow-sm' : 'text-gray-600 hover:text-green-900'
              }`}
            >
              <QrCode className="h-4 w-4" /> QR Scanner
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'manual' ? 'bg-green-50 text-lime-400 shadow-sm' : 'text-gray-600 hover:text-green-900'
              }`}
            >
              <Keyboard className="h-4 w-4" /> Manual Entry
            </button>
          </div>

          <Card className="bg-white border-green-200 shadow-2xl overflow-hidden relative min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lime-500 to-emerald-600 z-10"></div>
            <CardContent className="p-0 h-full flex flex-col">
              
              <AnimatePresence mode="wait">
                {activeTab === 'scanner' && (
                  <motion.div 
                    key="scanner"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 relative bg-black flex items-center justify-center overflow-hidden min-h-[400px]"
                  >
                    {!isScannerPaused ? (
                      <div className="w-full h-full">
                        <Scanner
                          onScan={handleScan}
                          components={{ finder: true }}
                          styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                        />
                        <div className="absolute inset-0 border-[3px] border-green-500/30 m-8 rounded-3xl pointer-events-none"></div>
                        <motion.div 
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                          className="absolute left-8 right-8 h-1 bg-green-600/50 blur-[2px] pointer-events-none"
                        />
                      </div>
                    ) : (
                      <ProcessingOverlay scanState={scanState} />
                    )}
                  </motion.div>
                )}

                {activeTab === 'manual' && (
                  <motion.div 
                    key="manual"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 p-8 flex flex-col justify-center items-center relative min-h-[400px]"
                  >
                    {!isScannerPaused ? (
                      <div className="w-full max-w-sm space-y-6">
                        <div className="text-center">
                          <div className="bg-green-100/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Keyboard className="h-8 w-8 text-gray-600" />
                          </div>
                          <h3 className="text-xl font-bold text-green-950 mb-2">Enter Token Manually</h3>
                          <p className="text-sm text-gray-600">If QR code is unreadable, enter the virtual token number below.</p>
                        </div>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                          <input 
                            type="text" 
                            placeholder="e.g. TKN-XYZ123" 
                            required
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-center text-xl font-mono text-green-950 focus:outline-none focus:ring-2 focus:ring-lime-500 uppercase tracking-widest"
                          />
                          <button type="submit" disabled={!manualToken.trim()} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-50 disabled:text-gray-500 text-zinc-950 font-bold py-3 rounded-xl transition-all">
                            Verify Token
                          </button>
                        </form>
                      </div>
                    ) : (
                      <ProcessingOverlay scanState={scanState} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'scanner' && (
                <div className="bg-green-50 p-4 flex items-center justify-between border-t border-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${scanState.status === 'error' ? 'bg-red-500 animate-pulse' : scanState.status === 'success' ? 'bg-green-600' : 'bg-blue-500 animate-pulse'}`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {scanState.status === 'idle' ? 'Point camera at QR Code' : 
                       scanState.status === 'loading' ? scanState.message || 'Processing...' : 
                       scanState.status === 'success' ? 'Ready for next' : 'Retrying soon'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <div className="space-y-4">
          <div className="flex bg-white/50 p-1.5 rounded-xl border border-green-200/80 mb-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setLogTab('pending')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                logTab === 'pending' ? 'bg-green-50 text-amber-500 shadow-sm' : 'text-gray-600 hover:text-green-900'
              }`}
            >
              <Clock className="h-4 w-4" /> Expected
            </button>
            <button
              onClick={() => setLogTab('delayed')}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                logTab === 'delayed' ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-200' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <div className="relative">
                <Clock className="h-4 w-4" />
                {pendingBookings.filter(b => b.isDelayed).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
                )}
              </div>
              Emergency Fit-in
            </button>
            <button
              onClick={() => setLogTab('recent')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                logTab === 'recent' ? 'bg-green-50 text-emerald-500 shadow-sm' : 'text-gray-600 hover:text-green-900'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> Recent
            </button>
          </div>

          <div className="bg-white/60 border border-green-200/80 rounded-2xl p-2 max-h-[480px] overflow-y-auto custom-scrollbar">
            {logTab === 'recent' ? (
              recentScans.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No recent scans today.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((scan) => (
                    <div key={scan._id} className="p-3 bg-green-50/50 rounded-xl border border-green-200/50 flex items-center justify-between">
                      <div>
                        <p className="text-lime-400 font-mono text-sm font-bold tracking-wider">{scan.virtualToken}</p>
                        <p className="text-xs text-gray-500 mt-1">{scan.cropType} • {scan.quantity} Qtl</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-green-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-semibold">
                          {scan.status || 'Verified'}
                        </span>
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {new Date(scan.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : logTab === 'pending' ? (
              pendingBookings.filter(b => !b.isDelayed).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No regular pending tokens for today.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingBookings.filter(b => !b.isDelayed).map((b) => (
                    <div key={b._id} className="p-3 bg-green-50/50 rounded-xl border border-green-200/50 flex items-center justify-between">
                      <div>
                        <p className="text-amber-500 font-mono text-sm font-bold tracking-wider">{b.virtualToken}</p>
                        <p className="text-xs text-gray-500 mt-1">{b.cropType} • {b.quantity} Qtl</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest font-semibold mb-1">
                          Expected
                        </span>
                        <p className="text-[10px] text-gray-600">
                          {b.timeSlot?.split(' - ')[0] || b.timeSlot}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              pendingBookings.filter(b => b.isDelayed).length === 0 ? (
                <div className="p-8 text-center bg-orange-50/50 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-orange-200 mx-auto mb-2" />
                  <p className="text-orange-800 text-sm font-medium">No delayed bookings.</p>
                  <p className="text-orange-600/70 text-xs mt-1">Queue is running smoothly.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingBookings.filter(b => b.isDelayed).map((b) => (
                    <div key={b._id} className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-orange-600 font-mono text-sm font-bold tracking-wider">{b.virtualToken}</p>
                          {b.verificationFailed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 font-bold" title="Weather/Location Verification Failed">
                              TRUST ALERT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{b.cropType} • {b.quantity} Qtl</p>
                        <p className="text-xs text-orange-700/80 italic line-clamp-1 mt-1">"{b.delayReason}"</p>
                      </div>
                      <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                        <span className="text-[10px] text-orange-700 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30 uppercase tracking-widest font-semibold">
                          Buffer Queue
                        </span>
                        <div className="text-[10px] text-orange-800 text-right">
                          <span className="block font-medium">Grace Ends:</span>
                          <span className="font-bold">{new Date(b.gracePeriodEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Overlay for processing states
function ProcessingOverlay({ scanState }: { scanState: ScanResult }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-green-50/90 backdrop-blur-md z-20">
      {scanState.status === 'loading' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-4" />
          <p className="text-green-800 font-semibold">{scanState.message || 'Verifying Token...'}</p>
        </motion.div>
      )}
      
      {scanState.status === 'success' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-950 mb-2">{scanState.message}</h3>
          {scanState.data && (
            <div className="bg-white border border-green-200 rounded-xl p-4 mt-2 text-left w-full shadow-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking Verified</p>
              <p className="text-xl font-bold text-lime-400 font-mono tracking-widest">{scanState.data.virtualToken}</p>
              <p className="text-sm text-green-800 mt-2">{scanState.data.cropType} • {scanState.data.quantity} Qtl</p>
            </div>
          )}
        </motion.div>
      )}

      {scanState.status === 'error' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-green-950 mb-2">Verification Failed</h3>
          <p className="text-red-400 max-w-xs">{scanState.message}</p>
        </motion.div>
      )}
    </div>
  );
}
