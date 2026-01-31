"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Composant Logo animé - Style yin-yang comme sur le dessin
function ConvergenceLogo({ animate = false, size = 120, id = "main" }) {
  const gradientId = `gradient-arc-${id}`;
  
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      className="overflow-visible"
    >
      {/* Gradients - définis en premier */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Arc du haut - forme de C ouvert vers la droite, en haut à gauche */}
      <g className={animate ? "animate-converge-top" : ""}>
        <path
          d="M 35 10 C 10 10, 10 55, 35 55"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Arc du bas - forme de C ouvert vers la gauche, en bas à droite */}
      <g className={animate ? "animate-converge-bottom" : ""}>
        <path
          d="M 65 75 C 90 75, 90 120, 65 120"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Pointillés centraux verticaux - entre les deux arcs */}
      <g className={animate ? "animate-dots-appear" : "opacity-90"}>
        <circle cx="50" cy="45" r="3.5" fill="#f97316" />
        <circle cx="50" cy="58" r="3.5" fill="#f97316" />
        <circle cx="50" cy="71" r="3.5" fill="#f97316" />
        <circle cx="50" cy="84" r="3.5" fill="#f97316" />
      </g>
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
      {/* Écran de lancement - même fond que la page principale */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <ConvergenceLogo animate={true} size={120} id="splash" />
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
        @keyframes converge-top {
          0% {
            transform: translate(-50px, -40px);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes converge-bottom {
          0% {
            transform: translate(50px, 40px);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes dots-appear {
          0%, 60% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 0.9;
            transform: scale(1);
          }
        }

        @keyframes title-appear {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-converge-top {
          animation: converge-top 1.2s ease-out both;
          transform-origin: center center;
        }

        .animate-converge-bottom {
          animation: converge-bottom 1.2s ease-out both;
          transform-origin: center center;
        }

        .animate-dots-appear {
          animation: dots-appear 1.6s ease-out both;
          transform-origin: center center;
        }

        .animate-title-appear {
          animation: title-appear 2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
