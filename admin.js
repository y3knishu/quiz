import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
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

// ✅ Restrict access to admin email only
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== "y3knishu@gmail.com") {
    alert("Access denied");
    window.location.href = "admin-login.html";
  } else {
    document.getElementById("adminEmail").textContent = "Logged in as: " + user.email;
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
  const correct = document.getElementById("correct").value.toUpperCase();
  const image = document.getElementById("imgUrl").value;

  if (!subject || !question || options.includes("") || !"ABCD".includes(correct)) {
    return alert("Please fill all fields and a valid correct answer (A/B/C/D)");
  }

  try {
    await addDoc(collection(db, subject), { question, options, correct, image });
    alert("✅ Question added!");
    document.getElementById("question").value = "";
    document.getElementById("optA").value = "";
    document.getElementById("optB").value = "";
    document.getElementById("optC").value = "";
    document.getElementById("optD").value = "";
    document.getElementById("correct").value = "";
    document.getElementById("imgUrl").value = "";
  } catch (err) {
    alert("❌ Error adding question: " + err.message);
  }
};
