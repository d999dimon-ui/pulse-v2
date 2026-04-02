// Pulse Logo SVG Component
// Minimal Speed Concept - Orange Lightning

interface PulseLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
}

export default function PulseLogo({ size = 120, className = '', withText = true }: PulseLogoProps) {
  return (
    <div className={className} style={{ width: size, height: withText ? size : size * 0.6 }}>
      <svg
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Define gradient for neon effect */}
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9900" />
            <stop offset="50%" stopColor="#FF6600" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
          <filter id="neonGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {withText && (
          <>
            {/* P */}
            <path
              d="M10 50V10H28C32 10 35 11 37 13C39 15 40 18 40 22C40 26 39 29 37 31C35 33 32 34 28 34H18V50H10ZM18 28H27C29 28 31 27 32 26C33 25 34 24 34 22C34 20 33 19 32 18C31 17 29 16 27 16H18V28Z"
              fill="url(#pulseGradient)"
              filter="url(#neonGlow)"
            />

            {/* U (stylized as lightning bolt) */}
            <path
              d="M45 10H53V38C53 42 55 44 59 44L68 10H76L65 50H57C53 50 50 48 48 46C46 44 45 41 45 38V10Z"
              fill="url(#pulseGradient)"
              filter="url(#neonGlow)"
              className="lightning-u"
            />

            {/* L */}
            <path
              d="M85 10H93V44H107V50H85V10Z"
              fill="url(#pulseGradient)"
              filter="url(#neonGlow)"
            />

            {/* S */}
            <path
              d="M115 50C111 50 108 49 106 47C104 45 103 43 103 40C103 37 104 35 106 33C108 31 111 30 115 29L123 27C125 27 126 26 127 25C128 24 128 23 128 22C128 20 127 19 126 18C125 17 123 16 121 16C119 16 117 17 116 18C115 19 115 21 115 23H107C107 19 108 16 110 14C112 12 115 11 119 11C123 11 126 12 128 14C130 16 131 18 131 21C131 24 130 26 128 28C126 30 123 31 119 32L112 34C110 34 109 35 108 36C107 37 107 38 107 39C107 41 108 42 109 43C110 44 112 44 114 44C116 44 118 43 119 42C120 41 121 39 121 37H129C129 41 128 44 126 46C124 48 121 49 117 49C115 49 113 49 111 48C109 47 107 46 106 44C105 42 104 40 104 38H112C112 40 113 42 114 43C115 44 117 45 119 45C121 45 122 44 123 43C124 42 125 41 125 39L115 50Z"
              fill="url(#pulseGradient)"
              filter="url(#neonGlow)"
            />

            {/* E */}
            <path
              d="M138 50V10H160V16H146V22H158V28H146V34H160V40H146V50H138Z"
              fill="url(#pulseGradient)"
              filter="url(#neonGlow)"
            />
          </>
        )}

        {/* Lightning bolt accent (optional standalone icon) */}
        {!withText && (
          <path
            d="M50 10L30 35H45L25 60L65 25H50L70 10H50Z"
            fill="url(#pulseGradient)"
            filter="url(#neonGlow)"
          />
        )}
      </svg>

      {/* CSS for lightning animation */}
      <style jsx>{`
        @keyframes lightningFlash {
          0% {
            opacity: 0.3;
            filter: drop-shadow(0 0 2px #FF9900);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 8px #FF6600);
          }
          100% {
            opacity: 0.3;
            filter: drop-shadow(0 0 2px #FF9900);
          }
        }

        .lightning-u {
          animation: lightningFlash 2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
