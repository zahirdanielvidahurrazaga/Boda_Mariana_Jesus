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
            animate={{ opacity: 0.78, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
          />
        </AnimatePresence>
        {/* Dark scrim — title contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
        {/* Cream wash — form area */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: '52%', background: 'linear-gradient(to top, #F4EFE6 55%, rgba(244,239,230,0.55) 80%, transparent 100%)' }}
        />
        {/* Edge vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 40%, transparent 55%, rgba(0,0,0,0.32) 100%)' }}
        />
      </div>

      {/* ── Watermark initials ── */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none select-none overflow-hidden" style={{ paddingTop: '6%' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.045 }}
          transition={{ delay: 2.2, duration: 2.5 }}
          className="font-heading font-bold text-white leading-none"
          style={{ fontSize: 'clamp(120px, 28vw, 280px)', letterSpacing: '-0.04em' }}
        >
          M&amp;J
        </motion.span>
      </div>

      {/* ── Title (upper — white over photo) ── */}
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
              <p className="text-[8.5px] tracking-[0.55em] uppercase text-white/30 font-sans">Cargando</p>
              <div className="w-5 h-[1px] bg-white/20" />
            </div>
            <p className="text-2xl font-heading font-bold tracking-[0.3em] text-white/45">
              M <span className="text-accent">·</span> J
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 text-center px-8 pt-14 pb-0 w-full max-w-[400px]"
          >
            {/* Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.9 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="h-[1px] w-7 bg-accent/45" />
              <span className="text-[8px] tracking-[0.55em] uppercase text-accent/80 font-sans font-medium whitespace-nowrap">
                XII · VI · MMXXVI
              </span>
              <div className="h-[1px] w-7 bg-accent/45" />
            </motion.div>

            {/* Names — white, high contrast */}
            <h1
              className="font-heading font-bold leading-[1.05]"
              style={{ textShadow: '0 2px 28px rgba(0,0,0,0.45)' }}
            >
              <span
                className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.5rem, 10vw, 3.2rem)' }}
              >
                Mariana
              </span>
              <span className="block text-accent font-light italic tracking-[0.3em] my-1 text-2xl">
                &amp;
              </span>
              <span
                className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.5rem, 10vw, 3.2rem)' }}
              >
                Jesús
              </span>
            </h1>

            <p className="mt-3 text-[8.5px] tracking-[0.55em] uppercase text-white/38 font-sans">
              Nuestra Historia
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form (bottom — floating on cream, no card) ── */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 w-full max-w-[360px] px-8 pb-12"
          >
            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[1px] bg-primary/[0.09] mb-9"
            />

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Input — underline only, no container */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-0 py-3.5 bg-transparent border-b border-primary/18 outline-none text-center text-[1.35rem] transition-colors duration-500 placeholder:text-primary/25 text-primary/85 font-heading italic tracking-wide focus:border-primary/38"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent origin-left transition-all duration-500 group-focus-within:w-full" />
              </div>

              {/* Button — solid dark, original feel */}
              <motion.button
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                className="w-full py-[17px] text-[10px] font-semibold tracking-[0.3em] uppercase text-white rounded-2xl bg-primary transition-colors duration-300 hover:bg-accent"
                style={{ boxShadow: '0 8px 30px -8px rgba(0,0,0,0.45)' }}
              >
                Entrar a la Galería
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-9 text-center text-[8px] tracking-[0.4em] uppercase text-primary/28 font-sans"
            >
              Comparte tu mirada de este día
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
