import Link from "next/link";

export default function Regles() {
  return (
    <main className="min-h-screen p-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-neutral-400 hover:text-[var(--accent)] transition"
        >
          ← Retour
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">Règles du jeu</h1>
      <p className="text-neutral-400 mb-8">
        Convergence — Quelque chose qui…
      </p>

      {/* Mode Équipes */}
      <section className="space-y-6 text-neutral-300 leading-relaxed mb-12">
        <h2 className="text-xl font-bold text-[var(--accent)]">Mode Équipes</h2>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Objectif</h3>
          <p>
            Faire deviner à ton équipe une <strong>règle</strong> (ex. &quot;Quelque chose qui
            pique&quot;) en utilisant les <strong>8 mots indices</strong>. Moins tu révèles de
            mots avant qu&apos;ils trouvent, plus tu marques de points.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Déroulement</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Un <strong>maître du jeu (MJ)</strong> tient le téléphone et voit la règle + les 8 mots.</li>
            <li>Il dit les mots à l&apos;oral un par un. L&apos;équipe propose des réponses.</li>
            <li>Quand l&apos;équipe trouve, le MJ <strong>sélectionne le dernier mot utilisé</strong> (clic sur le mot), puis <strong>Trouvé !</strong> pour valider les points.</li>
            <li><strong>Passer</strong> : changer de règle sans marquer.</li>
            <li><strong>Fin du tour</strong> : terminer le tour avant la fin du chrono.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Chrono</h3>
          <p>
            Chaque équipe joue pendant la durée choisie (30s, 1min, 2min ou 5min).
            À la fin du temps, on affiche le score du tour puis on passe à l&apos;équipe suivante.
          </p>
        </div>
      </section>

      {/* Mode Solo */}
      <section className="space-y-6 text-neutral-300 leading-relaxed mb-12">
        <h2 className="text-xl font-bold text-[var(--accent)]">Mode Solo</h2>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Objectif</h3>
          <p>
            Deviner la <strong>règle</strong> à partir des mots indices. Tu as <strong>5 vies</strong> pour
            faire le meilleur score possible. Chaque erreur te coûte une vie !
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Déroulement</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Les 8 mots sont <strong>cachés</strong> au départ.</li>
            <li>Clique sur <strong>&quot;Révéler&quot;</strong> pour découvrir les mots un par un.</li>
            <li>Tape ta réponse (juste la fin de la règle, ex: &quot;brille&quot;, &quot;coule&quot;, &quot;pique&quot;).</li>
            <li><strong>Bonne réponse</strong> : tu gagnes des points selon le nombre de mots révélés.</li>
            <li><strong>Mauvaise réponse</strong> : tu perds 1 vie, mais tu peux continuer.</li>
            <li><strong>Je passe</strong> : tu abandonnes la carte et perds 1 vie.</li>
            <li><strong>Game over</strong> quand tu n&apos;as plus de vies !</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Classement mondial</h3>
          <p>
            Entre ton pseudo et tente de battre les autres joueurs ! Ton meilleur score
            est enregistré dans le <strong>classement mondial</strong>.
          </p>
        </div>
      </section>

      {/* Points */}
      <section className="space-y-4 text-neutral-300 leading-relaxed">
        <h2 className="text-xl font-bold text-[var(--accent)]">Barème des points</h2>
        <p className="text-sm text-neutral-400">Identique pour les deux modes :</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 1 :</span> <strong className="text-white">15 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 2 :</span> <strong className="text-white">12 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 3 :</span> <strong className="text-white">10 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 4 :</span> <strong className="text-white">8 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 5 :</span> <strong className="text-white">6 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 6 :</span> <strong className="text-white">4 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 7 :</span> <strong className="text-white">2 pts</strong>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-3 border border-neutral-700">
            <span className="text-neutral-400">Mot 8 :</span> <strong className="text-white">1 pt</strong>
          </div>
        </div>
      </section>

      <div className="mt-12">
        <Link href="/" className="btn-primary text-center block">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
