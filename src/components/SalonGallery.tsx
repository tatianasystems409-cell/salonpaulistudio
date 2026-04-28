
import React from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
}

export function SalonGallery() {
  const [images, setImages] = React.useState<GalleryImage[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'salon_gallery'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url
      }));
      setImages(data);
    });
    return () => unsubscribe();
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-24 bg-[#fffdfd]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles className="w-3 h-3" />
            <span>Nuestros Espacios</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-rose-950">Ambientes creados <span className="font-bold not-italic">para ti</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-[32px] border border-white/60 shadow-lg cursor-pointer",
                index % 3 === 0 ? "md:col-span-2 md:row-span-2" : "aspect-square"
              )}
            >
              <img 
                src={img.url} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
