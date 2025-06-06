// src/app/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BreathingCircle } from '@/components/breathing-circle';
import { LoopCounter } from '@/components/loop-counter';
import { Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

  // State for voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceType, setSelectedVoiceType] = useState<'female' | 'male'>('female');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const updateVoices = () => {
        if (speechSynthesisRef.current) {
          const availableVoices = speechSynthesisRef.current.getVoices();
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
            // Clear the listener once voices are loaded
            speechSynthesisRef.current.onvoiceschanged = null;
          }
        }
      };

      // Voices might not be loaded immediately.
      // Browsers often fire 'voiceschanged' event when the list is ready.
      if (speechSynthesisRef.current.getVoices().length === 0) {
         speechSynthesisRef.current.onvoiceschanged = updateVoices;
      } else {
        updateVoices(); // If already loaded
      }
      
      // Additional fallback in case onvoiceschanged isn't fired or voices loaded very late
      const fallbackTimeout = setTimeout(() => {
        if (voices.length === 0) { // only if voices are still not set
            updateVoices();
        }
      }, 250); // Increased timeout slightly for safety
      
      return () => {
        clearTimeout(fallbackTimeout);
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.onvoiceschanged = null;
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount to initialize speech synthesis and voices

  const speak = useCallback((text: string) => {
    if (speechSynthesisRef.current) {
      if (speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel(); 
      }
      const utterance = new SpeechSynthesisUtterance(text);

      let chosenVoice: SpeechSynthesisVoice | null = null;
      if (voices.length > 0) {
        const langPrefix = 'en'; // Prioritize English voices

        // Try to find a voice matching the type and language preference
        if (selectedVoiceType === 'female') {
          chosenVoice = 
            voices.find(voice => voice.lang.startsWith(langPrefix) && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('eva'))) ||
            voices.find(voice => voice.lang.startsWith(langPrefix) && !voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('david') && !voice.name.toLowerCase().includes('mark') && !voice.name.toLowerCase().includes('alex')) ||
            voices.find(voice => voice.lang.startsWith(langPrefix) && voice.default && (voice.name.toLowerCase().includes('female') || !voice.name.toLowerCase().includes('male'))) || // Default english voice that seems female
            voices.find(voice => voice.default && (voice.name.toLowerCase().includes('female') || !voice.name.toLowerCase().includes('male'))); // Any default voice that seems female
        } else { // male
          chosenVoice = 
            voices.find(voice => voice.lang.startsWith(langPrefix) && (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('mark') || voice.name.toLowerCase().includes('alex'))) ||
            voices.find(voice => voice.lang.startsWith(langPrefix) && !voice.name.toLowerCase().includes('female') && !voice.name.toLowerCase().includes('zira') && !voice.name.toLowerCase().includes('samantha') && !voice.name.toLowerCase().includes('eva')) ||
            voices.find(voice => voice.lang.startsWith(langPrefix) && voice.default && (voice.name.toLowerCase().includes('male') || !voice.name.toLowerCase().includes('female'))) ||
            voices.find(voice => voice.default && (voice.name.toLowerCase().includes('male') || !voice.name.toLowerCase().includes('female')));
        }
        
        // If no specific type match, try any English voice or any default voice
        if (!chosenVoice) {
            chosenVoice = voices.find(v => v.lang.startsWith(langPrefix) && v.default) || voices.find(v => v.default) || voices.find(v => v.lang.startsWith(langPrefix)) || voices[0];
        }
      }
      
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      speechSynthesisRef.current.speak(utterance);
    }
  }, [voices, selectedVoiceType]);

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
    } else { 
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
    if (isActive) { 
      setIsActive(false);
      setPhase('idle');
      setCountdown(0);
      if (speechSynthesisRef.current?.speaking) {
        speechSynthesisRef.current.cancel();
      }
      toast({ title: "Session Stopped", description: "Breathing exercise has been stopped.", duration: 3000 });
    } else { 
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
        <h1 className="text-4xl sm:text-5xl font-bold text-accent">Relax</h1>
        <p className="text-lg text-foreground/80 mt-1">4-7-8 Guided Breathing</p>
      </header>

      <div className="my-6 flex flex-col items-center">
        <Label className="text-md font-medium text-foreground mb-2">Voice Preference</Label>
        <RadioGroup
          value={selectedVoiceType}
          onValueChange={(value) => setSelectedVoiceType(value as 'female' | 'male')}
          className="flex gap-x-4 sm:gap-x-6 items-center"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female-voice" />
            <Label htmlFor="female-voice" className="font-normal text-sm sm:text-base cursor-pointer">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male-voice" />
            <Label htmlFor="male-voice" className="font-normal text-sm sm:text-base cursor-pointer">Male</Label>
          </div>
        </RadioGroup>
      </div>

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
