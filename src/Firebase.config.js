import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth"
import { getFirestore, doc, addDoc, query, where, getDoc, getDocs, collection } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyA11_Orf7gStDculreYJlSbrD4ZVPhY9bQ",
    authDomain: "chatapp-4d642.firebaseapp.com",
    projectId: "chatapp-4d642",
    storageBucket: "chatapp-4d642.appspot.com",
    messagingSenderId: "711280795297",
    appId: "1:711280795297:web:e1e9099de3d24df9bc1ae0",
    measurementId: "G-H6FXF5V2JN"
  }

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

export {
  auth,
  getAuth,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  db,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  collection
}