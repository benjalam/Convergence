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

      <section className="space-y-6 text-neutral-300 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Objectif</h2>
          <p>
            Faire deviner à ton équipe une <strong>règle</strong> (ex. &quot;Quelque chose qui
            pique&quot;) en utilisant les <strong>8 mots indices</strong>. Moins tu révèles de
            mots avant qu&apos;ils trouvent, plus tu marques de points.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Déroulement</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Un <strong>maître du jeu (MJ)</strong> tient le téléphone et voit la règle + les 8 mots.</li>
            <li>Il dit les mots à l&apos;oral un par un. L&apos;équipe propose des réponses.</li>
            <li>Quand l&apos;équipe trouve, le MJ <strong>sélectionne le dernier mot utilisé</strong> (clic sur le mot), puis <strong>Trouvé !</strong> pour valider les points.</li>
            <li><strong>Passer</strong> : changer de règle sans marquer. <strong>Fin du tour</strong> : terminer le tour avant la fin des 2 minutes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Points</h2>
          <p className="mb-2">Plus tu trouves vite, plus tu marques :</p>
          <ul className="space-y-1 text-sm">
            <li>Mot 1 : <strong>15 pts</strong> · Mot 2 : <strong>12 pts</strong> · Mot 3 : <strong>10 pts</strong> · Mot 4 : <strong>8 pts</strong></li>
            <li>Mot 5 : <strong>6 pts</strong> · Mot 6 : <strong>4 pts</strong> · Mot 7 : <strong>2 pts</strong> · Mot 8 : <strong>1 pt</strong></li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Chrono</h2>
          <p>
            Chaque équipe a <strong>2 minutes</strong> par tour. Tu peux aussi cliquer sur
            <strong> Fin du tour</strong> pour arrêter avant. On affiche alors le score du tour
            puis on passe à l&apos;équipe suivante.
          </p>
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
