import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
  onJoin: (name: string) => void;
}

const BACKGROUNDS = ['/couple-1.jpg', '/couple-2.jpg'];

export default function WelcomeScreen({ onJoin }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 1800);
    const t2 = setInterval(() => setBgIndex(i => (i + 1) % BACKGROUNDS.length), 7000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] overflow-hidden bg-[#0D0A07]">

      {/* ── Background slideshow ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
          />
        </AnimatePresence>

        {/* Dark scrim for title readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        {/* Cream wash from bottom for form area */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/60 to-transparent" style={{ top: '55%' }} />
        {/* Vignette edges */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 40%, transparent 50%, rgba(0,0,0,0.35) 100%)' }}
        />
      </div>

      {/* ── Watermark initials (over photo) ── */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none select-none overflow-hidden" style={{ paddingTop: '8%' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ delay: 2.2, duration: 2.5 }}
          className="font-heading font-bold text-white leading-none"
          style={{ fontSize: 'clamp(120px, 28vw, 280px)', letterSpacing: '-0.04em' }}
        >
          M&amp;J
        </motion.span>
      </div>

      {/* ── Title (upper area, over photo) ── */}
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="z-10 flex flex-col items-center gap-3 mt-auto mb-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-[1px] bg-white/20" />
              <p className="text-[8.5px] tracking-[0.55em] uppercase text-white/35 font-sans">Cargando</p>
              <div className="w-5 h-[1px] bg-white/20" />
            </div>
            <p className="text-2xl font-heading font-bold tracking-[0.3em] text-white/50">
              M <span className="text-accent">·</span> J
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 text-center px-6 pt-14 pb-0 w-full max-w-[400px]"
          >
            {/* Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="h-[1px] w-8 bg-accent/40" />
              <span className="text-[8px] tracking-[0.55em] uppercase text-accent/75 font-sans font-medium whitespace-nowrap">
                XII · VI · MMXXVI
              </span>
              <div className="h-[1px] w-8 bg-accent/40" />
            </motion.div>

            {/* Names — white over dark photo */}
            <h1
              className="font-heading font-bold leading-[1.05]"
              style={{ textShadow: '0 2px 32px rgba(0,0,0,0.4)' }}
            >
              <span className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)' }}>
                Mariana
              </span>
              <span className="block text-accent font-light italic tracking-[0.3em] my-1 text-2xl">
                &amp;
              </span>
              <span className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)' }}>
                Jesús
              </span>
            </h1>

            <p className="mt-3 text-[8.5px] tracking-[0.55em] uppercase text-white/40 font-sans">
              Nuestra Historia
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form (bottom, glass card on cream area) ── */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 w-full max-w-[360px] px-5 pb-10 pt-2"
          >
            {/* Glass card */}
            <div
              className="w-full rounded-2xl px-6 py-7"
              style={{
                background: 'rgba(244, 239, 230, 0.72)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.65)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Input */}
                <div className="relative group">
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="Tu Nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-0 py-3 bg-transparent border-b border-primary/15 outline-none text-center text-xl transition-colors duration-400 placeholder:text-primary/22 text-primary/85 font-heading italic tracking-wide focus:border-primary/35"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent origin-left transition-all duration-500 group-focus-within:w-full" />
                </div>

                {/* Glass button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-[14px] text-[10px] font-semibold tracking-[0.3em] uppercase text-primary/75 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(197,160,89,0.28)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 10px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
                >
                  Entrar a la Galería
                </motion.button>
              </form>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="mt-5 text-center text-[8px] tracking-[0.4em] uppercase text-white/35 font-sans"
            >
              Comparte tu mirada de este día
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
