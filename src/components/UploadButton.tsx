'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompressor';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

interface UploadButtonProps {
  guestName: string;
}

export default function UploadButton({ guestName }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processUpload = async (file: File) => {
    setUploading(true);
    try {
      // Step 1: Compress image
      setProgress('Optimizando...');
      const compressed = await compressImage(file);

      // Step 2: Upload to Supabase Storage
      setProgress('Subiendo...');
      const fileExt = 'jpg'; // Always save as jpg after compression
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, compressed, {
          contentType: 'image/jpeg',
          cacheControl: '31536000', // Cache 1 year (immutable content)
        });

      if (uploadError) throw uploadError;

      // Step 3: Save to database
      setProgress('Guardando...');
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          url: publicUrl,
          guest_name: guestName,
          event_id: 'default-event'
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (error: any) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setProgress('');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6">
      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 px-8 py-4 bg-primary/90 backdrop-blur-xl rounded-full border border-primary/20 shadow-2xl flex items-center gap-4 z-50"
          >
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-xs tracking-[0.2em] uppercase text-white font-sans">{progress}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 px-8 py-4 glass rounded-full shadow-[0_8px_32px_rgba(0,59,92,0.12)] flex items-center gap-4 z-50 border border-primary/20"
          >
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-sans">¡Momento Guardado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-10 px-6 py-4">
        <div className="relative">
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <motion.button
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className={`flex flex-col items-center justify-center gap-3 group transition-all w-20 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full glass border border-primary/20 shadow-xl shadow-primary/5 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-primary drop-shadow-sm" />
              )}
            </div>
            <span className="text-[10px] tracking-[0.1em] text-primary/70 font-sans">Galería</span>
          </motion.button>
        </div>

        <div className="relative">
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <motion.button
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className={`flex flex-col items-center justify-center gap-3 group transition-all w-20 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full glass border border-primary/20 shadow-xl shadow-primary/5 flex items-center justify-center group-hover:bg-primary/5 transition-all relative overflow-hidden">
              {uploading ? (
                <Loader2 className="w-7 h-7 text-primary animate-spin relative z-10" />
              ) : (
                <Camera className="w-7 h-7 text-primary drop-shadow-sm relative z-10" />
              )}
            </div>
            <span className="text-[10px] tracking-[0.1em] font-sans text-primary/70">Cámara</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
