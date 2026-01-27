"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { VoteValue } from "@/lib/types";

interface PokerCardProps {
  value: VoteValue;
  isSelected: boolean;
  onClick: () => void;
}

// Компонент карточки для голосования (мемоизирован для производительности)
export const PokerCard = memo(function PokerCard({ value, isSelected, onClick }: PokerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-[3/4] w-full min-w-[80px] max-w-[120px]",
        "flex items-center justify-center",
        "rounded-xl border-2",
        // Оптимизированные transitions - только конкретные свойства вместо transition-all
        "transition-[transform,colors,border-color,box-shadow] duration-200 ease-out",
        "text-3xl font-bold",
        // Анимации с will-change для лучшей производительности
        "hover:scale-105 hover:will-change-transform active:scale-95",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-lg"
          : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20"
      )}
    >
      {value}
    </button>
  );
});
