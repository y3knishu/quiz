// ===================== FIREBASE & QUIZ VARIABLES =====================
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let subjectName = localStorage.getItem("selectedSubject") || "Quiz";
let quizStartTime;

// Firebase logic here (unchanged from your original app.js) to fetch `questions`

// ===================== INIT QUIZ =====================
function startQuiz() {
    quizStartTime = new Date();
    renderQuestion();
    renderPalette();
}

// ===================== RENDER QUESTION =====================
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const imageEl = document.getElementById("question-image");

    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";

    if (q.image) {
        imageEl.src = q.image;
        imageEl.style.display = "block";
    } else {
        imageEl.style.display = "none";
    }

    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.className = "option-btn";
        btn.onclick = () => selectOption(i);
        if (selectedAnswers[currentQuestionIndex] === i) {
            btn.classList.add("selected");
        }
        optionsEl.appendChild(btn);
    });

    updatePaletteHighlight();
}

// ===================== SELECT OPTION =====================
function selectOption(optionIndex) {
    selectedAnswers[currentQuestionIndex] = optionIndex;
    renderQuestion();
}

// ===================== QUESTION PALETTE =====================
function renderPalette() {
    const palette = document.getElementById("palette");
    palette.innerHTML = "";

    questions.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.textContent = idx + 1;
        btn.className = "palette-btn";
        btn.onclick = () => {
            currentQuestionIndex = idx;
            renderQuestion();
        };
        palette.appendChild(btn);
    });

    updatePaletteHighlight();
}

function updatePaletteHighlight() {
    const paletteBtns = document.querySelectorAll(".palette-btn");
    paletteBtns.forEach((btn, idx) => {
        btn.classList.remove("current", "answered");
        if (idx === currentQuestionIndex) btn.classList.add("current");
        if (selectedAnswers[idx] !== undefined) btn.classList.add("answered");
    });
}

// ===================== NEXT / PREVIOUS =====================
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// ===================== DOWNLOAD QUESTIONS AS PDF =====================
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let yOffset = 10;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Question text
        pdf.setFontSize(12);
        pdf.text(`${i + 1}. ${q.question}`, 10, yOffset);
        yOffset += 8;

        // Image
        if (q.image) {
            try {
                const img = await loadImageAsBase64(q.image);
                pdf.addImage(img, "JPEG", 10, yOffset, 60, 40);
                yOffset += 45;
            } catch (err) {
                console.warn("Image load failed", err);
            }
        }

        // Options
        q.options.forEach((opt, idx) => {
            let mark = "";
            if (q.answer === idx) mark += " ✅";
            if (selectedAnswers[i] === idx && q.answer !== idx) mark += " ❌";

            pdf.text(`(${String.fromCharCode(65 + idx)}) ${opt} ${mark}`, 15, yOffset);
            yOffset += 7;
        });

        yOffset += 5;

        // Add new page if needed
        if (yOffset > 270) {
            pdf.addPage();
            yOffset = 10;
        }
    }

    pdf.save(`${subjectName}_Questions.pdf`);
}

function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ===================== MOBILE PALETTE TOGGLE =====================
function togglePalette() {
    document.getElementById("palette-container").classList.toggle("open");
}

// ===================== EVENT LISTENERS =====================
document.getElementById("next-btn").onclick = nextQuestion;
document.getElementById("prev-btn").onclick = prevQuestion;
document.getElementById("download-pdf-btn").onclick = downloadPDF;
document.getElementById("toggle-palette-btn").onclick = togglePalette;

// Start quiz after questions are loaded from Firebase
// startQuiz(); <-- call this after fetching data
