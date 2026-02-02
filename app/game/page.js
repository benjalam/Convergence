"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import cartesData from "@/data/datamot.json";

const POINTS = [15, 12, 10, 8, 6, 4, 2, 1];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(cartes) {
  return shuffle(cartes);
}

// Timer circulaire
function CircleTimer({ seconds, maxSeconds }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / maxSeconds) * circumference;
  const isLow = seconds <= 10;
  const percentage = Math.round((seconds / maxSeconds) * 100);
  
  return (
    <div className="relative w-20 h-20">
      <svg className="timer-ring w-full h-full" viewBox="0 0 100 100">
        <circle 
          className="timer-ring-bg" 
          cx="50" cy="50" r={radius} 
          fill="none" 
          strokeWidth="8" 
        />
        <circle
          className={`timer-ring-progress ${isLow ? "animate-pulse-danger" : ""}`}
          cx="50" cy="50" r={radius}
          fill="none"
          strokeWidth="8"
          stroke={isLow ? "#ef4444" : percentage > 50 ? "#22c55e" : "#f59e0b"}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-black text-lg ${isLow ? "text-red-500" : "text-white"}`}>
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}

export default function Game() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [turnScore, setTurnScore] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [maxTimerSeconds, setMaxTimerSeconds] = useState(120);
  const [phase, setPhase] = useState("playing");
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const numTeams = config?.numTeams ?? 0;
  const teamNames = config?.teamNames ?? [];
  const numRounds = config?.numRounds ?? 1;
  const currentTeamName = teamNames[currentTeamIndex] ?? `Équipe ${currentTeamIndex + 1}`;
  const card = deck[currentCardIndex];
  const isLastTeamOfRound = currentTeamIndex === numTeams - 1;
  const isLastRound = currentRound === numRounds - 1;
  const gameOver = isLastTeamOfRound && isLastRound;
  const roundOverMoreRounds = isLastTeamOfRound && !isLastRound;

  // Confettis
  const triggerConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#f97316", "#22d3ee", "#6366f1", "#22c55e", "#facc15"],
    });
  };

  useEffect(() => {
    const raw = localStorage.getItem("convergence_config");
    if (!raw) {
      router.replace("/config");
      return;
    }
    try {
      const c = JSON.parse(raw);
      setConfig(c);
      setScores(Array(c.numTeams).fill(0));
      const initialDeck = buildDeck(cartesData);
      setDeck(initialDeck);
      setCurrentCardIndex(0);
      setHasMoreCards(initialDeck.length > 0);
      const duration = typeof c.turnDuration === "number" ? c.turnDuration : 120;
      setTimerSeconds(duration);
      setMaxTimerSeconds(duration);
    } catch {
      router.replace("/config");
    }
  }, [router]);

  const nextCard = useCallback(() => {
    setSelectedIndex(-1);
    setCurrentCardIndex((i) => {
      const next = i + 1;
      if (!deck || next >= deck.length) {
        setHasMoreCards(false);
        return i;
      }
      return next;
    });
  }, [deck]);

  const found = () => {
    if (selectedIndex < 0) return;
    const pts = POINTS[selectedIndex];
    setScores((s) => {
      const n = [...s];
      n[currentTeamIndex] += pts;
      return n;
    });
    setTurnScore((t) => t + pts);
    triggerConfetti();
    nextCard();
  };

  const skip = () => {
    nextCard();
  };

  const endTurn = () => {
    nextCard();
    setPhase("turnSummary");
  };

  useEffect(() => {
    if (phase !== "playing" || !config || timerSeconds <= 0) return;
    const id = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase, config, timerSeconds]);

  useEffect(() => {
    if (phase !== "playing" || !config || timerSeconds > 0) return;
    nextCard();
    setPhase("turnSummary");
  }, [phase, config, timerSeconds, nextCard]);

  const passToNextTeam = () => {
    setTurnScore(0);
    const duration = typeof config?.turnDuration === "number" ? config.turnDuration : 120;
    setTimerSeconds(duration);
    setMaxTimerSeconds(duration);
    setSelectedIndex(-1);
    if (!hasMoreCards) {
      setPhase("finalRanking");
      return;
    }
    if (isLastTeamOfRound && !isLastRound) {
      setCurrentRound((r) => r + 1);
      setCurrentTeamIndex(0);
    } else if (isLastTeamOfRound && isLastRound) {
      setPhase("finalRanking");
      return;
    } else {
      setCurrentTeamIndex((i) => i + 1);
    }
    setPhase("playing");
  };

  if (!config) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl font-bold animate-pulse">Chargement...</div>
      </main>
    );
  }

  // Turn Summary
  if (phase === "turnSummary") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black text-gray-800">Fin du tour !</h1>
        
        <div className="game-card w-full max-w-sm text-center">
          <p className="text-gray-500 uppercase tracking-wide text-sm">{currentTeamName}</p>
          <p className="text-5xl font-black text-indigo-600 my-3">+{turnScore}</p>
          <p className="text-gray-600">points ce tour</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {gameOver && (
            <button onClick={() => setPhase("finalRanking")} className="btn-party">
              🏆 Voir le classement final
            </button>
          )}
          {roundOverMoreRounds && (
            <button onClick={passToNextTeam} className="btn-party">
              ➡️ Round suivant
            </button>
          )}
          {!gameOver && !roundOverMoreRounds && (
            <button onClick={passToNextTeam} className="btn-party">
              ➡️ Équipe suivante
            </button>
          )}
        </div>
      </main>
    );
  }

  // Final Ranking
  if (phase === "finalRanking") {
    const ordered = scores
      .map((s, i) => ({ name: teamNames[i] ?? `Équipe ${i + 1}`, score: s }))
      .sort((a, b) => b.score - a.score);

    // Trigger confetti on mount
    useEffect(() => {
      triggerConfetti();
    }, []);

    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-black text-gray-800 animate-victory">
          🏆 Classement Final
        </h1>
        
        <div className="game-card w-full max-w-sm">
          <div className="space-y-3">
            {ordered.map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-4 px-4 rounded-xl ${
                  i === 0 ? "bg-amber-50 border-2 border-amber-300" :
                  i === 1 ? "bg-gray-50 border-2 border-gray-200" :
                  i === 2 ? "bg-orange-50 border-2 border-orange-200" :
                  "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span className="font-bold text-gray-800">{t.name}</span>
                </div>
                <span className="font-black text-xl text-indigo-600">{t.score}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="btn-party text-center max-w-sm">
          🏠 Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  // Playing Phase
  return (
    <main className="h-[100dvh] p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <CircleTimer seconds={timerSeconds} maxSeconds={maxTimerSeconds} />
        <div className="stat-bubble text-right">
          <p className="text-xs opacity-70">
            Tour {currentRound + 1}/{numRounds} · {currentTeamName}
          </p>
          <p className="text-2xl font-black">{scores[currentTeamIndex] ?? 0} pts</p>
        </div>
      </div>

      {card && (
        <>
          {/* Rule Card */}
          <div className="game-card mb-3 animate-card-appear">
            <div className="theme-badge theme-badge-classique">📝 Classique</div>
            
            <div className="pt-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Règle à deviner</p>
              <p className="text-xl font-black text-gray-800">{card.regle}</p>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              👆 Lis les mots jusqu&apos;à ce que ton équipe trouve !
            </p>
          </div>

          {/* Words List */}
          <div className="flex-1 overflow-y-auto mb-3">
            <div className="space-y-2">
              {card.mots.map((mot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-left transition-all touch-manipulation ${
                    selectedIndex === i
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-[1.02] shadow-lg shadow-indigo-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  <span className={`text-sm mr-2 ${selectedIndex === i ? "text-white/70" : "text-gray-400"}`}>
                    {i + 1}.
                  </span>
                  {mot}
                  <span className={`float-right text-sm ${selectedIndex === i ? "text-white/70" : "text-gray-400"}`}>
                    {POINTS[i]} pts
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={found}
              disabled={selectedIndex < 0}
              className="btn-party-success flex-1 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓ Trouvé !
            </button>
            <button 
              type="button" 
              onClick={skip} 
              className="btn-party-secondary flex-1 py-3 text-base"
            >
              Passer
            </button>
            <button
              type="button"
              onClick={endTurn}
              className="btn-party-danger flex-1 py-3 text-base"
            >
              Fin
            </button>
          </div>
        </>
      )}
    </main>
  );
}
