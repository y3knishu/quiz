// admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const loginBtn = document.getElementById("login");
const adminSection = document.getElementById("admin-section");

loginBtn.onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Login successful"))
    .catch(err => alert("Login failed: " + err.message));
};

onAuthStateChanged(auth, async user => {
  if (user && user.email === "y3knishu@gmail.com") {
    adminSection.style.display = "block";
  } else {
    adminSection.style.display = "none";
  }
});

document.getElementById("upload").onclick = async () => {
  const question = document.getElementById("question").value;
  const options = [
    document.getElementById("opt1").value,
    document.getElementById("opt2").value,
    document.getElementById("opt3").value,
    document.getElementById("opt4").value
  ];
  const answer = parseInt(document.getElementById("answer").value);
  const image = document.getElementById("image").value;
  const subject = document.getElementById("subject").value;

  const docRef = doc(db, "questions", subject);
  try {
    await setDoc(docRef, { questions: [] }, { merge: true });
    await updateDoc(docRef, {
      questions: arrayUnion({ question, options, answer, image })
    });
    alert("Question uploaded successfully!");
  } catch (err) {
    alert("Error uploading: " + err.message);
  }
};
