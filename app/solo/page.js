"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dataMotData from "@/data/datamot.json";
import dataCineData from "@/data/datacine.json";
import dataSportData from "@/data/datasport.json";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractKeyword(regle) {
  const cleaned = regle
    .replace(/^Quelque chose qui s'/i, "")
    .replace(/^Quelque chose qui est /i, "")
    .replace(/^Quelque chose qui /i, "")
    .trim()
    .toLowerCase();
  return cleaned;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function levenshtein(a, b) {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

function isAnswerClose(userAnswer, correctAnswer) {
  const normUser = normalize(userAnswer);
  const normCorrect = normalize(correctAnswer);
  if (normUser === normCorrect) return true;
  if (normCorrect.includes(normUser) && normUser.length >= 3) return true;
  if (normUser.includes(normCorrect)) return true;
  const distance = levenshtein(normUser, normCorrect);
  const maxDistance = Math.max(1, Math.floor(normCorrect.length / 4));
  if (distance <= maxDistance) return true;
  return false;
}

function isMovieAnswerClose(userAnswer, correctAnswer) {
  const normUser = normalize(userAnswer);
  const normCorrect = normalize(correctAnswer);
  if (normUser === normCorrect) return true;
  if (normCorrect.includes(normUser) && normUser.length >= 3) return true;
  if (normUser.includes(normCorrect) && normCorrect.length >= 3) return true;
  const distance = levenshtein(normUser, normCorrect);
  if (distance <= 10) return true;
  return false;
}

const MAX_LIVES = 5;
const POINTS = [15, 12, 10, 8, 6, 4, 2, 1];

const GAME_MODES = {
  classique: { name: "Classique", emoji: "📝", color: "indigo", data: dataMotData },
  cinema: { name: "Cinéma", emoji: "🎬", color: "red", data: dataCineData },
  sport: { name: "Sport", emoji: "⚽", color: "orange", data: dataSportData },
};

// Composant Timer circulaire
function CircleTimer({ seconds, maxSeconds }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / maxSeconds) * circumference;
  const isLow = seconds <= 5;
  
  return (
    <div className="relative w-24 h-24">
      <svg className="timer-ring w-full h-full" viewBox="0 0 100 100">
        <circle className="timer-ring-bg" cx="50" cy="50" r={radius} fill="none" strokeWidth="8" />
        <circle
          className={`timer-ring-progress ${isLow ? "animate-pulse-danger" : ""}`}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          stroke={isLow ? "#ef4444" : "#22c55e"}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-black text-2xl ${isLow ? "text-red-500" : "text-white"}`}>
        {seconds}
      </div>
    </div>
  );
}

export default function Solo() {
  const [phase, setPhase] = useState("config");
  const [gameMode, setGameMode] = useState("classique");
  const [pseudo, setPseudo] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [lastPoints, setLastPoints] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState({ classique: 0, cinema: 0, sport: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState("classique");
  const [myRank, setMyRank] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [lastKeyword, setLastKeyword] = useState("");
  const [animateWord, setAnimateWord] = useState(-1);
  const confettiRef = useRef(null);

  useEffect(() => {
    const savedBest = localStorage.getItem("convergence_solo_best");
    if (savedBest) {
      const parsed = JSON.parse(savedBest);
      if (typeof parsed === "object") {
        setBestScores(parsed);
      } else {
        setBestScores({ classique: parsed, cinema: 0, sport: 0 });
      }
    }
    const savedPseudo = localStorage.getItem("convergence_solo_pseudo");
    if (savedPseudo) setPseudo(savedPseudo);
  }, []);

  const card = deck[currentIndex];
  const keyword = card ? extractKeyword(card.regle) : "";
  const bestScore = bestScores[gameMode] || 0;

  // Confettis
  const triggerConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#22d3ee", "#6366f1", "#22c55e", "#facc15"],
    });
  };

  const fetchLeaderboard = async (mode) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/leaderboard?mode=${mode}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      if (pseudo) {
        const idx = data.leaderboard?.findIndex((e) => e.pseudo.toLowerCase() === pseudo.toLowerCase());
        setMyRank(idx >= 0 ? idx + 1 : null);
      }
    } catch { setLeaderboard([]); }
    finally { setLoadingLeaderboard(false); }
  };

  const submitScore = async () => {
    if (!pseudo.trim() || score === 0) return;
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo: pseudo.trim(), score, mode: gameMode }),
      });
    } catch {}
  };

  const startGame = () => {
    if (!pseudo.trim()) {
      alert("Entre un pseudo pour jouer !");
      return;
    }
    localStorage.setItem("convergence_solo_pseudo", pseudo.trim());
    const modeData = GAME_MODES[gameMode].data;
    setDeck(shuffle(modeData));
    setCurrentIndex(0);
    setRevealedCount(1);
    setAnswer("");
    setFeedback(null);
    setLives(MAX_LIVES);
    setScore(0);
    setLastKeyword("");
    setLastPoints(0);
    setPhase("playing");
  };

  const showLeaderboard = () => {
    setLeaderboardMode(gameMode);
    fetchLeaderboard(gameMode);
    setPhase("leaderboard");
  };

  const revealNext = () => {
    if (revealedCount < 8) {
      const nextIndex = revealedCount;
      setRevealedCount(revealedCount + 1);
      setAnimateWord(nextIndex);
      setTimeout(() => setAnimateWord(-1), 500);
    }
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;
    let correct = false;
    if (gameMode === "classique") {
      correct = isAnswerClose(answer, keyword);
    } else {
      correct = isMovieAnswerClose(answer, card.regle);
    }
    
    if (correct) {
      const earnedPoints = POINTS[Math.max(0, revealedCount - 1)] || 1;
      setScore((s) => s + earnedPoints);
      setLastPoints(earnedPoints);
      setFeedback("correct");
      triggerConfetti();
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        const correctAnswer = gameMode === "classique" ? keyword : card.regle;
        setLastKeyword(correctAnswer);
        setFeedback("gameover");
        if (score > bestScore) {
          const newBestScores = { ...bestScores, [gameMode]: score };
          setBestScores(newBestScores);
          localStorage.setItem("convergence_solo_best", JSON.stringify(newBestScores));
        }
        submitScore();
        setPhase("gameover");
      } else {
        setFeedback("wrong");
        setAnswer("");
      }
    }
  };

  const giveUp = () => {
    const correctAnswer = gameMode === "classique" ? keyword : card.regle;
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setLastKeyword(correctAnswer);
      if (score > bestScore) {
        const newBestScores = { ...bestScores, [gameMode]: score };
        setBestScores(newBestScores);
        localStorage.setItem("convergence_solo_best", JSON.stringify(newBestScores));
      }
      submitScore();
      setPhase("gameover");
    } else {
      setLastKeyword(correctAnswer);
      setFeedback("gaveup");
    }
  };

  const nextCard = () => {
    setRevealedCount(1);
    setAnswer("");
    setFeedback(null);
    setLastKeyword("");
    setCurrentIndex((i) => i + 1);
  };

  // Config Screen
  if (phase === "config") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <Link href="/" className="absolute top-4 left-4 stat-bubble text-sm">
          ← Accueil
        </Link>
        
        <div className="text-center space-y-2">
          <div className="text-4xl mb-1">🎮</div>
          <h1 className="text-3xl font-black text-gray-800">Mode Solo</h1>
          <p className="text-gray-500">Devine le maximum avant de perdre tes vies !</p>
        </div>

        <div className="game-card w-full max-w-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Ton pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Entre ton pseudo..."
                className="input-party"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                Choisis ton thème
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(GAME_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => setGameMode(key)}
                    className={`py-3 px-2 rounded-xl font-bold text-center transition-all ${
                      gameMode === key
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200 scale-105"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-2xl mb-1">{mode.emoji}</div>
                    <div className="text-xs">{mode.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-center text-gray-500 text-sm mb-4">
                🏆 Meilleur : <span className="font-bold text-indigo-600">{bestScores[gameMode] || 0}</span> pts ({GAME_MODES[gameMode].name})
              </p>
              <button onClick={startGame} className="btn-party w-full">
                🚀 C&apos;est parti !
              </button>
            </div>
          </div>
        </div>

        <button onClick={showLeaderboard} className="stat-bubble hover:shadow-md transition">
          🏆 Classement mondial
        </button>
      </main>
    );
  }

  // Leaderboard Screen
  if (phase === "leaderboard") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button onClick={() => setPhase("config")} className="stat-bubble text-sm">
            ← Retour
          </button>
          <div className="flex gap-1">
            {Object.entries(GAME_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => { setLeaderboardMode(key); fetchLeaderboard(key); }}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition ${
                  leaderboardMode === key
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {mode.emoji}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-800">
          🏆 Classement {GAME_MODES[leaderboardMode].name}
        </h1>

        <div className="game-card w-full max-w-sm">
          {loadingLeaderboard ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun score pour le moment</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl ${
                    i === 0 ? "bg-yellow-100 border-2 border-yellow-400" :
                    i === 1 ? "bg-gray-100 border-2 border-gray-300" :
                    i === 2 ? "bg-orange-100 border-2 border-orange-300" :
                    "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    <span className="font-bold text-gray-800">{entry.pseudo}</span>
                  </div>
                  <span className="font-black text-[var(--accent)]">{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setPhase("config")} className="btn-party-secondary max-w-sm">
          Jouer
        </button>
      </main>
    );
  }

  // Game Over Screen
  if (phase === "gameover") {
    const isNewBest = score >= bestScore && score > 0;
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <h1 className={`text-4xl font-black text-gray-800 ${isNewBest ? "animate-victory" : ""}`}>
          Game Over!
        </h1>
        
        {lastKeyword && (
          <div className="game-card w-full max-w-sm text-center">
            <p className="text-gray-500 text-sm">La réponse était :</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{lastKeyword}</p>
          </div>
        )}

        <div className="game-card w-full max-w-sm text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Ton score</p>
          <p className="text-5xl font-black text-indigo-600 my-2">{score}</p>
          {isNewBest && (
            <p className="text-emerald-500 font-bold animate-bounce">🎉 Nouveau record !</p>
          )}
          <p className="text-gray-400 text-sm mt-2">
            Meilleur : {bestScores[gameMode] || score}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={startGame} className="btn-party">
            🔄 Rejouer
          </button>
          <button onClick={showLeaderboard} className="btn-party-secondary">
            🏆 Classement
          </button>
          <Link href="/" className="btn-party-secondary text-center">
            🏠 Accueil
          </Link>
        </div>
      </main>
    );
  }

  // Loading
  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl font-bold animate-pulse">Chargement...</div>
      </main>
    );
  }

  // Playing Screen
  return (
    <main className="h-[100dvh] p-4 flex flex-col overflow-hidden">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="stat-bubble">
          <div className="lives-display">
            {[...Array(MAX_LIVES)].map((_, i) => (
              <span key={i} className={`heart ${i < lives ? "heart-full" : "heart-empty"}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>
        <div className="stat-bubble text-center">
          <p className="text-xs opacity-70">{GAME_MODES[gameMode].emoji} {GAME_MODES[gameMode].name}</p>
          <p className="text-xl font-black">{score} pts</p>
        </div>
      </div>

      {/* Game Card */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <div className="game-card w-full animate-card-appear relative">
          {/* Badge thématique */}
          <div className={`theme-badge theme-badge-${gameMode}`}>
            {GAME_MODES[gameMode].emoji} {GAME_MODES[gameMode].name}
          </div>

          {/* Instruction */}
          <div className="text-center mb-4 pt-2">
            <p className="text-lg font-bold text-gray-700">
              {gameMode === "cinema" ? "🎬 Trouve le film !" :
               gameMode === "sport" ? "⚽ Trouve le sport / athlète !" :
               "Quelque chose qui…"}
            </p>
          </div>

          {/* Liste des mots */}
          <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
            {card.mots.map((mot, i) => {
              const isRevealed = i < revealedCount;
              return (
                <div
                  key={i}
                  className={`word-item ${isRevealed ? "word-item-revealed" : "word-item-hidden"} ${
                    animateWord === i ? "animate-bounce-in" : ""
                  }`}
                >
                  <span className="text-sm mr-2 opacity-50">{i + 1}.</span>
                  {isRevealed ? mot : "• • • • •"}
                </div>
              );
            })}
          </div>

          {/* Zone de réponse */}
          {feedback === null || feedback === "wrong" ? (
            <div className="space-y-3">
              {feedback === "wrong" && (
                <div className="bg-red-100 border-2 border-red-400 rounded-xl py-2 px-3 text-center">
                  <p className="text-red-600 font-bold text-sm">❌ Raté ! Réessaie... (−1 ❤️)</p>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <button
                  onClick={revealNext}
                  disabled={revealedCount >= 8}
                  className="btn-party-sm flex-1 disabled:opacity-40"
                >
                  {revealedCount >= 8 ? "Tous révélés" : `Indice ${revealedCount + 1}`}
                </button>
                <span className="text-gray-500 font-bold text-sm w-16 text-right">
                  {POINTS[Math.max(0, revealedCount - 1)] || 1} pts
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                  placeholder={
                    gameMode === "cinema" ? "Titre du film..." :
                    gameMode === "sport" ? "Sport / Athlète..." :
                    "Ta réponse..."
                  }
                  className="input-party flex-1"
                />
                <button
                  onClick={checkAnswer}
                  disabled={!answer.trim()}
                  className="btn-party-sm disabled:opacity-40"
                >
                  ✓
                </button>
              </div>

              <button onClick={giveUp} className="btn-party-danger text-sm">
                Je passe (−1 ❤️)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl text-center ${
                feedback === "correct"
                  ? "bg-green-100 border-2 border-green-400"
                  : "bg-red-100 border-2 border-red-400"
              }`}>
                {feedback === "correct" ? (
                  <>
                    <p className="text-green-600 font-black text-xl">🎉 Bravo ! +{lastPoints} pts</p>
                    <p className="text-green-600/70 text-sm mt-1">
                      {revealedCount <= 1 ? "Sans indice ! Incroyable !" : `Trouvé au mot ${revealedCount}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-red-600 font-bold">Passé !</p>
                    <p className="text-gray-700 text-sm mt-1">
                      Réponse : <span className="font-bold">{gameMode === "classique" ? keyword : card.regle}</span>
                    </p>
                  </>
                )}
                {gameMode === "classique" && (
                  <p className="text-gray-500 text-xs mt-2">{card.regle}</p>
                )}
              </div>

              <button onClick={nextCard} className="btn-party-success w-full">
                Carte suivante →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
