import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, limit, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyATIwjN1-E5jRLG182kaxl93t9zAWaKe0Q",
  authDomain: "my-portfolio-5cd4d.firebaseapp.com",
  projectId: "my-portfolio-5cd4d",
  storageBucket: "my-portfolio-5cd4d.firebasestorage.app",
  messagingSenderId: "330296559133",
  appId: "1:330296559133:web:5662d69b2042765e3168f4",
  measurementId: "G-1NF6V11KZ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, limit, signInWithEmailAndPassword, onAuthStateChanged, signOut, getDoc, setDoc, GoogleAuthProvider, signInWithPopup };
