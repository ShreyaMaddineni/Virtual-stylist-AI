// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ✅ added

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBIggRc7u3FKl1xjGOl--6Nu5p1qYXKy0w",
  authDomain: "virtual-stylist-62aa8.firebaseapp.com",
  projectId: "virtual-stylist-62aa8",
  storageBucket: "virtual-stylist-62aa8.appspot.com",
  messagingSenderId: "621316014314",
  appId: "1:621316014314:web:de39f566b7438490fa1793",
  measurementId: "G-H6LQ2BZGS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ This is what you use in Signup/Login files
export const auth = getAuth(app);



