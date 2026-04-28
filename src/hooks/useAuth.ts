/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, signInWithCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCredentialResponse = async (response: any) => {
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("GIS Sign-In Error:", error);
    }
  };

  useEffect(() => {
    // Initializing One Tap if client ID is available
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    
    if (clientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: true
      });
      window.google.accounts.id.prompt();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || undefined,
          isAdmin: adminDoc.exists() || firebaseUser.email === 'tatianasystems409@gmail.com' // Bootstrapped admin
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, loginWithGoogle, logout };
}
