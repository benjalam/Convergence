import Link from "next/link";

export default function Regles() {
  return (
    <main className="min-h-screen p-6 pb-24 flex flex-col items-center">
      <Link href="/" className="absolute top-4 left-4 stat-bubble text-sm">
        ← Accueil
      </Link>

      <div className="w-full max-w-2xl mt-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📖</div>
          <h1 className="text-3xl font-black text-gray-800">Règles du jeu</h1>
          <p className="text-gray-500 mt-1">Comment jouer à Convergence</p>
        </div>

        {/* Mode Équipes */}
        <div className="game-card mb-6">
          <div className="theme-badge theme-badge-classique">👥 Équipes</div>
          
          <div className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎯 Objectif</h3>
              <p className="text-gray-600">
                Faire deviner une <strong>règle</strong> (ex. &quot;Quelque chose qui pique&quot;) 
                en utilisant les <strong>8 mots indices</strong>. Moins tu révèles de mots, 
                plus tu marques de points !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎮 Comment jouer</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span>📱</span>
                  <span>Un <strong>maître du jeu</strong> tient le téléphone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🗣️</span>
                  <span>Il dit les mots à l&apos;oral, un par un</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Quand l&apos;équipe trouve, sélectionne le dernier mot utilisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⏱️</span>
                  <span>Chaque équipe joue pendant la durée choisie</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mode Solo */}
        <div className="game-card mb-6">
          <div className="theme-badge theme-badge-sport">🎮 Solo</div>
          
          <div className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎯 Objectif</h3>
              <p className="text-gray-600">
                Deviner la règle avec <strong>5 vies</strong>. Chaque erreur = 1 vie perdue.
                Fais le meilleur score possible !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎨 Les 3 thèmes</h3>
              <div className="space-y-2">
                <div className="bg-indigo-50 p-3 rounded-xl border-l-4 border-indigo-400">
                  <strong className="text-indigo-700">📝 Classique</strong>
                  <p className="text-gray-600 text-sm">Trouve le mot-clé de la règle</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-xl border-l-4 border-pink-400">
                  <strong className="text-pink-700">🎬 Cinéma</strong>
                  <p className="text-gray-600 text-sm">Trouve le titre du film</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border-l-4 border-amber-400">
                  <strong className="text-amber-700">⚽ Sport</strong>
                  <p className="text-gray-600 text-sm">Trouve le sport ou l&apos;athlète</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Chaque thème a son propre classement mondial !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎮 Comment jouer</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span>🔒</span>
                  <span>Les mots sont cachés au départ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>👆</span>
                  <span>Clique pour révéler les mots un par un</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span><strong>Bonne réponse</strong> = points selon les mots révélés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>❌</span>
                  <span><strong>Mauvaise réponse</strong> = -1 vie (tu peux continuer)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barème */}
        <div className="game-card">
          <div className="theme-badge bg-emerald-500">💰 Points</div>
          
          <div className="pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Barème des points</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mot: 1, pts: 15 },
                { mot: 2, pts: 12 },
                { mot: 3, pts: 10 },
                { mot: 4, pts: 8 },
                { mot: 5, pts: 6 },
                { mot: 6, pts: 4 },
                { mot: 7, pts: 2 },
                { mot: 8, pts: 1 },
              ].map((item) => (
                <div 
                  key={item.mot} 
                  className="bg-gray-50 rounded-xl p-2 text-center"
                >
                  <p className="text-xs text-gray-400">Mot {item.mot}</p>
                  <p className="font-black text-indigo-600">{item.pts}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="btn-party text-center block">
            🏠 Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
