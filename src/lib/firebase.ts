/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OperationType, FirestoreErrorInfo } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity Check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

testConnection();

export function handleFirestoreError(error: any, operation: OperationType, path: string | null = null): never {
  const authUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: operation,
    path,
    authInfo: {
      userId: authUser?.uid || 'unauthenticated',
      email: authUser?.email || '',
      emailVerified: authUser?.emailVerified || false,
      isAnonymous: authUser?.isAnonymous || false,
      tenantId: null,
      providerInfo: authUser?.providerData.map(p => ({
        providerId: p.providerId,
        email: p.email || ''
      })) || []
    }
  };
  
  console.error("Firestore Error:", errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}
