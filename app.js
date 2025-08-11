// app.js (replace your current file with this)
// ------------------------ FIREBASE ------------------------
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

// ------------------------ STATE ------------------------
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get('subject') || 'Anatomy';

let questions = [];            // loaded from Firestore
let current = 0;               // index
let selectedAnswers = [];      // { selectedIndex, correct } per question (or undefined)
let startTime = Date.now();
let timerInterval = null;

// DOM elements (cached)
let elQuestionText, elQuestionImage, elOptions, elPalette, elResultSummary, elTimer;

function cacheElements() {
  elQuestionText = document.getElementById("question-text");
  elQuestionImage = document.getElementById("question-image");
  // Some HTML versions use id="options" or "options-container" — handle both.
  elOptions = document.getElementById("options") || document.getElementById("options-container");
  elPalette = document.getElementById("palette");
  elResultSummary = document.getElementById("result-summary") || document.getElementById("summary");
  elTimer = document.getElementById("timer");
}

// ------------------------ RENDER PALETTE ------------------------
function renderPalette() {
  if (!elPalette) return;
  elPalette.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = "palette-btn";
    btn.style.margin = "4px";
    btn.style.width = "40px";
    btn.onclick = () => {
      loadQuestion(i);
      // on mobile auto-close palette if there's a mobile toggle using #sidebar or #palette-container
      const sidebar = document.getElementById("sidebar") || document.getElementById("palette-container");
      if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    };
    if (selectedAnswers[i] !== undefined) {
      btn.style.background = selectedAnswers[i].correct ? "#66bb6a" : "#ef5350";
      btn.style.color = "#fff";
    }
    if (i === current) {
      btn.style.outline = "2px solid #1976d2";
    }
    elPalette.appendChild(btn);
  });
}

// ------------------------ LOAD / RENDER QUESTION ------------------------
function loadQuestion(index) {
  if (!questions || index < 0 || index >= questions.length) return;
  current = index;
  const q = questions[current];

  // Number + text
  if (elQuestionText) elQuestionText.textContent = `Q${current + 1}. ${q.question}`;

  // Image
  if (elQuestionImage) {
    if (q.image) {
      elQuestionImage.src = q.image;
      elQuestionImage.style.display = "block";
    } else {
      elQuestionImage.style.display = "none";
      elQuestionImage.src = "";
    }
  }

  // Options
  if (!elOptions) return;
  elOptions.innerHTML = "";
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.textContent = opt;
    b.style.display = "block";
    b.style.margin = "8px 0";
    b.style.padding = "12px";
    b.style.borderRadius = "8px";
    b.style.fontSize = "1rem";
    b.onclick = () => selectAnswer(i);
    // If already answered, disable options and color them
    const ans = selectedAnswers[current];
    if (ans !== undefined) {
      b.disabled = true;
      if (i === q.answer) {
        b.style.background = "#c8e6c9"; // correct green
      }
      if (i === ans.selectedIndex && !ans.correct) {
        b.style.background = "#ffcdd2"; // wrong
      }
    }
    elOptions.appendChild(b);
  });

  renderPalette();
}

// ------------------------ SELECT ANSWER ------------------------
function selectAnswer(selectedIndex) {
  const q = questions[current];
  if (!q) return;
  const isCorrect = selectedIndex === q.answer;
  selectedAnswers[current] = { selectedIndex, correct: isCorrect };

  // visually mark options
  const buttons = elOptions.querySelectorAll("button");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) {
      b.style.background = "#c8e6c9";
    }
    if (i === selectedIndex && !isCorrect) {
      b.style.background = "#ffcdd2";
    }
  });

  saveProgress();
  renderPalette();
}

