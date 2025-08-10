<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz</title>
  <style>
    /* Correct Answer Styling */
    .correct {
      background: #66bb6a !important; /* Green */
      color: white;
    }

    /* Wrong Answer Styling */
    .wrong {
      background: #ef5350 !important; /* Red */
      color: white;
    }

    body {
      font-family: Arial, sans-serif;
      display: flex;
      margin: 0;
      transition: background 0.3s, color 0.3s;
    }
    .dark {
      background: #121212;
      color: #eee;
    }
    .sidebar {
      width: 100px;
      background: #fff;
      border-right: 1px solid #ddd;
      padding: 10px;
      overflow-y: auto;
    }
    .dark .sidebar {
      background: #1e1e1e;
      border-color: #444;
    }
    #palette button {
      margin: 5px;
      width: 40px;
      height: 40px;
    }
    .main {
      padding: 20px;
      flex: 1;
    }
    .question { font-size: 1.1em; margin-bottom: 10px; }
    .image { max-width: 100%; margin-bottom: 20px; display: none; }
    .options button {
      display: block;
      margin: 10px 0;
      padding: 10px;
      width: 100%;
      font-size: 1em;
    }
  </style>
</head>
<body class="dark">
  <div class="sidebar">
    <h4>Palette</h4>
    <div id="palette"></div>
  </div>
  <div class="main">
    <div id="question-number"></div>
    <div id="question-text" class="question"></div>
    <img id="question-image" class="image" />
    <div id="options" class="options"></div>
    <p id="timer">Time: 0 sec</p>
    <button onclick="prevQuestion()">⬅️ Prev</button>
    <button onclick="nextQuestion()">Next ➡️</button>
    <button onclick="submitQuiz()">✅ Submit Quiz</button>
    <button onclick="resetQuiz()">🔄 Retry</button>
    <button onclick="location.href='index.html'">🏠 Home</button>
    <div id="result-summary" class="summary"></div>
  </div>
  <button id="toggle-dark" onclick="toggleDarkMode()">☀️</button>

  <script type="module" src="app.js"></script>
</body>
</html>
