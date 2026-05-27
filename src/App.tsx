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
            {/* Header */}
            <header className="sticky top-0 z-30 w-full px-5 py-4 glass border-b border-primary/[0.07]">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[17px] font-heading font-bold text-foreground tracking-[0.12em] uppercase leading-none">
                      Mariana <span className="text-accent font-normal italic">&amp;</span> Jesús
                    </h2>
                    <span className="flex items-center gap-1 px-2 py-[3px] rounded-full bg-accent/[0.08] border border-accent/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[8px] tracking-[0.18em] uppercase text-accent font-sans font-semibold">En vivo</span>
                    </span>
                  </div>
                  <p className="text-[8px] tracking-[0.4em] uppercase text-foreground/35 font-sans">
                    Galería de Invitados
                  </p>
                </div>

                <button
                  onClick={handleLeave}
                  className="px-3 py-1.5 text-[8px] tracking-[0.18em] font-semibold uppercase rounded-sm border border-foreground/12 text-foreground/45 hover:border-foreground/25 hover:text-foreground/70 transition-all duration-300 font-sans"
                >
                  Cambiar
                </button>
              </div>
            </header>

            {/* Hero title */}
            <div className="max-w-6xl mx-auto px-5 mt-14 mb-16 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-[9px] tracking-[0.4em] uppercase text-foreground/40 mb-4 font-sans"
              >
                Bienvenido, {guestName}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-7xl md:text-[88px] font-bold font-heading text-foreground tracking-tight leading-[1.02]"
              >
                Nuestra Historia
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="w-10 h-[1px] bg-accent/50 mx-auto mt-7"
              />
            </div>

            {/* Gallery */}
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
