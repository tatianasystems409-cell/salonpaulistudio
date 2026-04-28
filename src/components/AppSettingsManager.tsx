import React from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType, UserProfile } from '../types';
import { Save, Upload, Sparkles, Image as ImageIcon, Laptop, Type, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface AppSettings {
  heroImage: string;
  heroTitle: string;
  heroSlogan: string;
  heroDescription: string;
  salonLogo?: string;
  campaignMonth?: string;
  campaignTitle?: string;
  campaignMeaning?: string;
  campaignImage?: string;
  showCampaign?: boolean;
  emailBanner?: string;
  updatedAt: any;
}

const DEFAULT_SETTINGS: AppSettings = {
  heroImage: 'https://images.unsplash.com/photo-1556760544-74068565f38c?auto=format&fit=crop&q=80&w=1200',
  heroTitle: 'Realza tu',
  heroSlogan: 'Esencia.',
  heroDescription: 'El estudio de belleza más exclusivo en el barrio Libertador. Experiencias diseñadas para transformar tu imagen y bienestar.',
  campaignMonth: 'Abril',
  campaignTitle: 'Paulis Month',
  campaignMeaning: 'El mes de la transformación y el renacimiento.',
  campaignImage: '',
  showCampaign: false,
  updatedAt: null
};

export function AppSettingsManager({ user }: { user: UserProfile | null }) {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'app_settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snapshot.data() } as AppSettings);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = (field: 'heroImage' | 'emailBanner' | 'salonLogo' | 'campaignImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings(prev => ({ ...prev, [field]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.isSuperAdmin) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'general'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      alert('Configuración guardada con éxito');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'app_settings/general');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-12 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-serif italic text-rose-950">Ajustes del <span className="font-bold not-italic">Sitio</span></h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-900/40">Personaliza la primera impresión de tu estudio</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <div className="space-y-12">
        {/* Logo & Branding */}
        <section className="bg-white/40 backdrop-blur-md p-10 rounded-[40px] border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold italic text-rose-900">Identidad Visual (Logo)</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <p className="text-sm text-rose-900/60 italic leading-relaxed mb-4">
                Carga el logo oficial de Paulis Studio. Este aparecerá en el inicio cerca de la puntuación de Google.
              </p>
              <label className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Cargar Logo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload('salonLogo')} />
              </label>
            </div>
            <div className="w-32 h-32 bg-white rounded-full border-4 border-rose-50 overflow-hidden shadow-xl flex items-center justify-center relative">
              {settings.salonLogo ? (
                <img src={settings.salonLogo} className="w-full h-full object-cover" alt="Salon Logo" />
              ) : (
                <span className="text-[8px] font-bold uppercase tracking-widest text-rose-200 text-center px-4">Sin Logo</span>
              )}
            </div>
          </div>
        </section>

        {/* Campaign Section Edit */}
        <section className="bg-rose-50/50 backdrop-blur-md p-10 rounded-[40px] border border-rose-100 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold italic text-rose-900">Campaña del Mes</h3>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">Mostrar Campaña</span>
              <div 
                onClick={() => setSettings({...settings, showCampaign: !settings.showCampaign})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.showCampaign ? 'bg-rose-600' : 'bg-rose-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showCampaign ? 'left-7' : 'left-1'}`} />
              </div>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Mes</label>
                  <input 
                    type="text" 
                    value={settings.campaignMonth || ''}
                    onChange={(e) => setSettings({...settings, campaignMonth: e.target.value})}
                    className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-medium italic"
                    placeholder="Ej. Abril"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Título Campaña</label>
                  <input 
                    type="text" 
                    value={settings.campaignTitle || ''}
                    onChange={(e) => setSettings({...settings, campaignTitle: e.target.value})}
                    className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-bold text-rose-600"
                    placeholder="Ej. Mes de la Madre"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">¿Qué significa?</label>
                <textarea 
                  rows={3}
                  value={settings.campaignMeaning || ''}
                  onChange={(e) => setSettings({...settings, campaignMeaning: e.target.value})}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-sm italic"
                  placeholder="Breve explicación del mes..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Imagen de Campaña</label>
              <div className="relative aspect-square rounded-[32px] overflow-hidden border-2 border-white shadow-xl group max-w-[200px] mx-auto">
                {settings.campaignImage ? (
                  <img src={settings.campaignImage} className="w-full h-full object-cover" alt="Campaign Preview" />
                ) : (
                  <div className="w-full h-full bg-rose-100 flex items-center justify-center text-rose-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-center p-4">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Cambiar Imagen</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload('campaignImage')} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section Edit */}
        <section className="bg-white/40 backdrop-blur-md p-10 rounded-[40px] border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold italic text-rose-900">Sección Principal (Hero)</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">
                  <Type className="w-3 h-3" /> Título Principal
                </label>
                <input 
                  type="text" 
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-medium italic"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">
                  <Sparkles className="w-3 h-3" /> Eslogan (Resaltado)
                </label>
                <input 
                  type="text" 
                  value={settings.heroSlogan}
                  onChange={(e) => setSettings({...settings, heroSlogan: e.target.value})}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-bold text-rose-600"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">
                  <FileText className="w-3 h-3" /> Descripción
                </label>
                <textarea 
                  rows={4}
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({...settings, heroDescription: e.target.value})}
                  className="w-full p-4 bg-white/60 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all text-sm italic"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">
                <ImageIcon className="w-3 h-3" /> Imagen Principal
              </label>
              <div className="relative aspect-video rounded-[32px] overflow-hidden border-2 border-white shadow-xl group">
                <img src={settings.heroImage} className="w-full h-full object-cover" alt="Hero Preview" />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cambiar Imagen</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload('heroImage')} />
                </label>
              </div>
              <p className="text-[9px] font-medium text-rose-900/30 italic px-2">Sugerencia: Usa una foto de alta calidad (1920x1080) de tu local o un trabajo realizado.</p>
            </div>
          </div>
        </section>

        {/* Email Header Edit (Optional logic for future) */}
        <section className="bg-white/40 backdrop-blur-md p-10 rounded-[40px] border border-white/60 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold italic text-rose-900">Imagen para Correos</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <p className="text-sm text-rose-900/60 italic leading-relaxed mb-4">
                Esta imagen aparecerá en la parte superior de los correos automáticos que reciben tus clientes.
              </p>
              <label className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Cargar Imagen Logo/Banner</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload('emailBanner')} />
              </label>
            </div>
            <div className="w-full md:w-64 aspect-[3/1] bg-white rounded-xl border border-rose-100 overflow-hidden shadow-sm flex items-center justify-center relative">
              {settings.emailBanner ? (
                <img src={settings.emailBanner} className="w-full h-full object-contain" alt="Email Logo" />
              ) : (
                <span className="text-[8px] font-bold uppercase tracking-widest text-rose-200">Sin Imagen</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
