/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Scissors, LogIn, LogOut, User, LayoutDashboard, Home, Lock, Facebook, Instagram, Music, Phone as WhatsApp } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  setView: (view: 'home' | 'admin' | 'inventory') => void;
  currentView: 'home' | 'admin' | 'inventory';
}

export function Navbar({ user, onLogin, onLogout, setView, currentView }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/40 backdrop-blur-xl border-b border-white/60 py-3 shadow-lg shadow-rose-200/20" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="bg-rose-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-200">
            P
          </div>
          <span className="text-2xl font-semibold tracking-tight hidden xs:block">Paulis Studio</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest mr-2">
            <button 
              onClick={() => setView('home')}
              className={cn("transition-colors py-1", currentView === 'home' ? "text-rose-600 border-b-2 border-rose-500" : "hover:text-rose-600")}
            >
              Inicio
            </button>
            <button 
              onClick={() => setView('inventory')}
              className={cn("transition-colors py-1", currentView === 'inventory' ? "text-rose-600 border-b-2 border-rose-500" : "hover:text-rose-600")}
            >
              Inventario
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 text-rose-600">
            <span className="text-yellow-500 text-xs shrink-0">★★★★★</span>
            <span className="text-[10px] font-bold">4.9/5</span>
          </div>

          <a 
            href="https://www.facebook.com/people/Paulis-Studio/100063524895646/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-full transition-colors hidden sm:flex"
            title="Síguenos en Facebook"
          >
            <Facebook className="w-5 h-5 fill-current" />
          </a>

          <a 
            href="https://www.tiktok.com/@paulis_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-full transition-colors hidden sm:flex"
            title="Síguenos en TikTok"
          >
            <Music className="w-5 h-5" />
          </a>

          <a 
            href="https://www.instagram.com/paulisstudio_/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-full transition-colors hidden sm:flex"
            title="Síguenos en Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <a 
            href="https://wa.me/573145086329?text=Hola,%20quiero%20agendar%20cita"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-full transition-colors hidden sm:flex"
            title="Agenda por WhatsApp"
          >
            <WhatsApp className="w-5 h-5" />
          </a>

          <div className="h-6 w-[1px] bg-rose-200/50 mx-2" />

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[10px] font-bold uppercase tracking-wider">{user.displayName}</span>
                <span className="text-[9px] text-rose-900/40 font-bold uppercase tracking-tight">Acceso Concedido</span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-full transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.displayName.charAt(0)}
              </div>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center space-x-3 bg-rose-500 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 border border-rose-500/20 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}

          {user?.isAdmin && (
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "p-2.5 rounded-xl transition-colors",
                currentView === 'admin' ? "bg-rose-100 text-rose-600" : "hover:bg-rose-50 text-rose-300"
              )}
              title="Admin"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
