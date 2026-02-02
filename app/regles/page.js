import Link from "next/link";

export default function Regles() {
  return (
    <main className="min-h-screen p-6 pb-24 flex flex-col items-center">
      <Link href="/" className="absolute top-4 left-4 stat-bubble text-sm">
        ← Accueil
      </Link>

      <div className="w-full max-w-2xl mt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase title-shadow">📖 Règles</h1>
          <p className="text-white/70 mt-2">Comment jouer à Convergence</p>
        </div>

        {/* Mode Équipes */}
        <div className="game-card mb-6">
          <div className="theme-badge theme-badge-classique">👥 Mode Équipes</div>
          
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
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎮 Déroulement</h3>
              <ul className="text-gray-600 space-y-2">
                <li>📱 Un <strong>maître du jeu</strong> tient le téléphone</li>
                <li>🗣️ Il dit les mots à l&apos;oral, un par un</li>
                <li>✅ Quand l&apos;équipe trouve, sélectionne le dernier mot utilisé</li>
                <li>⏭️ <strong>Passer</strong> pour changer de règle sans marquer</li>
                <li>⏱️ Chaque équipe joue pendant la durée choisie</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mode Solo */}
        <div className="game-card mb-6">
          <div className="theme-badge theme-badge-sport">🎮 Mode Solo</div>
          
          <div className="pt-4 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎯 Objectif</h3>
              <p className="text-gray-600">
                Deviner la règle avec <strong>5 vies</strong>. Chaque erreur = 1 vie perdue.
                Fais le meilleur score possible !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎨 Types de jeu</h3>
              <div className="space-y-2">
                <div className="bg-indigo-50 p-3 rounded-xl border-l-4 border-indigo-500">
                  <strong className="text-indigo-700">📝 Classique</strong>
                  <p className="text-gray-600 text-sm">Trouve le mot-clé (ex: &quot;brille&quot; pour &quot;Quelque chose qui brille&quot;)</p>
                </div>
                <div className="bg-red-50 p-3 rounded-xl border-l-4 border-red-500">
                  <strong className="text-red-700">🎬 Cinéma</strong>
                  <p className="text-gray-600 text-sm">Trouve le titre du film (français ou anglais)</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl border-l-4 border-orange-500">
                  <strong className="text-orange-700">⚽ Sport</strong>
                  <p className="text-gray-600 text-sm">Trouve le sport, l&apos;athlète ou l&apos;équipe</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                ⭐ Chaque mode a son propre classement mondial !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🎮 Déroulement</h3>
              <ul className="text-gray-600 space-y-2">
                <li>🔒 Les mots sont cachés au départ</li>
                <li>👆 Clique pour révéler les mots un par un</li>
                <li>✏️ Tape ta réponse et valide</li>
                <li>✅ <strong>Bonne réponse</strong> = points selon les mots révélés</li>
                <li>❌ <strong>Mauvaise réponse</strong> = -1 vie (tu peux continuer)</li>
                <li>⏭️ <strong>Je passe</strong> = -1 vie, carte suivante</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barème */}
        <div className="game-card">
          <div className="theme-badge bg-green-500">💰 Points</div>
          
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
                  className="bg-gray-50 rounded-xl p-2 text-center border-b-3"
                  style={{ borderBottom: "3px solid #e5e7eb" }}
                >
                  <p className="text-xs text-gray-400">Mot {item.mot}</p>
                  <p className="font-black text-[var(--accent)]">{item.pts}</p>
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
