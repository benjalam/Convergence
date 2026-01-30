"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import cartesData from "@/data/cartes.json";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Extrait le mot-clé de la règle
function extractKeyword(regle) {
  const cleaned = regle
    .replace(/^Quelque chose qui s'/i, "")
    .replace(/^Quelque chose qui est /i, "")
    .replace(/^Quelque chose qui /i, "")
    .trim()
    .toLowerCase();
  return cleaned;
}

// Normalise une chaîne pour comparaison
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Distance de Levenshtein
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

// Vérifie si la réponse est acceptable
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

export default function Solo() {
  const [phase, setPhase] = useState("config"); // "config", "playing", "gameover", "leaderboard"
  const [pseudo, setPseudo] = useState("");
  const [maxLives, setMaxLives] = useState(10);
  const [lives, setLives] = useState(10);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const card = deck[currentIndex];
  const keyword = card ? extractKeyword(card.regle) : "";

  // Charger pseudo et meilleur score depuis localStorage
  useEffect(() => {
    const savedPseudo = localStorage.getItem("convergence_solo_pseudo");
    const savedBest = localStorage.getItem("convergence_solo_best");
    if (savedPseudo) setPseudo(savedPseudo);
    if (savedBest) setBestScore(parseInt(savedBest, 10) || 0);
  }, []);

  // Charger le leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error("Erreur chargement leaderboard:", e);
    }
    setLoadingLeaderboard(false);
  };

  // Soumettre le score au leaderboard
  const submitScore = async (finalScore) => {
    if (!pseudo.trim()) return;
    
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo: pseudo.trim(), score: finalScore }),
      });
      const data = await res.json();
      if (data.rank) setMyRank(data.rank);
    } catch (e) {
      console.error("Erreur soumission score:", e);
    }
  };

  // Sauvegarder le pseudo
  useEffect(() => {
    if (pseudo) {
      localStorage.setItem("convergence_solo_pseudo", pseudo);
    }
  }, [pseudo]);

  // Sauvegarder le meilleur score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("convergence_solo_best", score.toString());
    }
  }, [score, bestScore]);

  const startGame = () => {
    if (!pseudo.trim()) return;
    setDeck(shuffle(cartesData));
    setCurrentIndex(0);
    setRevealedCount(0);
    setAnswer("");
    setFeedback(null);
    setLives(maxLives);
    setScore(0);
    setMyRank(null);
    setPhase("playing");
  };

  const revealNext = () => {
    if (revealedCount < 8) {
      setRevealedCount((c) => c + 1);
    }
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;

    const isCorrect = isAnswerClose(answer, keyword);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      setFeedback("incorrect");
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        submitScore(score);
        setPhase("gameover");
        return;
      }
    }
  };

  const nextCard = () => {
    setRevealedCount(0);
    setAnswer("");
    setFeedback(null);
    if (currentIndex + 1 >= deck.length) {
      setDeck(shuffle(cartesData));
      setCurrentIndex(0);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const giveUp = () => {
    setFeedback("gaveup");
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      submitScore(score);
      setPhase("gameover");
    }
  };

  const showLeaderboard = () => {
    fetchLeaderboard();
    setPhase("leaderboard");
  };

  // Écran de configuration
  if (phase === "config") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <Link href="/" className="absolute top-4 left-4 text-neutral-400 hover:text-[var(--accent)] transition text-sm">
          ← Accueil
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mode Solo</h1>
          <p className="text-neutral-400">Trouve un maximum de règles !</p>
        </div>

        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Ton pseudo
          </label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value.slice(0, 20))}
            placeholder="Entre ton pseudo..."
            maxLength={20}
            className="w-full py-3 px-4 rounded-xl bg-[var(--card)] border border-neutral-600 text-white placeholder-neutral-500 focus:border-[var(--accent)] focus:outline-none text-center text-lg"
          />
        </div>

        {bestScore > 0 && (
          <div className="text-center">
            <p className="text-sm text-neutral-500">Ton meilleur score</p>
            <p className="text-2xl font-bold text-[var(--accent)]">{bestScore}</p>
          </div>
        )}

        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-neutral-400 mb-3 text-center">
            Nombre de vies
          </label>
          <div className="flex gap-2">
            {[5, 10, 15].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxLives(n)}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition touch-manipulation ${
                  maxLives === n
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-[var(--accent)]"
                }`}
              >
                {n} ❤️
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mt-2">
          <button
            type="button"
            onClick={startGame}
            disabled={!pseudo.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Commencer
          </button>
          <button
            type="button"
            onClick={showLeaderboard}
            className="btn-secondary"
          >
            🏆 Classement mondial
          </button>
        </div>
      </main>
    );
  }

  // Écran du leaderboard
  if (phase === "leaderboard") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center gap-6">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={() => setPhase("config")}
            className="text-neutral-400 hover:text-[var(--accent)] transition text-sm"
          >
            ← Retour
          </button>
          <button
            onClick={fetchLeaderboard}
            className="text-neutral-400 hover:text-[var(--accent)] transition text-sm"
          >
            🔄 Actualiser
          </button>
        </div>

        <h1 className="text-2xl font-bold">🏆 Classement mondial</h1>

        {loadingLeaderboard ? (
          <p className="text-neutral-400">Chargement...</p>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-neutral-400">
            <p>Aucun score pour l'instant.</p>
            <p className="text-sm mt-2">Sois le premier à jouer !</p>
          </div>
        ) : (
          <ul className="w-full max-w-sm space-y-2">
            {leaderboard.slice(0, 20).map((entry, i) => {
              const isMe = entry.pseudo.toLowerCase() === pseudo.toLowerCase();
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
              return (
                <li
                  key={i}
                  className={`flex justify-between items-center py-3 px-4 rounded-xl border ${
                    isMe
                      ? "bg-[var(--accent)]/20 border-[var(--accent)]"
                      : "bg-[var(--card)] border-neutral-700"
                  }`}
                >
                  <span className={isMe ? "font-bold" : ""}>
                    <span className="mr-2">{medal}</span>
                    {entry.pseudo}
                  </span>
                  <span className={`font-bold ${isMe ? "text-[var(--accent)]" : ""}`}>
                    {entry.score} pts
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setPhase("config")}
          className="btn-primary w-full max-w-sm mt-4"
        >
          Jouer
        </button>
      </main>
    );
  }

  // Écran de game over
  if (phase === "gameover") {
    const isNewBest = score >= bestScore && score > 0;
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">Game Over</h1>
        
        <div className="text-center space-y-2">
          <p className="text-neutral-400">Score de {pseudo}</p>
          <p className="text-5xl font-bold text-[var(--accent)]">{score}</p>
          {isNewBest && (
            <p className="text-green-400 font-semibold">🎉 Nouveau record personnel !</p>
          )}
          {myRank && (
            <p className="text-neutral-300">
              Tu es <span className="font-bold text-[var(--accent)]">#{myRank}</span> mondial !
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-500">Meilleur score</p>
          <p className="text-xl font-bold">{bestScore}</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
          <button
            type="button"
            onClick={startGame}
            className="btn-primary"
          >
            Rejouer
          </button>
          <button
            type="button"
            onClick={showLeaderboard}
            className="btn-secondary"
          >
            🏆 Voir le classement
          </button>
          <Link href="/" className="btn-secondary text-center block">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  // Écran de jeu
  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] p-3 pb-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-lg font-bold">
            {"❤️".repeat(lives)}
            <span className="text-neutral-600">{"🖤".repeat(maxLives - lives)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[var(--accent)]">{score}</p>
          <p className="text-xs text-neutral-500">{pseudo}</p>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mb-2">
        <p className="text-lg font-semibold text-neutral-300">Quelque chose qui…</p>
      </div>

      {/* Liste des mots */}
      <div className="flex-1 overflow-y-auto mb-2">
        <div className="grid grid-cols-1 gap-1.5">
          {card.mots.map((mot, i) => {
            const isRevealed = i < revealedCount;
            return (
              <div
                key={i}
                className={`py-2.5 px-3 rounded-lg font-medium text-left transition ${
                  isRevealed
                    ? "bg-[var(--card)] border border-neutral-600 text-neutral-300"
                    : "bg-neutral-800 border border-neutral-700 text-neutral-600"
                }`}
              >
                <span className="text-xs mr-1.5 text-neutral-500">
                  {i + 1}.
                </span>
                {isRevealed ? mot : "• • • • •"}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone de réponse */}
      {feedback === null ? (
        <div className="flex-shrink-0 space-y-2">
          <button
            type="button"
            onClick={revealNext}
            disabled={revealedCount >= 8}
            className="w-full py-2.5 rounded-lg font-medium bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition touch-manipulation"
          >
            {revealedCount >= 8 ? "Tous les mots révélés" : `Révéler le mot ${revealedCount + 1}`}
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              placeholder="Ta réponse..."
              className="flex-1 py-2.5 px-3 rounded-lg bg-[var(--card)] border border-neutral-600 text-white placeholder-neutral-500 focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={checkAnswer}
              disabled={!answer.trim()}
              className="px-4 py-2.5 rounded-lg font-medium bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition touch-manipulation"
            >
              Valider
            </button>
          </div>

          <button
            type="button"
            onClick={giveUp}
            className="w-full py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-300 transition"
          >
            Je passe (−1 ❤️)
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 space-y-3">
          <div
            className={`p-3 rounded-xl text-center ${
              feedback === "correct"
                ? "bg-green-500/20 border border-green-500"
                : "bg-red-500/20 border border-red-500"
            }`}
          >
            {feedback === "correct" ? (
              <p className="text-green-400 font-bold">Bravo !</p>
            ) : (
              <>
                <p className="text-red-400 font-bold">{feedback === "gaveup" ? "Passé !" : "Raté !"}</p>
                <p className="text-neutral-300 text-sm mt-1">
                  Réponse : <span className="font-bold text-white">{keyword}</span>
                </p>
              </>
            )}
            <p className="text-neutral-500 text-xs mt-1">{card.regle}</p>
          </div>

          <button
            type="button"
            onClick={nextCard}
            className="w-full py-3 rounded-xl font-semibold bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition touch-manipulation"
          >
            Carte suivante
          </button>
        </div>
      )}
    </main>
  );
}