// ------------------------ NAVIGATION ------------------------
function prevQuestion() { if (current > 0) loadQuestion(current - 1); }
function nextQuestion() { if (current < questions.length - 1) loadQuestion(current + 1); }
function resetQuiz() {
  selectedAnswers = [];
  saveProgress();
  loadQuestion(0);
  if (elResultSummary) elResultSummary.innerHTML = "";
  startTime = Date.now();
  if (timerInterval) { clearInterval(timerInterval); timerInterval = setInterval(updateTimer, 1000); }
}
function submitQuiz() {
  let correct = 0, wrong = 0, attempted = 0;
  selectedAnswers.forEach(a => {
    if (a !== undefined) {
      attempted++;
      if (a.correct) correct++; else wrong++;
    }
  });
  const unattempted = questions.length - attempted;
  const score = correct * 4 - wrong;
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  if (elResultSummary) {
    elResultSummary.innerHTML = `
      <h3>Quiz Summary</h3>
      <p>✅ Correct: ${correct}</p>
      <p>❌ Wrong: ${wrong}</p>
      <p>⏳ Unattempted: ${unattempted}</p>
      <p>🧮 Score: ${score} / ${questions.length * 4}</p>
      <p>⏱️ Time Taken: ${minutes} min ${seconds} sec</p>
      <canvas id="resultChart" width="300" height="300"></canvas>
    `;
    new window.Chart(document.getElementById("resultChart"), {
      type: "pie",
      data: {
        labels: ["Correct", "Wrong", "Unattempted"],
        datasets: [{ data: [correct, wrong, unattempted], backgroundColor: ["#66bb6a","#ef5350","#ffee58"] }]
      },
      options: { responsive: false, plugins: { legend: { position: "bottom" } } }
    });
  }

  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  renderPalette();
}

// ------------------------ TIMER ------------------------
function updateTimer() {
  if (!elTimer) return;
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  elTimer.textContent = `Time: ${mins}m ${secs}s`;
}

// ------------------------ SAVE / LOAD PROGRESS ------------------------
function saveProgress() {
  try {
    const key = `progress_${subject}`;
    const summary = {
      attempted: selectedAnswers.filter(a => a !== undefined).length,
      correct: selectedAnswers.filter(a => a && a.correct).length,
      wrong: selectedAnswers.filter(a => a && !a.correct).length,
      total: questions.length,
      answers: selectedAnswers
    };
    localStorage.setItem(key, JSON.stringify(summary));
  } catch(e) { console.warn("saveProgress failed", e); }
}

