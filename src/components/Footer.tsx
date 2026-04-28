/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scissors, Facebook, Instagram, Music, Phone as WhatsApp, MapPin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-white/40 backdrop-blur-xl border-t border-white/60 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-200">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl italic">Paulis <span className="font-bold not-italic">Studio</span></span>
            </div>
            <p className="text-rose-900/60 leading-relaxed italic max-w-md">
              Donde la belleza se encuentra con el arte. Especialistas en realzar tu esencia natural con técnicas vanguardistas y atención personalizada.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-600">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-rose-900/70 italic leading-relaxed">
                  Cra. 15 #7-35, Barrio Libertador<br />
                  Tunja, Boyacá
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <WhatsApp className="w-5 h-5 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-rose-900/70 italic">+57 314 508 6329</span>
              </li>
            </ul>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-600">Horarios</h4>
            <ul className="space-y-2 text-xs italic text-rose-900/70">
              <li>Lunes - Sábado</li>
              <li className="font-bold not-italic text-rose-900">8:00 AM - 7:00 PM</li>
              <li className="pt-2">Domingos y Festivos</li>
              <li className="font-bold not-italic text-rose-900">Previa Cita</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-rose-100 pt-10 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">
              © {currentYear} Paulis Studio. Todos los derechos reservados.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
              Propiedad Intelectual de TATIANASYSTEMS
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <a href="https://www.facebook.com/people/Paulis-Studio/100063524895646/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/60 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-white" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@paulis_studio" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/60 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-white" title="TikTok">
                <Music className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/paulisstudio_/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/60 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-white" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/573145086329" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/60 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-white" title="WhatsApp">
                <WhatsApp className="w-4 h-4" />
              </a>
            </div>
            
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40 hover:text-rose-600 transition-colors">
              Habeas Data / Privacidad
            </a>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-rose-900/40 border-l border-rose-100 pl-6">
              <span>Hecho con</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>para gente extraordinaria</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
