/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtohNEmKNXHT8GE9-mm9mRJepyOweD_po",
  authDomain: "epilhouse-1a923.firebaseapp.com",
  projectId: "epilhouse-1a923",
  storageBucket: "epilhouse-1a923.firebasestorage.app",
  messagingSenderId: "89507374295",
  appId: "1:89507374295:web:4b52394cb50abeef6d7c92",
  measurementId: "G-EE94QKSZ38",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
