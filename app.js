<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NEET PG Quiz</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: #fff;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    header {
      background: rgba(0,0,0,0.6);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h2 {
      margin: 0;
      font-size: 1.5em;
    }

    #question-number {
      font-weight: bold;
      margin-bottom: 10px;
    }

    .container {
      display: flex;
      flex: 1;
      padding: 20px;
      gap: 20px;
      flex-wrap: wrap;
    }

    #palette {
      flex: 1;
      min-width: 100px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: rgba(255,255,255,0.05);
      padding: 10px;
      border-radius: 8px;
    }

    #palette button {
      padding: 8px;
      background: #444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    #palette button:hover {
      background: #666;
    }

    .quiz-area {
      flex: 4;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 20px;
    }

    #question-text {
      font-size: 1.2em;
      margin-bottom: 10px;
    }

    #question-image {
      max-width: 100%;
      margin-bottom: 15px;
      display: none;
      border-radius: 6px;
    }

    #options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    #options button {
      background: #1e1e1e;
      color: white;
      border: 2px solid transparent;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: 0.3s;
    }

    #options button.correct {
      background: #2e7d32;
      border-color: #66bb6a;
    }

    #options button.wrong {
      background: #c62828;
      border-color: #ef5350;
    }

    #options button:hover:not(.correct):not(.wrong) {
      background: #333;
    }

    .controls {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .controls button {
      padding: 10px 20px;
      background: #00c6ff;
      background: linear-gradient(45deg, #00c6ff, #0072ff);
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .controls button:hover {
      background: linear-gradient(45deg, #0072ff, #00c6ff);
    }

    #result-summary {
      margin-top: 20px;
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 8px;
    }

    #timer {
      font-size: 1em;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <header>
    <h2>NEET PG Quiz</h2>
    <div id="timer">Time: 0m 0s</div>
  </header>
  <div class="container">
    <div id="palette"></div>
    <div class="quiz-area">
      <div id="question-number"></div>
      <div id="question-text"></div>
      <img id="question-image" />
      <div id="options"></div>
      <div class="controls">
        <button onclick="prevQuestion()">⬅️ Previous</button>
        <button onclick="nextQuestion()">Next ➡️</button>
        <button onclick="submitQuiz()">✅ Submit</button>
        <button onclick="resetQuiz()">♻️ Reset</button>
        <button onclick="window.location.href='index.html'">🏠 Home</button>
      </div>
      <div id="result-summary"></div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