function loadProgress() {
  try {
    const key = `progress_${subject}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      selectedAnswers = data.answers || new Array(questions.length);
    } else {
      selectedAnswers = new Array(questions.length);
    }
  } catch(e) {
    selectedAnswers = new Array(questions.length);
  }
}

// ------------------------ LOAD QUIZ FROM FIRESTORE ------------------------
async function loadQuiz(subjectName) {
  try {
    const docRef = doc(db, "questions", subjectName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      questions = docSnap.data().questions || [];
      // normalize field names if older docs used different keys
      questions = questions.map(q => ({
        question: q.question || q.text || "",
        options: q.options || q.choices || [],
        image: q.image || q.imageUrl || q.img || null,
        answer: (typeof q.answer === "number") ? q.answer : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0)
      }));
      // initialize selectedAnswers array
      selectedAnswers = new Array(questions.length);
      loadProgress();
      loadQuestion(0);
      startTime = Date.now();
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      alert("No questions found for this subject.");
    }
  } catch (err) {
    console.error("Failed to load quiz:", err);
    alert("Failed to load quiz. Check console for details.");
  }
}

// ------------------------ IMAGE -> DataURL helper ------------------------
async function imageUrlToDataURL(url, maxWidth = 600) {
  try {
    const resp = await fetch(url, { mode: 'cors' });
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("imageUrlToDataURL failed for", url, e);
    throw e;
  }
}

// ------------------------ PDF EXPORT (images + markings) ------------------------
async function exportQuestionsToPDF() {
  if (!questions || questions.length === 0) {
    alert("No quiz data loaded yet.");
    return;
  }

  // require jspdf loaded in page
  if (!window.jspdf) {
    alert("jsPDF not loaded. Add <script src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'></script> to your HTML.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;
  let y = margin;
  const lineHeight = 14;
  const imageMaxWidth = pageWidth - margin * 2;

  doc.setFontSize(14);
  doc.text(`${subject} - Questions`, margin, y);
  y += lineHeight * 1.5;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // wrap question text
    doc.setFontSize(12);
    const qLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, imageMaxWidth);
    doc.text(qLines, margin, y);
    y += qLines.length * lineHeight;

    // image (if any)
    if (q.image) {
      try {
        const dataUrl = await imageUrlToDataURL(q.image);
        // Calculate aspect to fit width
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => (img.onload = r));
        const scale = Math.min(imageMaxWidth / img.width, 300 / img.height, 1);
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        if (y + imgH > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.addImage(dataUrl, "JPEG", margin, y, imgW, imgH);
        y += imgH + 8;
      } catch (err) {
        console.warn("Could not embed image for question", i + 1, err);
      }
    }

    // options
    for (let oi = 0; oi < q.options.length; oi++) {
      const optText = `${String.fromCharCode(65 + oi)}. ${q.options[oi]}`;
      // mark correct / selected wrong
      const isCorrect = (oi === q.answer);
      const sel = selectedAnswers[i];
      const isSelectedWrong = (sel !== undefined && sel.selectedIndex === oi && !sel.correct);

      // prepare line
      const prefix = isCorrect ? "✅ " : (isSelectedWrong ? "❌ " : "   ");
      const lines = doc.splitTextToSize(prefix + optText, imageMaxWidth - 20);
      // if not enough space, add page
      if (y + lines.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      if (isCorrect) {
        // green background box for correct answer
        const boxHeight = lines.length * lineHeight + 6;
        doc.setFillColor(200, 230, 201); // light green
        doc.rect(margin - 4, y - 4, imageMaxWidth, boxHeight, "F");
        doc.setTextColor(0, 100, 0);
        doc.text(lines, margin, y);
        doc.setTextColor(0, 0, 0);
        y += boxHeight + 4;
      } else if (isSelectedWrong) {
        // red-ish background for selected wrong
        const boxHeight = lines.length * lineHeight + 6;
        doc.setFillColor(255, 205, 210); // light red
        doc.rect(margin - 4, y - 4, imageMaxWidth, boxHeight, "F");
        doc.setTextColor(128, 0, 0);
        doc.text(lines, margin, y);
        doc.setTextColor(0, 0, 0);
        y += boxHeight + 4;
      } else {
        doc.text(lines, margin, y);
        y += lines.length * lineHeight + 4;
      }
    }

    // small gap before next question
    y += 6;

    // page break checks
    if (y > doc.internal.pageSize.getHeight() - margin - 60 && i < questions.length - 1) {
      doc.addPage();
      y = margin;
    }
  }

  // filename
  const filename = `${subject.replace(/\s+/g, "_")}_Questions.pdf`;
  doc.save(filename);
}

// ------------------------ MOBILE PALETTE TOGGLE (if you use a #sidebar) ------------------------
function togglePalette() {
  const sidebar = document.getElementById("sidebar") || document.getElementById("palette-container") || document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

// ------------------------ SAFE INIT & BINDINGS ------------------------
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();

  // bind navigation controls if present (your HTML versions used different ids)
  const prevBtn = document.getElementById("prev-btn") || document.querySelector(".prev-btn");
  const nextBtn = document.getElementById("next-btn") || document.querySelector(".next-btn");
  const submitBtn = document.getElementById("submit-btn") || document.querySelector(".submit-btn");
  const retryBtn = document.getElementById("retry-btn") || document.querySelector(".retry-btn");
  const homeBtn = document.getElementById("home-btn") || document.querySelector(".home-btn");
  const togglePaletteBtn = document.querySelector(".toggle-palette-btn") || document.getElementById("toggle-palette-btn");
  const pdfBtn = document.getElementById("download-pdf-btn") || document.getElementById("export-pdf") || document.getElementById("download-pdf-btn") || document.getElementById("exportPdfBtn") || document.getElementById("downloadPdfBtn");

  if (prevBtn) prevBtn.addEventListener("click", prevQuestion);
  if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
  if (submitBtn) submitBtn.addEventListener("click", submitQuiz);
  if (retryBtn) retryBtn.addEventListener("click", resetQuiz);
  if (homeBtn) homeBtn.addEventListener("click", () => location.href = "index.html");
  if (togglePaletteBtn) togglePaletteBtn.addEventListener("click", togglePalette);
  if (pdfBtn) pdfBtn.addEventListener("click", exportQuestionsToPDF);

  // Load quiz after DOM ready
  loadQuiz(subject);
});

// expose some functions for inline HTML buttons (if needed)
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.resetQuiz = resetQuiz;
window.submitQuiz = submitQuiz;
window.togglePalette = togglePalette;
window.exportQuestionsToPDF = exportQuestionsToPDF;
