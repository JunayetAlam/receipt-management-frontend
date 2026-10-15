// Fixed, decorative background: small twinkling dots plus four-point sparkles
// that gently float up and down. Stars are denser near the top and thin out
// toward the bottom. Positions come from a seeded generator so server and
// client render the same markup.

const STAR_COLORS = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

type StarFieldOptions = {
  seed: number;
  dots: number;
  sparkles: number;
  /** Sparkle size range in px. */
  sparkleMin: number;
  sparkleMax: number;
  /** Bunch stars toward the top (like the reference sky) or spread them evenly. */
  topWeighted: boolean;
};

function buildStars(options: StarFieldOptions) {
  const random = seededRandom(options.seed);
  const pickColor = () => STAR_COLORS[Math.floor(random() * STAR_COLORS.length)];
  const top = () => (options.topWeighted ? Math.pow(random(), 1.7) : random()) * 100;

  const dots = Array.from({ length: options.dots }, (_, index) => ({
    id: index,
    top: top(),
    left: random() * 100,
    size: 1.5 + random() * 2.5,
    color: pickColor(),
    floatDelay: random() * -8,
    floatDuration: 5 + random() * 5,
    twinkleDelay: random() * -6,
    twinkleDuration: 2 + random() * 4,
  }));

  const sparkles = Array.from({ length: options.sparkles }, (_, index) => ({
    id: index,
    top: top(),
    left: random() * 100,
    size: options.sparkleMin + random() * (options.sparkleMax - options.sparkleMin),
    color: pickColor(),
    floatDelay: random() * -10,
    floatDuration: 6 + random() * 6,
    twinkleDelay: random() * -5,
    twinkleDuration: 3 + random() * 3,
  }));

  return { dots, sparkles };
}

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ filter: `drop-shadow(0 0 ${size / 6}px ${color})` }}
    >
      {/* long thin flares */}
      <path d="M24 0 L24.6 24 L24 48 L23.4 24 Z" fill={color} opacity={0.7} />
      <path d="M0 24 L24 23.4 L48 24 L24 24.6 Z" fill={color} opacity={0.7} />
      {/* curved four-point body */}
      <path
        d="M24 10 C24.8 20 28 23.2 38 24 C28 24.8 24.8 28 24 38 C23.2 28 20 24.8 10 24 C20 23.2 23.2 20 24 10 Z"
        fill={color}
      />
      <circle cx="24" cy="24" r="2.2" fill="#ffffff" />
    </svg>
  );
}

/** Twinkling dots and floating sparkles filling the nearest positioned parent. */
export function StarField({
  className,
  ...options
}: StarFieldOptions & { className: string }) {
  const { dots, sparkles } = buildStars(options);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden print:hidden ${className}`}
    >
      {dots.map((dot) => (
        <span
          key={`dot-${dot.id}`}
          className="starry-float absolute"
          style={{
            top: `${dot.top}%`,
            left: `${dot.left}%`,
            animationDelay: `${dot.floatDelay}s`,
            animationDuration: `${dot.floatDuration}s`,
          }}
        >
          <span
            className="starry-twinkle block rounded-full"
            style={{
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              boxShadow: `0 0 ${dot.size * 2}px ${dot.color}`,
              animationDelay: `${dot.twinkleDelay}s`,
              animationDuration: `${dot.twinkleDuration}s`,
            }}
          />
        </span>
      ))}

      {sparkles.map((sparkle) => (
        <span
          key={`sparkle-${sparkle.id}`}
          className="starry-float absolute"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            marginTop: -sparkle.size / 2,
            marginLeft: -sparkle.size / 2,
            animationDelay: `${sparkle.floatDelay}s`,
            animationDuration: `${sparkle.floatDuration}s`,
          }}
        >
          <span
            className="starry-twinkle block"
            style={{
              animationDelay: `${sparkle.twinkleDelay}s`,
              animationDuration: `${sparkle.twinkleDuration}s`,
            }}
          >
            <Sparkle size={sparkle.size} color={sparkle.color} />
          </span>
        </span>
      ))}
    </div>
  );
}

// Built once at module load so every render (and the server) uses the same stars.
const PAGE_STARS = {
  seed: 20261015,
  dots: 140,
  sparkles: 22,
  sparkleMin: 14,
  sparkleMax: 36,
  topWeighted: true,
};

export default function StarryBackground() {
  return <StarField className="fixed inset-0 -z-10" {...PAGE_STARS} />;
}
