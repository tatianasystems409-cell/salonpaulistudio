import { collection, addDoc, serverTimestamp, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedSampleData() {
  try {
    // Check services
    const sQ = query(collection(db, 'services'), limit(1));
    const sSnapshot = await getDocs(sQ);
    
    if (sSnapshot.empty) {
      console.log('Seeding initial services...');
      const services = [
        {
          id: 'corte-caballero',
          name: 'Corte Caballero',
          description: 'Corte de cabello clásico o moderno con terminación a navaja.',
          price: 25000,
          duration: 30,
          category: 'Peluquería',
          imageUrl: 'https://images.unsplash.com/photo-1599351431247-f579338cc8b2?auto=format&fit=crop&q=80&w=800'
        },
        {
          id: 'manicura-tradicional',
          name: 'Manicura Tradicional',
          description: 'Limpieza, exfoliación y esmaltado de uñas con técnica tradicional.',
          price: 35000,
          duration: 45,
          category: 'Manicura',
          imageUrl: 'https://images.unsplash.com/photo-1604654894610-df490c9a55af?auto=format&fit=crop&q=80&w=800'
        },
        {
          id: 'maquillaje-social',
          name: 'Maquillaje Social',
          description: 'Sesión de maquillaje profesional para eventos especiales.',
          price: 80000,
          duration: 60,
          category: 'Maquillaje',
          imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800'
        }
      ];

      for (const s of services) {
        await setDoc(doc(db, 'services', s.id), s);
      }
    }

    // Check appointments
    const apptQ = query(collection(db, 'appointments'), limit(1));
    const apptSnapshot = await getDocs(apptQ);
    
    if (apptSnapshot.empty) {
      console.log('Seeding sample appointments...');
      const sampleAppointments = [
        {
          serviceId: 'manicura-tradicional',
          serviceName: 'Manicura Tradicional',
          date: '2026-04-28',
          time: '10:00',
          status: 'confirmed',
          customerName: 'Valentina Rodríguez',
          customerEmail: 'valentina.test@example.com',
          customerPhone: '3101234567',
          totalPrice: 35000
        }
      ];

      for (const appt of sampleAppointments) {
        await addDoc(collection(db, 'appointments'), {
          ...appt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }

    // Check ratings
    const ratingsQ = query(collection(db, 'ratings'), limit(1));
    const ratingsSnapshot = await getDocs(ratingsQ);
    
    if (ratingsSnapshot.empty) {
      const sampleRatings = [
        {
          userId: 'system-seed',
          userName: 'Lucía Fernández',
          userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
          rating: 5,
          comment: 'El mejor servicio de uñas que he tenido. La atención es impecable.',
          createdAt: serverTimestamp()
        }
      ];

      for (const r of sampleRatings) {
        await addDoc(collection(db, 'ratings'), r);
      }
    }
    
    console.log('Seeding check completed.');
  } catch (err: any) {
    // If it's a permission error, we just ignore it for the seed script
    if (err.code === 'permission-denied') {
      console.log('Seed skipped: insufficient permissions (non-admin user).');
    } else {
      console.error('Seed error:', err);
    }
  }
}
