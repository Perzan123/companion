"use client";

import { useMemo } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() < 0.15 ? 2 : 1,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
  }));
}

export function StarfieldBackground() {
  // Generated once per mount, not per render — stars shouldn't jump around.
  const stars = useMemo(() => generateStars(70), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft radial glow, off-center, gives the sky some depth rather than flat black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,184,109,0.06), transparent)",
        }}
      />
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-text-primary animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
