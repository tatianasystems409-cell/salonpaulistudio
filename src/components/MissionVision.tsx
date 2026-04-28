
import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Sparkles } from 'lucide-react';

export function MissionVision() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="w-3 h-3" />
            <span>Nuestra Esencia</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif italic text-rose-950"
          >
            Más que un salón, <span className="font-bold not-italic">una experiencia de amor propio</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-rose-50/50 backdrop-blur-sm p-12 rounded-[48px] border border-rose-100/50 hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-rose-100 mb-8">
              <Target className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-rose-950 mb-6">Nuestra Misión</h3>
            <p className="text-rose-900/70 leading-relaxed text-lg italic">
              "En Paulis Studio, nuestra misión es transformar la belleza cotidiana en un ritual de empoderamiento. Nos dedicamos a brindar servicios de alta calidad con un toque humano, utilizando nuestra creatividad para que cada persona que nos visite se sienta renovada, segura y profundamente valorada."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-rose-50/50 backdrop-blur-sm p-12 rounded-[48px] border border-rose-100/50 hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-rose-100 mb-8">
              <Eye className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-rose-950 mb-6">Nuestra Visión</h3>
            <p className="text-rose-900/70 leading-relaxed text-lg italic">
              "Para el 2030, Paulis Studio será reconocido como el referente líder en bienestar y estética integral en nuestra región. Soñamos con ser un santuario donde la innovación técnica y la calidez colombiana se unan para inspirar confianza y proyectar la mejor versión de cada ser humano."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
