"use client";

import { cn } from "@/lib/utils";
import { VoteValue } from "@/lib/types";

interface PokerCardProps {
  value: VoteValue;
  isSelected: boolean;
  onClick: () => void;
}

// Компонент карточки для голосования
export function PokerCard({ value, isSelected, onClick }: PokerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-[3/4] w-full min-w-[80px] max-w-[120px]",
        "flex items-center justify-center",
        "rounded-xl border-2 transition-all",
        "text-3xl font-bold",
        "hover:scale-105 active:scale-95",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-lg"
          : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20"
      )}
    >
      {value}
    </button>
  );
}
