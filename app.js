// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAMNDoNuqkWfXEGYdwueJb5XTr1ST2ztKc",
  authDomain: "mcqs-96117.firebaseapp.com",
  projectId: "mcqs-96117",
  storageBucket: "mcqs-96117.firebasestorage.app",
  messagingSenderId: "352256319143",
  appId: "1:352256319143:web:74b2bd062a7f2dc5f1c582",
  measurementId: "G-6FZ770H045"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginPage = document.getElementById("login-page");
const homePage = document.getElementById("home-page");
const adminPage = document.getElementById("admin-page");

const emailLoginBtn = document.getElementById("email-login");
const googleLoginBtn = document.getElementById("google-login");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout");
const adminLogoutBtn = document.getElementById("admin-logout");

// Page switching helper
function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  page.classList.remove("hidden");
}

// Auth State Listener
onAuthStateChanged(auth, user => {
  if (user) {
    if (user.email === "y3knishu@gmail.com") {
      showPage(adminPage);
    } else {
      showPage(homePage);
    }
  } else {
    showPage(loginPage);
  }
});

// Email login
emailLoginBtn.onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Email login success"))
    .catch(err => alert("Login failed: " + err.message));
};

// Google login
googleLoginBtn.onclick = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => console.log("Google login success"))
    .catch(err => alert("Google login failed: " + err.message));
};

// Sign up
signupBtn.onclick = () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Signup successful! Now login."))
    .catch(err => alert("Signup failed: " + err.message));
};

// Logout buttons
logoutBtn.onclick = () => signOut(auth);
adminLogoutBtn.onclick = () => signOut(auth);
