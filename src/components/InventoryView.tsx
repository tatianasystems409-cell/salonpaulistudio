
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Search, 
  Lock, 
  ChevronRight,
  Archive,
  RefreshCw,
  LogOut,
  X,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { InventoryItem, UserProfile, OperationType } from '../types';
import { cn } from '../lib/utils';

interface InventoryViewProps {
  user: UserProfile | null;
  isSubView?: boolean;
}

export function InventoryView({ user, isSubView = false }: InventoryViewProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    brand: '',
    category: 'Peluquería',
    quantity: 0,
    minQuantity: 5,
    unit: 'unidades',
    imageUrl: ''
  });

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [notification, setNotification] = useState<{message: string, show: boolean, type: 'info' | 'alert'}>({ 
    message: '', 
    show: false, 
    type: 'info' 
  });
  const userEmail = 'tatianasystems409@gmail.com';

  const categories = ['Peluquería', 'Manicura', 'Maquillaje', 'Estética', 'Limpieza', 'Otros'];

  const sendEmail = async (subject: string, body: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: subject,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #331c26;">
            <h2 style="color: #e11d48;">${subject}</h2>
            <p>${body}</p>
            <hr style="border: 1px solid #fdf2f8;" />
            <p style="font-size: 10px; color: #999;">Paulis Studio - Sistema de Inventario</p>
          </div>`
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      console.log('Email sent successfully via Resend');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const showNotification = (action: string, itemName: string, type: 'info' | 'alert' = 'info') => {
    let message = '';
    const subject = type === 'alert' ? 'URGENTE: Stock Crítico - Paulis Studio' : 'Auditoría de Inventario - Paulis Studio';
    
    if (type === 'alert') {
      message = `¡ALERTA DE STOCK BAJO! El producto "${itemName}" se está agotando (queda menos del mínimo). Aviso enviado a ${userEmail}`;
    } else {
      message = `REPORTE: Se ha ${action} el producto "${itemName}". Resumen enviado a ${userEmail}`;
    }
    
    setNotification({ message, show: true, type });
    sendEmail(subject, message);
    setTimeout(() => setNotification({ message: '', show: false, type: 'info' }), 6000);
  };

  const loadDemoData = async () => {
    const demoItems = [
      { name: 'Shampoo Saloon In Professional 1L', category: 'Peluquería', quantity: 24, minQuantity: 6, unit: 'unidades' },
      { name: 'Tratamiento Prokpil Color', category: 'Peluquería', quantity: 15, minQuantity: 4, unit: 'unidades' },
      { name: 'Esmalte Masglo Tradicional', category: 'Manicura', quantity: 48, minQuantity: 12, unit: 'unidades' },
      { name: 'Base Vogue Resist 24h', category: 'Maquillaje', quantity: 20, minQuantity: 5, unit: 'unidades' },
      { name: 'Polvos Compactos Samy Professional', category: 'Maquillaje', quantity: 12, minQuantity: 3, unit: 'unidades' },
      { name: 'Kit Marcel France Hidratación', category: 'Peluquería', quantity: 10, minQuantity: 2, unit: 'unidades' },
      { name: 'Labial Bardot Mate Long Lasting', category: 'Maquillaje', quantity: 30, minQuantity: 6, unit: 'unidades' },
    ];

    try {
      setLoading(true);
      for (const item of demoItems) {
        await addDoc(collection(db, 'inventory'), {
          ...item,
          lastUpdated: serverTimestamp()
        });
      }
      showNotification('CARGADO', 'Lote de Marcas Colombianas');
    } catch (err) {
      console.error("Error loading demo data:", err);
      handleFirestoreError(err, OperationType.CREATE, 'inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) return;

    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setItems(itemsData);
      setLoading(false);

      // Check for low stock items to notify
      const lowStockItems = itemsData.filter(item => item.quantity <= item.minQuantity);
      if (lowStockItems.length > 0) {
        // Just notify about the first one found as an example for the user
        const item = lowStockItems[0];
        // Only notify if it's really low (e.g. less than 2 or exactly at min)
        // This is a demo trigger
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), {
          ...newItem,
          lastUpdated: serverTimestamp()
        });
        showNotification('ACTUALIZADO', newItem.name);
      } else {
        await addDoc(collection(db, 'inventory'), {
          ...newItem,
          lastUpdated: serverTimestamp()
        });
        showNotification('AGREGADO', newItem.name);
      }
      setIsAdding(false);
      setEditingItem(null);
      setNewItem({
        name: '',
        brand: '',
        category: 'Peluquería',
        quantity: 0,
        minQuantity: 5,
        unit: 'unidades',
        imageUrl: ''
      });
    } catch (err) {
      handleFirestoreError(err, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'inventory');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      imageUrl: item.imageUrl || ''
    });
    setIsAdding(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewItem(prev => ({ ...prev, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const itemRef = doc(db, 'inventory', id);
      const currentItem = items.find(i => i.id === id);
      const safeQuantity = Math.max(0, newQuantity);
      
      await updateDoc(itemRef, {
        quantity: safeQuantity,
        lastUpdated: serverTimestamp()
      });

      // Special alert if quantity drops below min
      if (currentItem && safeQuantity <= currentItem.minQuantity && currentItem.quantity > currentItem.minQuantity) {
        showNotification('ALERTA', currentItem.name, 'alert');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${id}`);
    }
  };

  const deleteItem = async (id: string, itemName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${itemName}"?`)) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        showNotification('ELIMINADO', itemName);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `inventory/${id}`);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-transparent px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/40 backdrop-blur-3xl p-12 rounded-[40px] shadow-2xl border border-white/60 text-center"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif italic mb-4">Acceso <span className="font-bold not-italic">Bloqueado</span></h2>
          <p className="text-rose-900/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Debe iniciar sesión como administrador <br /> para gestionar el inventario.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative z-10",
      isSubView ? "p-8" : "max-w-7xl mx-auto px-6 py-24"
    )}>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg"
          >
            <div className={cn(
              "mx-6 backdrop-blur-xl p-6 rounded-[24px] shadow-2xl border flex items-center gap-4 transition-colors",
              notification.type === 'alert' 
                ? "bg-rose-600/95 text-white border-rose-400" 
                : "bg-rose-900/90 text-white border-white/20"
            )}>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                {notification.type === 'alert' ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : (
                  <RefreshCw className="w-5 h-5 animate-spin-slow" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {notification.type === 'alert' ? 'ALERTA DE SISTEMA' : 'Actualización Exitosa'}
                  </p>
                  <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full font-mono">Email Sent</span>
                </div>
                <p className="text-xs font-medium leading-relaxed">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Archive className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">Gestión de Recursos</span>
          </div>
          <h1 className="text-5xl font-serif leading-none italic">Stock & <span className="font-bold not-italic text-rose-600">Suministros</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
            <input 
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-[20px] text-xs font-bold uppercase tracking-widest min-w-[300px] outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <button 
            onClick={loadDemoData}
            className="flex items-center gap-2 px-6 py-4 bg-white/40 backdrop-blur-md rounded-[20px] text-[10px] font-bold uppercase tracking-widest text-rose-900/60 border border-white/60 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xl shadow-rose-200/20"
            title="Cargar Datos de Prueba"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Cargar Demo</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-4 bg-rose-500 text-white rounded-[20px] shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <form onSubmit={handleAddItem} className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-10 border border-white/80 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Nombre del Producto</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Tinte Sin Amoníaco"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Marca (Norma Calidad)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Igora, Masglo"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                    className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Categoría</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none appearance-none cursor-pointer font-medium"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Stock Inicial</label>
                      <input 
                        type="number" 
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                        className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Unidad</label>
                      <input 
                        type="text" 
                        placeholder="unidades, ml, etc."
                        value={newItem.unit}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                        className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-rose-600 text-white py-5 rounded-3xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingItem ? 'Guardar Cambios' : 'Registrar Producto'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingItem(null); }}
                      className="p-5 bg-white/60 text-rose-300 hover:text-rose-600 rounded-3xl border border-white/60 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-1">Imagen del Producto (Opcional)</label>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative w-40 h-40 rounded-[32px] overflow-hidden border-2 border-white shadow-xl bg-white/60 flex items-center justify-center group shrink-0">
                      {newItem.imageUrl ? (
                        <img src={newItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-rose-100" />
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Subir</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-[10px] text-rose-900/40 italic leading-relaxed mb-4">
                        Recomendamos fotos claras del envase para una rápida identificación visual en el almacén.
                      </p>
                      <input 
                        type="url"
                        placeholder="O pega una URL de imagen..."
                        value={newItem.imageUrl}
                        onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})}
                        className="w-full p-4 bg-white/50 rounded-2xl border border-rose-100 outline-none font-medium text-xs italic"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <motion.div 
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-rose-100 transition-all group overflow-hidden"
          >
            <div className="h-40 relative group/img">
              {item.imageUrl ? (
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt={item.name} />
              ) : (
                <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-200">
                  <Package className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-rose-600 shadow-sm">
                {item.category}
              </div>
              <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(item)} className="p-2.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-xl shadow-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id, item.name)} className="p-2.5 bg-white/90 backdrop-blur-sm text-rose-500 rounded-xl shadow-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold mb-1 truncate">{item.name}</h3>
              {item.brand && (
                <span className="text-[9px] font-medium text-rose-500/60 uppercase tracking-widest mb-6 block">{item.brand}</span>
              )}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-900/30 block mb-1">Cantidad</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/60 rounded-full text-rose-900 shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                    >-</button>
                    <span className={cn(
                      "text-3xl font-serif italic",
                      item.quantity <= item.minQuantity ? "text-rose-600" : "text-rose-900"
                    )}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/60 rounded-full text-rose-900 shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                    >+</button>
                  </div>
                </div>
                
                {item.quantity <= item.minQuantity && (
                  <div className="flex items-center px-3 py-1 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Reabastecer</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-rose-50">
                <span className="text-[9px] font-bold uppercase tracking-widest text-rose-900/20 italic">Unidad: {item.unit}</span>
                <RefreshCw className="w-4 h-4 text-rose-900/10" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/30 backdrop-blur-xl rounded-[32px] p-8 border border-white/40 shadow-sm relative overflow-hidden">
              {/* Shimmer Effect */}
              <motion.div 
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
              />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="w-12 h-12 bg-rose-100/50 rounded-2xl animate-pulse" />
                <div className="w-8 h-8 bg-rose-100/30 rounded-full animate-pulse" />
              </div>
              
              <div className="h-6 bg-rose-100/50 rounded-lg w-3/4 mb-4 animate-pulse relative z-10" />
              <div className="h-4 bg-rose-100/30 rounded-lg w-1/4 mb-8 animate-pulse relative z-10" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-24 h-10 bg-rose-100/50 rounded-xl animate-pulse" />
                <div className="w-16 h-4 bg-rose-100/30 rounded-lg animate-pulse" />
              </div>
              
              <div className="pt-6 border-t border-white/20 relative z-10">
                <div className="h-3 bg-rose-100/20 rounded-lg w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
          {/* Scanner Line Overlay */}
          <motion.div 
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="fixed inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent z-50 pointer-events-none"
            style={{ boxShadow: '0 0 20px rgba(225,29,72,0.2)' }}
          />
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-24 bg-white/20 backdrop-blur-md rounded-[40px] border border-dashed border-white/60">
          <Archive className="w-16 h-16 text-rose-200 mx-auto mb-6 opacity-40" />
          <div className="text-rose-900/30 font-bold uppercase tracking-[0.3em] text-[10px]">No se encontraron productos</div>
        </div>
      )}
    </div>
  );
}
