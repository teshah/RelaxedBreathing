// src/components/loop-counter.tsx
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoopCounterProps {
  completed: number;
  total: number;
}

export const LoopCounter: FC<LoopCounterProps> = ({ completed, total }) => {
  const remaining = Math.max(0, total - completed);

  return (
    <Card className="w-64 sm:w-72 mt-8 shadow-lg border-accent/30">
      <CardHeader className="p-3 bg-accent rounded-t-lg ">
        <CardTitle className="text-center text-xl text-accent-foreground">Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-center space-y-1">
        <p className="text-md text-foreground">
          Rounds Completed: <span className="font-bold text-accent">{completed} / {total}</span>
        </p>
        <p className="text-md text-foreground">
          Remaining: <span className="font-bold text-accent">{remaining}</span>
        </p>
      </CardContent>
    </Card>
  );
};
