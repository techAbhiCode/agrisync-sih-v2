import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sprout, ArrowRight, CalendarCheck, MapPin, TrendingUp, Truck,
  Shield, Bell, Clock, IndianRupee, BarChart3, Smartphone,
  CheckCircle2, XCircle, ChevronDown, Zap, Users, Building2,
  Code2, Bot, Layers, Star,
} from 'lucide-react';

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((frame / total) * target));
      if (frame >= total) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Farmers Onboarded', value: 2400, suffix: '+', icon: <Users className="h-5 w-5" /> },
  { label: 'Mandis Connected', value: 14, suffix: '', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Queue Time Reduced', value: 73, suffix: '%', icon: <Clock className="h-5 w-5" /> },
  { label: 'Transactions Processed', value: 2.4, suffix: ' Cr+', prefix: '₹', icon: <IndianRupee className="h-5 w-5" /> },
];

const problems = [
  { old: '6+ hour physical queues at mandi gates', fix: 'Pre-scheduled digital time slots' },
  { old: 'No price transparency — middlemen exploit', fix: 'AI-driven real-time price intelligence' },
  { old: 'Paper tokens lost, chaos at entry', fix: 'Scannable virtual QR tokens' },
  { old: 'Unpredictable weighing & payment delays', fix: 'Live status tracking from gate to payment' },
  { old: 'Zero logistics support for last-mile', fix: 'Geo-optimized micro-logistics routing' },
];

