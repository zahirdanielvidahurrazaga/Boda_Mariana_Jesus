import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompressor';

interface UploadButtonProps {
  guestName: string;
}

type Status = 'idle' | 'compressing' | 'uploading' | 'saving' | 'success' | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle:        '',
  compressing: 'Optimizando...',
  uploading:   'Subiendo...',
  saving:      'Guardando...',
  success:     '¡Momento guardado!',
  error:       'Error al subir. Intenta de nuevo.',
};

const circleGlass = {
  background: 'rgba(255,255,255,0.28)',
  backdropFilter: 'blur(28px) saturate(180%) brightness(1.08)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%) brightness(1.08)',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 20px rgba(0,0,0,0.12)',
};

export default function UploadButton({ guestName }: UploadButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const isProcessing = status !== 'idle' && status !== 'success' && status !== 'error';

  const processUpload = async (file: File) => {
    try {
      setStatus('compressing');
      const compressed = await compressImage(file);

      setStatus('uploading');
      const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .upload(path, compressed, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (storageError) throw storageError;

      setStatus('saving');
      const { data: { publicUrl } } = supabase.storage.from('wedding-photos').getPublicUrl(path);
      const { error: dbError } = await supabase
        .from('photos')
        .insert({ url: publicUrl, guest_name: guestName, event_id: 'default-event' });
      if (dbError) throw dbError;

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      if (cameraRef.current)  cameraRef.current.value = '';
      if (galleryRef.current) galleryRef.current.value = '';
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUpload(file);
  };

  return (
    <>
      {/* ── Toast de estado ── */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[9.5px] tracking-[0.18em] uppercase font-sans font-semibold whitespace-nowrap"
            style={{
              ...circleGlass,
              color: status === 'error' ? '#c0392b' : 'rgba(26,26,26,0.7)',
            }}
          >
            {isProcessing        && <Loader2 size={12} className="animate-spin text-primary/50" />}
            {status === 'success' && <CheckCircle2 size={12} className="text-primary/60" />}
            {status === 'error'   && <AlertCircle size={12} className="text-red-400" />}
            <span>{STATUS_LABEL[status]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dos círculos flotantes sobre la galería ── */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-around items-end px-8 max-w-2xl mx-auto">

        {/* Galería */}
        <input type="file" ref={galleryRef} onChange={handleFile} accept="image/*" className="hidden" />
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => galleryRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center"
            style={circleGlass}
          >
            {isProcessing
              ? <Loader2 size={22} className="text-primary/55 animate-spin" />
              : <ImageIcon size={22} className="text-primary/60" />
            }
          </div>
          <span className="text-[8.5px] tracking-[0.12em] text-primary/40 font-sans leading-none">
            Galería
          </span>
        </motion.button>

        {/* Cámara */}
        <input type="file" ref={cameraRef} onChange={handleFile} accept="image/*" capture="environment" className="hidden" />
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => cameraRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center"
            style={circleGlass}
          >
            {isProcessing
              ? <Loader2 size={24} className="text-primary/65 animate-spin" />
              : <Camera size={24} className="text-primary/65" />
            }
          </div>
          <span className="text-[8.5px] tracking-[0.12em] text-primary/40 font-sans leading-none">
            Cámara
          </span>
        </motion.button>
      </div>
    </>
  );
}
