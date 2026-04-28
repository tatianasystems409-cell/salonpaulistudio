/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesList } from './components/ServicesList';
import { BookingModal } from './components/BookingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryView } from './components/InventoryView';
import { LoginModal } from './components/LoginModal';
import { RatingsSection } from './components/RatingsSection';
import { BEAUTY_QUOTES } from './constants/quotes';
import { Footer } from './components/Footer';
import { MissionVision } from './components/MissionVision';
import { SalonGallery } from './components/SalonGallery';
import { CampaignSection } from './components/CampaignSection';
import { Service, UserProfile } from './types';
import { AUTHORIZED_EMAILS, INITIAL_SERVICES } from './constants';
import { LogIn, Calendar, CheckCircle, X, Facebook, MessageCircle, Instagram, Phone as WhatsApp, MapPin, Navigation } from 'lucide-react';

import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { seedSampleData } from './lib/seed';

export default function App() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [currentView, setCurrentView] = React.useState<'home' | 'admin' | 'inventory'>('home');
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase();
        const isAuthorized = email && AUTHORIZED_EMAILS.some(e => e.toLowerCase() === email);
        const isSuperAdmin = email === 'tatianasystems409@gmail.com';
        const isAnonymous = firebaseUser.isAnonymous;

        const isDocente = email?.includes('docente');
        
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 
            (isAnonymous || isDocente ? 'Admin DOCENTE' : (isAuthorized ? 'Admin Paulis' : 'Cliente Paulis')),
          email: firebaseUser.email || (isAnonymous ? 'admin@paulisstudio.com' : 'cliente@paulisstudio.com'),
          photoURL: firebaseUser.photoURL || undefined,
          isAdmin: !!(isAuthorized || isAnonymous),
          isSuperAdmin: isSuperAdmin
        });

        // Seed data if admin
        if (isAuthorized || isAnonymous || isDocente) {
          seedSampleData().catch(console.warn);
        }
      } else if (user?.uid === 'simulated-admin-docente') {
        // Keep simulated user if it exists (manual login fallback)
        return;
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (firebaseUser: any) => {
    if (firebaseUser.uid.startsWith('simulated-admin')) {
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        isAdmin: true
      });
    }
    // Real firebase user handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentView('home');
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
  };

  const handleBookingComplete = () => {
    setSelectedService(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf2f8] text-[#331c26] font-sans selection:bg-rose-500 selection:text-white relative overflow-x-hidden">
      {/* Interactive Glowing Follower */}
      <motion.div 
        animate={{ 
          x: mousePos.x - 200,
          y: mousePos.y - 200,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100, restDelta: 0.001 }}
        className="fixed w-[400px] h-[400px] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none z-0"
      />

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-200 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-300 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-amber-100 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10">
        <Navbar 
          user={user} 
          onLogin={() => setIsLoginOpen(true)} 
          onLogout={handleLogout} 
          setView={setCurrentView}
          currentView={currentView}
        />

        <main>
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Hero onActionClick={() => {
                  const scrollBtn = document.getElementById('services-grid-anchor');
                  if (scrollBtn) {
                    scrollBtn.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    const servicesSection = document.getElementById('services');
                    servicesSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} onDirectBook={() => {
                  handleBookService(INITIAL_SERVICES[0] as Service);
                }} />

                <CampaignSection />

                {/* Beauty Wisdom Section */}
                <div className="py-24 overflow-hidden bg-white/30 backdrop-blur-sm border-y border-white/60">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col items-center">
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                      >
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-500 mb-4 px-4 py-1 border border-rose-200 rounded-full inline-block">Sabiduría de Belleza</h2>
                        <h3 className="text-4xl font-serif italic mt-4">Inspiración para <span className="font-bold not-italic">Tu Día</span></h3>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {BEAUTY_QUOTES.slice(0, 3).map((quote, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/40 backdrop-blur-md p-8 rounded-[32px] border border-white/80 shadow-xl shadow-rose-200/20 flex flex-col justify-between"
                          >
                            <p className="text-lg font-serif italic text-rose-900 leading-relaxed">"{quote.text}"</p>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400 mt-6 block">— {quote.author}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="services" className="max-w-7xl mx-auto px-4 py-20">
                  <div className="text-center mb-16">
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-rose-600 mb-4">Servicios Exclusivos</h2>
                    <h3 className="text-5xl font-serif mb-4 italic">Nuestra <span className="font-bold not-italic">Propuesta</span></h3>
                    <p className="text-rose-900/60 max-w-2xl mx-auto italic leading-relaxed">
                      Realzamos tu belleza natural con técnicas modernas disenadas para transformar tu imagen y bienestar.
                    </p>
                  </div>
                  <ServicesList onBook={handleBookService} user={user} />
                </div>

                <MissionVision />
                <SalonGallery />

                <div id="ratings" className="py-20 bg-rose-50/30">
                  <RatingsSection 
                    user={user} 
                    onLoginRequest={() => setIsLoginOpen(true)} 
                  />
                </div>

                {/* Map Section */}
                <div className="max-w-7xl mx-auto px-4 pb-20">
                  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-rose-600 mb-4">Ubicación</h2>
                        <h3 className="text-4xl font-serif mb-4 italic">¿Dónde <span className="font-bold not-italic">Estamos?</span></h3>
                        <div className="flex items-start space-x-4 text-rose-900/70">
                          <MapPin className="w-6 h-6 shrink-0 text-rose-600" />
                          <p className="italic leading-relaxed">
                            Cra. 15 #7-35, Barrio Libertador <br />
                            Tunja, Boyacá, Colombia
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <a 
                          href="https://www.google.com/maps/dir//Sal%C3%B3n+De+Belleza+Paulis+Studio,+150001,+Cra.+15+%237-35,+Libertador,+Tunja,+Boyac%C3%A1/@6.0267165,-73.6065168,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x8e6a7dbd6aaee909:0x663064971127e27a!2m2!1d-73.3705314!2d5.5217878"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-3 bg-rose-600 text-white px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95"
                        >
                          <Navigation className="w-5 h-5" />
                          <span>Obtener Instrucciones</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/2 h-[400px] rounded-[32px] overflow-hidden shadow-inner border border-white/40 relative">
                      <iframe 
                        title="Ubicación Paulis Studio"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.218!2d-73.3705314!3d5.5217878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7dbd6aaee909%3A0x663064971127e27a!2sSal%C3%B3n%20De%20Belleza%20Paulis%20Studio!5e0!3m2!1ses!2sco!4v1714032000000!5m2!1ses!2sco"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                  </div>
                </div>

                <Footer />
              </motion.div>
            )}
            {currentView === 'admin' && <AdminDashboard key="admin" user={user} />}
            {currentView === 'inventory' && <InventoryView key="inventory" user={user} />}
          </AnimatePresence>
        </main>

        <footer className="bg-white/20 backdrop-blur-md border-t border-white/40 py-12 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl mb-4 italic">Paulis <span className="font-bold not-italic">Studio</span></h3>
              <p className="text-sm text-rose-900/50 italic">
                Belleza y salud en Tunja, Boyacá. <br />
                Cra. 15 #7-35, Libertador.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#331c26]/60 mb-4">Redes Sociales</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/people/Paulis-Studio/100063524895646/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/paulisstudio_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://wa.me/573145086329?text=Hola,%20quiero%20agendar%20cita"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                >
                  <WhatsApp className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#331c26]/60 mb-4">Contacto</h4>
              <p className="text-sm text-rose-900/70 italic">
                Tel: 314 5086329 <br />
                Email: contacto@paulisstudio.com
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#331c26]/60 mb-4">Horarios</h4>
              <p className="text-sm text-rose-900/70 italic">
                Lunes - Sábado: 8:00 AM - 6:30 PM <br />
                Domingos: Cerrado
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-black/5 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            © 2026 Paulis Studio Tunja • Realza tu Esencia
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal 
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService && (
          <BookingModal 
            service={selectedService} 
            user={user}
            onClose={() => setSelectedService(null)}
            onComplete={handleBookingComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 z-50 shadow-rose-200"
          >
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold text-sm uppercase tracking-wider">¡Cita Agendada!</p>
              <p className="text-xs opacity-90 italic">Te hemos enviado un correo.</p>
            </div>
            <button onClick={() => setBookingSuccess(false)}>
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Buttons */}
      <div className="fixed bottom-8 left-8 flex flex-col space-y-4 z-40">
        <motion.a
          href="https://www.facebook.com/people/Paulis-Studio/100063524895646/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all border-4 border-white group relative"
        >
          <div className="absolute left-full ml-4 bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Facebook
          </div>
          <Facebook className="w-6 h-6 fill-current" />
        </motion.a>

        <motion.a
          href="https://www.instagram.com/paulisstudio_/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 transition-all border-4 border-white group relative"
        >
          <div className="absolute left-full ml-4 bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Instagram
          </div>
          <Instagram className="w-6 h-6" />
        </motion.a>

        <motion.a
          href="https://wa.me/573145086329?text=Hola,%20quiero%20agendar%20cita"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-all border-4 border-white group relative"
        >
          <div className="absolute left-full ml-4 bg-white text-green-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            WhatsApp: Agendar Cita
          </div>
          <WhatsApp className="w-6 h-6" />
        </motion.a>
      </div>
    </div>
  );
}
