"use client";

import { useState, useEffect } from "react";
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

// Extrait le mot-clé de la règle (mode classique)
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

// Vérifie si la réponse est acceptable (mode classique)
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

// Vérifie si la réponse est acceptable (mode cinéma - tolérance jusqu'à 10 caractères)
function isMovieAnswerClose(userAnswer, correctAnswer) {
  const normUser = normalize(userAnswer);
  const normCorrect = normalize(correctAnswer);
  
  if (normUser === normCorrect) return true;
  if (normCorrect.includes(normUser) && normUser.length >= 3) return true;
  if (normUser.includes(normCorrect) && normCorrect.length >= 3) return true;
  
  const distance = levenshtein(normUser, normCorrect);
  // Tolérance jusqu'à 10 caractères de différence pour les titres de films
  if (distance <= 10) return true;
  
  return false;
}

const MAX_LIVES = 5;
const POINTS = [15, 12, 10, 8, 6, 4, 2, 1]; // Points selon le nombre de mots révélés

const GAME_MODES = {
  classique: {
    name: "Classique",
    emoji: "📝",
    description: "Trouve le mot-clé de la règle",
    data: dataMotData,
  },
  cinema: {
    name: "Cinéma",
    emoji: "🎬",
    description: "Trouve le titre du film (en anglais ou français)",
    data: dataCineData,
  },
  sport: {
    name: "Sport",
    emoji: "⚽",
    description: "Trouve le sport, l'athlète ou l'équipe",
    data: dataSportData,
  },
};

