"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import cartesData from "@/data/cartes.json";

const POINTS = [15, 12, 10, 8, 6, 4, 2, 1];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Construit un deck aléatoire contenant chaque carte exactement une fois
function buildDeck(cartes) {
  return shuffle(cartes);
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
  const [phase, setPhase] = useState("playing");
  const [hasMoreCards, setHasMoreCards] = useState(true);

  const numTeams = config?.numTeams ?? 0;
  const teamNames = config?.teamNames ?? [];
  const numRounds = config?.numRounds ?? 1;
  const currentTeamName = teamNames[currentTeamIndex] ?? `Équipe ${currentTeamIndex + 1}`;
  const card = deck[currentCardIndex];
  const isLastTeamOfRound = currentTeamIndex === numTeams - 1;
  const isLastRound = currentRound === numRounds - 1;
  const gameOver = isLastTeamOfRound && isLastRound;
  const roundOverMoreRounds = isLastTeamOfRound && !isLastRound;

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
      // Initialise le chrono avec la durée choisie (fallback 120s)
      const duration = typeof c.turnDuration === "number" ? c.turnDuration : 120;
      setTimerSeconds(duration);
    } catch {
      router.replace("/config");
    }
  }, [router]);

  // Passe à la carte suivante sans jamais réutiliser une carte déjà tirée.
  // Si le deck est épuisé, on marque qu'il n'y a plus de cartes pour cette partie.
  const nextCard = useCallback(() => {
    setSelectedIndex(-1);
    setCurrentCardIndex((i) => {
      const next = i + 1;
      if (!deck || next >= deck.length) {
        setHasMoreCards(false);
        return i; // on reste sur la dernière carte visible
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
    nextCard();
  };

  const skip = () => {
    nextCard();
  };

  const endTurn = () => {
    // On considère la carte actuelle comme "utilisée" même si elle n'a pas été trouvée
    nextCard();
    setPhase("turnSummary");
  };

  useEffect(() => {
    if (phase !== "playing" || !config || timerSeconds <= 0) return;
    const id = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase, config, timerSeconds]);

  useEffect(() => {
    // Ne déclenche pas la fin de tour tant que config n'est pas chargé
    // (évite le bug où timerSeconds=0 au démarrage déclenche immédiatement la fin)
    if (phase !== "playing" || !config || timerSeconds > 0) return;
    // Le temps est écoulé : la carte courante est également consommée
    nextCard();
    setPhase("turnSummary");
  }, [phase, config, timerSeconds, nextCard]);

  const passToNextTeam = () => {
    setTurnScore(0);
    // Réinitialise le chrono avec la durée configurée (fallback 120s)
    const duration = typeof config?.turnDuration === "number" ? config.turnDuration : 120;
    setTimerSeconds(duration);
    setSelectedIndex(-1);
    // Si plus de cartes disponibles, on termine la partie
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

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const s2 = s % 60;
    return `${m}:${s2.toString().padStart(2, "0")}`;
  };

  if (!config) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Chargement…</p>
      </main>
    );
  }

  if (phase === "turnSummary") {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Fin du tour</h1>
        <p className="text-neutral-400">{currentTeamName}</p>
        <p className="text-3xl font-bold text-[var(--accent)]">
          +{turnScore} pts ce tour
        </p>
        <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
          {gameOver && (
            <button onClick={() => setPhase("finalRanking")} className="btn-primary">
              Voir le classement final
            </button>
          )}
          {roundOverMoreRounds && (
            <button onClick={passToNextTeam} className="btn-primary">
              Round suivant
            </button>
          )}
          {!gameOver && !roundOverMoreRounds && (
            <button onClick={passToNextTeam} className="btn-primary">
              Passer à l&apos;équipe suivante
            </button>
          )}
        </div>
      </main>
    );
  }

  if (phase === "finalRanking") {
    const ordered = scores
      .map((s, i) => ({ name: teamNames[i] ?? `Équipe ${i + 1}`, score: s }))
      .sort((a, b) => b.score - a.score);
    return (
      <main className="min-h-screen p-6 flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold">Classement final</h1>
        <ul className="w-full max-w-sm space-y-3">
          {ordered.map((t, i) => (
            <li
              key={i}
              className="flex justify-between items-center py-3 px-4 rounded-xl bg-[var(--card)] border border-neutral-700"
            >
              <span>
                {i + 1}. {t.name}
              </span>
              <span className="font-bold text-[var(--accent)]">{t.score} pts</span>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn-primary text-center block w-full max-w-sm">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] p-3 pb-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-2xl font-mono font-bold tabular-nums text-[var(--accent)]">
          {formatTime(timerSeconds)}
        </span>
        <div className="text-right">
          <p className="text-xs text-neutral-500">
            Tour {currentRound + 1} / {numRounds} · {currentTeamName}
          </p>
          <p className="text-base font-bold">
            {scores[currentTeamIndex] ?? 0} pts
          </p>
        </div>
      </div>

      {card && (
        <>
          <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-2 border-[var(--accent)] p-4 mb-3">
            <p className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wide mb-1">Règle à deviner</p>
            <p className="text-xl font-bold text-white">{card.regle}</p>
          </div>

          <p className="text-xs text-neutral-400 mb-2 text-center">
            Lis les mots un par un jusqu'à ce que ton équipe trouve
          </p>

          <div className="flex-1 overflow-y-auto mb-2">
            <div className="grid grid-cols-1 gap-1.5">
              {card.mots.map((mot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`py-2.5 px-3 rounded-lg font-medium text-left transition touch-manipulation break-words ${
                    selectedIndex === i
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  <span className={`text-xs mr-1.5 ${selectedIndex === i ? "text-black/60" : "text-neutral-500"}`}>
                    {i + 1}.
                  </span>
                  {mot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={found}
              disabled={selectedIndex < 0}
              className="btn-small flex-1 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trouvé !
            </button>
            <button type="button" onClick={skip} className="btn-small flex-1 py-2.5">
              Passer
            </button>
            <button
              type="button"
              onClick={endTurn}
              className="btn-small flex-1 py-2.5 border-amber-500/50 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10"
            >
              Fin
            </button>
          </div>
        </>
      )}
    </main>
  );
}
