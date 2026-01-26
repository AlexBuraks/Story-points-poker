"use client";

import { Participant } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useMemo } from "react";

interface ParticipantListProps {
  participants: Record<string, Participant>;
  revealed: boolean;
  creatorId: string;
  children?: React.ReactNode; // Для кнопок контролов
}

// Рандомные эмоджи для участников
const EMOJIS = ['🎮', '🚀', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻', '🎹', '🥁', '🎤', '🎧', '🎬', '🎼', '🌟', '⭐', '✨', '💫', '🔥', '💎', '🏆', '🎖️', '🏅', '🥇', '🥈', '🥉'];

// Компонент списка участников
export function ParticipantList({ participants, revealed, creatorId, children }: ParticipantListProps) {
  const participantEntries = Object.entries(participants);

  // Генерируем стабильные эмоджи для каждого userId
  const userEmojis = useMemo(() => {
    const emojis: Record<string, string> = {};
    participantEntries.forEach(([userId]) => {
      // Используем хеш от userId для стабильного выбора эмоджи
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      emojis[userId] = EMOJIS[hash % EMOJIS.length];
    });
    return emojis;
  }, [participantEntries.map(([id]) => id).join(',')]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Participants ({participantEntries.length})</h2>
      </div>
      
      {/* Кнопки контролов модератора (если есть) */}
      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}

      {/* Список участников */}
      <div className="space-y-0 border-t">
        {/* Хедер */}
        <div className="grid grid-cols-[auto_auto] gap-8 items-center py-3 px-4 border-b bg-muted/30">
          <div className="font-semibold">Name</div>
          <div className="font-semibold text-right min-w-[100px]">Story Points</div>
        </div>
        
        {/* Участники */}
        {participantEntries.map(([userId, participant]) => {
          const hasVoted = participant.vote !== null;

          return (
            <div 
              key={userId} 
              className="grid grid-cols-[auto_auto] gap-8 items-center py-3 px-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              {/* Имя участника */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Рандомный эмоджи */}
                <span className="text-lg flex-shrink-0">
                  {userEmojis[userId]}
                </span>
                {/* Имя участника */}
                <span className="font-medium truncate">
                  {participant.name}
                </span>
              </div>
              
              {/* Story Points */}
              <div className="flex items-center justify-end min-w-[100px]">
                {revealed && hasVoted ? (
                  // Показываем результат после reveal
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                    {participant.vote}
                  </div>
                ) : hasVoted ? (
                  // Большая яркая галочка если проголосовал но результаты скрыты
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                    <Check className="h-7 w-7 text-green-600 dark:text-green-400 stroke-[3]" />
                  </div>
                ) : (
                  // Пустое место если не проголосовал
                  <div className="w-10 h-10" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
