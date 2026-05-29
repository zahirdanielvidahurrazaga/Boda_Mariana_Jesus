import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import { supabase, type Photo } from '@/lib/supabase';
import Lightbox from './Lightbox';

const TILTS = [-1.4, 0.9, -0.6, 1.6, -1.0, 0.5, -1.9, 1.2, -0.4, 1.4, -0.8, 0.7];

export default function Gallery({ refreshKey }: { refreshKey?: number }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const insertBuffer = useRef<Photo[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, payload => {
        insertBuffer.current.push(payload.new as Photo);
        if (flushTimer.current) clearTimeout(flushTimer.current);
        flushTimer.current = setTimeout(() => {
          const batch = insertBuffer.current.splice(0);
          if (batch.length > 0) setPhotos(prev => [...batch, ...prev]);
        }, 400);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos' }, payload => {
        setPhotos(prev => prev.filter(p => p.id !== (payload.old as Photo).id));
      })
      .subscribe();

    // Re-fetch cuando el usuario vuelve a la app (teléfono desbloqueado, tab activa)
    const handleVisibility = () => { if (!document.hidden) fetchPhotos(); };
    document.addEventListener('visibilitychange', handleVisibility);

    // Fallback: re-fetch cada 30 segundos por si el realtime se cae
    const poll = setInterval(fetchPhotos, 30_000);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(poll);
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      setPhotos(data || []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const formattedPhotos = useMemo(() => photos.map(p => ({
    src: p.url,
    width: p.width ?? 3,
    height: p.height ?? 4,
    key: p.id,
    alt: p.guest_name,
    guest_name: p.guest_name,
    message: p.message ?? null,
  })), [photos]);

  const renderImage = useCallback((
    _imageProps: React.ImgHTMLAttributes<HTMLImageElement>,
    { photo, index }: { photo: { src: string; width: number; height: number; alt?: string; guest_name: string; message: string | null }; index: number }
  ) => {
    const tilt = TILTS[index % TILTS.length];

    return (
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: tilt }}
        whileInView={{ opacity: 1, y: 0, rotate: tilt }}
        whileHover={{ scale: 1.04, rotate: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setSelectedIndex(index)}
        className="cursor-pointer group"
        style={{
          background: '#fff',
          padding: '6px 6px 54px 6px',
          boxShadow: '0 3px 14px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.07)',
          willChange: 'transform',
        }}
      >
        {/* Foto */}
        <div
          className="overflow-hidden"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          <img
            src={photo.src}
            alt={photo.alt ?? ''}
            loading="lazy"
            style={{ display: 'block', width: '100%', height: '100%' }}
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Firma Polaroid */}
        <div
          className="px-1.5 pt-2.5"
          style={{ height: '54px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1px' }}
        >
          {photo.message && (
            <p
              className="truncate"
              style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '14px',
                color: 'rgba(26,26,26,0.48)',
                lineHeight: 1.3,
              }}
            >
              {photo.message}
            </p>
          )}
          <p
            style={{
              fontFamily: 'Caveat, cursive',
              fontSize: photo.message ? '16px' : '18px',
              color: 'rgba(26,26,26,0.68)',
              lineHeight: 1.2,
            }}
          >
            — {photo.guest_name}
          </p>
        </div>
      </motion.div>
    );
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-3.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="mb-2.5 sm:mb-3.5 break-inside-avoid overflow-hidden"
            style={{ background: '#fff', padding: '6px 6px 54px 6px', boxShadow: '0 3px 14px rgba(0,0,0,0.08)' }}
          >
            <div
              className="w-full skeleton"
              style={{ aspectRatio: ['3/4', '4/5', '2/3', '3/4'][i % 4] }}
            />
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (photos.length === 0) {
    return (
      <div className="text-center py-32 border-y border-primary/[0.06]">
        <div className="w-11 h-11 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-5">
          <span className="text-accent font-heading italic text-base">M</span>
        </div>
        <p className="text-primary/45 font-heading italic text-2xl mb-2.5">Aún no hay momentos.</p>
        <p className="text-[9px] tracking-[0.35em] uppercase text-primary/25 font-sans">
          Sé el primero en compartir la magia
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8 text-center text-[9px] tracking-[0.35em] uppercase text-primary/30 font-sans"
      >
        {photos.length} {photos.length === 1 ? 'momento compartido' : 'momentos compartidos'}
      </motion.p>

      <MasonryPhotoAlbum
        photos={formattedPhotos}
        render={{ image: renderImage }}
        columns={w => (w < 480 ? 2 : w < 768 ? 2 : w < 1024 ? 3 : 4)}
        spacing={w => (w < 640 ? 14 : 18)}
      />

      <div className="mt-20 text-center pb-4">
        <p className="text-[8.5px] tracking-[0.55em] uppercase text-primary/14 font-sans">#MarianayJesús</p>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            key="lightbox"
            photos={photos}
            currentIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onNavigate={setSelectedIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
