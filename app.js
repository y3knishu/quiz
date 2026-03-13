import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMNDoNuqkWfXEGYdwueJb5XTr1ST2ztKc",
  authDomain: "mcqs-96117.firebaseapp.com",
  projectId: "mcqs-96117",
  storageBucket: "mcqs-96117.firebasestorage.app",
  messagingSenderId: "352256319143",
  appId: "1:352256319143:web:74b2bd062a7f2dc5f1c582"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.auth = auth;
window.db = db;

const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get("subject") || "Anatomy";

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

const expBox = document.getElementById("explanation-box");
const expTitle = document.getElementById("explanation-title");
const expText = document.getElementById("explanation-text");
const expImage = document.getElementById("explanation-image");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    alert("Please login first");
    window.location.href = "index.html";
    return;
  }

  console.log("UID:", user.uid);

  await loadQuiz(subject, user.uid);

});

function renderPalette() {

  palette.innerHTML = "";

  questions.forEach((_, i) => {

    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.onclick = () => loadQuestion(i);

    if (selectedAnswers[i]) {
      btn.style.background =
        selectedAnswers[i].correct ? "#66bb6a" : "#ef5350";
    }

    palette.appendChild(btn);

  });

}

function loadQuestion(index) {

  if (index < 0 || index >= questions.length) return;

  current = index;

  const q = questions[index];

  qNumber.textContent = `Question ${index + 1}`;
  qText.textContent = q.question;

  qImage.style.display = q.image ? "block" : "none";
  qImage.src = q.image || "";

  qOptions.innerHTML = "";

  expBox.style.display = "none";
  expTitle.style.display = "none";
  expText.innerHTML = "";
  expImage.style.display = "none";

  q.options.forEach((opt, i) => {

    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);

    qOptions.appendChild(btn);

  });

  if (selectedAnswers[index]) {

    const correctIndex = q.answer;
    const selected = selectedAnswers[index].selectedIndex;

    const buttons = qOptions.querySelectorAll("button");

    buttons.forEach((b, i) => {

      b.disabled = true;

      if (i === correctIndex) b.classList.add("correct");

      if (i === selected && selected !== correctIndex)
        b.classList.add("wrong");

    });

    showExplanation(q);

  }

  renderPalette();

}

function selectAnswer(selectedIndex) {

  const q = questions[current];

  const isCorrect = selectedIndex === q.answer;

  selectedAnswers[current] = {
    selectedIndex,
    correct: isCorrect
  };

  const buttons = qOptions.querySelectorAll("button");

  buttons.forEach((b, i) => {

    b.disabled = true;

    if (i === q.answer) b.classList.add("correct");

    if (i === selectedIndex && !isCorrect)
      b.classList.add("wrong");

  });

  showExplanation(q);

  const user = auth.currentUser;

  if (user) saveProgress(user.uid);

  renderPalette();

}

function showExplanation(q) {

  expBox.style.display = "block";
  expTitle.style.display = "block";

  expText.innerHTML = q.explanation || "No explanation available.";

  if (q.explanation_image) {

    expImage.src = q.explanation_image;
    expImage.style.display = "block";

  } else {

    expImage.style.display = "none";

  }

}

function prevQuestion() {

  if (current > 0) loadQuestion(current - 1);

}

function nextQuestion() {

  if (current < questions.length - 1) loadQuestion(current + 1);

}

function resetQuiz() {

  selectedAnswers = new Array(questions.length);

  const user = auth.currentUser;

  if (user) saveProgress(user.uid);

  loadQuestion(0);

  resultDiv.innerHTML = "";

  startTime = Date.now();

}

function submitQuiz(){

  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  selectedAnswers.forEach(a=>{
    if(a){
      attempted++;
      if(a.correct) correct++;
      else wrong++;
    }
  });

  const unattempted = questions.length - attempted;
  const score = correct*4 - wrong;

  resultDiv.innerHTML = `
  <h3>Quiz Summary</h3>
  <p>Correct: ${correct}</p>
  <p>Wrong: ${wrong}</p>
  <p>Unattempted: ${unattempted}</p>
  <p>Score: ${score}</p>
  `;

}

async function saveProgress(userId){

  try{

    const key = `progress_${subject}`;

    const cleanedAnswers = selectedAnswers.map(a => a || null);

    const summary = {

      attempted: cleanedAnswers.filter(a=>a).length,
      correct: cleanedAnswers.filter(a=>a && a.correct).length,
      wrong: cleanedAnswers.filter(a=>a && !a.correct).length,
      currentQuestion: current,
      answers: cleanedAnswers,
      timestamp: new Date().toISOString()

    };

    const ref = doc(db,"user_progress",userId);

    await setDoc(ref,{[key]:summary},{merge:true});

    console.log("Progress saved");

    /* update homepage instantly */

    localStorage.setItem(`progress_${subject}`,JSON.stringify(summary));

  }catch(err){

    console.error("Firestore save error:",err);

  }

}

async function loadProgress(userId){

  const key = `progress_${subject}`;

  const ref = doc(db,"user_progress",userId);

  const snap = await getDoc(ref);

  if(snap.exists()){

    const saved = snap.data()[key];

    if(saved){

      selectedAnswers = saved.answers || [];
      current = saved.currentQuestion || 0;

    }

  }

}

async function loadQuiz(subjectName,userId){

  const ref = doc(db,"questions",subjectName);

  const snap = await getDoc(ref);

  if(!snap.exists()){

    alert("No questions found");

    return;

  }

  questions = snap.data().questions;

  await loadProgress(userId);

  if(!selectedAnswers || selectedAnswers.length !== questions.length){

    selectedAnswers = new Array(questions.length);

  }

  if(current >= questions.length) current = 0;

  loadQuestion(current);

  timerInterval = setInterval(updateTimer,1000);

}

function updateTimer(){

  const diff = Math.floor((Date.now()-startTime)/1000);

  const mins = Math.floor(diff/60);

  const secs = diff%60;

  timer.textContent = `Time: ${mins}m ${secs}s`;

}

window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.resetQuiz = resetQuiz;
window.submitQuiz = submitQuiz;
