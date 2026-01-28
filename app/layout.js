import "./globals.css";

export const metadata = {
  title: "Convergence — Quelque chose qui…",
  description: "Jeu de déduction sémantique. Trouve la règle à partir des indices !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
