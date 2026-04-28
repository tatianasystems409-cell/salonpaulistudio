import React from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface CampaignSettings {
  campaignMonth: string;
  campaignTitle: string;
  campaignMeaning: string;
  campaignImage: string;
  showCampaign: boolean;
}

export function CampaignSection() {
  const [settings, setSettings] = React.useState<CampaignSettings | null>(null);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'app_settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.showCampaign) {
          setSettings({
            campaignMonth: data.campaignMonth || 'Mes Especial',
            campaignTitle: data.campaignTitle || 'Campaña Actual',
            campaignMeaning: data.campaignMeaning || '',
            campaignImage: data.campaignImage || '',
            showCampaign: data.showCampaign
          });
        } else {
          setSettings(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (!settings) return null;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/40 backdrop-blur-2xl rounded-[60px] border border-white/60 shadow-2xl p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/20 blur-[100px] -z-10" />

          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
              <Sparkles className="w-4 h-4" />
              <span>Destacado del Mes: {settings.campaignMonth}</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif italic text-rose-950 leading-tight">
              {settings.campaignTitle}
            </h2>
            
            <div className="space-y-6">
              <p className="text-xl md:text-2xl text-rose-900/60 font-light italic leading-relaxed">
                "{settings.campaignMeaning}"
              </p>
              <div className="h-px w-24 bg-rose-200 mx-auto lg:mx-0" />
              <p className="text-sm text-rose-900/40 uppercase tracking-widest font-bold">
                Descubre por qué este mes es sagrado en Paulis Studio
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white/60"
            >
              {settings.campaignImage ? (
                <img 
                  src={settings.campaignImage} 
                  alt={settings.campaignTitle}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-rose-100" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1">Campaña Activa</p>
                  <p className="text-sm font-serif italic text-rose-900">Agenda tu cita y vive la experiencia.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
