import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const subjects = [
  "Anatomy", "Physiology", "Biochemistry",
  "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine",
  "Community Medicine", "ENT", "Ophthalmology",
  "General Medicine", "General Surgery", "Obstetrics & Gynaecology",
  "Pediatrics", "Orthopaedics", "Dermatology",
  "Psychiatry", "Respiratory Medicine", "Anesthesiology"
];

let isPaid = false;
let userId = null;
let currentUser = null;

const userInfo = document.getElementById("user-info");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const payBtn = document.getElementById("payBtn");

function renderSubjects() {
  const container = document.getElementById("subject-container");
  container.innerHTML = "";
  subjects.forEach(subject => {
    const card = document.createElement("a");
    card.className = "card";
    const isFree = subject === "Anatomy";
    const locked = !isFree && !isPaid;
    card.classList.toggle("locked", locked);
    card.innerHTML = `
      <div class="card-title">${subject}</div>
      <div class="card-sub">${locked ? "🔒 Locked" : "✅ Open"}</div>
    `;
    if (!locked) {
      card.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
    } else {
      card.onclick = (e) => {
        e.preventDefault();
        alert("🔒 This subject is locked. Please login and pay ₹99 to unlock all subjects.");
      };
    }
    container.appendChild(card);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userId = user.uid;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    userInfo.textContent = `👋 ${user.email}`;

    const statusSpan = document.createElement("div");
    statusSpan.style.fontSize = "0.85em";
    statusSpan.style.marginTop = "4px";

    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      console.log("Payment status from Firestore:", snap.data());
      if (snap.exists() && snap.data().isPaid) {
        isPaid = true;
        payBtn.style.display = "none";
        statusSpan.textContent = "🟢 Full Access Unlocked (Paid)";
        statusSpan.style.color = "#00cc66";
      } else {
        isPaid = false;
        payBtn.style.display = "inline-block";
        statusSpan.textContent = "🔴 Limited Access (Only Anatomy Free)";
        statusSpan.style.color = "#ff6666";
      }
    } catch (e) {
      console.warn("Error checking payment status:", e);
    }

    userInfo.appendChild(statusSpan);
    renderSubjects();
  } else {
    currentUser = null;
    userInfo.textContent = "🔐 Not logged in";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    isPaid = false;
    payBtn.style.display = "inline-block";
    renderSubjects();
  }
});

loginBtn.onclick = () => {
  window.location.href = "admin-login.html";
};

logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    alert("Logged out");
    window.location.reload();
  });
};

payBtn.onclick = function () {
  if (!currentUser) {
    alert("🔐 Please login first to make payment.");
    return;
  }
  const options = {
    key: "rzp_live_7nZptAUoDrsfRb",
    amount: 9900,
    currency: "INR",
    name: "NEET PG Quiz",
    description: "Unlock all subjects",
    handler: async function (response) {
      alert("✅ Payment successful! ID: " + response.razorpay_payment_id);
      console.log("Saving isPaid: true to Firestore for", userId);
      try {
        await setDoc(doc(db, "users", userId), { isPaid: true }, { merge: true });
        console.log("✅ 'users' document created/updated successfully.");
      } catch (err) {
        console.error("❌ Error saving to Firestore:", err);
      }
      isPaid = true;
      payBtn.style.display = "none";
      renderSubjects();
    },
    theme: {
      color: "#3399cc"
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
};
