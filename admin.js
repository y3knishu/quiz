import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

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

const emailBox = document.getElementById("adminEmail");

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== "y3knishu@gmail.com") {
    alert("Access denied");
    window.location.href = "admin-login.html";
  } else {
    emailBox.textContent = "👤 Logged in as: " + user.email;
  }
});

window.logout = () => {
  signOut(auth).then(() => window.location.href = "admin-login.html");
};

window.addQuestion = async () => {
  const subject = document.getElementById("subject").value;
  const question = document.getElementById("question").value;
  const options = [
    document.getElementById("optA").value,
    document.getElementById("optB").value,
    document.getElementById("optC").value,
    document.getElementById("optD").value
  ];
  const correct = document.getElementById("correct").value;
  const image = document.getElementById("imgUrl").value;

  if (!subject || !question || options.includes("") || !correct) {
    return alert("Fill all fields properly.");
  }

  await addDoc(collection(db, subject), { question, options, correct, image });
  alert("✅ Question added!");
};

window.loadAllQuestions = async () => {
  const subject = document.getElementById("subject").value;
  const preview = document.getElementById("preview");
  if (!subject) return alert("Select a subject");

  const qSnap = await getDocs(collection(db, subject));
  preview.innerHTML = "";

  qSnap.forEach((docSnap) => {
    const q = docSnap.data();
    const div = document.createElement("div");
    div.className = "question-box";
    div.innerHTML = `
      <b>Q:</b> ${q.question}<br/>
      A: ${q.options[0]}<br/>
      B: ${q.options[1]}<br/>
      C: ${q.options[2]}<br/>
      D: ${q.options[3]}<br/>
      ✅ Correct: ${q.correct}<br/>
      ${q.image ? `<img src="${q.image}" />` : ""}
      <br/>
      <button onclick="deleteQuestion('${subject}', '${docSnap.id}')">🗑 Delete</button>
    `;
    preview.appendChild(div);
  });
};

window.deleteQuestion = async (subject, id) => {
  await deleteDoc(doc(db, subject, id));
  alert("Deleted");
  loadAllQuestions();
};

window.showSummary = async () => {
  const subjects = [
    "Anatomy", "Physiology", "Biochemistry",
    "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine",
    "Community Medicine", "ENT", "Ophthalmology",
    "General Medicine", "General Surgery", "Obstetrics & Gynaecology",
    "Pediatrics", "Orthopaedics", "Dermatology",
    "Psychiatry", "Respiratory Medicine", "Anesthesiology"
  ];

  let report = "📊 Total Questions:\n";
  for (let s of subjects) {
    const snap = await getDocs(collection(db, s));
    report += `${s}: ${snap.size}\n`;
  }
  alert(report);
};

window.exportQuestions = async () => {
  const subject = document.getElementById("subject").value;
  if (!subject) return alert("Select subject");

  const snap = await getDocs(collection(db, subject));
  const questions = [];
  snap.forEach((docSnap) => questions.push(docSnap.data()));

  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${subject}-questions.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importQuestions = () => {
  const subject = document.getElementById("subject").value;
  const fileInput = document.getElementById("importFile");
  if (!subject || !fileInput.files.length) return alert("Choose subject and file");

  const reader = new FileReader();
  reader.onload = async (e) => {
    const questions = JSON.parse(e.target.result);
    for (let q of questions) await addDoc(collection(db, subject), q);
    alert("✅ Imported!");
  };
  reader.readAsText(fileInput.files[0]);
};
