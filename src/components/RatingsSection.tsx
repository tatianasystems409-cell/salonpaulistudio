/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Rating, OperationType, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageCircle, Send, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RatingsSectionProps {
  user: UserProfile | null;
  onLoginRequest: () => void;
}

export function RatingsSection({ user, onLoginRequest }: RatingsSectionProps) {
  const [ratings, setRatings] = React.useState<Rating[]>([]);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

  React.useEffect(() => {
    const q = query(
      collection(db, 'ratings'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ratingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));
      setRatings(ratingsData);
    }, (error) => {
      console.error("Error fetching ratings:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginRequest();
      return;
    }

    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL || null,
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      setComment('');
      setRating(5);
    } catch (error) {
      console.error("Error adding rating:", error);
      handleFirestoreError(error, OperationType.CREATE, 'ratings');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
    : "5.0";

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 bg-white/30 backdrop-blur-md rounded-[48px] border border-white/40 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-300/10 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Rating Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-rose-600 mb-4">Experiencias Paulis</h2>
            <h3 className="text-5xl font-serif mb-4 italic">Califíca<span className="font-bold not-italic">nos</span></h3>
            <p className="text-rose-900/60 leading-relaxed italic mb-4">
              Tu opinión es el pincel que perfecciona nuestro arte. Comparte tu experiencia con nosotros.
            </p>
            {!user && (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full w-fit">
                Debes iniciar sesión con tu cuenta de Google para calificar
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoveredStar ?? rating) >= star 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-rose-200"
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="relative">
              <MessageCircle className="absolute top-6 left-6 w-5 h-5 text-rose-300" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={user ? "Escribe tu reseña aquí..." : "Inicia sesión para dejarnos tu reseña"}
                disabled={submitting}
                className="w-full bg-white/50 border border-white/60 rounded-[32px] pl-16 pr-8 py-6 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all min-h-[160px] text-rose-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex items-center justify-center space-x-3 bg-rose-600 text-white px-10 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>{user ? "Enviar Comentario" : "Ingresar con Gmail"}</span>
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-rose-600">{averageRating}</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${Math.round(Number(averageRating)) >= s ? "fill-yellow-400 text-yellow-400" : "text-rose-200"}`} />
                ))}
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-900/40">
              {ratings.length} Reseñas totales
            </div>
          </div>

          <div className="mb-6">
            <a 
              href="https://share.google/HBcyWfgiQaJ5YrJxU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              Ver todas las calificaciones certificadas
            </a>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {ratings.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/40 p-6 rounded-[28px] border border-white/60 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 border border-white flex items-center justify-center shadow-inner">
                        {rev.userPhoto ? (
                          <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-rose-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-900">{rev.userName}</div>
                        <div className="text-[9px] text-rose-900/40 uppercase tracking-widest">
                          {rev.createdAt?.toDate ? format(rev.createdAt.toDate(), "d 'de' MMMM", { locale: es }) : "Reciente"}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${rev.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-rose-100"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-rose-900/70 italic leading-relaxed pl-1">
                    "{rev.comment}"
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {ratings.length === 0 && (
              <div className="text-center py-20 text-rose-900/20 italic">
                Aún no hay reseñas. ¡Sé la primera persona en calificarnos!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
