"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Config() {
  const router = useRouter();
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(["Équipe 1", "Équipe 2"]);
  const [numRounds, setNumRounds] = useState(2);
  const [turnDuration, setTurnDuration] = useState(120);

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
      turnDuration,
    };
    localStorage.setItem("convergence_config", JSON.stringify(config));
    router.push("/game");
  };

  return (
    <main className="min-h-screen p-6 pb-24 flex flex-col items-center">
      <Link href="/" className="absolute top-4 left-4 stat-bubble text-sm">
        ← Accueil
      </Link>

      <div className="w-full max-w-md mt-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">👥</div>
          <h1 className="text-3xl font-black text-gray-800">Mode Équipes</h1>
          <p className="text-gray-500 mt-1">Configure ta partie</p>
        </div>

        <div className="game-card">
          <div className="space-y-6">
            {/* Nombre d'équipes */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                Nombre d&apos;équipes
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateTeams(n)}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                      numTeams === n
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Noms des équipes */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                Noms des équipes
              </label>
              <div className="space-y-2">
                {teamNames.slice(0, numTeams).map((name, i) => (
                  <input
                    key={i}
                    type="text"
                    value={name}
                    onChange={(e) => setTeamName(i, e.target.value)}
                    placeholder={`Équipe ${i + 1}`}
                    className="input-party"
                  />
                ))}
              </div>
            </div>

            {/* Nombre de tours */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                Nombre de tours
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumRounds(n)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      numRounds === n
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Durée d'un tour */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                Durée d&apos;un tour
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "30s", value: 30, icon: "⚡" },
                  { label: "1 min", value: 60, icon: "🏃" },
                  { label: "2 min", value: 120, icon: "⏱️" },
                  { label: "5 min", value: 300, icon: "🐢" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTurnDuration(opt.value)}
                    className={`py-3 px-3 rounded-xl font-bold transition-all ${
                      turnDuration === opt.value
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={startMatch} className="btn-party w-full">
            🚀 C&apos;est parti !
          </button>
        </div>
      </div>
    </main>
  );
}
