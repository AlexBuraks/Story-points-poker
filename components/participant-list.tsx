"use client";

import { Participant } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Check, Crown } from "lucide-react";

interface ParticipantListProps {
  participants: Record<string, Participant>;
  revealed: boolean;
  creatorId: string;
}

// Компонент списка участников
export function ParticipantList({ participants, revealed, creatorId }: ParticipantListProps) {
  const participantEntries = Object.entries(participants);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-4">Participants ({participantEntries.length})</h2>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {participantEntries.map(([userId, participant]) => {
          const hasVoted = participant.vote !== null;
          const isCreator = userId === creatorId;

          return (
            <Card key={userId} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Имя участника */}
                  <span className="font-medium truncate">
                    {participant.name}
                  </span>
                  
                  {/* Корона для создателя */}
                  {isCreator && (
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {/* Статус голосования */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {revealed && hasVoted ? (
                    // Показываем результат после reveal
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                      {participant.vote}
                    </div>
                  ) : hasVoted ? (
                    // Галочка если проголосовал но результаты скрыты
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    // Пустое место если не проголосовал
                    <div className="w-5 h-5" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