export default function Solo() {
  const [phase, setPhase] = useState("config"); // "config", "playing", "gameover", "leaderboard"
  const [gameMode, setGameMode] = useState("classique"); // "classique" ou "cinema"
  const [pseudo, setPseudo] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [lastPoints, setLastPoints] = useState(0); // Points gagnés sur la dernière carte
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null, "correct", "incorrect", "gaveup", "wrong"
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState({ classique: 0, cinema: 0, sport: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState("classique"); // Mode affiché dans le leaderboard
  const [myRank, setMyRank] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [lastKeyword, setLastKeyword] = useState(""); // Pour afficher la réponse au game over
  
  // Raccourci pour le meilleur score du mode actuel
  const bestScore = bestScores[gameMode] || 0;

  const card = deck[currentIndex];
  // En mode cinéma/sport, la réponse est directement le titre (regle)
  // En mode classique, on extrait le mot-clé de "Quelque chose qui..."
  const keyword = card 
    ? (gameMode === "classique" ? extractKeyword(card.regle) : card.regle) 
    : "";

  // Charger pseudo et meilleurs scores depuis localStorage
  useEffect(() => {
    const savedPseudo = localStorage.getItem("convergence_solo_pseudo");
    if (savedPseudo) setPseudo(savedPseudo);
    
    // Charger les meilleurs scores pour chaque mode
    const scores = {};
    Object.keys(GAME_MODES).forEach((mode) => {
      const saved = localStorage.getItem(`convergence_solo_best_${mode}`);
      scores[mode] = saved ? parseInt(saved, 10) || 0 : 0;
    });
    setBestScores(scores);
  }, []);

  // Charger le leaderboard pour un mode donné
  const fetchLeaderboard = async (mode = leaderboardMode) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/leaderboard?mode=${mode}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setLeaderboardMode(mode);
    } catch (e) {
      console.error("Erreur chargement leaderboard:", e);
    }
    setLoadingLeaderboard(false);
  };

  // Soumettre le score au leaderboard (avec le mode)
  const submitScore = async (finalScore, mode = gameMode) => {
    if (!pseudo.trim()) return;
    
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo: pseudo.trim(), score: finalScore, mode }),
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

  // Sauvegarder le meilleur score par mode
  useEffect(() => {
    if (score > bestScore && phase === "playing") {
      setBestScores((prev) => ({ ...prev, [gameMode]: score }));
      localStorage.setItem(`convergence_solo_best_${gameMode}`, score.toString());
    }
  }, [score, bestScore, gameMode, phase]);

  const startGame = () => {
    if (!pseudo.trim()) return;
    const modeData = GAME_MODES[gameMode].data;
    setDeck(shuffle(modeData));
    setCurrentIndex(0);
    setRevealedCount(1);
    setAnswer("");
    setFeedback(null);
    setLives(MAX_LIVES);
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

    // Utilise la fonction de validation appropriée selon le mode
    // Cinema et Sport utilisent une tolérance plus grande (titres/noms)
    const isCorrect = gameMode === "classique" 
      ? isAnswerClose(answer, keyword)
      : isMovieAnswerClose(answer, keyword);

    if (isCorrect) {
      // Points basés sur le nombre de mots révélés (0 = pas encore révélé = 15pts bonus)
      const wordIndex = Math.max(0, revealedCount - 1);
      const pts = POINTS[wordIndex] || 1;
      setLastPoints(pts);
      setFeedback("correct");
      setScore((s) => s + pts);
    } else {
      // Mauvaise réponse : perd 1 vie mais peut continuer à deviner
      setLastPoints(0);
      setAnswer(""); // Vide le champ pour réessayer
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setLastKeyword(keyword); // Sauvegarde la réponse pour l'afficher au game over
        submitScore(score);
        setPhase("gameover");
        return;
      }
      
      // Feedback temporaire "wrong" qui disparaît après 1 seconde
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback((f) => f === "wrong" ? null : f);
      }, 1000);
    }
  };

  const nextCard = () => {
    setRevealedCount(1);
    setAnswer("");
    setFeedback(null);
    setLastPoints(0);
    if (currentIndex + 1 >= deck.length) {
      const modeData = GAME_MODES[gameMode].data;
      setDeck(shuffle(modeData));
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
      setLastKeyword(keyword);
      submitScore(score);
      setPhase("gameover");
    }
  };

  const showLeaderboard = () => {
    fetchLeaderboard(gameMode);
    setPhase("leaderboard");
  };

  // Écran de configuration
  if (phase === "config") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-5">
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

        {/* Sélection du mode de jeu */}
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Type de jeu
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(GAME_MODES).map(([key, mode]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGameMode(key)}
                className={`py-3 px-2 rounded-xl font-medium text-center transition ${
                  gameMode === key
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                <span className="block text-lg">{mode.emoji}</span>
                <span className="block text-xs">{mode.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            {GAME_MODES[gameMode].description}
          </p>
        </div>

        {bestScore > 0 && (
          <div className="text-center">
            <p className="text-sm text-neutral-500">Ton meilleur score</p>
            <p className="text-2xl font-bold text-[var(--accent)]">{bestScore}</p>
          </div>
        )}

        <p className="text-neutral-400 text-center">
          Tu as <span className="font-bold text-white">5 ❤️</span> pour faire le meilleur score !
        </p>

        <div className="flex flex-col gap-3 w-full max-w-sm">
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
      <main className="min-h-screen p-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={() => setPhase("config")}
            className="text-neutral-400 hover:text-[var(--accent)] transition text-sm"
          >
            ← Retour
          </button>
          <button
            onClick={() => fetchLeaderboard(leaderboardMode)}
            className="text-neutral-400 hover:text-[var(--accent)] transition text-sm"
          >
            🔄 Actualiser
          </button>
        </div>

        <h1 className="text-2xl font-bold">🏆 Classement mondial</h1>

        {/* Onglets de sélection du mode */}
        <div className="w-full max-w-sm flex gap-1 bg-[var(--card)] p-1 rounded-xl">
          {Object.entries(GAME_MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => fetchLeaderboard(key)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition ${
                leaderboardMode === key
                  ? "bg-[var(--accent)] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {mode.emoji}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          {GAME_MODES[leaderboardMode].emoji} {GAME_MODES[leaderboardMode].name}
        </p>

        {loadingLeaderboard ? (
          <p className="text-neutral-400">Chargement...</p>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-neutral-400">
            <p>Aucun score pour l&apos;instant.</p>
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
        
        {lastKeyword && (
          <div className="text-center bg-red-500/20 border border-red-500 rounded-xl p-3 w-full max-w-sm">
            <p className="text-neutral-400 text-sm">
              {gameMode === "cinema" ? "Le film était :" 
                : gameMode === "sport" ? "La réponse était :" 
                : "La réponse était :"}
            </p>
            <p className="text-white font-bold text-lg">{lastKeyword}</p>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <p className="text-neutral-400">
            Score de {pseudo} ({GAME_MODES[gameMode].emoji} {GAME_MODES[gameMode].name})
          </p>
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
            <span className="text-neutral-600">{"🖤".repeat(MAX_LIVES - lives)}</span>
          </p>
          <p className="text-xs text-neutral-500">
            {GAME_MODES[gameMode].emoji} {GAME_MODES[gameMode].name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[var(--accent)]">{score}</p>
          <p className="text-xs text-neutral-500">{pseudo}</p>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mb-2">
        {gameMode === "cinema" ? (
          <p className="text-lg font-semibold text-neutral-300">🎬 Trouve le film !</p>
        ) : gameMode === "sport" ? (
          <p className="text-lg font-semibold text-neutral-300">⚽ Trouve le sport / athlète / équipe !</p>
        ) : (
          <p className="text-lg font-semibold text-neutral-300">Quelque chose qui…</p>
        )}
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
      {feedback === null || feedback === "wrong" ? (
        <div className="flex-shrink-0 space-y-2">
          {/* Indicateur de mauvaise réponse */}
          {feedback === "wrong" && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg py-2 px-3 text-center">
              <p className="text-red-400 font-medium text-sm">Raté ! Réessaie... (−1 ❤️)</p>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={revealNext}
              disabled={revealedCount >= 8}
              className="flex-1 py-2.5 rounded-lg font-medium bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition touch-manipulation"
            >
              {revealedCount >= 8 ? "Tous révélés" : `Révéler mot ${revealedCount + 1}`}
            </button>
            <span className="text-sm text-neutral-500 w-16 text-right">
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
                gameMode === "cinema" ? "Titre du film..." 
                : gameMode === "sport" ? "Sport / Athlète / Équipe..."
                : "Ta réponse..."
              }
              className={`flex-1 py-2.5 px-3 rounded-lg bg-[var(--card)] border text-white placeholder-neutral-500 focus:outline-none transition ${
                feedback === "wrong" 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-neutral-600 focus:border-[var(--accent)]"
              }`}
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
            className="w-full py-2.5 rounded-lg font-medium bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition"
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
              <>
                <p className="text-green-400 font-bold text-lg">Bravo ! +{lastPoints} pts</p>
                <p className="text-neutral-400 text-xs mt-1">
                  {revealedCount <= 1 ? "Sans indice !" : `Trouvé au mot ${revealedCount}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-red-400 font-bold">Passé !</p>
                <p className="text-neutral-300 text-sm mt-1">
                  Réponse : <span className="font-bold text-white">{gameMode === "classique" ? keyword : card.regle}</span>
                </p>
              </>
            )}
            {gameMode === "classique" && (
              <p className="text-neutral-500 text-xs mt-1">{card.regle}</p>
            )}
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
