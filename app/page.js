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
    }, 2200);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 2800);

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
            background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)"
          }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Logo animé */}
            <div className="relative">
              <div className="text-8xl animate-bounce-in">🎯</div>
              <div className="absolute -top-2 -right-2 text-4xl animate-spin-slow">✨</div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-wider title-shadow animate-title-appear">
              Convergence
            </h1>
            <p className="text-xl text-white/80 animate-title-appear" style={{ animationDelay: "0.3s" }}>
              Party Game
            </p>
          </div>
        </div>
      )}

      {/* Page principale */}
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="text-center space-y-4">
          <div className="text-7xl mb-4">🎯</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-wider title-shadow">
            Convergence
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-medium">
            Quelque chose qui…
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
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

        {/* Décoration */}
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">🎲</div>
        <div className="absolute top-20 right-10 text-3xl opacity-20 animate-float-delayed">🎪</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-float">🎨</div>
        <div className="absolute bottom-10 right-20 text-3xl opacity-20 animate-float-delayed">🎭</div>
      </main>

      <style jsx global>{`
        @keyframes title-appear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-10deg); }
        }

        .animate-title-appear {
          animation: title-appear 0.8s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
}
