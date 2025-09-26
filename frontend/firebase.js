

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "food-delivery-e2b1f.firebaseapp.com",
  projectId: "food-delivery-e2b1f",
  storageBucket: "food-delivery-e2b1f.firebasestorage.app",
  messagingSenderId: "1019972029151",
  appId: "1:1019972029151:web:f848395b15c1d42dc5f76a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app,auth} 