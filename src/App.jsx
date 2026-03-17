import { useState, useEffect } from "react";
import video from "./assets/Number Puzzle.mp4";

// ✅ SOLUTION BOARD
const solution = [
  ["5", "3", "4", "6", "7", "8", "9", "1", "2"],
  ["6", "7", "2", "1", "9", "5", "3", "4", "8"],
  ["1", "9", "8", "3", "4", "2", "5", "6", "7"],
  ["8", "5", "9", "7", "6", "1", "4", "2", "3"],
  ["4", "2", "6", "8", "5", "3", "7", "9", "1"],
  ["7", "1", "3", "9", "2", "4", "8", "5", "6"],
  ["9", "6", "1", "5", "3", "7", "2", "8", "4"],
  ["2", "8", "7", "4", "1", "9", "6", "3", "5"],
  ["3", "4", "5", "2", "8", "6", "1", "7", "9"],
];

// 🎯 Generate puzzle
const generateBoard = (difficulty) => {
  let removeCount = { easy: 30, medium: 45, hard: 55 }[difficulty];
  let board = solution.map(row => [...row]);

  while (removeCount > 0) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (board[r][c] !== "") {
      board[r][c] = "";
      removeCount--;
    }
  }
  return board;
};

// ✅ Check board full
const isBoardFull = (b) => {
  return b.every(row => row.every(cell => cell !== ""));
};

export default function App() {
  const [board, setBoard] = useState([]);
  const [locked, setLocked] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [wrongCells, setWrongCells] = useState({});

  const [score, setScore] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(600);

  const [gameOver, setGameOver] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  // ⏱ TIMER (COUNTDOWN)
  useEffect(() => {
    if (!difficulty || gameOver) return;


    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          setShowFail(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);


  }, [difficulty, gameOver]);

  // 🎮 START GAME
  const startGame = (level) => {
    const newBoard = generateBoard(level);
    const lock = newBoard.map(row => row.map(cell => cell !== ""));


    setBoard(newBoard);
    setLocked(lock);
    setDifficulty(level);

    setScore(100);
    setMistakes(0);
    setTime(600);
    setGameOver(false);

    setWrongCells({});
    setShowWin(false);
    setShowFail(false);


  };

  // 🏆 CHECK WIN / FAIL
  const checkGameStatus = (b) => {
    if (!isBoardFull(b)) return;


    let isCorrect = true;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (b[i][j] !== solution[i][j]) {
          isCorrect = false;
          break;
        }
      }
    }

    setGameOver(true);

    if (isCorrect) {
      setShowWin(true);
    } else {
      setShowFail(true);
    }


  };

  // ✏️ INPUT CHANGE
  const handleChange = (r, c, val) => {
    // ❌ block invalid input or game over
    if (!/^[1-9]?$/.test(val) || gameOver) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = val;

    const key = `${r}-${c}`;
    const newWrong = { ...wrongCells };

    // ❌ wrong input
    if (val !== "" && val !== solution[r][c]) {
      if (!wrongCells[key]) {
        setMistakes((m) => m + 1);


        setScore((prev) => {
          const newScore = Math.max(prev - 5, 0);

          // 🚨 score reached 0 → end game
          if (newScore === 0) {
            setGameOver(true);
            setShowFail(true);
          }

          return newScore;
        });
      }

      newWrong[key] = true;


    } else {
      // ✅ correct input
      delete newWrong[key];
    }

    setBoard(newBoard);
    setWrongCells(newWrong);

    // 🏁 check if board is full
    if (newBoard.every(row => row.every(cell => cell !== ""))) {
      checkGameStatus(newBoard);
    }
  };


  // 🔁 RESTART
  const restartGame = () => {
    setDifficulty(null);
    setBoard([]);
    setLocked([]);


    setScore(100);
    setMistakes(0);
    setTime(600);

    setGameOver(false);
    setShowWin(false);
    setShowFail(false);
    setConfirmRestart(false);


  };

  // ⏱ FORMAT TIME
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">


    <h1 className="text-3xl font-bold text-purple-600 mb-4">
      Sodakku Game
    </h1>

    {/* 📊 STATS */}
    {difficulty && (
      <div className="flex gap-6 mb-3 text-lg">
        <p>⏱ {formatTime(time)}</p>
        <p>❌ {mistakes}</p>
        <p>⭐ {score}</p>
      </div>
    )}

    {/* MODE */}
    {/* 🎬 VIDEO + MODE SELECT */}
    {!difficulty && (

      <div className="flex flex-col items-center gap-6">


        {/* VIDEO */}
        <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg">
          <video
            src={video}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-700">
          Choose Game Mode
        </h2>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={() => startGame("easy")}
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:scale-105 transition"
          >
            Easy
          </button>

          <button
            onClick={() => startGame("medium")}
            className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:scale-105 transition"
          >
            Medium
          </button>

          <button
            onClick={() => startGame("hard")}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:scale-105 transition"
          >
            Hard
          </button>
        </div>


      </div>
    )}


    {/* BOARD */}
    {board.length > 0 && (
      <>
        <div className="grid grid-cols-9 border-4 border-black mt-4">

          {board.map((row, r) =>
            row.map((cell, c) => (
              <input
                key={`${r}-${c}`}
                value={cell || ""}
                disabled={locked[r][c] || gameOver}
                onChange={(e) => handleChange(r, c, e.target.value)}
                className={`w-10 h-10 text-center border text-lg
                ${locked[r][c] ? "bg-gray-300 font-bold" : ""}
                ${wrongCells[`${r}-${c}`] ? "bg-red-300" : ""}
                ${(c + 1) % 3 === 0 ? "border-r-4" : ""}
                ${(r + 1) % 3 === 0 ? "border-b-4" : ""}
              `}
              />
            ))
          )}

        </div>

        <button
          onClick={() => setConfirmRestart(true)}
          className="mt-4 px-5 py-2 bg-red-500 text-white rounded"
        >
          Restart
        </button>
      </>
    )}

    {/* 🔁 RESTART MODAL */}
    {confirmRestart && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded text-center">
          <p className="mb-4">Restart game?</p>
          <div className="flex gap-4">
            <button onClick={restartGame} className="bg-red-500 text-white px-4 py-2 rounded">
              Yes
            </button>
            <button onClick={() => setConfirmRestart(false)} className="bg-gray-300 px-4 py-2 rounded">
              No
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 🏆 WIN */}
    {showWin && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded text-center">
          <h2 className="text-xl font-bold mb-2">🎉 You Won!</h2>
          <p>Time: {formatTime(time)}</p>
          <p>Score: {score}</p>
          <button onClick={restartGame} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
            Play Again
          </button>
        </div>
      </div>
    )}

    {/* ❌ FAIL */}
    {showFail && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded text-center">
          <h2 className="text-xl font-bold mb-2">❌ Game Over</h2>
          <p>Score: {score}</p>
          <button onClick={restartGame} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
            Try Again
          </button>
        </div>
      </div>
    )}

  </div>


  );
}
