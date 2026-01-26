// Типы для участника комнаты
export interface Participant {
  name: string;
  vote: string | null;
  votedAt: number | null;
  isCreator: boolean;
}

// Структура комнаты в Redis
export interface Room {
  id: string;
  creatorId: string;
  createdAt: number;
  lastActivity: number;
  revealed: boolean;
  participants: Record<string, Participant>;
}

// Возможные значения для голосования
export const VOTE_VALUES = ["0.5", "1", "2", "3", "5", "8", "13", "21", "?", "☕️"] as const;
export type VoteValue = typeof VOTE_VALUES[number];
