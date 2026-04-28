
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, LogIn, AlertCircle, Chrome } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AUTHORIZED_EMAILS } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid automatic login with wrong account
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email?.toLowerCase();
      const isAuthorized = email && AUTHORIZED_EMAILS.some(e => e.toLowerCase() === email);
      
      if (isAuthorized) {
        console.log('Admin login detected:', email);
      }
      
      onLoginSuccess(result.user);
      onClose();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana de inicio de sesión. Por favor, permita las ventanas emergentes.');
      } else {
        setError('Error al iniciar sesión con Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const normalizedUser = username.trim().toUpperCase();
    
    if (normalizedUser === 'DOCENTECUN' && password === '26V01') {
      try {
        // Try anonymous sign-in, if skip if it fails (not enabled in console)
        let result;
        try {
          result = await signInAnonymously(auth);
          onLoginSuccess({
            uid: result.user.uid,
            displayName: 'Admin DOCENTE',
            email: 'admin@paulisstudio.com',
            isAdmin: true
          });
        } catch (anonErr) {
          console.warn("Anonymous login failed (provider likely disabled):", anonErr);
          // Mock login for UI development if Firebase is not fully configured
          onLoginSuccess({
            uid: 'simulated-admin-docente',
            displayName: 'Admin DOCENTE (Mock)',
            email: 'admin@paulisstudio.com',
            isAdmin: true
          });
        }
        
        onClose();
        setUsername('');
        setPassword('');
      } catch (err) {
        console.error("Login Error:", err);
        setError('Error al iniciar sesión');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Credenciales de administrador incorrectas');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-rose-900/20 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white/80 backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl border border-white/60"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-rose-200">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif italic mb-2">Iniciar <span className="font-bold not-italic">Sesión</span></h2>
              <p className="text-rose-900/40 text-[10px] font-bold uppercase tracking-widest text-center px-4">
                Usa tu cuenta de Google autorizada o tus credenciales de estudio
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/60 mb-2 px-1">Usuario</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-white/40 backdrop-blur-md rounded-[20px] border border-white/60 focus:ring-2 focus:ring-rose-500/20 font-bold text-sm outline-none transition-all"
                  placeholder="DIGITE USUARIO"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-900/60 mb-2 px-1">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-white/40 backdrop-blur-md rounded-[20px] border border-white/60 focus:ring-2 focus:ring-rose-500/20 font-bold text-sm outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 text-[10px] font-bold uppercase tracking-tight">{error}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-500 text-white py-5 rounded-[24px] text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rose-100"></div>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-white/80 px-4 text-rose-300">O continuar con</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white border border-rose-100 text-rose-900 py-4 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-100/50 active:scale-95"
              >
                <Chrome className="w-4 h-4 text-rose-500" />
                <span>Continuar con Google</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
