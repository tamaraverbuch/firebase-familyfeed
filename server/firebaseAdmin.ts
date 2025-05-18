
import * as admin from 'firebase-admin';


const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.warn(`Environment variable ${name} is not set!`);
    return '';
  }
  return value;
};


if (!admin.apps.length) {
  try {
    const serviceAccountString = getEnv('FIREBASE_SERVICE_ACCOUNT_KEY');
    const storageBucket = getEnv('FIREBASE_STORAGE_BUCKET');
    
    if (serviceAccountString) {
      
      const serviceAccount = JSON.parse(serviceAccountString);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket || undefined
      });
      
      console.log("Firebase Admin initialized successfully with service account");
    } else {
      // for local development or if no service account is provided
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}


const adminAuth = admin.auth();
const adminFirestore = admin.firestore();
const adminStorage = admin.storage();

export { admin, adminAuth, adminFirestore, adminStorage };