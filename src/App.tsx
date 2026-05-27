import { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import Gallery from '@/components/Gallery';
import UploadButton from '@/components/UploadButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('guest_name');
    if (saved) setGuestName(saved);
  }, []);

  const handleJoin = (name: string) => {
    localStorage.setItem('guest_name', name);
    setGuestName(name);
  };

  const handleLeave = () => {
    localStorage.removeItem('guest_name');
    setGuestName(null);
  };

  return (
    <>
      <div className="grain-overlay" />
      <AnimatePresence mode="wait">
        {!guestName ? (
          <WelcomeScreen key="welcome" onJoin={handleJoin} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen pb-44 bg-background"
          >
            {/* ── Header centrado ── */}
            <header
              className="sticky top-0 z-30 w-full border-b border-primary/[0.07]"
              style={{
                background: 'rgba(244,239,230,0.88)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              }}
            >
              <div className="flex flex-col items-center text-center px-6 pt-5 pb-5">
                <h2 className="font-heading font-bold text-foreground tracking-[0.08em] uppercase leading-none"
                  style={{ fontSize: 'clamp(1.25rem, 5vw, 1.7rem)' }}>
                  Mariana &amp; Jesús
                </h2>
                <p className="text-[7.5px] tracking-[0.45em] uppercase text-foreground/40 font-sans mt-1.5">
                  Galería de Invitados
                </p>
                <button
                  onClick={handleLeave}
                  className="mt-3.5 px-5 py-2 text-[8px] tracking-[0.22em] uppercase font-semibold border border-foreground/18 text-foreground/55 rounded-sm hover:border-foreground/35 hover:text-foreground/75 transition-all duration-300 font-sans"
                >
                  Cambiar Invitado
                </button>
              </div>
            </header>

            {/* ── Hero compacto ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-6xl mx-auto px-5 pt-9 pb-7 text-center"
            >
              <p className="text-[8px] tracking-[0.4em] uppercase text-foreground/35 font-sans mb-2.5">
                Bienvenido a Nuestra Historia, {guestName}
              </p>
              <h1 className="font-heading font-bold text-foreground leading-tight"
                style={{ fontSize: 'clamp(1.9rem, 7vw, 3rem)' }}>
                Nuestra Historia
              </h1>
              <div className="w-8 h-[1px] bg-foreground/12 mx-auto mt-4" />
            </motion.div>

            {/* ── Gallery ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-5">
              <Gallery />
            </div>

            <UploadButton guestName={guestName} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
