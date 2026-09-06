import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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
  BarChart, Bar, LineChart, Line
} from 'recharts';
import WeatherWidget from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';

// ─── Data ─────────────────────────────────────────────────────────────────────
const priceData = [
  { year: '2021', wheat: 1975, paddy: 1940 },
  { year: '2022', wheat: 2015, paddy: 2040 },
  { year: '2023', wheat: 2125, paddy: 2183 },
  { year: '2024', wheat: 2275, paddy: 2203 },
  { year: '2025', wheat: 2425, paddy: 2300 },
  { year: '2026', wheat: 2500, paddy: 2450 },
];

// Cards will be generated inside the component to access translations

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-green-300 px-4 py-3 rounded-xl shadow-2xl">
        <p className="text-gray-600 text-xs mb-2 font-medium">{label}</p>
        <p className="text-lime-400 text-sm font-semibold">Wheat ₹{payload[0]?.value}/Qtl</p>
        <p className="text-emerald-400 text-sm font-semibold">Paddy ₹{payload[1]?.value}/Qtl</p>
      </div>
    );
  }
  return null;
};

// ─── Animation variants ───────────────────────────────────────────────────────
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { getClosestUpcomingBooking } = useBookingStore();
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  
  const activeBooking = getClosestUpcomingBooking();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting.morning') : hour < 17 ? t('dashboard.greeting.afternoon') : t('dashboard.greeting.evening');

  const statCards = [
    {
      title: t('dashboard.stats.market.title'),
      value: t('dashboard.stats.market.value'),
      sub: t('dashboard.stats.market.sub'),
      icon: <TrendingUp className="h-5 w-5" />,
      accent: 'text-lime-400',
      ring: 'ring-lime-500/20',
      bg: 'bg-green-600/10',
    },
    {
      title: t('dashboard.stats.mandis.title'),
      value: t('dashboard.stats.mandis.value'),
      sub: t('dashboard.stats.mandis.sub'),
      icon: <Users className="h-5 w-5" />,
      accent: 'text-emerald-400',
      ring: 'ring-emerald-500/20',
      bg: 'bg-emerald-500/10',
    },
    {
      title: t('dashboard.stats.health.title'),
      value: t('dashboard.stats.health.value'),
      sub: t('dashboard.stats.health.sub'),
      icon: <Sprout className="h-5 w-5" />,
      accent: 'text-sky-400',
      ring: 'ring-sky-500/20',
      bg: 'bg-sky-500/10',
    },
  ];
  
  const quickActions = [
    { label: t('dashboard.quickActions.book'), icon: <CalendarDays className="h-5 w-5" />, to: '/booking', color: 'bg-green-600 hover:bg-lime-400 text-zinc-950 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]' },
    { label: t('dashboard.quickActions.trends'), icon: <TrendingUp className="h-5 w-5" />, to: '/market-trends', color: 'bg-green-50 hover:bg-green-100 text-green-950 border border-green-300' },
    { label: t('dashboard.quickActions.mandis'), icon: <MapPin className="h-5 w-5" />, to: '/logistics', color: 'bg-green-50 hover:bg-green-100 text-green-950 border border-green-300' },
  ];

  // Dynamic Queue Stat
  const waitTimeStat = {
    title: t('dashboard.stats.queue.title'),
    value: activeBooking?.queuePosition ? t('dashboard.stats.queue.pos', { pos: activeBooking.queuePosition }) : t('dashboard.stats.queue.noQueue'),
    sub: activeBooking?.queuePosition ? t('dashboard.stats.queue.wait', { wait: activeBooking.queuePosition * 15 }) : t('dashboard.stats.queue.bookToJoin'),
    icon: <Clock className="h-5 w-5" />,
    accent: activeBooking ? 'text-violet-400' : 'text-gray-400',
    ring: activeBooking ? 'ring-violet-500/20' : 'ring-gray-200',
    bg: activeBooking ? 'bg-violet-500/10' : 'bg-gray-100',
  };

  const dynamicStatCards = [...statCards, waitTimeStat];

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] bg-green-600/8 blur-[120px] rounded-full pointer-events-none" />
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
            <p className="text-gray-500 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-green-950">
              {user?.name ?? 'Farmer'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Active token card */}
          {activeBooking ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 bg-white/70 border border-green-500/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(132,204,22,0.08)]"
            >
              <div className="p-2 bg-green-600/10 rounded-lg">
                <TicketCheck className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{t('dashboard.activeToken')}</p>
                <p className="text-lime-400 font-mono font-bold text-lg tracking-widest">{activeBooking.virtualToken}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 ml-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">{t('dashboard.live')}</span>
                </div>
                <span className="text-[9px] text-gray-500">{new Date(activeBooking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex-shrink-0 bg-white/70 border border-green-200/50 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <div className="p-2 bg-green-100/50 rounded-lg">
                <TicketCheck className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{t('dashboard.noActiveToken')}</p>
                <p className="text-zinc-600 font-mono font-bold text-sm tracking-widest mt-0.5">{t('dashboard.bookSlot')}</p>
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
          {dynamicStatCards.map((s) => (
            <motion.div key={s.title} variants={item} whileHover={{ y: -4 }}>
              <Card className={`bg-white/40 backdrop-blur border-green-200/50 hover:border-green-300/50 transition-all ring-1 ${s.ring}`}>
                <CardContent className="p-5">
                  <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.accent} mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{s.title}</p>
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
            <Card className="bg-white/40 backdrop-blur-xl border-green-200/50 shadow-2xl h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-green-950 text-base flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-lime-400" />
                  {t('dashboard.charts.title')}
                </CardTitle>
                <div className="flex bg-white/50 p-1 rounded-lg border border-green-200">
                  <button onClick={() => setChartType('area')} className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${chartType === 'area' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-green-800'}`}>Area</button>
                  <button onClick={() => setChartType('bar')} className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${chartType === 'bar' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-green-800'}`}>Bar</button>
                  <button onClick={() => setChartType('line')} className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${chartType === 'line' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-green-800'}`}>Line</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
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
                    ) : chartType === 'bar' ? (
                      <BarChart data={priceData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="wheat" fill="#84cc16" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="paddy" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={priceData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="year" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="wheat" stroke="#84cc16" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="paddy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex gap-5 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-3 h-0.5 bg-green-600 rounded-full" />Wheat
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
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
                  <p className="text-lime-400 font-bold text-sm mb-1">{t('dashboard.advisory.bullish.title')}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {t('dashboard.advisory.bullish.desc')}
                  </p>
                  <Link to="/market-trends" className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-lime-400 mt-2 font-medium transition-colors">
                    {t('dashboard.advisory.bullish.link')} <ArrowRight className="h-3 w-3" />
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
                  <p className="text-orange-400 font-bold text-sm mb-1">{t('dashboard.advisory.spoilage.title')}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {t('dashboard.advisory.spoilage.desc')}
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
                    {t('dashboard.bookingCta.new')}
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/booking?tab=upcoming"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-green-200 hover:border-green-300 hover:bg-green-50 text-green-800 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
                >
                  <TicketCheck className="h-4 w-4" />
                  {t('dashboard.bookingCta.check')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <Card className="bg-white/40 backdrop-blur-xl border-green-200/50 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-950 text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-lime-400" />
                {t('dashboard.activity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, text: 'Booking TK-8492 confirmed at Kanpur Central', time: '2h ago' },
                  { icon: <IndianRupee className="h-4 w-4 text-green-700" />, text: '₹12,400 credited for 50 qtl Paddy — Akbarpur Mandi', time: '1d ago' },
                  { icon: <TrendingUp className="h-4 w-4 text-sky-500" />, text: 'Wheat price alert triggered — 4.5% surge detected', time: '2d ago' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-100/20 hover:bg-green-100/40 transition-colors">
                    <div className="p-1.5 bg-green-50 rounded-lg flex-shrink-0">{a.icon}</div>
                    <p className="text-sm text-green-800 flex-1">{a.text}</p>
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