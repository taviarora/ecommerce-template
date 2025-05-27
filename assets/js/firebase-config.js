// filepath: /Users/malika/ecommerce-template/assets/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"; // Updated version

const firebaseConfig = {
  apiKey: "AIzaSyBkXcVHDX7LoBpgb011MMtn-kCKQ_7UoFY",
  authDomain: "ecom-template-359ac.firebaseapp.com",
  projectId: "ecom-template-359ac",
  storageBucket: "ecom-template-359ac.firebasestorage.app",
  messagingSenderId: "129533648576",
  appId: "1:129533648576:web:674cb211fa70195b7d5725",
  measurementId: "G-19CDYFQRG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);            // ✅ properly initialize auth
const db = getFirestore(app);         // ✅ initialize Firestore

export { app, auth, db };