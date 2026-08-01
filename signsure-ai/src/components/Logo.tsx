import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  return (
    <div className={`flex flex-col items-center sm:items-start ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Emblem SVG with Purple to Cyan Gradient Glass Shield */}
        <div className={`relative ${dimensions} shrink-0 group`}>
          {/* Ambient Glow behind logo */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 opacity-60 blur-md group-hover:opacity-100 transition duration-500"></div>
          
          {/* SVG Canvas */}
          <div className="relative w-full h-full rounded-xl bg-slate-950/90 border border-white/20 shadow-inner flex items-center justify-center p-1.5 overflow-hidden backdrop-blur-md">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_2px_8px_rgba(139,92,246,0.5)]"
            >
              <defs>
                <linearGradient id="purpleCyanGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id="penGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>

              {/* Outer 'S' Curve Surround */}
              <path
                d="M75 18 C50 5, 20 20, 25 45 C30 70, 75 60, 75 80 C75 95, 45 100, 20 85"
                stroke="url(#purpleCyanGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />

              {/* Center Document Sheet */}
              <rect x="30" y="24" width="38" height="50" rx="4" fill="#F8FAFC" className="drop-shadow-md" />

              {/* Justice Scales on Document */}
              <path d="M49 32 H51 M50 30 V37 M43 37 H57 M43 37 L40 43 H46 Z M57 37 L54 43 H60 Z" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

              {/* Document Text Lines */}
              <line x1="38" y1="48" x2="60" y2="48" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
              <line x1="38" y1="53" x2="52" y2="53" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
              <line x1="38" y1="58" x2="48" y2="58" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

              {/* Checkmark Badge */}
              <circle cx="41" cy="66" r="4" fill="#0EA5E9" />
              <path d="M39 66 L40.5 67.5 L43 64.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Signature Line */}
              <path d="M47 67 C48 65, 51 68, 53 66 C54 65, 56 67, 58 66" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

              {/* 3D Pen Signing Document */}
              <path d="M72 32 L53 63 L49 68 L53 64 L72 32 Z" fill="url(#penGrad)" />
              <circle cx="73" cy="30" r="2.5" fill="#38BDF8" />
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        {showText && (
          <div className="flex flex-col">
            <div className={`font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 font-sans ${textSize}`}>
              SignSure<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"> AI</span>
            </div>
          </div>
        )}
      </div>

      {/* Tagline / Slogan */}
      {showTagline && (
        <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-cyan-300/80 dark:text-cyan-300/80 light:text-indigo-600 uppercase mt-1">
          Understand Every Clause. Sign With Confidence.
        </p>
      )}
    </div>
  );
};
