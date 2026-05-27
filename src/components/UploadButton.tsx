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
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3.5">

      {/* Status toast */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] tracking-[0.18em] uppercase font-sans font-semibold whitespace-nowrap border
              ${status === 'success' ? 'bg-background border-accent/25 text-primary shadow-lg shadow-black/[0.06]' :
                status === 'error'   ? 'bg-background border-red-300/40 text-red-600 shadow-lg shadow-black/[0.06]' :
                                       'bg-primary/92 border-transparent text-white shadow-xl shadow-black/20'}`}
          >
            {isProcessing  && <Loader2 size={13} className="animate-spin" />}
            {status === 'success' && <CheckCircle2 size={13} className="text-accent" />}
            {status === 'error'   && <AlertCircle size={13} className="text-red-500" />}
            <span>{STATUS_LABEL[status]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons pill */}
      <div className="flex items-center gap-0 px-5 py-3.5 glass rounded-full border border-white/55 shadow-xl shadow-black/[0.08]">

        {/* Gallery */}
        <input type="file" ref={galleryRef} onChange={handleFile} accept="image/*" className="hidden" />
        <motion.button
          whileHover={{ y: -2.5 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => galleryRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center gap-2 px-4 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <div className="w-[52px] h-[52px] rounded-full bg-white/55 border border-white/80 shadow-sm flex items-center justify-center hover:bg-white/75 transition-colors duration-200">
            {isProcessing
              ? <Loader2 size={19} className="text-primary/60 animate-spin" />
              : <ImageIcon size={19} className="text-primary/60" />
            }
          </div>
          <span className="text-[8.5px] tracking-[0.1em] text-primary/40 font-sans leading-none">Galería</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-9 bg-primary/[0.07] mx-1" />

        {/* Camera — gold accent */}
        <input type="file" ref={cameraRef} onChange={handleFile} accept="image/*" capture="environment" className="hidden" />
        <motion.button
          whileHover={{ y: -2.5 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => cameraRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center gap-2 px-4 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <div
            className="w-[52px] h-[52px] rounded-full gold-gradient flex items-center justify-center hover:opacity-88 transition-opacity duration-200"
            style={{ boxShadow: '0 4px 16px -4px rgba(160,100,30,0.55)' }}
          >
            {isProcessing
              ? <Loader2 size={21} className="text-white animate-spin" />
              : <Camera size={21} className="text-white" />
            }
          </div>
          <span className="text-[8.5px] tracking-[0.1em] text-primary/40 font-sans leading-none">Cámara</span>
        </motion.button>
      </div>
    </div>
  );
}
