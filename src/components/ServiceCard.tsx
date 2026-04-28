/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Service, UserProfile } from '../types';
import { formatCurrency } from '../lib/utils';
import { Clock, Star, ArrowRight, Edit3 } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBook: () => void;
  user?: UserProfile | null;
}

export function ServiceCard({ service, onBook, user }: ServiceCardProps) {
  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <div className="group bg-white/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/60 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-200/40 hover:-translate-y-2 relative">
      {isSuperAdmin && (
        <div className="absolute top-8 right-8 z-20">
          <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-2 animate-pulse">
            <Edit3 className="w-3 h-3 text-rose-600" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-600">Modo Edición</span>
          </div>
        </div>
      )}
      <div className="relative h-64 overflow-hidden p-3 pb-0">
        <img 
          src={service.imageUrl} 
          alt={service.name} 
          className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200">
          {service.category}
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-yellow-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-rose-900/40">
            <Clock className="w-3 h-3" />
            <span>{service.duration} min</span>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-3 group-hover:text-rose-600 transition-colors">{service.name}</h3>
        <p className="text-rose-900/60 text-sm mb-6 line-clamp-2 italic">{service.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-rose-900/30 text-[10px] font-bold uppercase tracking-widest block">Inversión</span>
            <span className="text-xl font-bold italic">{formatCurrency(service.price)}+</span>
          </div>
          <button 
            onClick={onBook}
            className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-90"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
