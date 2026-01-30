import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Convergence
        </h1>
        <p className="text-xl sm:text-2xl text-neutral-400">
          Quelque chose qui…
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link href="/config" className="btn-primary text-center block">
          Mode Équipes
        </Link>
        <Link href="/solo" className="btn-primary text-center block">
          Mode Solo
        </Link>
        <Link
          href="/regles"
          className="btn-secondary text-center block"
        >
          Règles du jeu
        </Link>
        <Link
          href="/admin"
          className="text-center block text-sm text-neutral-500 hover:text-neutral-300 transition mt-4"
        >
          🛠️ Administration
        </Link>
      </div>
    </main>
  );
}
