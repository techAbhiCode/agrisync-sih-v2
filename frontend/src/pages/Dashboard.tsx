import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Sprout, ArrowRight, CalendarDays,
  MapPin, Bell, TicketCheck, Zap, IndianRupee, Clock,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import WeatherWidget from '@/components/WeatherWidget';

// ─── Data ─────────────────────────────────────────────────────────────────────
const priceData = [
  { year: '2021', wheat: 1975, paddy: 1940 },
  { year: '2022', wheat: 2015, paddy: 2040 },
  { year: '2023', wheat: 2125, paddy: 2183 },
  { year: '2024', wheat: 2275, paddy: 2203 },
  { year: '2025', wheat: 2425, paddy: 2300 },
  { year: '2026', wheat: 2500, paddy: 2450 },
];

const statCards = [
  {
    title: 'Live Market',
    value: 'Bullish',
    sub: '+4.5% this week',
    icon: <TrendingUp className="h-5 w-5" />,
    accent: 'text-lime-400',
    ring: 'ring-lime-500/20',
    bg: 'bg-lime-500/10',
  },
  {
    title: 'Active Mandis',
    value: '14 Open',
    sub: 'Nearest: 2.4 km',
    icon: <Users className="h-5 w-5" />,
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Crop Health AI',
    value: 'Optimal',
    sub: 'No spoilage detected',
    icon: <Sprout className="h-5 w-5" />,
    accent: 'text-sky-400',
    ring: 'ring-sky-500/20',
    bg: 'bg-sky-500/10',
  },
  {
    title: 'Queue Wait Time',
    value: '~8 min',
    sub: '↓ 73% vs walk-in',
    icon: <Clock className="h-5 w-5" />,
    accent: 'text-violet-400',
    ring: 'ring-violet-500/20',
    bg: 'bg-violet-500/10',
  },
];

const quickActions = [
  { label: 'Book a Slot', icon: <CalendarDays className="h-5 w-5" />, to: '/booking', color: 'bg-lime-500 hover:bg-lime-400 text-zinc-950 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]' },
  { label: 'Market Trends', icon: <TrendingUp className="h-5 w-5" />, to: '/market-trends', color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700' },
  { label: 'Find Mandis', icon: <MapPin className="h-5 w-5" />, to: '/logistics', color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700' },
];

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur border border-zinc-700 px-4 py-3 rounded-xl shadow-2xl">
        <p className="text-zinc-400 text-xs mb-2 font-medium">{label}</p>
        <p className="text-lime-400 text-sm font-semibold">Wheat ₹{payload[0]?.value}/Qtl</p>
        <p className="text-emerald-400 text-sm font-semibold">Paddy ₹{payload[1]?.value}/Qtl</p>
      </div>
    );
  }
  return null;
};

// ─── Animation variants ───────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  const { bookings, getClosestUpcomingBooking } = useBookingStore();
  
  const activeBooking = getClosestUpcomingBooking();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] bg-lime-500/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/6 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-8"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-zinc-500 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {user?.name ?? 'Farmer'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">👋</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Here's your live market intelligence for today.
            </p>
          </div>

          {/* Active token card */}
          {activeBooking ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 bg-zinc-900/70 border border-lime-500/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(132,204,22,0.08)]"
            >
              <div className="p-2 bg-lime-500/10 rounded-lg">
                <TicketCheck className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Active Token</p>
                <p className="text-lime-400 font-mono font-bold text-lg tracking-widest">{activeBooking.virtualToken}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 ml-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                  <span className="text-xs text-lime-500 font-medium">Live</span>
                </div>
                <span className="text-[9px] text-zinc-500">{new Date(activeBooking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex-shrink-0 bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <div className="p-2 bg-zinc-800/50 rounded-lg">
                <TicketCheck className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">No Active Tokens</p>
                <p className="text-zinc-600 font-mono font-bold text-sm tracking-widest mt-0.5">Book a slot</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <motion.div variants={item} className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${a.color}`}
            >
              {a.icon}
              {a.label}
            </Link>
          ))}
        </motion.div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <motion.div key={s.title} variants={item} whileHover={{ y: -4 }}>
              <Card className={`bg-zinc-900/40 backdrop-blur border-zinc-800/50 hover:border-zinc-700/50 transition-all ring-1 ${s.ring}`}>
                <CardContent className="p-5">
                  <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.accent} mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">{s.title}</p>
                  <h4 className={`text-xl font-bold mt-0.5 ${s.accent}`}>{s.value}</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Main Content: Chart + Advisory ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Price Trend Chart */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-lime-400" />
                  5-Year Commodity Price Trend (₹/Quintal)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gWheat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gPaddy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="wheat" stroke="#84cc16" strokeWidth={2.5} fill="url(#gWheat)" />
                      <Area type="monotone" dataKey="paddy" stroke="#10b981" strokeWidth={2.5} fill="url(#gPaddy)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex gap-5 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="w-3 h-0.5 bg-lime-500 rounded-full" />Wheat
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />Paddy
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Advisory Panel */}
          <motion.div variants={item} className="flex flex-col gap-4 h-full">
            {/* Weather Widget */}
            <div className="h-[220px]">
              <WeatherWidget />
            </div>

            {/* Advisory 1 */}
            <Card className="bg-lime-950/20 border border-lime-900/30 flex-1">
              <CardContent className="p-5 flex gap-3">
                <div className="p-2 bg-lime-900/30 rounded-lg flex-shrink-0 h-fit">
                  <Zap className="h-5 w-5 text-lime-400" />
                </div>
                <div>
                  <p className="text-lime-400 font-bold text-sm mb-1">AI Insight: Bullish Signal</p>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Wheat prices predicted to rise 4.5% next quarter. Lower rainfall forecast is the key driver.
                  </p>
                  <Link to="/market-trends" className="inline-flex items-center gap-1 text-xs text-lime-500 hover:text-lime-400 mt-2 font-medium transition-colors">
                    View Analysis <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Advisory 2 */}
            <Card className="bg-orange-950/20 border border-orange-900/30 flex-1">
              <CardContent className="p-5 flex gap-3">
                <div className="p-2 bg-orange-900/30 rounded-lg flex-shrink-0 h-fit">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-400 font-bold text-sm mb-1">Spoilage Alert</p>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    High humidity in cluster B. Expedite Paddy liquidation within 14 days.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking CTA */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/booking"
                  className="flex items-center justify-between gap-2 w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-950 font-bold text-sm px-5 py-4 rounded-2xl shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Book Your Next Slot
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/booking?tab=upcoming"
                  className="flex items-center justify-center gap-2 w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
                >
                  <TicketCheck className="h-4 w-4" />
                  Check all your bookings
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-lime-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: <CheckCircle2 className="h-4 w-4 text-lime-500" />, text: 'Booking TK-8492 confirmed at Kanpur Central', time: '2h ago' },
                  { icon: <IndianRupee className="h-4 w-4 text-emerald-500" />, text: '₹12,400 credited for 50 qtl Paddy — Akbarpur Mandi', time: '1d ago' },
                  { icon: <TrendingUp className="h-4 w-4 text-sky-500" />, text: 'Wheat price alert triggered — 4.5% surge detected', time: '2d ago' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors">
                    <div className="p-1.5 bg-zinc-800 rounded-lg flex-shrink-0">{a.icon}</div>
                    <p className="text-sm text-zinc-300 flex-1">{a.text}</p>
                    <span className="text-xs text-zinc-600 flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}