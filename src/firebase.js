import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your friend's web app Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmNw5IQm6cHv5zaAeXaqhK39gSHXmZVrw",
  authDomain: "post-surgery-care-portal-2c2a9.firebaseapp.com",
  projectId: "post-surgery-care-portal-2c2a9",
  storageBucket: "post-surgery-care-portal-2c2a9.firebasestorage.app",
  messagingSenderId: "706495297441",
  appId: "1:706495297441:web:f94076f0485fbbbd1ebde0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Database and Authentication tools so your UI can use them
export const db = getFirestore(app);
export const auth = getAuth(app);