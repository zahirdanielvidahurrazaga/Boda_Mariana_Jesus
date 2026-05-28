import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { Photo } from '@/lib/supabase';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '105%' : '-105%', opacity: 0.2 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-105%' : '105%', opacity: 0.2 }),
};

const glassBtn = {
  background: 'rgba(255,255,255,0.10)',
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
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  useEffect(() => {
    setShowControls(true);
    const t = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const THRESHOLD = 55;
    if (info.offset.x < -THRESHOLD)     goNext();
    else if (info.offset.x > THRESHOLD) goPrev();
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boda-${photo.guest_name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', damping: 26, stiffness: 160, mass: 1.1 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(10, 8, 6, 0.97)', transformOrigin: 'center center' }}
      onClick={() => setShowControls(v => !v)}
    >

      {/* ── Botones superiores — siempre visibles ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
      >
        <AnimatePresence>
          {showControls && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[9px] tracking-[0.45em] uppercase text-white/35 font-sans"
            >
              {currentIndex + 1} <span className="text-white/18">/</span> {photos.length}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          <button
            onClick={handleDownload}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={glassBtn}
          >
            <Download size={16} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={glassBtn}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Polaroid centrada ── */}
      <div className="flex-1 flex items-center justify-center px-5">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 36, mass: 1.0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: hasNext ? 0.18 : 0.04, right: hasPrev ? 0.18 : 0.04 }}
            onDragEnd={handleDragEnd}
            onClick={e => { e.stopPropagation(); setShowControls(v => !v); }}
            className="cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Marco Polaroid */}
            <div
              style={{
                background: '#fff',
                padding: '9px 9px 62px 9px',
                width: 'min(80vw, 340px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 6px 22px rgba(0,0,0,0.35)',
              }}
            >
              <img
                src={photo.url}
                alt={`Foto de ${photo.guest_name}`}
                className="w-full select-none block"
                style={{
                  aspectRatio: `${photo.width ?? 3} / ${photo.height ?? 4}`,
                  objectFit: 'cover',
                }}
                draggable={false}
              />
              {/* Firma */}
              <div
                style={{
                  height: '62px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '2px',
                  padding: '0 4px',
                }}
              >
                {photo.message && (
                  <p
                    className="truncate"
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '15px', color: 'rgba(26,26,26,0.45)', lineHeight: 1.3 }}
                  >
                    {photo.message}
                  </p>
                )}
                <p style={{ fontFamily: 'Caveat, cursive', fontSize: photo.message ? '18px' : '21px', color: 'rgba(26,26,26,0.65)', lineHeight: 1.2 }}>
                  — {photo.guest_name}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dots + flechas — auto-hide ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 pb-12"
            onClick={e => e.stopPropagation()}
          >
            {/* Flechas desktop */}
            <div className="hidden sm:block">
              {hasPrev && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={e => { e.stopPropagation(); goPrev(); }}
                  className="fixed left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  style={glassBtn}
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}
              {hasNext && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={e => { e.stopPropagation(); goNext(); }}
                  className="fixed right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  style={glassBtn}
                >
                  <ChevronRight size={20} />
                </motion.button>
              )}
            </div>

            {/* Dots */}
            {photos.length > 1 && photos.length <= 30 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center px-8">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > currentIndex ? 1 : -1); onNavigate(i); }}
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
