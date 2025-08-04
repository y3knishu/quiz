import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get('subject') || 'Anatomy';

let questions = [];
let current = 0;
let selectedAnswers = [];

const qText = document.getElementById("question-text");
const qImage = document.getElementById("question-image");
const qOptions = document.getElementById("options");
const qNumber = document.getElementById("question-number");
const palette = document.getElementById("palette");

function renderPalette() {
  palette.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.onclick = () => loadQuestion(i);
    if (selectedAnswers[i] !== undefined) {
      btn.style.background = selectedAnswers[i].correct ? "#c8e6c9" : "#ffcdd2";
    }
    palette.appendChild(btn);
  });
}

function loadQuestion(index) {
  current = index;
  const q = questions[index];
  qNumber.textContent = `Question ${index + 1}`;
  qText.textContent = q.question;
  qImage.style.display = q.image ? "block" : "none";
  qImage.src = q.image || "";
  qOptions.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i, btn);
    qOptions.appendChild(btn);
  });
  renderPalette();
}

function selectAnswer(selectedIndex, btn) {
  const q = questions[current];
  const isCorrect = selectedIndex === q.answer;
  selectedAnswers[current] = { selectedIndex, correct: isCorrect };

  const buttons = qOptions.querySelectorAll("button");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    if (i === selectedIndex && !isCorrect) b.classList.add("wrong");
  });

  saveProgress();
  renderPalette();
}

function prevQuestion() {
  if (current > 0) loadQuestion(current - 1);
}

function nextQuestion() {
  if (current < questions.length - 1) loadQuestion(current + 1);
}

function resetQuiz() {
  selectedAnswers = [];
  saveProgress();
  loadQuestion(0);
}

async function loadQuiz(subjectName) {
  const docRef = doc(db, "questions", subjectName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    questions = docSnap.data().questions;
    selectedAnswers = new Array(questions.length);
    loadProgress();
    loadQuestion(0);
  } else {
    alert("No questions found for this subject.");
  }
}

async function saveProgress() {
  const summary = {
    attempted: selectedAnswers.filter(a => a !== undefined).length,
    correct: selectedAnswers.filter(a => a && a.correct).length,
    wrong: selectedAnswers.filter(a => a && !a.correct).length,
    total: questions.length,
    timestamp: Date.now()
  };
  try {
    await setDoc(doc(db, "progress", subject), summary);
  } catch (e) {
    console.error("Error saving progress", e);
  }
}

async function loadProgress() {
  const progressDoc = await getDoc(doc(db, "progress", subject));
  if (progressDoc.exists()) {
    console.log("Progress loaded:", progressDoc.data());
  }
}

loadQuiz(subject);
