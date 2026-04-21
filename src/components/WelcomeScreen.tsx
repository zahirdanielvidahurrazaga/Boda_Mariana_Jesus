'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
  onJoin: (name: string) => void;
}

export default function WelcomeScreen({ onJoin }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [showContent, setShowContent] = useState(false);

  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = ['/couple-1.jpg', '/couple-2.jpg'];

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 2000);
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000);
    return () => {
      clearTimeout(timer);
      clearInterval(bgTimer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] p-6 overflow-hidden bg-[#05080a] text-white">
      {/* Cinematic Background with Ken Burns Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-[70%_center] brightness-[1.15]"
            style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
          />
        </AnimatePresence>
        
        {/* Subtle Navy Color Grading over Dark */}
        <div className="absolute inset-0 bg-primary/30 mix-blend-color" />
        
        {/* Deep vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-transparent to-[#05080a]/60" />
      </div>

      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-50 flex flex-col items-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[0.3em] uppercase text-white font-heading">
              JESÚS & PAOLA
            </h1>
            <div className="w-12 h-[1px] bg-white/40 mt-4 animate-pulse" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="z-10 w-full max-w-md text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            >
              <h1 className="mb-2 text-4xl sm:text-5xl font-bold tracking-[0.1em] text-white font-heading uppercase">
                JESÚS & PAOLA
              </h1>
              <p className="mb-16 text-sm tracking-[0.4em] uppercase text-white/50 font-sans">
                Nuestra Historia
              </p>
            </motion.div>

            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-4 bg-transparent border-b border-primary/20 outline-none focus:border-white text-center text-xl transition-all duration-700 placeholder:text-white/20 text-white font-heading italic tracking-wide"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-700 group-focus-within:w-full" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 text-sm font-semibold tracking-[0.2em] uppercase text-white transition-all rounded-2xl glass hover:bg-primary/40"
              >
                Entrar a la Galería
              </motion.button>
            </motion.form>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
              className="mt-16 text-[10px] tracking-[0.3em] uppercase text-white/60"
            >
              01 MAYO 2026
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
