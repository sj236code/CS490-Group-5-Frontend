// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlBuTQOu_Ti2cIx0ftZMVCx8TukJkPHsc",
  authDomain: "jade-f1fd9.firebaseapp.com",
  projectId: "jade-f1fd9",
  storageBucket: "jade-f1fd9.firebasestorage.app",
  messagingSenderId: "1071705465101",
  appId: "1:1071705465101:web:50495b357e5140d0b4d044",
  measurementId: "G-V3CSWQZLT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
export default app;