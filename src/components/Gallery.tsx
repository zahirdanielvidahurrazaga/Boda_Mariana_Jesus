'use client';

import { useEffect, useState } from 'react';
import { Photo, supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MasonryPhotoAlbum } from 'react-photo-album';
import "react-photo-album/masonry.css";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setGuestName(localStorage.getItem('wedding_guest_name') || 'Invitado');
    fetchPhotos();

    const channel = supabase
      .channel('public:photos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos' },
        (payload) => {
          setPhotos((prev) => [payload.new as Photo, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'photos' },
        (payload) => {
          setPhotos((prev) => prev.filter(photo => photo.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (props: any) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden rounded-sm bg-neutral-100 border border-black/5"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full aspect-[3/4]"
        >
          <img 
            {...props} 
            className={`${props.className} w-full h-full object-cover transition-opacity duration-1000`}
            loading="lazy"
          />
        </motion.div>
        
        {/* Guest Name Overlay (Restored as requested) */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-4 pointer-events-none">
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mb-1 font-sans">Capturado por</p>
          <p className="text-white font-heading italic text-xl">
            {props.alt?.replace('Shared by ', '') || 'Invitado'}
          </p>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-12 h-[1px] bg-primary/20 mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-primary/40 font-sans">
          Cargando recuerdos...
        </p>
      </div>
    );
  }

  const formattedPhotos = photos.map(p => ({
    src: p.url,
    width: 800,
    height: 1000,
    key: p.id,
    alt: `Shared by ${p.guest_name}`,
  }));

  return (
    <div className="w-full pb-20">
      {photos.length > 0 ? (
        <>
          <MasonryPhotoAlbum 
            photos={formattedPhotos}
            render={{ image: renderImage }}
            columns={(containerWidth) => {
              if (containerWidth < 480) return 2;
              if (containerWidth < 768) return 2;
              if (containerWidth < 1024) return 3;
              return 4;
            }}
            spacing={(containerWidth) => containerWidth < 640 ? 8 : 16}
          />
          <div className="mt-20 text-center">
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary/20 font-sans">
              #MarianayJesús
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-32 border-y border-primary/5">
          <p className="text-primary/60 font-heading text-2xl md:text-3xl mb-4">
            Aún no hay momentos guardados.
          </p>
          <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-primary/40 font-sans">
            Sé el primero en compartir la magia
          </p>
        </div>
      )}
    </div>
  );
}
