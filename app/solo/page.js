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

// Extrait le mot-clé de la règle (ex: "Quelque chose qui brille" -> "brille")
function extractKeyword(regle) {
  // Enlève "Quelque chose qui " ou "Quelque chose qui s'" ou "Quelque chose qui est "
  const cleaned = regle
    .replace(/^Quelque chose qui s'/i, "")
    .replace(/^Quelque chose qui est /i, "")
    .replace(/^Quelque chose qui /i, "")
    .trim()
    .toLowerCase();
  return cleaned;
}

// Normalise une chaîne pour comparaison (sans accents, minuscules)
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function Solo() {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null, "correct", "incorrect"
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const card = deck[currentIndex];
  const keyword = card ? extractKeyword(card.regle) : "";

  useEffect(() => {
    setDeck(shuffle(cartesData));
  }, []);

  const revealNext = () => {
    if (revealedCount < 8) {
      setRevealedCount((c) => c + 1);
    }
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;

    const userAnswer = normalize(answer);
    const correctAnswer = normalize(keyword);

    // Vérifie si la réponse est suffisamment proche
    const isCorrect =
      userAnswer === correctAnswer ||
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      setFeedback("incorrect");
      setShowAnswer(true);
    }
    setTotalPlayed((t) => t + 1);
  };

  const nextCard = () => {
    setRevealedCount(0);
    setAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    if (currentIndex + 1 >= deck.length) {
      // Recharger le deck
      setDeck(shuffle(cartesData));
      setCurrentIndex(0);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const giveUp = () => {
    setFeedback("incorrect");
    setShowAnswer(true);
    setTotalPlayed((t) => t + 1);
  };

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
      <div className="flex items-center justify-between gap-2 mb-3">
        <Link href="/" className="text-neutral-400 hover:text-[var(--accent)] transition text-sm">
          ← Accueil
        </Link>
        <div className="text-right">
          <p className="text-sm font-bold text-[var(--accent)]">
            {score} / {totalPlayed}
          </p>
          <p className="text-xs text-neutral-500">Score</p>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mb-3">
        <p className="text-lg font-semibold text-neutral-300">Quelque chose qui…</p>
        <p className="text-xs text-neutral-500">Trouve la fin de la règle</p>
      </div>

      {/* Liste des mots */}
      <div className="flex-1 overflow-y-auto mb-3">
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
            Je donne ma langue au chat
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 space-y-3">
          <div
            className={`p-4 rounded-xl text-center ${
              feedback === "correct"
                ? "bg-green-500/20 border border-green-500"
                : "bg-red-500/20 border border-red-500"
            }`}
          >
            {feedback === "correct" ? (
              <p className="text-green-400 font-bold text-lg">Bravo !</p>
            ) : (
              <>
                <p className="text-red-400 font-bold text-lg">Raté !</p>
                {showAnswer && (
                  <p className="text-neutral-300 mt-1">
                    La réponse était : <span className="font-bold text-white">{keyword}</span>
                  </p>
                )}
              </>
            )}
            <p className="text-neutral-400 text-sm mt-2">{card.regle}</p>
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
