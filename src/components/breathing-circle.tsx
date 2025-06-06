// src/components/breathing-circle.tsx
"use client";

import type { FC } from 'react';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingCircleProps {
  phase: Phase;
  countdown: number;
  durations: {
    inhale: number;
    hold: number;
    exhale: number;
  };
}

export const BreathingCircle: FC<BreathingCircleProps> = ({ phase, countdown, durations }) => {
  const getPhaseStyles = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125 bg-primary';
      case 'hold':
        return 'scale-125 bg-primary'; // Maintain scale and color
      case 'exhale':
        return 'scale-100 bg-primary/70'; // Use opacity or a lighter shade
      case 'idle':
      default:
        return 'scale-100 bg-muted';
    }
  };

  const getTransitionDuration = () => {
    switch (phase) {
      case 'inhale':
        return `${durations.inhale}s`;
      case 'hold':
        return '0.2s'; // Quick transition for hold if visual changes, else not critical
      case 'exhale':
        return `${durations.exhale}s`;
      case 'idle':
      default:
        return '0.5s';
    }
  };

  return (
    <div
      className={cn(
        "w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center text-center shadow-xl transition-all ease-linear transform-gpu",
        getPhaseStyles()
      )}
      style={{
        transitionDuration: getTransitionDuration(),
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-5xl sm:text-7xl font-bold text-primary-foreground tabular-nums">
        {countdown}
      </p>
      <p className="text-lg sm:text-xl font-medium text-primary-foreground/90 capitalize mt-1">
        {phase === 'idle' ? 'Ready?' : phase}
      </p>
    </div>
  );
};
