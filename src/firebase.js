// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAKDH_4lveDVsOHqtv1Hr0Fqe40ciusewQ",
  authDomain: "paint-tracker-97097.firebaseapp.com",
  projectId: "paint-tracker-97097",
  storageBucket: "paint-tracker-97097.firebasestorage.app",
  messagingSenderId: "39753113374",
  appId: "1:39753113374:web:d655721e290a227d29f30f",
  measurementId: "G-0S4QT7H096"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;