import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// O SDK procura credenciais locais via GOOGLE_APPLICATION_CREDENTIALS.
// Também pode usar Application Default Credentials em infraestrutura Google.
export function conectarFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  // O emulador usa projeto fictício demo-* e dispensa credenciais reais.
  const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (emulador && (!projectId || !projectId.startsWith('demo-'))) {
    throw new Error('Para o emulador, use FIREBASE_PROJECT_ID iniciado por demo-.');
  }
  initializeApp({
    ...(emulador ? {} : { credential: applicationDefault() }),
    ...(projectId ? { projectId } : {})
  });
  return getFirestore();
}
