// ✅ Final updated app.js with Firebase-only progress tracking, admin override, mobile fixes, vibrant UI compatibility

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMNDoNuqkWfXEGYdwueJb5XTr1ST2ztKc",
  authDomain: "mcqs-96117.firebaseapp.com",
  projectId: "mcqs-96117",
  storageBucket: "mcqs-96117.appspot.com",
  messagingSenderId: "352256319143",
  appId: "1:352256319143:web:74b2bd062a7f2dc5f1c582",
  measurementId: "G-6FZ770H045"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const subject = urlParams.get('subject');

let questions = [];
let currentQuestion = 0;
let score = 0;
let correct = 0;
let wrong = 0;
let startTime;
let answered = [];
let attempted = [];

const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
const retryBtn = document.getElementById("retryBtn");
const palette = document.getElementById("palette");
const imageContainer = document.getElementById("questionImage");
const returnBtn = document.getElementById("returnHome");

function loadQuestion(index) {
  const q = questions[index];
  questionText.textContent = `${index + 1}. ${q.question}`;
  imageContainer.innerHTML = q.image ? `<img src="${q.image}" class="q-image">` : "";
  optionsContainer.innerHTML = "";
  q.options.forEach((option, i) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option");
    if (answered[index] !== undefined) {
      button.disabled = true;
      if (i === q.answer) {
        button.classList.add("correct");
      }
      if (i === answered[index] && i !== q.answer) {
        button.classList.add("wrong");
      }
    }
    button.onclick = () => {
      if (answered[index] === undefined) {
        answered[index] = i;
        attempted[index] = true;
        if (i === q.answer) {
          score += 4;
          correct++;
        } else {
          score -= 1;
          wrong++;
        }
        loadQuestion(index);
        updatePalette();
      }
    };
    optionsContainer.appendChild(button);
  });
  updateButtons();
}

function updateButtons() {
  prevBtn.style.display = currentQuestion > 0 ? "inline-block" : "none";
  nextBtn.style.display = currentQuestion < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = answered.length > 0 ? "inline-block" : "none";
}

function updatePalette() {
  palette.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    if (answered[i] !== undefined) {
      btn.classList.add("answered");
    }
    btn.onclick = () => {
      currentQuestion = i;
      loadQuestion(i);
    };
    palette.appendChild(btn);
  });
}

function showSummary() {
  document.querySelector(".quiz-container").style.display = "none";
  document.getElementById("summary").style.display = "block";
  document.getElementById("summaryText").innerHTML = `✅ Correct: ${correct}<br>❌ Wrong: ${wrong}<br>📌 Unattempted: ${questions.length - (correct + wrong)}<br>🎯 Score: ${score}`;
  const percent = Math.round((correct + wrong) / questions.length * 100);
  document.getElementById("chart").innerHTML = `<svg viewBox="0 0 36 36" class="circular-chart green">
    <path class="circle-bg" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831A15.9155 15.9155 0 0 1 18 2.0845" />
    <path class="circle" stroke-dasharray="${percent}, 100" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831A15.9155 15.9155 0 0 1 18 2.0845" />
    <text x="18" y="20.35" class="percentage">${percent}%</text>
  </svg>`;
}

async function saveProgress() {
  const user = auth.currentUser;
  if (!user) return;
  const total = questions.length;
  const attemptedCount = attempted.filter(x => x).length;
  const correctCount = correct;
  const wrongCount = wrong;
  await setDoc(doc(db, "user_progress", `${user.uid}_${subject}`), {
    attempted: attemptedCount,
    correct: correctCount,
    wrong: wrongCount,
    total: total
  }, { merge: true });
}

nextBtn.onclick = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion(currentQuestion);
  }
};

prevBtn.onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion(currentQuestion);
  }
};

submitBtn.onclick = async () => {
  await saveProgress();
  showSummary();
};

retryBtn.onclick = () => window.location.reload();
returnBtn.onclick = () => window.location.href = "index.html";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userEmail = user.email;
    if (userEmail === "y3knishu@gmail.com") {
      loadQuiz(subject);
      return;
    }
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().isPaid) {
      loadQuiz(subject);
    } else {
      alert("❌ This subject is locked. Please complete payment to access.");
      window.location.href = "index.html";
    }
  } else {
    if (subject === "Anatomy") {
      loadQuiz(subject);
    } else {
      alert("❌ Please login to access this subject.");
      window.location.href = "index.html";
    }
  }
});

async function loadQuiz(subject) {
  try {
    const ref = doc(db, "questions", subject);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("No questions found");
    questions = snap.data().questions;
    if (!questions || questions.length === 0) throw new Error("Empty question set");
    startTime = new Date();
    loadQuestion(0);
    updatePalette();
    document.querySelector(".quiz-container").style.display = "block";
  } catch (e) {
    alert("Failed to load questions: " + e.message);
    console.error(e);
  }
}
