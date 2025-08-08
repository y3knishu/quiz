import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

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
const auth = getAuth(app);

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

// Function to save user details to Firestore
async function saveUserDetails(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email,
    name: user.displayName || 'Guest',
    photoURL: user.photoURL || 'default-photo-url',
    lastLogin: new Date(),
    quizProgress: [] 
  }, { merge: true });

  console.log("User details saved to Firestore");
}

// Function to fetch and calculate quiz progress from Firestore
async function getUserProgress(userId, subject) {
  const userProgressRef = doc(db, "user_progress", userId);
  const docSnap = await getDoc(userProgressRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const quizData = data.quizData || [];
    const totalQuestions = questions.length;
    const answered = quizData.filter(item => item.selectedAnswer).length; 

    const progress = (answered / totalQuestions) * 100;
    return progress;
  } else {
    return 0; 
  }
}

// Function to save quiz progress to Firestore
async function saveQuizProgress(userId, quizData) {
  const userProgressRef = doc(db, "user_progress", userId);
  
  await setDoc(userProgressRef, {
    quizData: quizData,
    lastUpdated: new Date()
  }, { merge: true });

  console.log("Quiz progress saved to Firestore");
}

// Function to store quiz data (user's selected answers)
function storeQuizData(userId, questionId, selectedAnswer) {
  const quizData = {
    questionId: questionId,
    selectedAnswer: selectedAnswer
  };

  saveQuizProgress(userId, quizData);
}

// Function to render question palette
function renderPalette() {
  palette.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.onclick = () => loadQuestion(i);
    if (selectedAnswers[i] !== undefined) {
      btn.style.background = selectedAnswers[i].correct ? "#66bb6a" : "#ef5350";
    }
    palette.appendChild(btn);
  });
}

// Function to load question
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

// Function to select an answer
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

// Navigate to previous question
function prevQuestion() {
  if (current > 0) loadQuestion(current - 1);
}

// Navigate to next question
function nextQuestion() {
  if (current < questions.length - 1) loadQuestion(current + 1);
}

// Reset the quiz
function resetQuiz() {
  selectedAnswers = [];
  saveProgress();
  loadQuestion(0);
  resultDiv.innerHTML = "";
  startTime = Date.now();
}

// Submit the quiz and show results
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

  // Time taken calculation
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  // Show quiz results (correct answers, wrong answers, total score, etc.)
  resultDiv.innerHTML = `
    <h3>Quiz Summary</h3>
    <p>✅ Correct: ${correct}</p>
    <p>❌ Wrong: ${wrong}</p>
    <p>⏳ Unattempted: ${unattempted}</p>
    <p>🧮 Score: ${score} / ${questions.length * 4}</p>
    <p>⏱️ Time Taken: ${minutes} min ${seconds} sec</p>
    <canvas id="resultChart" width="300" height="300"></canvas>
  `;

  // Displaying Pie Chart for results
  new Chart(document.getElementById("resultChart"), {
    type: "pie",
    data: {
      labels: ["Correct", "Wrong", "Unattempted"],
      datasets: [{
        data: [correct, wrong, unattempted],
        backgroundColor: ["#66bb6a", "#ef5350", "#ffee58"]
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  // Clear the timer interval once quiz is submitted
  clearInterval(timerInterval);
  renderPalette();
}

// Timer update
function updateTimer() {
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  timer.textContent = `Time: ${mins}m ${secs}s`;
}

// Save progress to localStorage
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

// Load progress from localStorage
function loadProgress() {
  const key = `progress_${subject}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    const data = JSON.parse(saved);
    selectedAnswers = data.answers || [];
  }
}

// Load quiz questions from Firestore
async function loadQuiz() {
  const docRef = doc(db, "questions", subject);
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

// Subject access control with admin override
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid;
    await saveUserDetails(user);
  }

  if (subject === "Anatomy") {
    loadQuiz();
    return;
  }

  if (user) {
    const userId = user.uid;
    const userEmail = user.email;

    if (userEmail === "y3knishu@gmail.com") {
      console.log("✅ Admin override access granted");
      loadQuiz();
      return;
    }

    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().isPaid) {
      loadQuiz();
    } else {
      alert("❌ This subject is locked. Please complete payment to access.");
      window.location.href = "index.html";
    }
  } else {
    alert("❌ Please login to access this subject.");
    window.location.href = "index.html";
  }
});

// Expose functions to window
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.resetQuiz = resetQuiz;
window.submitQuiz = submitQuiz;
