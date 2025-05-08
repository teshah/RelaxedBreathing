// src/app/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BreathingCircle } from '@/components/breathing-circle';
import { LoopCounter } from '@/components/loop-counter';
import { Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INHALE_DURATION = 4;
const HOLD_DURATION = 7;
const EXHALE_DURATION = 8;
const TOTAL_LOOPS = 10;

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phaseDurations: Record<Exclude<Phase, 'idle'>, number> = {
  inhale: INHALE_DURATION,
  hold: HOLD_DURATION,
  exhale: EXHALE_DURATION,
};

const phaseMessages: Record<Exclude<Phase, 'idle'>, string> = {
  inhale: "Breath in",
  hold: "Hold breadth",
  exhale: "Breath out",
};

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number>(0);
  const [loopsDone, setLoopsDone] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const { toast } = useToast();

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (speechSynthesisRef.current) {
      if (speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel(); // Cancel previous utterance if any
      }
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (speechSynthesisRef.current?.speaking) speechSynthesisRef.current.cancel();
      return;
    }

    if (phase !== 'idle' && countdown === phaseDurations[phase]) {
      speak(phaseMessages[phase]);
    }
    
    if (countdown > 0) {
      timeoutIdRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else { // Countdown reached 0, transition to next phase
      if (phase === 'inhale') {
        setPhase('hold');
        setCountdown(HOLD_DURATION);
      } else if (phase === 'hold') {
        setPhase('exhale');
        setCountdown(EXHALE_DURATION);
      } else if (phase === 'exhale') {
        const newLoopsDone = loopsDone + 1;
        setLoopsDone(newLoopsDone);
        if (newLoopsDone < TOTAL_LOOPS) {
          setPhase('inhale');
          setCountdown(INHALE_DURATION);
        } else {
          setIsActive(false);
          setPhase('idle');
          const completionMessage = "Session complete. Well done!";
          speak(completionMessage);
          toast({
            title: "Session Complete!",
            description: "You've completed all breathing rounds.",
            duration: 5000,
          });
        }
      }
    }

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [isActive, phase, countdown, loopsDone, speak, toast]);

  const handleToggleSession = () => {
    if (isActive) { // Stopping session
      setIsActive(false);
      setPhase('idle');
      setCountdown(0);
      // LoopsDone is not reset to show progress if stopped early,
      // will be reset when starting a new session.
      if (speechSynthesisRef.current?.speaking) {
        speechSynthesisRef.current.cancel();
      }
      toast({ title: "Session Stopped", description: "Breathing exercise has been stopped.", duration: 3000 });
    } else { // Starting session
      setIsActive(true);
      setLoopsDone(0);
      setPhase('inhale');
      setCountdown(INHALE_DURATION);
    }
  };
  
  const durations = { inhale: INHALE_DURATION, hold: HOLD_DURATION, exhale: EXHALE_DURATION };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-background">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-accent">BreatheEasy</h1>
        <p className="text-lg text-foreground/80 mt-1">4-7-8 Guided Breathing</p>
      </header>

      <BreathingCircle phase={phase} countdown={countdown} durations={durations} />

      { (isActive || (loopsDone > 0 && phase === 'idle')) && (
          <LoopCounter completed={loopsDone} total={TOTAL_LOOPS} />
        )
      }
      { phase === 'idle' && !isActive && loopsDone === 0 && (
        <p className="text-md sm:text-lg text-foreground/70 my-8 text-center max-w-md">
          Press start to begin your {TOTAL_LOOPS} rounds of 4-7-8 breathing. <br/>This technique can help reduce stress and promote relaxation.
        </p>
      )}


      <Button 
        onClick={handleToggleSession} 
        className="mt-8 px-8 py-6 text-lg rounded-lg shadow-md bg-accent hover:bg-accent/90 text-accent-foreground"
        aria-label={isActive ? "Stop breathing session" : "Start breathing session"}
      >
        {isActive ? <Square className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
        {isActive ? 'Stop Session' : (loopsDone === TOTAL_LOOPS && phase === 'idle' ? 'Start New Session' : 'Start Session')}
      </Button>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Find your calm, one breath at a time.</p>
      </footer>
    </main>
  );
}
