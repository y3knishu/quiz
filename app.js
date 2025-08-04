// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

// DOM Elements
const loginPage = document.getElementById("login-page");
const homePage = document.getElementById("home-page");
const quizPage = document.getElementById("quiz-page");
const adminPage = document.getElementById("admin-page");

function showPage(page) {
  [loginPage, homePage, quizPage, adminPage].forEach(p => p.classList.add("hidden"));
  page.classList.remove("hidden");
}

// Login logic
const emailLoginBtn = document.getElementById("email-login");
const googleLoginBtn = document.getElementById("google-login");
const signupBtn = document.getElementById("signup-btn");

emailLoginBtn.onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Email login success"))
    .catch(error => alert("Login failed: " + error.message));
};

googleLoginBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => console.log("Google login success"))
    .catch(error => alert("Google login failed: " + error.message));
};

signupBtn.onclick = () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account created! You are now logged in."))
    .catch(error => alert("Signup failed: " + error.message));
};

// Logout
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth).then(() => showPage(loginPage));
}

// Auth State
onAuthStateChanged(auth, async user => {
  if (user) {
    if (user.email === "y3knishu@gmail.com") {
      showPage(adminPage);
    } else {
      showPage(homePage);
      loadSubjects();
    }
  } else {
    showPage(loginPage);
  }
});

// Subjects
const subjectsByYear = {
  "1st Year": ["Anatomy", "Physiology", "Biochemistry"],
  "2nd Year": ["Pathology", "Pharmacology", "Microbiology", "Forensic Medicine"],
  "3rd Year": ["Community Medicine", "ENT", "Ophthalmology"],
  "Final Year": ["General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Orthopaedics", "Dermatology", "Psychiatry", "Respiratory Medicine", "Anesthesiology"]
};

async function loadSubjects() {
  const grid = document.getElementById("subjects-grid");
  grid.innerHTML = "";
  for (let year in subjectsByYear) {
    const h3 = document.createElement("h3");
    h3.textContent = year;
    h3.className = "year-heading";
    grid.appendChild(h3);
    const row = document.createElement("div");
    row.className = "subject-row";
    for (let sub of subjectsByYear[year]) {
      const card = document.createElement("div");
      card.className = "subject-card";
      card.innerHTML = `<strong>${sub}</strong><br/><button class='start-btn'>Start</button>`;
      card.querySelector(".start-btn").onclick = () => startQuiz(sub);
      row.appendChild(card);
    }
    grid.appendChild(row);
  }
}

// Admin upload JSON
const uploadBtn = document.getElementById("upload-json");
if (uploadBtn) {
  uploadBtn.onclick = async () => {
    const subject = document.getElementById("admin-subject").value;
    const jsonText = document.getElementById("bulk-json").value;
    try {
      const questions = JSON.parse(jsonText);
      const ref = doc(db, "questions", subject);
      await setDoc(ref, { questions });
      alert("Questions uploaded!");
    } catch (err) {
      alert("Invalid JSON");
    }
  };
}

// Load admin subject dropdown
const adminDropdown = document.getElementById("admin-subject");
if (adminDropdown) {
  Object.values(subjectsByYear).flat().forEach(sub => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = sub;
    adminDropdown.appendChild(opt);
  });
}

// Quiz logic
let currentQuestionIndex = 0;
let currentSubject = "";
let questions = [];

async function startQuiz(subject) {
  currentSubject = subject;
  const ref = doc(db, "questions", subject);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("No questions found");
  questions = snap.data().questions;
  currentQuestionIndex = 0;
  showPage(quizPage);
  renderQuestion();
  renderPalette();
}

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  const container = document.getElementById("question-container");
  container.innerHTML = `<div><strong>Q${currentQuestionIndex + 1}:</strong> ${q.question}</div>`;
  if (q.image) container.innerHTML += `<img src='${q.image}' alt='question image' />`;
  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = opt;
    div.onclick = () => validateAnswer(i, div, q.answer);
    container.appendChild(div);
  });
}

function validateAnswer(index, el, correctIndex) {
  const options = document.querySelectorAll(".option");
  options.forEach((opt, i) => {
    opt.classList.remove("correct", "wrong");
    if (i === correctIndex) opt.classList.add("correct");
    else if (i === index) opt.classList.add("wrong");
  });
}

function renderPalette() {
  const palette = document.getElementById("palette-container");
  palette.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.onclick = () => {
      currentQuestionIndex = i;
      renderQuestion();
    };
    palette.appendChild(btn);
  }
}

// Retry and back buttons
const retryBtn = document.getElementById("retry-quiz");
if (retryBtn) retryBtn.onclick = () => startQuiz(currentSubject);
const backBtn = document.getElementById("back-home");
if (backBtn) backBtn.onclick = () => showPage(homePage);
const adminLogout = document.getElementById("admin-logout");
if (adminLogout) adminLogout.onclick = () => signOut(auth);
