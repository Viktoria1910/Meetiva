import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAt4UUtYHbGE2RizDXB-oivaUz7438isRU",
  authDomain: "meetiva-366d2.firebaseapp.com",
  projectId: "meetiva-366d2",
  storageBucket: "meetiva-366d2.firebasestorage.app",
  messagingSenderId: "247732431497",
  appId: "1:247732431497:web:e2e0f6835f20b7c0f77458"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);