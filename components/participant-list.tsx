"use client";

import { Participant } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useMemo } from "react";

interface ParticipantListProps {
  participants: Record<string, Participant>;
  revealed: boolean;
  creatorId: string;
  currentUserId?: string | null;
  optimisticVote?: string | null;
  optimisticStatus?: 'voted' | 'thinking' | null;
  children?: React.ReactNode; // Для кнопок контролов
}

// Рандомные эмоджи для участников
const EMOJIS = ['🎮', '🚀', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻', '🎹', '🥁', '🎤', '🎧', '🎬', '🎼', '🌟', '⭐', '✨', '💫', '🔥', '💎', '🏆', '🎖️', '🏅', '🥇', '🥈', '🥉'];

// Компонент списка участников
export function ParticipantList({
  participants,
  revealed,
  creatorId,
  currentUserId,
  optimisticVote,
  optimisticStatus,
  children,
}: ParticipantListProps) {
  const participantEntries = Object.entries(participants);

  const sortedEntries = useMemo(() => {
    if (!revealed) return participantEntries;

    // Бизнес-логика сортировки после reveal:
    // 1) числовые оценки по возрастанию
    // 2) нечисловые: сначала "?", потом "☕️"
    // 3) не голосовали в самом конце
    const numericOrder = ["0.5", "1", "2", "3", "5", "8", "13", "21"];
    const specialOrder = ["?", "☕️"];

    const originalIndex = new Map(participantEntries.map((entry, idx) => [entry[0], idx]));

    const getGroupRank = (vote: string | null) => {
      if (vote === null) return 2; // not voted
      if (numericOrder.includes(vote)) return 0; // numeric
      return 1; // special
    };

    const getValueRank = (vote: string | null) => {
      if (vote === null) return Number.MAX_SAFE_INTEGER;
      if (numericOrder.includes(vote)) return numericOrder.indexOf(vote);
      if (specialOrder.includes(vote)) return specialOrder.indexOf(vote);
      return Number.MAX_SAFE_INTEGER - 1; // неизвестные значения в конце своей группы
    };

    return [...participantEntries].sort((a, b) => {
      const voteA = a[1].vote;
      const voteB = b[1].vote;

      const groupDiff = getGroupRank(voteA) - getGroupRank(voteB);
      if (groupDiff !== 0) return groupDiff;

      const valueDiff = getValueRank(voteA) - getValueRank(voteB);
      if (valueDiff !== 0) return valueDiff;

      return (originalIndex.get(a[0]) ?? 0) - (originalIndex.get(b[0]) ?? 0);
    });
  }, [participantEntries, revealed]);

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
        {sortedEntries.map(([userId, participant]) => {
          // Оптимистично подменяем данные только для текущего пользователя
          const isCurrentUser = currentUserId && userId === currentUserId;
          const effectiveVote = isCurrentUser && optimisticVote !== null ? optimisticVote : participant.vote;
          const effectiveStatus = isCurrentUser && optimisticStatus ? optimisticStatus : participant.status;
          const hasVoted = effectiveVote !== null;

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
                    {effectiveVote}
                  </div>
                ) : hasVoted ? (
                  // Различаем статус "thinking" vs "voted"
                  effectiveStatus === 'thinking' ? (
                    // Иконка песочных часов для черновой оценки
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20" title="Thinking...">
                      <span className="text-2xl">⏳</span>
                    </div>
                  ) : (
                    // Большая яркая галочка для финального голоса (по умолчанию если статус не указан)
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20" title="Voted">
                      <Check className="h-7 w-7 text-green-600 dark:text-green-400 stroke-[3]" />
                    </div>
                  )
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
