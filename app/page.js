"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {/* Écran de lancement */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background: "linear-gradient(145deg, #e0e7ff 0%, #fae8ff 50%, #cffafe 100%)"
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-7xl animate-bounce-in">🎯</div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-800 animate-title-appear">
              Convergence
            </h1>
            <p className="text-lg text-gray-500 animate-title-appear" style={{ animationDelay: "0.2s" }}>
              Party Game
            </p>
          </div>
        </div>
      )}

      {/* Page principale */}
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="text-center space-y-3">
          <div className="text-6xl mb-2">🎯</div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-800">
            Convergence
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">
            Quelque chose qui…
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Link href="/config" className="btn-party text-center block">
            👥 Mode Équipes
          </Link>
          <Link href="/solo" className="btn-party text-center block">
            🎮 Mode Solo
          </Link>
          <Link
            href="/regles"
            className="btn-party-secondary text-center block"
          >
            📖 Règles du jeu
          </Link>
        </div>
      </main>

      <style jsx global>{`
        @keyframes title-appear {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-title-appear {
          animation: title-appear 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
