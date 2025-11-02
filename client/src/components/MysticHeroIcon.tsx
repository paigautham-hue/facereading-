import { useEffect, useState } from 'react';

export function MysticHeroIcon() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation on mount
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Animated outer glow ring */}
      <div className="absolute inset-0 rounded-full animate-pulse-slow">
        <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-spin-slow" />
      </div>

      {/* Secondary rotating ring */}
      <div className="absolute inset-4 rounded-full">
        <div className="absolute inset-0 rounded-full border border-orange-400/20 animate-spin-reverse" />
      </div>

      {/* Main mystical face image */}
      <div 
        className={`absolute inset-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <img
          src="/hero-mystic-face.png"
          alt="Mystical Face Reader - Ancient wisdom meets AI technology"
          className="w-full h-full object-cover rounded-full shadow-2xl shadow-orange-500/20"
        />
        
        {/* Glowing overlay effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-orange-500/10 animate-pulse-glow" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full animate-float"
            style={{
              left: `${20 + Math.cos((i / 8) * Math.PI * 2) * 40}%`,
              top: `${20 + Math.sin((i / 8) * Math.PI * 2) * 40}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Mystical energy lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none animate-rotate-slow"
        viewBox="0 0 256 256"
      >
        <circle
          cx="128"
          cy="128"
          r="100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          className="animate-dash"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.8;
          }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dash {
          to { stroke-dashoffset: -16; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 8s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        .animate-dash {
          animation: dash 2s linear infinite;
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-slow,
          .animate-spin-slow,
          .animate-spin-reverse,
          .animate-pulse-glow,
          .animate-float,
          .animate-rotate-slow,
          .animate-dash {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

