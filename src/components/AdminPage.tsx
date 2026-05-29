import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Camera, BarChart3, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase, type Photo } from '@/lib/supabase';

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Código incorrecto');
      setPasscode('');
    }
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('photos').delete().match({ id });
      if (error) throw error;
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;
    setDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < photos.length; i++) {
        try {
          const res = await fetch(photos[i].url);
          const blob = await res.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          zip.file(`${photos[i].guest_name}_${i + 1}.${ext}`, blob);
        } catch {
          // skip foto si falla
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MarianaYJesus_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al generar el ZIP. Intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: 'Fotos', value: photos.length, icon: Camera },
    { label: 'Invitados', value: new Set(photos.map(p => p.guest_name)).size, icon: BarChart3 },
    { label: 'Est. tamaño', value: `${(photos.length * 0.4).toFixed(1)} MB`, icon: ShieldCheck },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-10 text-center"
        >
          <div>
            <h2 className="text-3xl font-heading text-foreground mb-3">Panel Admin</h2>
            <p className="text-[9px] tracking-[0.35em] uppercase text-foreground/40 font-sans">
              Mariana &amp; Jesús
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <input
              type="password"
              placeholder="Código de acceso"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/20 py-4 text-center text-xl outline-none focus:border-foreground/50 transition-all placeholder:text-foreground/20 text-foreground font-heading"
            />
            <button
              type="submit"
              className="w-full py-4 text-foreground text-[10px] font-bold tracking-[0.25em] uppercase font-sans border border-foreground/15 hover:border-foreground/35 transition-all"
            >
              Entrar
            </button>
          </form>
          <a href="/#" className="block text-[8.5px] tracking-[0.3em] uppercase text-foreground/30 hover:text-foreground/50 transition-colors font-sans">
            ← Volver a la galería
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-30 w-full border-b border-primary/[0.07]"
        style={{
          background: 'rgba(244,239,230,0.92)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-foreground tracking-wide text-lg">Panel Admin</h1>
              <p className="text-[8px] tracking-[0.35em] uppercase text-foreground/40 font-sans mt-0.5">
                Mariana &amp; Jesús
              </p>
            </div>
            <a
              href="/#"
              className="text-[8.5px] tracking-[0.25em] uppercase text-foreground/45 hover:text-foreground/70 transition-colors font-sans border border-foreground/12 px-4 py-2"
            >
              ← Galería
            </a>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadAll}
              disabled={downloading || photos.length === 0}
              className="flex-1 py-2.5 flex items-center justify-center gap-2 text-[9px] font-bold tracking-[0.2em] uppercase font-sans border border-foreground/15 hover:border-foreground/35 transition-all disabled:opacity-40 text-foreground/70"
            >
              {downloading
                ? <><Loader2 size={12} className="animate-spin" /><span>Generando ZIP...</span></>
                : <><Download size={12} /><span>Descargar todo ({photos.length})</span></>
              }
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-7">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="border border-primary/[0.07] p-4 text-center"
            >
              <stat.icon className="w-4 h-4 text-foreground/25 mx-auto mb-2" />
              <p className="text-2xl font-heading text-foreground">{stat.value}</p>
              <p className="text-[8px] tracking-[0.2em] uppercase text-foreground/40 mt-1 font-sans">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Grid de fotos */}
        {loading ? (
          <p className="text-center text-foreground/30 font-sans text-sm py-20">Cargando fotos...</p>
        ) : photos.length === 0 ? (
          <p className="text-center text-foreground/30 font-heading italic text-xl py-20">Sin fotos aún.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative group aspect-[4/5] bg-primary/5 overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.guest_name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay con nombre */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                  <p className="text-[8px] tracking-[0.2em] uppercase text-white/50 font-sans">De</p>
                  <p className="text-white font-heading italic text-sm">{photo.guest_name}</p>
                  {photo.message && (
                    <p className="text-white/60 text-xs mt-0.5" style={{ fontFamily: 'Caveat, cursive' }}>
                      "{photo.message}"
                    </p>
                  )}
                </div>

                {/* Botón eliminar */}
                {deleteConfirm === photo.id ? (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-4">
                    <p className="text-white text-xs text-center font-sans">¿Eliminar esta foto?</p>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="flex-1 py-2 bg-red-500/80 text-white text-[9px] font-bold tracking-wider uppercase font-sans"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2 bg-white/20 text-white text-[9px] font-bold tracking-wider uppercase font-sans"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
