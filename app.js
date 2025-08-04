import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Firebase Configuration
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
const db = getFirestore(app);

// ✅ Subjects
const subjects = [
  "Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology",
  "Microbiology", "Forensic Medicine", "Community Medicine", "ENT", "Ophthalmology",
  "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics",
  "Orthopaedics", "Dermatology", "Psychiatry", "Respiratory Medicine", "Anesthesiology"
];

// ✅ Elements
const subjectsGrid = document.getElementById("subjects-grid");
const quizPage = document.createElement("div");
quizPage.id = "quiz-page";
document.body.appendChild(quizPage);

// ✅ Render Subject Cards
function showSubjectCards() {
  subjectsGrid.innerHTML = "";
  subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.textContent = subject;
    btn.onclick = () => loadQuiz(subject);
    subjectsGrid.appendChild(btn);
  });
}

let currentSubject = "";
let questions = [];
let answers = {};
let currentIndex = 0;

// ✅ Load Quiz
async function loadQuiz(subject) {
  currentSubject = subject;
  const docRef = doc(db, "questions", subject);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return alert("No questions for " + subject);
  questions = docSnap.data().questions || [];
  answers = {};
  currentIndex = 0;
  renderQuizUI();
}

// ✅ Render UI
function renderQuizUI() {
  quizPage.innerHTML = "";
  quizPage.style.display = "block";
  subjectsGrid.style.display = "none";

  const q = questions[currentIndex];
  const imageHTML = q.image ? `<img src="${q.image}" width="200" /><br/>` : "";
  const qBox = document.createElement("div");
  qBox.innerHTML = `<h3>Q${currentIndex + 1}: ${q.question}</h3>${imageHTML}`;

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.style.margin = "4px";
    btn.onclick = () => validateAnswer(i, q.answer, btn);

    if (answers[currentIndex] !== undefined) {
      btn.disabled = true;
      if (i === q.answer) btn.style.background = "green";
      if (i === answers[currentIndex] && i !== q.answer) btn.style.background = "red";
    }

    qBox.appendChild(btn);
  });

  quizPage.appendChild(qBox);
  renderPalette();
  renderNavigation();
}

// ✅ Validate Answer
function validateAnswer(selected, correct, btn) {
  answers[currentIndex] = selected;
  renderQuizUI();
}

// ✅ Palette
function renderPalette() {
  const palette = document.createElement("div");
  palette.innerHTML = "<h4>Question Palette</h4>";

  questions.forEach((_, i) => {
    const b = document.createElement("button");
    b.textContent = i + 1;
    b.style.margin = "2px";
    if (answers[i] !== undefined) b.style.background = "orange";
    b.onclick = () => { currentIndex = i; renderQuizUI(); };
    palette.appendChild(b);
  });

  quizPage.appendChild(palette);
}

// ✅ Navigation
function renderNavigation() {
  const nav = document.createElement("div");

  if (currentIndex > 0) {
    const prev = document.createElement("button");
    prev.textContent = "Previous";
    prev.onclick = () => { currentIndex--; renderQuizUI(); };
    nav.appendChild(prev);
  }

  if (currentIndex < questions.length - 1) {
    const next = document.createElement("button");
    next.textContent = "Next";
    next.onclick = () => { currentIndex++; renderQuizUI(); };
    nav.appendChild(next);
  }

  const submit = document.createElement("button");
  submit.textContent = "Submit";
  submit.onclick = showScore;
  nav.appendChild(submit);

  const reset = document.createElement("button");
  reset.textContent = "Reset";
  reset.onclick = () => { answers = {}; currentIndex = 0; renderQuizUI(); };
  nav.appendChild(reset);

  const back = document.createElement("button");
  back.textContent = "Back to Subjects";
  back.onclick = () => {
    quizPage.style.display = "none";
    subjectsGrid.style.display = "block";
  };
  nav.appendChild(back);

  quizPage.appendChild(nav);
}

// ✅ Show Score
function showScore() {
  let correct = 0, attempted = 0;
  questions.forEach((q, i) => {
    if (answers[i] !== undefined) {
      attempted++;
      if (answers[i] === q.answer) correct++;
    }
  });
  const wrong = attempted - correct;
  alert(`📊 Attempted: ${attempted} | ✅ Correct: ${correct} | ❌ Wrong: ${wrong}`);
}

// ✅ Init
showSubjectCards();
