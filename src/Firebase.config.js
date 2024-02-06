import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA11_Orf7gStDculreYJlSbrD4ZVPhY9bQ",
    authDomain: "chatapp-4d642.firebaseapp.com",
    projectId: "chatapp-4d642",
    storageBucket: "chatapp-4d642.appspot.com",
    messagingSenderId: "711280795297",
    appId: "1:711280795297:web:e1e9099de3d24df9bc1ae0",
    measurementId: "G-H6FXF5V2JN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);