import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/lib/supabase';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [currentIndex, hasPrev, hasNext, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0C0907]/94 backdrop-blur-sm" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4">
          <p className="text-[9px] tracking-[0.45em] uppercase text-white/25 font-sans">
            {currentIndex + 1} <span className="text-white/15">/</span> {photos.length}
          </p>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/75 hover:border-white/20 transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Prev button */}
        {hasPrev && (
          <button
            onClick={e => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
            className="absolute left-3 sm:left-5 z-10 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/18 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={e => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
            className="absolute right-3 sm:right-5 z-10 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/18 transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Photo */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative flex flex-col items-center max-w-[88vw]"
        >
          {/* Photo frame */}
          <div
            className="relative"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 30px 80px rgba(0,0,0,0.7)',
            }}
          >
            <img
              src={photo.url}
              alt={`Foto de ${photo.guest_name}`}
              className="block max-w-[85vw] max-h-[72vh] w-auto h-auto object-contain"
              draggable={false}
            />
          </div>

          {/* Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="mt-5 text-center"
          >
            <p className="text-[8px] tracking-[0.4em] uppercase text-white/22 font-sans mb-1.5">
              Capturado por
            </p>
            <p className="text-white/70 font-heading italic text-[1.25rem] leading-none">
              {photo.guest_name}
            </p>
          </motion.div>
        </motion.div>

        {/* Dot indicators */}
        {photos.length <= 20 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); onNavigate(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-4 h-1.5 bg-accent'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
