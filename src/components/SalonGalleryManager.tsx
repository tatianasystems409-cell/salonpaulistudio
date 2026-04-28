
import React from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType, UserProfile } from '../types';
import { Trash2, Plus, Upload, ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: any;
}

export function SalonGalleryManager({ user }: { user: UserProfile | null }) {
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, 'salon_gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GalleryImage));
      setImages(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'salon_gallery');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        await addDoc(collection(db, 'salon_gallery'), {
          url: base64,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'salon_gallery');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!user?.isSuperAdmin) return;
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    try {
      await deleteDoc(doc(db, 'salon_gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `salon_gallery/${id}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif italic pb-2">Galería del <span className="font-bold not-italic">Estudio</span></h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">Sube fotos reales de tu local para atraer clientes</p>
        </div>
        <label className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 cursor-pointer">
          {uploading ? 'Subiendo...' : <><Upload className="w-4 h-4" /> <span>Subir Foto</span></>}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img) => (
          <motion.div 
            key={img.id}
            layout
            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/60 shadow-md"
          >
            <img src={img.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleDelete(img.id)}
                className="p-2 bg-white text-rose-600 rounded-full hover:scale-110 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {images.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center bg-rose-50/50 rounded-[32px] border border-rose-100/50">
            <ImageIcon className="w-12 h-12 text-rose-200 mx-auto mb-4" />
            <p className="text-xs text-rose-900/40 font-bold uppercase tracking-widest">No hay fotos en la galería aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
