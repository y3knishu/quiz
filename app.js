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
  deleteDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
onAuthStateChanged(auth, user => {
  if (user) {
    if (user.email === "y3knishu@gmail.com") {
      showPage(document.getElementById("admin-page"));
    } else {
      showPage(document.getElementById("home-page"));
      loadSubjects(); // if you have a function to populate subjects
    }
  } else {
    showPage(document.getElementById("login-page"));
  }
});
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

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth).then(() => showPage(loginPage));
}

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

const adminDropdown = document.getElementById("admin-subject");
if (adminDropdown) {
  Object.values(subjectsByYear).flat().forEach(sub => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = sub;
    adminDropdown.appendChild(opt);
  });
}

let newQuestions = [];

document.getElementById("add-question").onclick = () => {
  const question = document.getElementById("question-text").value.trim();
  const options = [
    document.getElementById("option0").value.trim(),
    document.getElementById("option1").value.trim(),
    document.getElementById("option2").value.trim(),
    document.getElementById("option3").value.trim()
  ];
  const answer = parseInt(document.getElementById("correct-index").value);
  const image = document.getElementById("image-url").value.trim();

  if (!question || options.some(o => !o) || isNaN(answer) || answer < 0 || answer > 3) {
    alert("Please fill all fields correctly.");
    return;
  }

  newQuestions.push({ question, options, answer, image });
  document.getElementById("question-preview").innerHTML += `<div>✅ ${question}</div>`;

  document.getElementById("question-text").value = "";
  options.forEach((_, i) => document.getElementById("option" + i).value = "");
  document.getElementById("correct-index").value = "";
  document.getElementById("image-url").value = "";
};

document.getElementById("save-questions").onclick = async () => {
  const subject = document.getElementById("admin-subject").value;
  if (newQuestions.length === 0) {
    alert("No questions to save.");
    return;
  }
  try {
    const ref = doc(db, "questions", subject);
    await setDoc(ref, { questions: newQuestions });
    alert("Questions saved successfully!");
    newQuestions = [];
    document.getElementById("question-preview").innerHTML = "";
  } catch (err) {
    alert("Error saving questions: " + err.message);
  }
};

document.getElementById("preview-questions").onclick = async () => {
  const subject = document.getElementById("admin-subject").value;
  const ref = doc(db, "questions", subject);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("No questions in DB for this subject");
  const qlist = snap.data().questions;
  const preview = qlist.map((q, i) => `${i + 1}. ${q.question}`).join("<br>");
  document.getElementById("question-preview").innerHTML = preview;
};

document.getElementById("delete-questions").onclick = async () => {
  const subject = document.getElementById("admin-subject").value;
  const confirmed = confirm("Are you sure you want to delete all questions for " + subject + "?");
  if (!confirmed) return;
  await deleteDoc(doc(db, "questions", subject));
  alert("Questions deleted.");
  document.getElementById("question-preview").innerHTML = "";
};
