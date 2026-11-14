import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// O SDK procura credenciais locais via GOOGLE_APPLICATION_CREDENTIALS.
// Também pode usar Application Default Credentials em infraestrutura Google.
export function conectarFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  initializeApp({
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {})
  });
  return getFirestore();
}
