/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, MapPin, Clock, Star, Scissors, Music } from 'lucide-react';

import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BEAUTY_QUOTES } from '../constants/quotes';

interface HeroProps {
  onActionClick: () => void;
  onDirectBook: () => void;
}

export function Hero({ onActionClick, onDirectBook }: HeroProps) {
  const [heroQuote] = React.useState(BEAUTY_QUOTES[0]);
  const [settings, setSettings] = React.useState({
    heroTitle: 'Realza tu',
    heroSlogan: 'Esencia.',
    heroDescription: 'El estudio de belleza más exclusivo en el barrio Libertador. Experiencias diseñadas para transformar tu imagen y bienestar.',
    heroImage: 'https://images.unsplash.com/photo-1556760544-74068565f38c?auto=format&fit=crop&q=80&w=1200',
    salonLogo: ''
  });

  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'app_settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          heroTitle: data.heroTitle || 'Realza tu',
          heroSlogan: data.heroSlogan || 'Esencia.',
          heroDescription: data.heroDescription || 'El estudio de belleza más exclusivo en el barrio Libertador. Experiencias diseñadas para transformar tu imagen y bienestar.',
          heroImage: data.heroImage || 'https://images.unsplash.com/photo-1556760544-74068565f38c?auto=format&fit=crop&q=80&w=1200',
          salonLogo: data.salonLogo || ''
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:col-span-6 flex flex-col justify-center"
        >
          <div className="inline-flex items-center space-x-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 mb-6 w-fit">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-600">Tunja, Boyacá • Cra. 15 #7-35</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light leading-none mb-6 italic tracking-tighter">
            {settings.heroTitle} <br />
            <span className="font-bold not-italic text-rose-600 drop-shadow-sm">{settings.heroSlogan}</span>
          </h1>
          
          <p className="text-lg text-rose-900/70 mb-10 leading-relaxed italic max-w-lg">
            {settings.heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onDirectBook}
              className="bg-rose-500 text-white px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Agendar Cita Ahora</span>
              <Scissors className="w-4 h-4" />
            </button>
            <button 
              onClick={onActionClick}
              className="bg-white/40 backdrop-blur-md border border-white/60 px-8 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/60 transition-all text-[#331c26] active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Ver Servicios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="md:col-span-6 relative"
        >
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-4 shadow-2xl relative overflow-hidden">
            <img 
              src={settings.heroImage} 
              alt="Paulis Studio" 
              className="w-full h-full object-cover rounded-[32px] shadow-inner"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-4 bg-gradient-to-t from-rose-900/20 to-transparent rounded-[32px] pointer-events-none" />
          </div>
          
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 md:-left-12 flex flex-col items-start gap-3 z-20"
          >
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[24px] shadow-2xl border border-white/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-lg font-bold italic leading-none">4.9/5</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-rose-600">Google Reviews</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.a 
                href="https://www.tiktok.com/@paulis_studio"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-black/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-white"
              >
                <Music className="w-5 h-5" />
              </motion.a>

              {settings.salonLogo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-full shadow-xl border-4 border-white p-1 flex items-center justify-center"
                >
                  <img src={settings.salonLogo} alt="Paulis Studio Logo" className="w-full h-full object-contain rounded-full" />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute -top-6 -right-6 md:top-20 md:-right-12 bg-rose-50/90 backdrop-blur-xl p-4 rounded-[20px] shadow-2xl z-20 border border-white/80 max-w-[180px]"
          >
            <p className="text-xs font-serif italic text-rose-800 leading-tight">"{heroQuote.text}"</p>
            <p className="text-[7px] font-bold uppercase tracking-widest text-rose-400 mt-2">— {heroQuote.author}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Re-using icon for floating element
