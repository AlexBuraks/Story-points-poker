"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RotateCcw } from "lucide-react";

interface RoomControlsProps {
  roomId: string;
  userId: string;
  revealed: boolean;
  onRevealToggle: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

// Компонент контролов для модератора комнаты
export function RoomControls({
  revealed,
  onRevealToggle,
  onReset,
  isLoading = false,
}: RoomControlsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Кнопка показать/скрыть результаты */}
      <Button
        onClick={onRevealToggle}
        disabled={isLoading}
        size="lg"
        variant={revealed ? "secondary" : "default"}
        className="flex-1 min-w-[200px]"
      >
        {revealed ? (
          <>
            <EyeOff className="mr-2 h-5 w-5" />
            Hide estimates
          </>
        ) : (
          <>
            <Eye className="mr-2 h-5 w-5" />
            Show estimates
          </>
        )}
      </Button>

      {/* Кнопка сброса голосов */}
      <Button
        onClick={onReset}
        disabled={isLoading}
        size="lg"
        variant="outline"
        className="flex-1 min-w-[200px]"
      >
        <RotateCcw className="mr-2 h-5 w-5" />
        Delete estimates
      </Button>
    </div>
  );
}