const features = [
  {
    icon: <CalendarCheck className="h-6 w-6" />,
    title: 'Smart Slot Booking',
    desc: 'Reserve your mandi entry window digitally. No more arriving at 4 AM to secure a spot.',
    color: 'lime',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Virtual Token System',
    desc: 'Receive a QR-based token the moment you book. Scan at the gate — zero paper, zero chaos.',
    color: 'emerald',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'AI Price Intelligence',
    desc: "Gemini-powered predictions on commodity prices. Know when to sell before the market moves.",
    color: 'sky',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Micro-Logistics Map',
    desc: 'Real-time geospatial map of nearest active mandis with capacity and routing.',
    color: 'violet',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Live Procurement Status',
    desc: 'Track your goods from token scan → weighing → quality check → payment in real time.',
    color: 'orange',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Role-Based Access Control',
    desc: 'Separate portals for Farmers, Hub Managers, and Logistics — each with tailored controls.',
    color: 'rose',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/20 hover:border-lime-500/50', text: 'text-lime-400', glow: 'hover:shadow-[0_0_30px_rgba(132,204,22,0.15)]' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20 hover:border-emerald-500/50', text: 'text-emerald-400', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20 hover:border-sky-500/50', text: 'text-sky-400', glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20 hover:border-violet-500/50', text: 'text-violet-400', glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20 hover:border-orange-500/50', text: 'text-orange-400', glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20 hover:border-rose-500/50', text: 'text-rose-400', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
};

const steps = [
  { n: '01', title: 'Register Your Profile', desc: 'Sign up as a Farmer or Hub Manager. Firebase authentication secures your identity instantly.' },
  { n: '02', title: 'Browse & Book a Slot', desc: 'Check live mandi capacity on the map. Pick your preferred date and time window.' },
  { n: '03', title: 'Receive Virtual Token', desc: 'Get an instant QR-based digital token. Present it at the gate — no paperwork needed.' },
  { n: '04', title: 'Sell, Track & Get Paid', desc: 'Monitor your goods through every stage. Payment confirmation delivered in real time.' },
];

const techStack = [
  'React 18', 'TypeScript', 'Firebase Auth', 'MongoDB Atlas',
  'Node.js', 'Gemini AI', 'Leaflet Maps', 'Recharts',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans overflow-x-hidden">

      {/* ── Ambient glows (fixed) ───────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-lime-500/8 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-emerald-600/8 blur-[140px] rounded-full" />
      </div>

      {/* ── Dot-grid background ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 py-4 pointer-events-none"
      >
        <nav className="pointer-events-auto w-full max-w-5xl flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-full px-6 py-2.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-lime-500/10 p-2 rounded-full ring-1 ring-lime-500/30">
              <Sprout className="h-5 w-5 text-lime-500" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AgriSync<span className="text-lime-500">.</span></span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          {/* CTA */}
          <Link
            to="/login"
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-sm px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </motion.header>

      {/* ════════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/25 text-lime-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide"
        >
          <Star className="h-3.5 w-3.5 fill-lime-400" />
          Smart India Hackathon 2026 — Selected Project
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl"
        >
          India's Smartest{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500">
            Agricultural
          </span>{' '}
          Management Platform
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
        >
          Eliminate mandi queues, get AI-powered price intelligence, track your crops from field to payment — all from one platform built for India's farmers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Link
            to="/register"
            className="group flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold px-8 py-3.5 rounded-full transition-all shadow-[0_0_20px_rgba(132,204,22,0.4)] hover:shadow-[0_0_35px_rgba(132,204,22,0.6)] text-base"
          >
            Get Started — Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold px-8 py-3.5 rounded-full transition-all text-base"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          STATS BAND
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 border-y border-zinc-800/60 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 mx-auto bg-lime-500/10 text-lime-400`}>
                {s.icon}
              </div>
              <div className="text-3xl md:text-4xl font-black text-white">
                <Counter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <p className="text-sm text-zinc-500 mt-1 font-medium">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          PROBLEM vs SOLUTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-lime-500 text-sm font-bold uppercase tracking-widest mb-3">The Problem We Solve</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Mandi visits shouldn't be <span className="text-zinc-500">a nightmare.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Way */}
            <Reveal delay={0.1}>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="font-bold text-zinc-300 text-lg">The Old Way</h3>
                </div>
                <ul className="space-y-3">
                  {problems.map((p) => (
                    <li key={p.old} className="flex items-start gap-3 text-sm text-zinc-500">
                      <XCircle className="h-4 w-4 text-red-500/60 mt-0.5 flex-shrink-0" />
                      {p.old}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* AgriSync Way */}
            <Reveal delay={0.2}>
              <div className="bg-lime-950/20 border border-lime-900/40 rounded-2xl p-6 h-full shadow-[0_0_40px_rgba(132,204,22,0.06)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-lime-500/10 rounded-lg border border-lime-500/20">
                    <Sprout className="h-5 w-5 text-lime-400" />
                  </div>
                  <h3 className="font-bold text-lime-400 text-lg">The AgriSync Way</h3>
                </div>
                <ul className="space-y-3">
                  {problems.map((p) => (
                    <li key={p.fix} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-lime-500 mt-0.5 flex-shrink-0" />
                      {p.fix}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-6 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-lime-500 text-sm font-bold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Everything a farmer needs,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">
                in one place.
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div
                    className={`group h-full bg-zinc-900/50 border ${c.border} rounded-2xl p-6 transition-all duration-300 ${c.glow} cursor-default`}
                  >
                    <div className={`inline-flex p-3 rounded-xl ${c.bg} ${c.text} mb-4 border ${c.border} group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-zinc-100 text-lg mb-2">{f.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-lime-500 text-sm font-bold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              From registration to payment<br />
              <span className="text-zinc-500">in four steps.</span>
            </h2>
          </Reveal>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.12} className="relative text-center">
                  {/* Number circle */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border-2 border-lime-500/40 text-lime-400 font-black text-xl mb-5 shadow-[0_0_20px_rgba(132,204,22,0.15)]">
                    {step.n}
                  </div>
                  <h3 className="font-bold text-zinc-100 text-base mb-2">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          TECH STACK BAND
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-14 border-y border-zinc-800/60 bg-zinc-900/30">
        <Reveal className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest mb-6">
            Built with enterprise-grade technology
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-sm font-medium hover:border-zinc-600 hover:text-zinc-200 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          CTA STRIP
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6">
        <Reveal className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-lime-500/20 rounded-3xl p-12 overflow-hidden shadow-[0_0_80px_rgba(132,204,22,0.12)]">
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-lime-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-500/10 rounded-2xl border border-lime-500/20 mb-6">
                <Zap className="h-7 w-7 text-lime-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to transform your<br />mandi experience?
              </h2>
              <p className="text-zinc-400 mb-8 text-lg">
                Join 2,400+ farmers already using AgriSync to sell smarter and faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold px-8 py-3.5 rounded-full transition-all shadow-[0_0_20px_rgba(132,204,22,0.4)] hover:shadow-[0_0_40px_rgba(132,204,22,0.6)] text-base"
                >
                  Start for Free — Farmer Portal
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-transparent text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base"
                >
                  Hub Manager Login
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/30 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-lime-500/10 p-2 rounded-full ring-1 ring-lime-500/25">
                  <Sprout className="h-5 w-5 text-lime-500" />
                </div>
                <span className="text-lg font-bold text-white">AgriSync<span className="text-lime-500">.</span></span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                Digitizing agricultural procurement for Uttar Pradesh farmers. Built for SIH 2026.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="#" className="p-2 bg-zinc-800/60 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                  <Code2 className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 bg-zinc-800/60 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                  <Bot className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-zinc-300 font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-zinc-500">
                {['Farmer Portal', 'Hub Manager Portal', 'Market Trends', 'Micro-Logistics', 'Slot Booking'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-zinc-200 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-zinc-300 font-semibold text-sm mb-4">Info</h4>
              <ul className="space-y-2.5 text-sm text-zinc-500">
                {['About the Project', 'SIH 2026', 'Ministry of Agriculture', 'Privacy Policy', 'Terms of Use'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-zinc-200 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-xs">
              © 2026 AgriSync. Built with ❤️ for India's farmers.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Code2 className="h-3.5 w-3.5" />
              Built with ❤️ by Team Lakshya
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}