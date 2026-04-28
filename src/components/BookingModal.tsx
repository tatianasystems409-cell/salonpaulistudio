/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, UserProfile, Appointment } from '../types';
import { X, Calendar, Clock, User, Mail, Phone, ArrowLeft, Check, Download, Share2, Scissors } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { addDays, format, isAfter, startOfDay, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPicker } from './CalendarPicker';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { OperationType } from '../types';
import { BEAUTY_QUOTES } from '../constants/quotes';
import { toJpeg } from 'html-to-image';

interface BookingModalProps {
  service: Service;
  user: UserProfile | null;
  onClose: () => void;
  onComplete: () => void;
}

export function BookingModal({ service, user, onClose, onComplete }: BookingModalProps) {
  const [step, setStep] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = React.useState<string>('');
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = React.useState(false);
  const [customerInfo, setCustomerInfo] = React.useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: ''
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [appointmentId, setAppointmentId] = React.useState<string | null>(null);
  const [randomQuote, setRandomQuote] = React.useState(BEAUTY_QUOTES[0]);
  const [settings, setSettings] = React.useState<any>(null);

  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRandomQuote(BEAUTY_QUOTES[Math.floor(Math.random() * BEAUTY_QUOTES.length)]);
    
    getDoc(doc(db, 'app_settings', 'general')).then(snap => {
      if (snap.exists()) setSettings(snap.data());
    });
  }, []);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const downloadJPG = async () => {
    if (cardRef.current === null) return;
    try {
      // Ensure the capture looks good by adding temporary padding if needed
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 1, 
        backgroundColor: '#fff',
        pixelRatio: 2, // Higher quality
      });
      const link = document.createElement('a');
      link.download = `Cita-PaulisStudio-${customerInfo.name.replace(/\s+/g, '-')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error sharing/downloading:', err);
      alert('Hubo un problema al generar la imagen. Intenta de nuevo.');
    }
  };

  React.useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate) return;
      setLoadingAvailability(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('date', '==', selectedDate),
          where('status', '!=', 'cancelled')
        );
        const snapshot = await getDocs(q);
        const booked = snapshot.docs.map(doc => doc.data().time);
        setBookedSlots(booked);
      } catch (error) {
        console.error("Error checking availability:", error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedTime || !customerInfo.name || !customerInfo.email || !customerInfo.phone) return;

    setSubmitting(true);
    try {
      // Final re-check to avoid race conditions
      const q = query(
        collection(db, 'appointments'),
        where('date', '==', selectedDate),
        where('time', '==', selectedTime),
        where('status', '!=', 'cancelled')
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        alert('Este horario acaba de ser reservado. Por favor selecciona otro.');
        setBookedSlots(prev => [...prev, selectedTime]);
        setSelectedTime('');
        setStep(1); // Go back to step 1
        setSubmitting(false);
        return;
      }

      const appointmentData: Omit<Appointment, 'id'> = {
        userId: user?.uid,
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        totalPrice: service.price,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      setAppointmentId(docRef.id);

      // We'll advance to step 4 first to enable image capture after rendering
      setStep(4);

      // Small delay to ensure step 4 card is rendered
      setTimeout(async () => {
        if (cardRef.current) {
          try {
            const dataUrl = await toJpeg(cardRef.current, { quality: 0.8, backgroundColor: '#fff' });
            const base64Content = dataUrl.split(',')[1];

            // Notify customer and admin via email
            const emailHtml = `
              <div style="font-family: serif; padding: 30px; border: 1px solid #fecdd3; border-radius: 40px; background-color: #fff; max-width: 500px; margin: 0 auto; overflow: hidden;">
                ${settings?.emailBanner ? `<img src="${settings.emailBanner}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 20px;" />` : ''}
                <div style="text-align: center; border-bottom: 1px solid #fff1f2; padding-bottom: 20px; margin-bottom: 20px;">
                  <h1 style="color: #e11d48; margin: 0; font-size: 24px; font-style: italic;">Paulis Studio</h1>
                  <p style="color: #fda4af; margin: 5px 0 0; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">Comprobante de Reserva</p>
                </div>
                
                <p style="color: #881337;">Hola <strong>${customerInfo.name}</strong>,</p>
                <p style="color: #881337; line-height: 1.6;">Tu reserva ha sido confirmada. Hemos adjuntado tu comprobante en este correo.</p>
                
                <div style="background-color: #fff1f2; padding: 25px; border-radius: 24px; margin: 20px 0; text-align: center;">
                   <p style="margin: 0; color: #e11d48; font-style: italic; font-size: 18px;">"${randomQuote.text}"</p>
                   <p style="margin: 10px 0 0; color: #fda4af; font-size: 10px; font-weight: bold; text-transform: uppercase;">— ${randomQuote.author}</p>
                </div>

                <div style="background-color: #fef2f2; padding: 20px; border-radius: 16px; margin: 20px 0;">
                  <p style="margin: 5px 0; font-size: 12px;"><strong>Servicio:</strong> ${service.name}</p>
                  <p style="margin: 5px 0; font-size: 12px;"><strong>Fecha:</strong> ${format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}</p>
                  <p style="margin: 5px 0; font-size: 12px;"><strong>Hora:</strong> ${selectedTime}</p>
                </div>

                <p style="text-align: center; color: #fda4af; font-size: 11px; font-style: italic; margin-top: 30px;">
                  ¡Gracias por elegirnos! Nos vemos pronto.
                </p>
              </div>
            `;

            // Send to Customer
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: customerInfo.email,
                subject: 'Confirmación de Cita - Paulis Studio',
                attachments: [
                  {
                    filename: 'comprobante-reserva.jpg',
                    content: base64Content,
                  }
                ],
                html: emailHtml
              })
            });

            // Send to Admin
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: 'tatianasystems409@gmail.com',
                subject: 'NUEVA CITA REGISTRADA - Paulis Studio',
                html: `
                  <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e11d48; border-radius: 20px;">
                    <h2 style="color: #e11d48;">¡Nueva Cita Registrada!</h2>
                    <p>Se ha creado una nueva reserva en el sistema:</p>
                    <ul>
                      <li><strong>Cliente:</strong> ${customerInfo.name}</li>
                      <li><strong>Email:</strong> ${customerInfo.email}</li>
                      <li><strong>Teléfono:</strong> ${customerInfo.phone}</li>
                      <li><strong>Servicio:</strong> ${service.name}</li>
                      <li><strong>Fecha:</strong> ${selectedDate}</li>
                      <li><strong>Hora:</strong> ${selectedTime}</li>
                    </ul>
                    <p>Revisa el Panel Administrativo para más detalles.</p>
                  </div>
                `
              })
            });
          } catch (err) {
            console.error("Error capturing or sending image:", err);
          }
        }
      }, 500);

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white/80 max-h-[95vh] flex flex-col"
      >
        {/* Sticky Header */}
        <div className="shrink-0 p-6 md:p-8 border-b border-rose-100 flex items-center justify-between bg-white/40">
          <h2 className="text-2xl font-serif italic italic font-light leading-none">
            {step === 4 ? '¡Todo Listo!' : 'Agendar'} <span className="font-bold not-italic">{step === 4 ? 'Confirmación' : 'Cita'}</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full transition-colors group" title="Cerrar">
            <X className="w-6 h-6 text-rose-300 group-hover:text-rose-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          {/* Stepper Header */}
          {step < 4 && (
            <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2 shrink-0">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold uppercase tracking-widest transition-colors",
                    step >= i ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-white/40 text-rose-900/40"
                  )}>
                    {step > i ? <Check className="w-4 h-4" /> : i}
                  </div>
                  {i < 3 && <div className={cn("w-6 h-[1.5px]", step > i ? "bg-rose-500" : "bg-white/40")} />}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60">
                    <div>
                      <div className="font-bold text-base">{service.name}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-rose-900/40">{service.duration} min</div>
                    </div>
                    <div className="font-serif italic text-xl text-rose-600">{formatCurrency(service.price)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform scale-[0.9] origin-top-left">
                    <CalendarPicker 
                      selectedDate={parseISO(selectedDate)}
                      onDateSelect={(date) => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                      minDate={new Date()}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-rose-900/40 px-1">
                      Horarios {format(parseISO(selectedDate), "d MMM", { locale: es })}
                    </div>
                    
                    {loadingAvailability ? (
                      <div className="h-40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {timeSlots.map((time) => {
                          const isBooked = bookedSlots.includes(time);
                          return (
                            <button
                              key={time}
                              disabled={isBooked}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border",
                                selectedTime === time 
                                  ? "bg-rose-500 text-white shadow-xl shadow-rose-200 border-rose-500" 
                                  : isBooked 
                                    ? "bg-rose-50 text-rose-200 border-rose-100 cursor-not-allowed italic"
                                    : "bg-white/40 text-rose-900/40 hover:bg-white/60 border-white/60"
                              )}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  disabled={!selectedTime}
                  onClick={nextStep}
                  className="w-full mt-8 bg-rose-500 text-white py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all disabled:opacity-50 active:scale-95"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button onClick={prevStep} className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-rose-600 mb-2 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-rose-900/60 mb-1.5 px-1">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-200" />
                      <input 
                        type="text"
                        placeholder="Tu nombre"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full pl-10 p-3 bg-white/40 rounded-[16px] border border-white/60 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-rose-900/60 mb-1.5 px-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-200" />
                      <input 
                        type="tel"
                        placeholder="314 ..."
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full pl-10 p-3 bg-white/40 rounded-[16px] border border-white/60 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-rose-900/60 mb-1.5 px-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-200" />
                      <input 
                        type="email"
                        placeholder="tu@email.com"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full pl-10 p-3 bg-white/40 rounded-[16px] border border-white/60 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
                  onClick={nextStep}
                  className="w-full mt-6 bg-rose-500 text-white py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-rose-200 transition-all disabled:opacity-50"
                >
                  Ver Resumen
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={prevStep} className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-rose-600 mb-4 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver
                </button>

                <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 space-y-4 border border-white/80 shadow-lg">
                  <div className="flex justify-between border-b border-rose-100 pb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-900/30">Servicio</span>
                    <span className="font-bold text-sm italic">{service.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-rose-100 pb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-900/30">Fecha</span>
                    <span className="font-bold text-sm italic">{format(parseISO(selectedDate), "EEE, d 'de' MMM", { locale: es })}</span>
                  </div>
                  <div className="flex justify-between border-b border-rose-100 pb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-900/30">Hora</span>
                    <span className="font-bold text-sm italic">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-lg font-serif italic self-end">Total</span>
                    <span className="text-2xl font-bold italic text-rose-600">{formatCurrency(service.price)}</span>
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="w-full mt-6 bg-rose-500 text-white py-5 rounded-[24px] text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirmar Reserva</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-100">
                  <Check className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-serif italic mb-4">¡Cita <span className="font-bold not-italic">Confirmada!</span></h3>
                
                <div className="bg-rose-50 p-6 rounded-3xl mb-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Scissors className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-serif italic text-rose-800 relative z-10">"{randomQuote.text}"</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400 mt-2 relative z-10">— {randomQuote.author}</p>
                </div>

                <p className="text-rose-900/60 mb-8 italic">
                  Te hemos enviado un correo electrónico con los detalles y tu comprobante adjunto.
                </p>

                <div 
                  ref={cardRef}
                  className="bg-white p-8 rounded-[32px] shadow-lg border border-rose-100 text-left mb-8 max-w-sm mx-auto"
                >
                  <div className="text-center mb-6">
                    <h4 className="font-serif text-xl italic text-rose-600">Paulis Studio</h4>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-rose-300">Reserva de Cita</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-rose-50 pb-2">
                       <span className="text-[8px] font-bold uppercase text-rose-300 tracking-widest">Cliente</span>
                       <span className="text-xs font-bold text-rose-900">{customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-rose-50 pb-2">
                       <span className="text-[8px] font-bold uppercase text-rose-300 tracking-widest">Servicio</span>
                       <span className="text-xs font-bold text-rose-900">{service.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-rose-50 pb-2">
                       <span className="text-[8px] font-bold uppercase text-rose-300 tracking-widest">Fecha</span>
                       <span className="text-xs font-bold text-rose-900">{format(parseISO(selectedDate), "d 'de' MMMM", { locale: es })}</span>
                    </div>
                    <div className="flex justify-between border-b border-rose-50 pb-2">
                       <span className="text-[8px] font-bold uppercase text-rose-300 tracking-widest">Hora</span>
                       <span className="text-xs font-bold text-rose-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                       <span className="text-xs font-serif italic text-rose-900">Total</span>
                       <span className="text-lg font-bold text-rose-600">{formatCurrency(service.price)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-[7px] font-bold uppercase tracking-widest text-rose-300">Presenta este comprobante al llegar</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={downloadJPG}
                    className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 text-rose-900 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/60 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar JPG</span>
                  </button>
                  <button 
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="flex-1 bg-rose-500 text-white px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
