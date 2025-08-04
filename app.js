import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc
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

const loginPage = document.getElementById('login-page');
const homePage = document.getElementById('home-page');
const quizPage = document.getElementById('quiz-page');
const adminPage = document.getElementById('admin-page');

function showPage(page) {
  [loginPage, homePage, quizPage, adminPage].forEach(p => p.classList.add('hidden'));
  page.classList.remove('hidden');
  page.classList.add('visible');
}

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    if (user.email === "y3knishu@gmail.com") {
      showPage(adminPage);
    } else {
      showPage(homePage);
    }
  } else {
    showPage(loginPage);
  }
});

document.getElementById("google-login").onclick = () => signInWithPopup(auth, provider);
document.getElementById("email-login").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password);
};

document.getElementById("logout").onclick = () => signOut(auth);
document.getElementById("admin-logout").onclick = () => signOut(auth);

let currentUser = null;
let subjects = [];

fetch("subjects.json")
  .then(res => res.json())
  .then(data => {
    subjects = data;
    populateSubjectGrid();
    populateAdminDropdown();
  });

function populateSubjectGrid() {
  const grid = document.getElementById("subjects-grid");
  grid.innerHTML = "";
  subjects.forEach(subj => {
    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerText = `${subj.name} (${subj.year})`;
    card.onclick = () => loadSubjectQuiz(subj.id, subj.name);
    grid.appendChild(card);
  });
}

function populateAdminDropdown() {
  const dropdown = document.getElementById("admin-subject");
  subjects.forEach(subj => {
    const opt = document.createElement("option");
    opt.value = subj.id;
    opt.textContent = subj.name;
    dropdown.appendChild(opt);
  });
}

document.getElementById("upload-json").onclick = async () => {
  const jsonText = document.getElementById("bulk-json").value;
  const subject = document.getElementById("admin-subject").value;
  if (!jsonText || !subject) return alert("Please select subject and paste JSON.");

  let questions;
  try {
    questions = JSON.parse(jsonText);
  } catch (e) {
    return alert("Invalid JSON format");
  }

  for (let q of questions) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, "subjects", subject, "questions", id), q);
  }

  alert("Questions uploaded successfully!");
};

let currentQuestions = [];
let currentSubjectId = "";
let currentAnswers = {};

async function loadSubjectQuiz(subjectId, subjectName) {
  currentSubjectId = subjectId;
  currentAnswers = {};
  document.getElementById("quiz-subject").textContent = subjectName;

  const qsnap = await getDocs(collection(db, "subjects", subjectId, "questions"));
  currentQuestions = qsnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  renderQuestion(0);
  renderPalette();
  showPage(quizPage);
}

function renderQuestion(index) {
  const q = currentQuestions[index];
  const container = document.getElementById("question-container");
  container.innerHTML = `<h3>Q${index + 1}. ${q.questionText}</h3>`;

  if (q.imageUrl) {
    const img = document.createElement("img");
    img.src = q.imageUrl;
    container.appendChild(img);
  }

  q.options.forEach((opt, i) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt;
    if (currentAnswers[index] !== undefined) {
      if (i === q.correctIndex) btn.classList.add("correct");
      else if (i === currentAnswers[index]) btn.classList.add("wrong");
    }
    btn.onclick = () => {
      if (currentAnswers[index] !== undefined) return;
      currentAnswers[index] = i;
      renderQuestion(index);
      renderPalette();
    };
    container.appendChild(btn);
  });
}

function renderPalette() {
  const palette = document.getElementById("palette-container");
  palette.innerHTML = "";
  currentQuestions.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.textContent = idx + 1;
    btn.style.margin = "5px";
    if (currentAnswers[idx] !== undefined) {
      if (currentAnswers[idx] === currentQuestions[idx].correctIndex)
        btn.style.background = "#2ecc71";
      else btn.style.background = "#e74c3c";
    }
    btn.onclick = () => renderQuestion(idx);
    palette.appendChild(btn);
  });
}

document.getElementById("submit-quiz").onclick = async () => {
  let correct = 0, wrong = 0;
  currentQuestions.forEach((q, i) => {
    if (currentAnswers[i] === q.correctIndex) correct++;
    else if (currentAnswers[i] !== undefined) wrong++;
  });

  await setDoc(doc(db, "userProgress", auth.currentUser.email), {
    [currentSubjectId]: { attempted: currentQuestions.length, correct, wrong }
  }, { merge: true });

  alert(`Submitted!\nCorrect: ${correct}\nWrong: ${wrong}`);
};

document.getElementById("retry-quiz").onclick = () => {
  loadSubjectQuiz(currentSubjectId, document.getElementById("quiz-subject").textContent);
};

document.getElementById("back-home").onclick = () => {
  showPage(homePage);
};
