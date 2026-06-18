import admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.app();

  const config = process.env.FIREBASE_ADMIN_SDK_JSON
    ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON)
    : null;

  if (!config) throw new Error('FIREBASE_ADMIN_SDK_JSON env var is not set');

  return admin.initializeApp({ credential: admin.credential.cert(config) });
}

export function getAuth() {
  return getAdminApp().auth();
}

export function getFirestore() {
  return getAdminApp().firestore();
}

export default admin;
