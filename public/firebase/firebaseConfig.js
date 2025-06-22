import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkT9CfMw2m5atezryS54Jn6dqc1_GxCak",
  authDomain: "ressonancia-a0e74.firebaseapp.com",
  projectId: "ressonancia-a0e74",
  storageBucket: "ressonancia-a0e74.appspot.com",
  messagingSenderId: "374621132978",
  appId: "1:374621132978:web:58c81a608a4570c34651ab",
  measurementId: "G-QJ76HPBPF4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
