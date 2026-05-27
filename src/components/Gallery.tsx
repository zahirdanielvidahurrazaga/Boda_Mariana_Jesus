import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import { supabase, type Photo } from '@/lib/supabase';
import Lightbox from './Lightbox';

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();

    const channel = supabase
      .channel('realtime:photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, payload => {
        setPhotos(prev => [payload.new as Photo, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos' }, payload => {
        setPhotos(prev => prev.filter(p => p.id !== (payload.old as Photo).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const formattedPhotos = photos.map(p => ({
    src: p.url,
    width: p.width ?? 3,
    height: p.height ?? 4,
    key: p.id,
    alt: p.guest_name,
  }));

  const renderImage = useCallback((imageProps: React.ImgHTMLAttributes<HTMLImageElement>, { photo }: { photo: typeof formattedPhotos[0] }) => {
    const index = formattedPhotos.findIndex(p => p.src === photo.src);
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setSelectedIndex(index)}
        className="group relative overflow-hidden rounded-[2px] cursor-pointer bg-muted"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <img
          {...imageProps}
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-[1.045]"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex flex-col justify-end p-3.5">
          <p className="text-[7.5px] tracking-[0.25em] uppercase text-white/40 font-sans mb-0.5">Capturado por</p>
          <p className="text-white font-heading italic text-[1.05rem] leading-snug">{photo.alt}</p>
        </div>
      </motion.div>
    );
  }, [formattedPhotos]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-3.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="mb-2.5 sm:mb-3.5 break-inside-avoid rounded-[2px] overflow-hidden">
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
        spacing={w => (w < 640 ? 10 : 14)}
      />

      <div className="mt-20 text-center pb-4">
        <p className="text-[8.5px] tracking-[0.55em] uppercase text-primary/14 font-sans">#MarianayJesús</p>
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  );
}
