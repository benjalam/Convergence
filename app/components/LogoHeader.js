"use client";

import Link from "next/link";

// Logo Convergence - Style yin-yang
function ConvergenceLogo({ size = 40 }) {
  const gradientId = `gradient-arc-header-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Arc du haut */}
      <path
        d="M 35 10 C 10 10, 10 55, 35 55"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Arc du bas */}
      <path
        d="M 65 75 C 90 75, 90 120, 65 120"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Points centraux */}
      <circle cx="50" cy="45" r="4" fill="#f97316" opacity="0.9" />
      <circle cx="50" cy="58" r="4" fill="#f97316" opacity="0.9" />
      <circle cx="50" cy="71" r="4" fill="#f97316" opacity="0.9" />
      <circle cx="50" cy="84" r="4" fill="#f97316" opacity="0.9" />
    </svg>
  );
}

// Header avec logo cliquable
export default function LogoHeader({ size = 32 }) {
  return (
    <Link 
      href="/" 
      className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105"
      title="Retour à l'accueil"
    >
      <ConvergenceLogo size={size} />
    </Link>
  );
}
