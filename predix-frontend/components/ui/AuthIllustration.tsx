export default function AuthIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 360"
      fill="none"
      className="w-full"
      aria-hidden="true"
    >
      {/* Background glow rings */}
      <circle cx="310" cy="195" r="210" fill="rgba(255,255,255,0.03)" />
      <circle cx="310" cy="195" r="148" fill="rgba(255,255,255,0.05)" />
      <circle cx="310" cy="195" r="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="6 5" />

      {/* ── SOCCER BALL ── */}
      <ellipse cx="318" cy="298" rx="82" ry="14" fill="rgba(0,0,0,0.18)" />
      <circle cx="310" cy="192" r="98" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

      {/* Pentagon patches */}
      <polygon points="310,165 289,179 297,202 323,202 331,179" fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <polygon points="272,148 251,160 254,184 276,191 292,177 288,154" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polygon points="348,148 369,160 366,184 344,191 328,177 332,154" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polygon points="268,210 246,224 250,248 272,254 290,241 286,216" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polygon points="352,210 374,224 370,248 348,254 330,241 334,216" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <polygon points="293,228 297,252 310,260 323,252 327,228 310,218" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

      {/* ── PREDICTION CARD (top-left) ── */}
      <rect x="18" y="32" width="188" height="98" rx="14" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <text x="36" y="56" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.52)" letterSpacing="1.2">PREDICCIÓN</text>
      <text x="36" y="90" fontFamily="system-ui,sans-serif" fontSize="30" fontWeight="800" fill="white" letterSpacing="-1">2 — 1</text>
      <text x="36" y="112" fontFamily="system-ui,sans-serif" fontSize="10.5" fill="rgba(255,255,255,0.52)">Argentina vs Brasil</text>
      <rect x="142" y="101" width="50" height="18" rx="9" fill="rgba(16,185,129,0.28)" stroke="rgba(16,185,129,0.55)" strokeWidth="1" />
      <polyline points="152,110 156,114 162,107" stroke="rgb(52,211,153)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <text x="168" y="114" fontFamily="system-ui,sans-serif" fontSize="9.5" fontWeight="600" fill="rgb(52,211,153)">Acierto</text>

      {/* ── POINTS CARD (right) ── */}
      <rect x="368" y="48" width="96" height="86" rx="14" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      {/* Trophy shape */}
      <rect x="401" y="62" width="30" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
      <path d="M404,66 Q396,78 402,88 L414,88 Q420,78 412,66 Z" fill="rgba(255,255,255,0.65)" />
      <rect x="407" y="88" width="2" height="10" fill="rgba(255,255,255,0.55)" />
      <rect x="403" y="98" width="10" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
      <path d="M404,68 Q398,72 400,80" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <path d="M412,68 Q418,72 416,80" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <text x="416" y="122" fontFamily="system-ui,sans-serif" fontSize="22" fontWeight="800" fill="white" textAnchor="middle">+5</text>
      <text x="416" y="136" fontFamily="system-ui,sans-serif" fontSize="9" fill="rgba(255,255,255,0.48)" textAnchor="middle">puntos</text>

      {/* ── LEADERBOARD CARD (bottom-left) ── */}
      <rect x="16" y="258" width="210" height="88" rx="14" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <text x="36" y="280" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.52)" letterSpacing="1.2">CLASIFICACIÓN</text>
      {/* Rank bars */}
      <rect x="36" y="288" width="5" height="18" rx="2.5" fill="rgba(217,119,6,0.9)" />
      <text x="48" y="301" fontFamily="system-ui,sans-serif" fontSize="11.5" fontWeight="600" fill="white">Juan</text>
      <text x="208" y="301" fontFamily="system-ui,sans-serif" fontSize="11.5" fontWeight="700" fill="rgba(255,255,255,0.85)" textAnchor="end">87 pts</text>

      <rect x="36" y="310" width="5" height="18" rx="2.5" fill="rgba(148,163,184,0.7)" />
      <text x="48" y="323" fontFamily="system-ui,sans-serif" fontSize="11.5" fill="rgba(255,255,255,0.65)">María</text>
      <text x="208" y="323" fontFamily="system-ui,sans-serif" fontSize="11.5" fill="rgba(255,255,255,0.55)" textAnchor="end">72 pts</text>

      <rect x="36" y="330" width="5" height="14" rx="2.5" fill="rgba(120,53,15,0.7)" />
      <text x="48" y="341" fontFamily="system-ui,sans-serif" fontSize="11" fill="rgba(255,255,255,0.45)">Carlos</text>
      <text x="208" y="341" fontFamily="system-ui,sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)" textAnchor="end">58 pts</text>

      {/* ── RACHA PILL (bottom-right) ── */}
      <rect x="362" y="280" width="106" height="36" rx="18" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <path d="M378,298 Q378,290 384,290 Q382,295 386,295 Q384,288 390,286 Q388,294 392,296 Q394,290 396,292 Q396,304 388,306 Q380,306 378,298 Z" fill="rgba(251,146,60,0.85)" />
      <text x="400" y="303" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="white">Racha x5</text>

      {/* ── SPARKLES ── */}
      <g transform="translate(448,26)" stroke="rgba(255,255,255,0.6)" strokeLinecap="round">
        <line x1="0" y1="-13" x2="0" y2="13" strokeWidth="2.5" />
        <line x1="-13" y1="0" x2="13" y2="0" strokeWidth="2.5" />
        <line x1="-9" y1="-9" x2="9" y2="9" strokeWidth="1.5" />
        <line x1="9" y1="-9" x2="-9" y2="9" strokeWidth="1.5" />
      </g>
      <g transform="translate(12,178)" stroke="rgba(255,255,255,0.38)" strokeLinecap="round">
        <line x1="0" y1="-9" x2="0" y2="9" strokeWidth="2" />
        <line x1="-9" y1="0" x2="9" y2="0" strokeWidth="2" />
        <line x1="-6" y1="-6" x2="6" y2="6" strokeWidth="1.2" />
        <line x1="6" y1="-6" x2="-6" y2="6" strokeWidth="1.2" />
      </g>
      <g transform="translate(264,78)" stroke="rgba(255,255,255,0.42)" strokeLinecap="round">
        <line x1="0" y1="-7" x2="0" y2="7" strokeWidth="1.8" />
        <line x1="-7" y1="0" x2="7" y2="0" strokeWidth="1.8" />
      </g>
      <g transform="translate(456,240)" stroke="rgba(255,255,255,0.35)" strokeLinecap="round">
        <line x1="0" y1="-5" x2="0" y2="5" strokeWidth="1.5" />
        <line x1="-5" y1="0" x2="5" y2="0" strokeWidth="1.5" />
      </g>

      {/* ── DOTS ── */}
      <circle cx="230" cy="24" r="4" fill="rgba(255,255,255,0.28)" />
      <circle cx="248" cy="18" r="2.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="170" cy="14" r="2" fill="rgba(255,255,255,0.18)" />
      <circle cx="424" cy="158" r="4.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="458" cy="195" r="3" fill="rgba(255,255,255,0.22)" />
      <circle cx="420" cy="265" r="3.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="22" cy="52" r="3" fill="rgba(255,255,255,0.18)" />
      <circle cx="348" cy="22" r="2.5" fill="rgba(255,255,255,0.22)" />
      <circle cx="460" cy="310" r="2" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}
