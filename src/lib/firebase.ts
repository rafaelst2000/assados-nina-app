import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAYInE4laY5ZZx82RuymgP2cRCgNeNQyMI",
  authDomain: "assados-da-nina.firebaseapp.com",
  projectId: "assados-da-nina",
  storageBucket: "assados-da-nina.firebasestorage.app",
  messagingSenderId: "550692581031",
  appId: "1:550692581031:web:ea80dbb036e0af4b667582"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
