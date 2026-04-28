/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Service, OperationType, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, Edit2, Plus, X, Save, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceEditorProps {
  user: UserProfile | null;
}

export function ServiceEditor({ user }: ServiceEditorProps) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'Manicura',
    imageUrl: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?auto=format&fit=crop&q=80&w=800'
  });

  React.useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services for editor:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: 'Manicura',
      imageUrl: 'https://images.unsplash.com/photo-1604654894611-6973b376cbde?auto=format&fit=crop&q=80&w=800'
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isSuperAdmin) {
      alert("Solo el Super Administrador puede modificar servicios.");
      return;
    }

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
      } else if (isAdding) {
        await addDoc(collection(db, 'services'), formData);
      }
      setEditingService(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Error saving service:", error);
      handleFirestoreError(error, editingService ? OperationType.UPDATE : OperationType.CREATE, 'services');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.isSuperAdmin) {
      alert("Solo el Super Administrador puede eliminar servicios.");
      return;
    }
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error("Error deleting service:", error);
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-8 text-center text-rose-900/40">Cargando servicios...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-rose-950">Edición de <span className="font-bold not-italic">Servicios</span></h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-900/40 mt-1">Sube imágenes y personaliza tu menú de belleza</p>
        </div>
        {!isAdding && !editingService ? (
          <button 
            onClick={handleAddNew}
            className="group flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Agregar Nuevo Servicio</span>
          </button>
        ) : (
          <button 
            onClick={() => { setIsAdding(false); setEditingService(null); }}
            className="flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Cancelar Edición</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(isAdding || editingService) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[40px] p-10 shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8">
                <div className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Editor de Servicio</div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Nombre del Servicio</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/50 border border-rose-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-medium italic text-lg"
                        placeholder="Ej. Manicura Galáctica"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Categoría</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/50 border border-rose-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="Manicura">Manicura</option>
                        <option value="Maquillaje">Maquillaje</option>
                        <option value="Peinado">Peinado</option>
                        <option value="Corte">Corte</option>
                        <option value="Facial">Facial</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Precio ($)</label>
                        <input 
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          className="w-full bg-white/50 border border-rose-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-rose-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Minutos</label>
                        <input 
                          type="number"
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                          className="w-full bg-white/50 border border-rose-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Descripción del Ritual</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/50 border border-rose-50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all min-h-[150px] italic text-sm text-rose-900/70"
                      placeholder="Describe la experiencia que vivirá el cliente..."
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-3 px-1">Imagen del Servicio</label>
                    <div className="relative aspect-square rounded-[32px] overflow-hidden border-2 border-white shadow-xl group mb-4">
                      {formData.imageUrl ? (
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-rose-50 flex flex-col items-center justify-center text-rose-200">
                          <ImageIcon className="w-16 h-16 mb-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Sin Imagen Seleccionada</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                        <Plus className="w-10 h-10 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-4 text-center">Haz clic para subir o cambiar la foto</span>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="bg-white/40 p-4 rounded-2xl border border-white/60">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-rose-900/30 mb-2 px-1">O pega una URL de imagen</label>
                      <input 
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full bg-transparent border-b border-rose-100 py-2 focus:outline-none focus:border-rose-400 text-[10px] italic"
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-6 rounded-3xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-[0.98] mt-10"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingService ? 'Guardar Cambios' : 'Lanzar Servicio'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div 
            key={service.id}
            layout
            className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[32px] p-6 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
              <img 
                src={service.imageUrl} 
                alt={service.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-rose-600 shadow-sm">
                {service.category}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{service.name}</h3>
            <p className="text-xs text-rose-900/60 mb-6 italic line-clamp-2">{service.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div>
                <div className="text-[10px] font-bold text-rose-900/40 uppercase tracking-widest mb-0.5">Inversión</div>
                <div className="font-bold text-rose-600">{formatCurrency(service.price)}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(service)}
                  className="p-3 bg-white/60 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-3 bg-white/60 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
