'use client';

import { useEffect, useState } from 'react';
import { Photo, supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Trash2, Download, Camera, BarChart3, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Código Incorrecto');
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este recuerdo? No se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .match({ id });

      if (error) throw error;
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      alert(`Error al eliminar: ${error.message || 'Permiso denegado'}`);
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) {
      alert('No hay fotos para descargar.');
      return;
    }

    setDownloading(true);

    try {
      // Dynamically import JSZip (lighter initial bundle)
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Download each photo and add to ZIP
      for (let i = 0; i < photos.length; i++) {
        try {
          const response = await fetch(photos[i].url);
          const blob = await response.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          zip.file(`${photos[i].guest_name}_${i + 1}.${ext}`, blob);
        } catch (err) {
          console.warn(`Skipping photo ${i + 1}:`, err);
        }
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MarianaYJesus_Recuerdos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP generation failed:', error);
      alert('Error al generar el archivo ZIP. Intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: 'Recuerdos', value: photos.length, icon: Camera },
    { label: 'Invitados', value: new Set(photos.map(p => p.guest_name)).size, icon: BarChart3 },
    { label: 'Almacenamiento', value: `${(photos.length * 0.4).toFixed(1)} MB`, icon: ShieldCheck },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-12 text-center"
        >
          <div>
            <h2 className="text-3xl font-heading text-foreground mb-4">Concierge Privado</h2>
            <p className="text-xs tracking-[0.3em] uppercase text-foreground/50 font-sans">
              Identidad de Acceso Requerida
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <input
              type="password"
              placeholder="Código de Acceso"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/20 py-4 text-center text-2xl outline-none focus:border-foreground transition-all placeholder:text-foreground/20 text-foreground font-heading"
            />
            <button
              type="submit"
              className="w-full py-4 glass text-foreground text-xs font-bold tracking-[0.2em] uppercase font-sans hover:bg-primary/5 transition-all border border-primary/10"
            >
              Verificar Identidad
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass border-b border-primary/10 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/20 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-heading tracking-tight text-foreground truncate">Panel de Control</h1>
              <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-sans mt-0.5">Mariana & Jesús | Concierge</p>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            <Link 
              href="/"
              className="flex-1 px-4 py-2.5 text-[9px] sm:text-xs font-bold tracking-[0.15em] uppercase text-foreground border border-primary/10 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-sans"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span>Galería</span>
            </Link>
            <button 
              onClick={handleDownloadAll}
              disabled={downloading || photos.length === 0}
              className="flex-1 px-4 py-2.5 glass text-foreground text-[9px] sm:text-xs font-bold tracking-[0.15em] uppercase rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-sans border border-primary/10 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                  <span>Descargando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 shrink-0" />
                  <span>Descargar ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Grid - single row on mobile */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-4 sm:p-6 border border-primary/5 text-center"
            >
              <stat.icon className="w-4 h-4 text-foreground/30 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-heading tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase text-foreground/50 mt-1 font-sans">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-primary/5 mb-8" />

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-[4/5] bg-muted rounded-lg overflow-hidden border border-primary/5"
            >
              <img 
                src={photo.url} 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                alt={photo.guest_name}
                loading="lazy"
              />
              {/* Guest Name Overlay (Restored and refined) */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 h-1/2 pointer-events-none">
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 mb-1 font-sans">Compartido por</p>
                <p className="text-white font-heading italic text-base">{photo.guest_name}</p>
              </div>

              {/* Glass Delete Button (Always accessible top-right) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="w-8 h-8 rounded-full glass border border-white/20 shadow-lg flex items-center justify-center text-white/80 hover:text-red-400 hover:bg-white/10 transition-all backdrop-blur-xl"
                  title="Eliminar Recuerdo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Persistent Delete (Top right restricted for mobile) */}
              <div className="absolute top-2 right-2 sm:hidden">
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="w-7 h-7 rounded-full glass border border-white/20 flex items-center justify-center text-white/60 active:text-red-400 backdrop-blur-md"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && photos.length === 0 && (
          <div className="text-center py-32 border border-dashed border-primary/10 rounded-lg">
            <p className="text-foreground/40 font-heading text-xl">Esperando el primer recuerdo...</p>
          </div>
        )}
      </main>
    </div>
  );
}
