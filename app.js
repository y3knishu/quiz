import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

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
let startTime = Date.now();
let timerInterval;

const qText = document.getElementById("question-text");
const qImage = document.getElementById("question-image");
const qOptions = document.getElementById("options");
const qNumber = document.getElementById("question-number");
const palette = document.getElementById("palette");
const resultDiv = document.getElementById("result-summary");
const timer = document.getElementById("timer");

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

  if (selectedAnswers[index] !== undefined) {
    const correctIndex = q.answer;
    const selected = selectedAnswers[index].selectedIndex;
    const buttons = qOptions.querySelectorAll("button");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === correctIndex) b.classList.add("correct");
      if (i === selected && selected !== correctIndex) b.classList.add("wrong");
    });
  }

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
  resultDiv.innerHTML = "";
  startTime = Date.now();
}
function submitQuiz() {
  let correct = 0, wrong = 0, attempted = 0;
  selectedAnswers.forEach(a => {
    if (a !== undefined) {
      attempted++;
      if (a.correct) correct++;
      else wrong++;
    }
  });
  const unattempted = questions.length - attempted;
  const score = correct * 4 - wrong;

  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  resultDiv.innerHTML = `
    <h3>Quiz Summary</h3>
    ✅ Correct: ${correct}<br>
    ❌ Wrong: ${wrong}<br>
    ⏳ Unattempted: ${unattempted}<br>
    🧮 Score: ${score} / ${questions.length * 4}<br>
    ⏱️ Time Taken: ${minutes} min ${seconds} sec
  `;

  clearInterval(timerInterval);
  renderPalette();
}

function updateTimer() {
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  timer.textContent = `Time: ${mins}m ${secs}s`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function saveProgress() {
  const key = `progress_${subject}`;
  const summary = {
    attempted: selectedAnswers.filter(a => a !== undefined).length,
    correct: selectedAnswers.filter(a => a && a.correct).length,
    wrong: selectedAnswers.filter(a => a && !a.correct).length,
    total: questions.length,
    answers: selectedAnswers
  };
  localStorage.setItem(key, JSON.stringify(summary));
}

function loadProgress() {
  const key = `progress_${subject}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    const data = JSON.parse(saved);
    selectedAnswers = data.answers || [];
  }
}

async function loadQuiz(subjectName) {
  const docRef = doc(db, "questions", subjectName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    questions = docSnap.data().questions;
    selectedAnswers = new Array(questions.length);
    loadProgress();
    loadQuestion(0);
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    alert("No questions found for this subject.");
  }
}

loadQuiz(subject);

// expose functions
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.resetQuiz = resetQuiz;
window.submitQuiz = submitQuiz;
window.toggleDarkMode = toggleDarkMode;
