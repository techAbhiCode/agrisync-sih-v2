import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  Sprout, ArrowRight, CalendarCheck, MapPin,
  Shield, Bell, BarChart3, Smartphone,
  ChevronDown,
} from 'lucide-react';
import landingBg from '../assets/landing_bg.jpg';

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

// ─── Component ────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string, text: string, border: string, glow: string }> = {
  lime: { bg: 'bg-lime-500/10', text: 'text-lime-600', border: 'border-lime-200/50', glow: 'hover:shadow-[0_0_30px_rgba(132,204,22,0.3)]' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200/50', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-200/50', glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-200/50', glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200/50', glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-200/50', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]' },
};

export default function Landing() {
  const { t } = useTranslation();

  // We move features inside the component to use the `t` function
  const features = [
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: t('features.items.slot.title'),
      desc: t('features.items.slot.desc'),
      color: 'lime',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: t('features.items.token.title'),
      desc: t('features.items.token.desc'),
      color: 'emerald',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('features.items.price.title'),
      desc: t('features.items.price.desc'),
      color: 'sky',
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('features.items.map.title'),
      desc: t('features.items.map.desc'),
      color: 'violet',
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: t('features.items.status.title'),
      desc: t('features.items.status.desc'),
      color: 'orange',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('features.items.rbac.title'),
      desc: t('features.items.rbac.desc'),
      color: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 text-green-950 font-sans overflow-x-hidden">

      {/* ── Ambient glows (fixed) ───────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-green-600/8 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-emerald-600/8 blur-[140px] rounded-full" />
      </div>

      {/* ── Background Image & Pattern ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          backgroundImage: `url(${landingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-farm-pattern opacity-50 mix-blend-multiply" />

      {/* ════════════════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 py-4 pointer-events-none"
      >
        <nav className="pointer-events-auto w-full max-w-5xl flex items-center justify-between bg-white/60 backdrop-blur-xl border border-green-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-full px-6 py-2.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-green-600/10 p-2 rounded-full ring-1 ring-lime-500/30">
              <Sprout className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-lg font-bold text-green-950 tracking-tight">{t('navbar.brand')}<span className="text-green-600">.</span></span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-green-950 transition-colors">{t('navbar.features')}</a>
            <LanguageSwitcher />
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-green-600 hover:bg-lime-400 text-zinc-950 font-bold text-sm px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]"
            >
              {t('navbar.signIn')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* ════════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-black tracking-tight text-green-950 leading-[1.08] max-w-4xl"
        >
          {t('hero.title1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500">
            {t('hero.title2')}
          </span>{' '}
          {t('hero.title3')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600"
        >
          <span className="text-xs font-medium tracking-widest uppercase">{t('hero.scroll')}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-6 bg-white/20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-3">{t('features.badge')}</p>
            <h2 className="text-4xl md:text-5xl font-black text-green-950">
              {t('features.title1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">
                {t('features.title2')}
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div
                    className={`group h-full bg-white/50 border ${c.border} rounded-2xl p-6 transition-all duration-300 ${c.glow} cursor-default`}
                  >
                    <div className={`inline-flex p-3 rounded-xl ${c.bg} ${c.text} mb-4 border ${c.border} group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-green-950 text-lg mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-green-200/60 bg-white/30 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="bg-green-600/10 p-2 rounded-full ring-1 ring-lime-500/25">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-lg font-bold text-green-950">{t('footer.brand')}<span className="text-green-600">.</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs text-center md:text-left">
                {t('footer.desc')}
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-green-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-xs">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}