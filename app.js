// app.js

// You can later fetch subjects from Firestore if needed.
// For now, it's static for the public quiz view

const subjects = [
  "Anatomy", "Physiology", "Biochemistry",
  "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine",
  "Community Medicine", "ENT", "Ophthalmology",
  "General Medicine", "General Surgery", "Obstetrics & Gynaecology",
  "Pediatrics", "Orthopaedics", "Dermatology", "Psychiatry", "Respiratory Medicine", "Anesthesiology"
];

const grid = document.getElementById("subjects-grid");

subjects.forEach(subject => {
  const card = document.createElement("div");
  card.className = "subject-card";
  card.textContent = subject;
  grid.appendChild(card);
});
