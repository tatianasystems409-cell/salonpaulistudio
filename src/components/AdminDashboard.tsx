/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Appointment, Service } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Trash2, Filter, Scissors, ExternalLink, Package, Archive, Edit3, Save, X, Share2, Mail, MessageSquare } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryView } from './InventoryView';
import { ServiceEditor } from './ServiceEditor';
import { SalonGalleryManager } from './SalonGalleryManager';
import { AppSettingsManager } from './AppSettingsManager';
import { CalendarPicker } from './CalendarPicker';
import { UserProfile } from '../types';
import { Image as ImageIcon, Settings } from 'lucide-react';

export function AdminDashboard({ user }: { user: UserProfile | null }) {
  const [activeTab, setActiveTab] = React.useState<'appointments' | 'inventory' | 'services' | 'gallery' | 'settings'>('appointments');
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Appointment['status'] | 'all' | 'by-date'>('all');
  const [adminSelectedDate, setAdminSelectedDate] = React.useState<Date>(new Date());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Appointment>>({});

  React.useEffect(() => {
    onSnapshot(doc(db, 'app_settings', 'general'), (snapshot) => {
      if (snapshot.exists()) setSettings(snapshot.data());
    });
  }, []);

  React.useEffect(() => {
    if (!user?.isAdmin) return;

    const q = query(collection(db, 'appointments'), orderBy('date', 'desc'), orderBy('time', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      // In Admin view, we still want to show a graceful error instead of crashing
      console.error("Firestore onSnapshot Error:", error);
      // We don't necessarily want to call handleFirestoreError here which throws,
      // but we could if we want the full error info.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const startEditing = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditForm(appointment);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateDoc(doc(db, 'appointments', editingId), {
        ...editForm,
        updatedAt: new Date()
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error al guardar cambios");
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      
      const appointment = appointments.find(a => a.id === id);
      if (appointment && (status === 'confirmed' || status === 'completed')) {
        const statusText = status === 'confirmed' ? 'Confirmada' : 'Completada';
        const message = status === 'confirmed' 
          ? '¡Tu cita ha sido confirmada! Te esperamos en la fecha y hora seleccionada.'
          : '¡Tu cita ha sido completada con éxito! Gracias por confiar en nosotros.';

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: appointment.customerEmail,
            subject: `Cita ${statusText} - Paulis Studio`,
            html: `
              <div style="font-family: serif; padding: 30px; border: 1px solid #fecdd3; border-radius: 40px; background-color: #fff; max-width: 500px; margin: 0 auto; overflow: hidden;">
                ${settings?.emailBanner ? `<img src="${settings.emailBanner}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 20px;" />` : ''}
                <h1 style="color: #e11d48; text-align: center; font-style: italic;">Paulis Studio</h1>
                <h2 style="color: #881337; text-align: center;">Tu cita está ${statusText}</h2>
                <p style="color: #881337; text-align: center;">${message}</p>
                <div style="background-color: #fff1f2; padding: 20px; border-radius: 24px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Servicio:</strong> ${appointment.serviceName}</p>
                  <p style="margin: 5px 0;"><strong>Fecha:</strong> ${appointment.date}</p>
                  <p style="margin: 5px 0;"><strong>Hora:</strong> ${appointment.time}</p>
                </div>
                <p style="text-align: center; color: #fda4af; font-size: 12px; font-style: italic;">¡Gracias por preferirnos!</p>
              </div>
            `
          })
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const appointment = appointments.find(a => a.id === id);
      await deleteDoc(doc(db, 'appointments', id));

      if (appointment) {
        // Notify customer and admin via email
        try {
          const emailHtml = `
            <div style="font-family: serif; padding: 30px; border: 1px solid #fecdd3; border-radius: 40px; background-color: #fff; max-width: 500px; margin: 0 auto; overflow: hidden;">
              ${settings?.emailBanner ? `<img src="${settings.emailBanner}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 20px;" />` : ''}
              <h1 style="color: #e11d48; text-align: center; font-style: italic;">Paulis Studio</h1>
              <h2 style="color: #881337; text-align: center;">Cita Cancelada</h2>
              <p style="color: #881337; text-align: center;">Lamentamos informarte que tu cita ha sido cancelada o eliminada del sistema.</p>
              <div style="background-color: #fff1f2; padding: 20px; border-radius: 24px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Servicio:</strong> ${appointment.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${appointment.date}</p>
                <p style="margin: 5px 0;"><strong>Hora:</strong> ${appointment.time}</p>
              </div>
              <p style="text-align: center; color: #fda4af; font-size: 12px; font-style: italic;">Si crees que esto es un error, por favor contáctanos.</p>
            </div>
          `;

          // Send to Customer
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: appointment.customerEmail,
              subject: 'Cita Cancelada - Paulis Studio',
              html: emailHtml
            })
          });

          // Send to Admin
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'tatianasystems409@gmail.com',
              subject: 'CITA ELIMINADA/CANCELADA - Paulis Studio',
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e11d48; border-radius: 20px;">
                  <h2 style="color: #e11d48;">Cita Eliminada</h2>
                  <p>Se ha eliminado la siguiente reserva:</p>
                  <ul>
                    <li><strong>Cliente:</strong> ${appointment.customerName}</li>
                    <li><strong>Email:</strong> ${appointment.customerEmail}</li>
                    <li><strong>Servicio:</strong> ${appointment.serviceName}</li>
                    <li><strong>Fecha:</strong> ${appointment.date}</li>
                    <li><strong>Hora:</strong> ${appointment.time}</li>
                  </ul>
                </div>
              `
            })
          });
        } catch (emailError) {
          console.error("Non-blocking delete email error:", emailError);
        }
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : filter === 'by-date'
      ? appointments.filter(a => isSameDay(parseISO(a.date), adminSelectedDate))
      : appointments.filter(a => a.status === filter);

  const daysWithAppointments = appointments.map(a => parseISO(a.date));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="w-1/3 h-12 bg-rose-100/50 rounded-2xl animate-pulse" />
          <div className="w-1/4 h-12 bg-rose-100/30 rounded-[24px] animate-pulse" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/30 backdrop-blur-xl rounded-[32px] p-8 border border-white/40 shadow-sm relative overflow-hidden h-32">
              <motion.div 
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
              />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-12 h-12 bg-rose-100/50 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-rose-100/50 rounded-lg w-1/4 animate-pulse" />
                  <div className="h-3 bg-rose-100/30 rounded-lg w-1/6 animate-pulse" />
                </div>
                <div className="w-24 h-4 bg-rose-100/30 rounded-lg animate-pulse" />
                <div className="w-32 h-4 bg-rose-100/30 rounded-lg animate-pulse" />
                <div className="w-20 h-10 bg-rose-100/50 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const shareByWhatsApp = (appointment: Appointment) => {
    const text = `*Paulis Studio - Confirmación de Cita*%0A%0A¡Hola ${appointment.customerName}! Te recordamos tu cita:%0A%0A✨ *Servicio:* ${appointment.serviceName}%0A📅 *Fecha:* ${appointment.date}%0A🕒 *Hora:* ${appointment.time}%0A📍 *Lugar:* Paulis Studio%0A%0A¡Te esperamos con la mejor energía! ✨`;
    window.open(`https://wa.me/${appointment.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const resendEmail = async (appointment: Appointment) => {
    try {
      const statusText = appointment.status === 'confirmed' ? 'Confirmada' : 
                        appointment.status === 'pending' ? 'Pendiente' : 'Completada';
      
      const message = appointment.status === 'confirmed' 
        ? '¡Tu cita ha sido confirmada! Te esperamos en la fecha y hora seleccionada.'
        : appointment.status === 'pending'
        ? 'Estamos revisando tu solicitud de cita. Te avisaremos pronto.'
        : '¡Tu cita ha sido completada con éxito! Gracias por confiar en nosotros.';

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appointment.customerEmail,
          subject: `Recordatorio de Cita: ${statusText} - Paulis Studio`,
          html: `
            <div style="font-family: serif; padding: 30px; border: 1px solid #fecdd3; border-radius: 40px; background-color: #fff; max-width: 500px; margin: 0 auto; overflow: hidden;">
              ${settings?.emailBanner ? `<img src="${settings.emailBanner}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 20px;" />` : ''}
              <h1 style="color: #e11d48; text-align: center; font-style: italic;">Paulis Studio</h1>
              <h2 style="color: #881337; text-align: center;">Recordatorio de tu Cita</h2>
              <p style="color: #881337; text-align: center;">${message}</p>
              <div style="background-color: #fff1f2; padding: 20px; border-radius: 24px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Servicio:</strong> ${appointment.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${appointment.date}</p>
                <p style="margin: 5px 0;"><strong>Hora:</strong> ${appointment.time}</p>
              </div>
              <p style="text-align: center; color: #fda4af; font-size: 12px; font-style: italic;">¡Gracias por preferirnos!</p>
            </div>
          `
        })
      });
      alert('Correo enviado con éxito');
    } catch (error) {
      console.error("Error resending email:", error);
      alert('Error enviando el correo');
    }
  };

  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <div className="min-h-screen bg-[#fffdfd] pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-serif italic text-rose-950">Panel de Control</h1>
              {isSuperAdmin && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-rose-200">
                  Acceso Propietario
                </span>
              )}
            </div>
            <p className="text-rose-900/40 text-[10px] font-bold uppercase tracking-[0.3em] px-1">Gestión Central • Paulis Studio</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            {isSuperAdmin && (
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-md rounded-[20px] text-[10px] font-bold uppercase tracking-widest text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all shadow-sm w-full md:w-auto justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Nueva Pestaña</span>
              </button>
            )}

            <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-white/60 shadow-xl shadow-rose-100 w-full md:w-auto overflow-x-auto">
              <button 
                onClick={() => setActiveTab('appointments')}
                className={cn(
                  "flex items-center gap-2 px-6 md:px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === 'appointments' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600"
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>Citas</span>
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className={cn(
                  "flex items-center gap-2 px-6 md:px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === 'inventory' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600"
                )}
              >
                <Package className="w-4 h-4" />
                <span>Inventario</span>
              </button>
              {isSuperAdmin && (
                <button 
                  onClick={() => setActiveTab('services')}
                  className={cn(
                    "flex items-center gap-2 px-6 md:px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === 'services' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600"
                  )}
                >
                  <Scissors className="w-4 h-4" />
                  <span>Edición de Servicios</span>
                </button>
              )}
              {isSuperAdmin && (
                <button 
                  onClick={() => setActiveTab('gallery')}
                  className={cn(
                    "flex items-center gap-2 px-6 md:px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === 'gallery' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600"
                  )}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Edición de Galería</span>
                </button>
              )}
              {isSuperAdmin && (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "flex items-center gap-2 px-6 md:px-8 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === 'settings' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>Ajustes Generales e Imágenes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'appointments' ? (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Calendar Sidebar */}
              <div className="lg:w-80 space-y-6">
                <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-2 border border-white/60 shadow-lg">
                  <button 
                    onClick={() => setFilter(filter === 'by-date' ? 'all' : 'by-date')}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all text-center",
                      filter === 'by-date' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-rose-900/40 hover:text-rose-600 hover:bg-rose-50"
                    )}
                  >
                    {filter === 'by-date' ? 'Ver Todos los Registros' : 'Filtrar por Calendario'}
                  </button>
                </div>

                <AnimatePresence>
                  {filter === 'by-date' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <CalendarPicker 
                        selectedDate={adminSelectedDate}
                        onDateSelect={(date) => setAdminSelectedDate(date)}
                        highlightDays={daysWithAppointments}
                      />
                      <div className="mt-4 px-6 text-[9px] font-bold uppercase tracking-widest text-rose-900/30 italic text-center">
                        Los puntos indican días con citas
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col space-y-2 bg-white/40 backdrop-blur-md p-4 rounded-[32px] border border-white/60 shadow-lg">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40 mb-2 px-2">Estado</div>
                  <button 
                    onClick={() => setFilter('all')}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                      filter === 'all' ? "bg-rose-100 text-rose-900 shadow-sm" : "text-rose-900/40 hover:text-rose-600 hover:bg-white/40"
                    )}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setFilter('pending')}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                      filter === 'pending' ? "bg-orange-100 text-orange-600 shadow-sm" : "text-rose-900/40 hover:text-orange-500 hover:bg-white/40"
                    )}
                  >
                    Pendientes
                  </button>
                  <button 
                    onClick={() => setFilter('confirmed')}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                      filter === 'confirmed' ? "bg-green-100 text-green-600 shadow-sm" : "text-rose-900/40 hover:text-green-600 hover:bg-white/40"
                    )}
                  >
                    Confirmadas
                  </button>
                  <button 
                    onClick={() => setFilter('completed')}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                      filter === 'completed' ? "bg-blue-100 text-blue-600 shadow-sm" : "text-rose-900/40 hover:text-blue-600 hover:bg-white/40"
                    )}
                  >
                    Completadas
                  </button>
                </div>
              </div>

              {/* Main List */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <motion.div
                          layout
                          key={appointment.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className={cn(
                            "bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 shadow-lg hover:shadow-2xl transition-all",
                            editingId === appointment.id ? "ring-2 ring-rose-500 bg-rose-50/50" : "hover:shadow-rose-200/40"
                          )}
                        >
                          {editingId === appointment.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold uppercase text-rose-400 px-1">Servicio</label>
                                <input 
                                  className="w-full bg-white px-3 py-2 rounded-xl text-sm font-bold border border-rose-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                  value={editForm.serviceName}
                                  onChange={(e) => setEditForm({...editForm, serviceName: e.target.value})}
                                />
                                <input 
                                  type="number"
                                  className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold border border-rose-100"
                                  value={editForm.totalPrice}
                                  onChange={(e) => setEditForm({...editForm, totalPrice: Number(e.target.value)})}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold uppercase text-rose-400 px-1">Fecha y Hora</label>
                                <input 
                                  type="date"
                                  className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-rose-100"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                />
                                <input 
                                  type="time"
                                  className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-rose-100"
                                  value={editForm.time}
                                  onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-bold uppercase text-rose-400 px-1">Cliente</label>
                                <input 
                                  className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-rose-100 font-bold"
                                  value={editForm.customerName}
                                  onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                                />
                                <input 
                                  className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-rose-100"
                                  value={editForm.customerPhone}
                                  onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                                />
                              </div>
                              <div className="flex justify-end gap-3 mt-4 md:mt-0">
                                <button onClick={saveEdit} className="p-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-colors"><Save className="w-6 h-6" /></button>
                                <button onClick={cancelEditing} className="p-3 bg-rose-200 text-rose-600 rounded-2xl hover:bg-rose-300 transition-colors"><X className="w-6 h-6" /></button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                              <div className="md:col-span-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 text-xs font-bold">
                                    {appointment.serviceName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-base leading-tight">{appointment.serviceName}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-rose-900/40 italic">{formatCurrency(appointment.totalPrice)}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="md:col-span-1 space-y-1 px-4 md:border-l border-white/40">
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-900/60">
                                  <Calendar className="w-3.5 h-3.5 mr-2" />
                                  <span>{format(parseISO(appointment.date), "EEE, d MMM", { locale: es })}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-900/60">
                                  <Clock className="w-3.5 h-3.5 mr-2" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>

                              <div className="md:col-span-1 md:border-l border-white/40 pl-6">
                                <div className="font-bold text-sm text-[#331c26]">{appointment.customerName}</div>
                                <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-rose-900/40 mt-0.5 italic">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span>{appointment.customerPhone}</span>
                                </div>
                              </div>

                              <div className="md:col-span-1 flex items-center justify-end space-x-2">
                                <div className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm",
                                  appointment.status === 'pending' && "bg-orange-100 text-orange-600 border border-orange-200",
                                  appointment.status === 'confirmed' && "bg-green-100 text-green-600 border border-green-200",
                                  appointment.status === 'completed' && "bg-blue-100 text-blue-600 border border-blue-200",
                                  appointment.status === 'cancelled' && "bg-red-100 text-red-600 border border-red-200",
                                )}>
                                  {appointment.status}
                                </div>

                                <div className="flex gap-2">
                                  {appointment.status === 'pending' && (
                                    <button 
                                      onClick={() => updateStatus(appointment.id, 'confirmed')}
                                      className="p-2.5 bg-white/40 backdrop-blur-md text-green-600 rounded-xl hover:bg-green-600 hover:text-white border border-green-200 transition-all shadow-sm"
                                      title="Confirmar"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  {appointment.status === 'confirmed' && (
                                    <button 
                                      onClick={() => updateStatus(appointment.id, 'completed')}
                                      className="p-2.5 bg-white/40 backdrop-blur-md text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white border border-blue-200 transition-all shadow-sm"
                                      title="Completada"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => shareByWhatsApp(appointment)}
                                    className="p-2.5 bg-white/40 backdrop-blur-md text-green-500 rounded-xl hover:bg-green-500 hover:text-white border border-green-100 transition-all shadow-sm"
                                    title="Compartir por WhatsApp"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => resendEmail(appointment)}
                                    className="p-2.5 bg-white/40 backdrop-blur-md text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white border border-blue-100 transition-all shadow-sm"
                                    title="Volver a enviar Correo"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => startEditing(appointment)}
                                    className="p-2.5 bg-white/40 backdrop-blur-md text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white border border-rose-100 transition-all shadow-sm"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => deleteAppointment(appointment.id)}
                                    className="p-2.5 bg-white/40 backdrop-blur-md text-red-100 rounded-xl hover:bg-red-500 hover:text-white border border-red-50 transition-all shadow-sm"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-24 bg-white/20 backdrop-blur-md rounded-[40px] border border-dashed border-white/60">
                        <Calendar className="w-16 h-16 text-rose-200 mx-auto mb-6 opacity-40" />
                        <div className="text-rose-900/30 font-bold uppercase tracking-[0.3em] text-[10px]">No hay citas registradas para este filtro</div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'inventory' ? (
          <motion.div
            key="inventory-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-[48px] border border-white/40 overflow-hidden shadow-2xl shadow-rose-200/20">
              <InventoryView user={user} isSubView={true} />
            </div>
          </motion.div>
        ) : activeTab === 'services' ? (
          <motion.div
            key="services-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-[48px] border border-white/40 overflow-hidden shadow-2xl shadow-rose-200/20">
              <ServiceEditor user={user} />
            </div>
          </motion.div>
        ) : activeTab === 'gallery' ? (
          <motion.div
            key="gallery-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-[48px] border border-white/40 overflow-hidden shadow-2xl shadow-rose-200/20">
              <SalonGalleryManager user={user} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-[48px] border border-white/40 overflow-hidden shadow-2xl shadow-rose-200/20">
              <AppSettingsManager user={user} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
