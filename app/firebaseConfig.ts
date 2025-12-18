import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCzXoNaa8UKO9VfYzs1QfECFBzKeYcIeZ8",
  authDomain: "jewelrystore-1e634.firebaseapp.com",
  projectId: "jewelrystore-1e634",
  storageBucket: "jewelrystore-1e634.firebasestorage.app",
  messagingSenderId: "1031967144798",
  appId: "1:1031967144798:web:80b22296e7db8686582dcf",
  measurementId: "G-HN11HD4B6M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);