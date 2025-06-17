/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCjF3lHQt0kmr5dILSb4LW67HfKLbd99AM",
  authDomain: "epilhouse-ef35c.firebaseapp.com",
  projectId: "epilhouse-ef35c",
  storageBucket: "epilhouse-ef35c.firebasestorage.app",
  messagingSenderId: "921590450829",
  appId: "1:921590450829:web:575c03c121aa04c3df30c4",
  measurementId: "G-J197ER0NLR",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
