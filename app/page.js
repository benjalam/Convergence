"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Composant Logo animé
function ConvergenceLogo({ animate = false, size = 120 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="overflow-visible"
    >
      {/* Demi-cercle gauche */}
      <g
        className={`origin-center ${
          animate ? "animate-converge-left" : ""
        }`}
      >
        <path
          d="M 50 10 A 40 40 0 0 0 50 90"
          fill="none"
          stroke="url(#gradient-left)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Demi-cercle droit */}
      <g
        className={`origin-center ${
          animate ? "animate-converge-right" : ""
        }`}
      >
        <path
          d="M 50 10 A 40 40 0 0 1 50 90"
          fill="none"
          stroke="url(#gradient-right)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Pointillés du haut */}
      <g className={animate ? "animate-dots-appear" : ""}>
        <line
          x1="50"
          y1="8"
          x2="50"
          y2="25"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeDasharray="4 4"
          strokeLinecap="round"
          className="opacity-80"
        />
      </g>

      {/* Pointillés du bas */}
      <g className={animate ? "animate-dots-appear" : ""}>
        <line
          x1="50"
          y1="75"
          x2="50"
          y2="92"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeDasharray="4 4"
          strokeLinecap="round"
          className="opacity-80"
        />
      </g>

      {/* Point central qui pulse */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="#fbbf24"
        className={animate ? "animate-pulse-center" : ""}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="gradient-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Vérifier si on a déjà vu le splash dans cette session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    // Timer pour commencer le fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    // Timer pour cacher complètement le splash
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
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <ConvergenceLogo animate={true} size={140} />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent animate-title-appear">
              Convergence
            </h1>
          </div>
        </div>
      )}

      {/* Page principale */}
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <ConvergenceLogo size={80} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
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

      {/* Styles pour les animations */}
      <style jsx global>{`
        @keyframes converge-left {
          0% {
            transform: translateX(-30px) rotate(-20deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes converge-right {
          0% {
            transform: translateX(30px) rotate(20deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes dots-appear {
          0%, 50% {
            opacity: 0;
            transform: scaleY(0);
          }
          100% {
            opacity: 0.8;
            transform: scaleY(1);
          }
        }

        @keyframes pulse-center {
          0%, 60% {
            transform: scale(0);
            opacity: 0;
          }
          80% {
            transform: scale(1.5);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes title-appear {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          60% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-converge-left {
          animation: converge-left 1.2s ease-out forwards;
          transform-origin: center center;
        }

        .animate-converge-right {
          animation: converge-right 1.2s ease-out forwards;
          transform-origin: center center;
        }

        .animate-dots-appear {
          animation: dots-appear 1.5s ease-out forwards;
          transform-origin: center center;
        }

        .animate-pulse-center {
          animation: pulse-center 1.8s ease-out forwards;
        }

        .animate-title-appear {
          animation: title-appear 2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
