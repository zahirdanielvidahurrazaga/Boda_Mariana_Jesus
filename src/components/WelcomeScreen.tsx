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
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden bg-[#F4EFE6]">

      {/* ── Background slideshow ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: 0.52, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
          />
        </AnimatePresence>
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/35 to-[#F4EFE6]/05" />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(20,10,0,0.28) 100%)' }}
        />
      </div>

      {/* ── Watermark initials ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.032 }}
          transition={{ delay: 2.2, duration: 2.5 }}
          className="font-heading font-bold text-primary leading-none"
          style={{ fontSize: 'clamp(140px, 30vw, 320px)', letterSpacing: '-0.04em' }}
        >
          M&amp;J
        </motion.span>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!showContent ? (
          /* Preloader */
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5 }}
            className="z-10 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-[1px] bg-primary/25" />
              <p className="text-[9px] tracking-[0.55em] uppercase text-primary/40 font-sans">Cargando</p>
              <div className="w-6 h-[1px] bg-primary/25" />
            </div>
            <p className="text-2xl font-heading font-bold tracking-[0.3em] text-primary/60">
              M <span className="text-accent">·</span> J
            </p>
          </motion.div>
        ) : (
          /* Main content */
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="z-10 w-full max-w-[340px] px-8 text-center"
          >
            {/* Names */}
            <motion.div
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Date with lines */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-[1px] flex-1 bg-accent/30" />
                <span className="text-[8.5px] tracking-[0.5em] uppercase text-accent/70 font-sans font-medium whitespace-nowrap">
                  XII · VI · MMXXVI
                </span>
                <div className="h-[1px] flex-1 bg-accent/30" />
              </div>

              {/* Main title */}
              <h1 className="font-heading font-bold text-primary leading-[1.08]">
                <span className="block text-[2.6rem] sm:text-[3rem] tracking-[0.06em] uppercase">Mariana</span>
                <span className="block text-[1.6rem] text-accent font-light italic tracking-[0.25em] my-1">&amp;</span>
                <span className="block text-[2.6rem] sm:text-[3rem] tracking-[0.06em] uppercase">Jesús</span>
              </h1>

              <p className="mt-3 text-[9px] tracking-[0.5em] uppercase text-primary/35 font-sans">
                Nuestra Historia
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[1px] bg-primary/[0.08] my-9"
            />

            {/* Form */}
            <motion.form
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.9 }}
              onSubmit={handleSubmit}
              className="space-y-7"
            >
              <div className="relative group">
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-primary/18 outline-none text-center text-xl transition-colors duration-500 placeholder:text-primary/22 text-primary font-heading italic tracking-wide focus:border-primary/40"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent origin-left transition-all duration-500 group-focus-within:w-full" />
              </div>

              <motion.button
                whileHover={{ scale: 1.012, opacity: 0.93 }}
                whileTap={{ scale: 0.984 }}
                type="submit"
                className="w-full py-[15px] text-[10.5px] font-semibold tracking-[0.28em] uppercase text-white rounded-xl gold-gradient transition-opacity"
                style={{ boxShadow: '0 8px 28px -6px rgba(160, 100, 30, 0.5)' }}
              >
                Entrar a la Galería
              </motion.button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 1 }}
              className="mt-10 text-[8.5px] tracking-[0.4em] uppercase text-primary/28 font-sans"
            >
              Comparte tu mirada de este día
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
