/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, setDoc, doc, getDocs } from 'firebase/firestore';
import { Service, OperationType, UserProfile } from '../types';
import { INITIAL_SERVICES } from '../constants';
import { ServiceCard } from './ServiceCard';
import { motion } from 'motion/react';

interface ServicesListProps {
  onBook: (service: Service) => void;
  user: UserProfile | null;
}

export function ServicesList({ onBook, user }: ServicesListProps) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(services.map(s => s.category)))];

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
      console.error("Error fetching services:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredServices = activeCategory === 'Todos' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/30 backdrop-blur-xl rounded-[32px] p-8 border border-white/40 shadow-sm relative overflow-hidden h-[300px]">
            <motion.div 
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
            />
            <div className="h-4 bg-rose-100/30 rounded-lg w-1/4 mb-4 animate-pulse" />
            <div className="h-8 bg-rose-100/50 rounded-lg w-3/4 mb-6 animate-pulse" />
            <div className="h-4 bg-rose-100/30 rounded-lg w-full mb-2 animate-pulse" />
            <div className="h-4 bg-rose-100/30 rounded-lg w-5/6 mb-8 animate-pulse" />
            <div className="flex justify-between items-center mt-auto">
              <div className="h-6 bg-rose-100/50 rounded-lg w-20 animate-pulse" />
              <div className="h-10 bg-rose-100/50 rounded-xl w-32 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' 
                : 'bg-white/40 backdrop-blur-md text-rose-900/40 hover:text-rose-600 border border-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <ServiceCard service={service} onBook={() => onBook(service)} user={user} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
