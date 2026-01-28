"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Config() {
  const router = useRouter();
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(["Équipe 1", "Équipe 2"]);
  const [numRounds, setNumRounds] = useState(2);

  const updateTeams = (n) => {
    const next = Math.min(4, Math.max(2, n));
    setNumTeams(next);
    setTeamNames((prev) => {
      const nextNames = [...prev];
      while (nextNames.length < next)
        nextNames.push(`Équipe ${nextNames.length + 1}`);
      return nextNames.slice(0, next);
    });
  };

  const setTeamName = (i, name) => {
    setTeamNames((prev) => {
      const next = [...prev];
      next[i] = name || `Équipe ${i + 1}`;
      return next;
    });
  };

  const startMatch = () => {
    const config = {
      numTeams,
      teamNames: teamNames.slice(0, numTeams),
      numRounds,
    };
    localStorage.setItem("convergence_config", JSON.stringify(config));
    router.push("/game");
  };

  return (
    <main className="min-h-screen p-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-neutral-400 hover:text-[var(--accent)] transition"
        >
          ← Retour
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Configuration</h1>
      <p className="text-neutral-400 mb-8">Convergence — Quelque chose qui…</p>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Nombre d&apos;équipes (2 à 4)
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateTeams(n)}
                className={`flex-1 py-3 rounded-xl font-medium transition touch-manipulation ${
                  numTeams === n
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-[var(--accent)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Noms des équipes (optionnel)
          </label>
          <div className="space-y-2">
            {teamNames.slice(0, numTeams).map((name, i) => (
              <input
                key={i}
                type="text"
                value={name}
                onChange={(e) => setTeamName(i, e.target.value)}
                placeholder={`Équipe ${i + 1}`}
                className="w-full py-3 px-4 rounded-xl bg-[var(--card)] border border-neutral-600 text-white placeholder-neutral-500 focus:border-[var(--accent)] focus:outline-none"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Nombre de tours
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumRounds(n)}
                className={`flex-1 min-w-[4rem] py-3 rounded-xl font-medium transition touch-manipulation ${
                  numRounds === n
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--card)] border border-neutral-600 text-neutral-300 hover:border-[var(--accent)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <button onClick={startMatch} className="btn-primary w-full">
          Commencer le match
        </button>
      </div>
    </main>
  );
}
