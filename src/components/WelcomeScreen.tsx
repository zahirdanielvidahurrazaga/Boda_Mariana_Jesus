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

      {/* ── Foto fullscreen ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
          />
        </AnimatePresence>

        {/* Scrim superior para el título */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '55%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.18) 70%, transparent 100%)' }}
        />
        {/* Scrim inferior oscuro para el form — sin crema */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: '68%', background: 'linear-gradient(to top, rgba(8,4,2,0.97) 0%, rgba(8,4,2,0.92) 35%, rgba(8,4,2,0.70) 60%, transparent 100%)' }}
        />
        {/* Vignette lateral */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.28) 100%)' }}
        />
      </div>

      {/* ── Watermark ── */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none select-none overflow-hidden" style={{ paddingTop: '5%' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 2.2, duration: 2.5 }}
          className="font-heading font-bold text-white leading-none"
          style={{ fontSize: 'clamp(120px, 28vw, 280px)', letterSpacing: '-0.04em' }}
        >
          M&amp;J
        </motion.span>
      </div>

      {/* ── Título ── */}
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="pre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="z-10 flex flex-col items-center gap-3 my-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-[1px] bg-white/20" />
              <p className="text-[8.5px] tracking-[0.55em] uppercase text-white/30 font-sans">Cargando</p>
              <div className="w-5 h-[1px] bg-white/20" />
            </div>
            <p className="text-2xl font-heading font-bold tracking-[0.3em] text-white/40">
              M <span className="text-accent">·</span> J
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 text-center px-8 pt-12 pb-0 w-full max-w-[420px]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="h-[1px] w-7 bg-accent/80" />
              <span className="text-[8px] tracking-[0.55em] uppercase text-accent font-sans font-medium whitespace-nowrap" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                XII · VI · MMXXVI
              </span>
              <div className="h-[1px] w-7 bg-accent/80" />
            </motion.div>

            <h1
              className="font-heading font-bold leading-[1.05]"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
            >
              <span className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.5rem, 10vw, 3.3rem)' }}>
                Mariana
              </span>
              <span className="block text-accent font-light italic tracking-[0.3em] my-1.5 text-[1.6rem]">
                &amp;
              </span>
              <span className="block text-white tracking-[0.07em] uppercase"
                style={{ fontSize: 'clamp(2.5rem, 10vw, 3.3rem)' }}>
                Jesús
              </span>
            </h1>

            <p className="mt-3 text-[8.5px] tracking-[0.55em] uppercase text-white/70 font-sans" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
              Nuestra Historia
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form (abajo, todo sobre oscuro) ── */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 w-full max-w-[360px] px-8 pb-12"
          >
            {/* Divisor */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.8 }}
              className="w-full h-[1px] bg-white/10 mb-0"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input — sobre fondo oscuro: todo blanco */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-0 pt-7 pb-7 bg-transparent border-b border-white/35 outline-none text-center text-[1.35rem] transition-colors duration-500 placeholder:text-white/50 text-white font-heading italic tracking-wide focus:border-white/65"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent origin-left transition-all duration-500 group-focus-within:w-full" />
              </div>

              {/* Botón liquid glass */}
              <motion.button
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                className="w-full py-[17px] text-[10px] font-semibold tracking-[0.3em] uppercase text-white/90 rounded-2xl transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.13)',
                  backdropFilter: 'blur(28px) saturate(200%) brightness(1.1)',
                  WebkitBackdropFilter: 'blur(28px) saturate(200%) brightness(1.1)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.25)',
                }}
              >
                Entrar a la Galería
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-center text-[8px] tracking-[0.4em] uppercase text-white/55 font-sans"
            >
              Comparte tu mirada de este día
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
