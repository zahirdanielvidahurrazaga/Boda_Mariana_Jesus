import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/lib/supabase';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0.4,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0.4,
  }),
};

const glassBtn = {
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.14)',
};

export default function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goNext = useCallback(() => {
    if (!hasNext) return;
    setDirection(1);
    onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    setDirection(-1);
    onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  goNext();
      if (e.key === 'ArrowLeft')   goPrev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  // Oculta controles automáticamente después de 3s de inactividad
  useEffect(() => {
    setShowControls(true);
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const THRESHOLD = 55;
    if (info.offset.x < -THRESHOLD)      goNext();
    else if (info.offset.x > THRESHOLD)  goPrev();
  };

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      onClick={() => setShowControls(v => !v)}
    >

      {/* ── Barra superior ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-6 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          >
            <p className="text-[9px] tracking-[0.45em] uppercase text-white/35 font-sans pointer-events-none">
              {currentIndex + 1} <span className="text-white/18">/</span> {photos.length}
            </p>
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors pointer-events-auto"
              style={glassBtn}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Foto (swipeable) ── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.7 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: hasNext ? 0.18 : 0.04, right: hasPrev ? 0.18 : 0.04 }}
            onDragEnd={handleDragEnd}
            onClick={e => e.stopPropagation()}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
          >
            <img
              src={photo.url}
              alt={`Foto de ${photo.guest_name}`}
              className="w-full h-full object-contain select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Flechas laterales (desktop) */}
        <AnimatePresence>
          {showControls && (
            <>
              {hasPrev && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={e => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hidden sm:flex"
                  style={glassBtn}
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}
              {hasNext && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={e => { e.stopPropagation(); goNext(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hidden sm:flex"
                  style={glassBtn}
                >
                  <ChevronRight size={20} />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Hint de swipe (primera vez) */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden">
            <p className="text-[8px] tracking-[0.3em] uppercase text-white/18 font-sans">
              desliza para navegar
            </p>
          </div>
        )}
      </div>

      {/* ── Info inferior ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 px-6 pb-10 pt-5"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[8px] tracking-[0.4em] uppercase text-white/28 font-sans mb-1.5">
              Capturado por
            </p>
            <p className="text-white/80 font-heading italic leading-none"
              style={{ fontSize: 'clamp(1.1rem, 5vw, 1.4rem)' }}>
              {photo.guest_name}
            </p>

            {/* Dots */}
            {photos.length > 1 && photos.length <= 30 && (
              <div className="flex items-center gap-1.5 mt-5 flex-wrap">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      onNavigate(i);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-4 h-1.5 bg-white/70'
                        : 'w-1.5 h-1.5 bg-white/18 hover:bg-white/35'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
