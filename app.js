// ====================== FIREBASE SETUP ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====================== QUIZ VARIABLES ======================
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let timerInterval;
let timeElapsed = 0;

// ====================== ELEMENTS ======================
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const optionsContainer = document.getElementById("options-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const retryBtn = document.getElementById("retry-btn");
const homeBtn = document.getElementById("home-btn");
const questionPalette = document.getElementById("questionPalette");
const timerDisplay = document.getElementById("timer");
const downloadBtn = document.getElementById("download-pdf");

// ====================== LOAD QUESTIONS ======================
async function loadQuestions() {
    const subject = localStorage.getItem("selectedSubject");
    if (!subject) return alert("No subject selected!");

    const querySnapshot = await getDocs(collection(db, "subjects", subject, "questions"));
    questions = querySnapshot.docs.map(doc => doc.data());

    if (questions.length === 0) {
        alert("No questions found!");
        return;
    }
    displayQuestion();
    renderPalette();
    startTimer();
}

function displayQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = `${currentQuestionIndex + 1}. ${q.question}`;

    if (q.image && q.image.trim() !== "") {
        questionImage.src = q.image;
        questionImage.style.display = "block";
    } else {
        questionImage.style.display = "none";
    }

    optionsContainer.innerHTML = "";
    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.classList.add("option-btn");
        if (selectedAnswers[currentQuestionIndex] === index) {
            btn.classList.add("selected");
        }
        btn.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(btn);
    });
}

function selectAnswer(index) {
    selectedAnswers[currentQuestionIndex] = index;
    displayQuestion();
    updatePalette();
}

function renderPalette() {
    questionPalette.innerHTML = "";
    questions.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.onclick = () => {
            currentQuestionIndex = i;
            displayQuestion();
        };
        btn.classList.add("palette-btn");
        questionPalette.appendChild(btn);
    });
}

function updatePalette() {
    document.querySelectorAll(".palette-btn").forEach((btn, i) => {
        if (selectedAnswers[i] !== undefined) {
            btn.classList.add("attempted");
        } else {
            btn.classList.remove("attempted");
        }
    });
}

// ====================== TIMER ======================
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        let minutes = String(Math.floor(timeElapsed / 60)).padStart(2, "0");
        let seconds = String(timeElapsed % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// ====================== PDF DOWNLOAD ======================
downloadBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let y = 10;

    for (let i = 0; i < questions.length; i++) {
        let q = questions[i];
        pdf.setFontSize(12);
        pdf.text(`${i + 1}. ${q.question}`, 10, y);
        y += 8;

        if (q.image) {
            try {
                const imgData = await getBase64ImageFromUrl(q.image);
                pdf.addImage(imgData, "JPEG", 10, y, 60, 40);
                y += 45;
            } catch (err) {
                console.error("Image load failed:", err);
            }
        }

        q.options.forEach((opt, idx) => {
            if (idx === q.answer) {
                pdf.setTextColor(0, 128, 0); // green
            } else if (selectedAnswers[i] === idx && idx !== q.answer) {
                pdf.setTextColor(255, 0, 0); // red
            } else {
                pdf.setTextColor(0, 0, 0); // black
            }
            pdf.text(`- ${opt}`, 15, y);
            y += 6;
        });

        pdf.setTextColor(0, 0, 0);
        y += 5;

        if (y > 270) {
            pdf.addPage();
            y = 10;
        }
    }

    pdf.save("quiz-report.pdf");
});

async function getBase64ImageFromUrl(imageUrl) {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ====================== NAVIGATION ======================
prevBtn.onclick = () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
};

nextBtn.onclick = () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
};

retryBtn.onclick = () => {
    selectedAnswers = {};
    currentQuestionIndex = 0;
    displayQuestion();
    updatePalette();
    retryBtn.style.display = "none";
    submitBtn.style.display = "inline-block";
};

homeBtn.onclick = () => {
    window.location.href = "index.html";
};

submitBtn.onclick = () => {
    clearInterval(timerInterval);
    retryBtn.style.display = "inline-block";
    submitBtn.style.display = "none";
    alert("Quiz submitted!");
};

// ====================== INIT ======================
loadQuestions();
