"use client";

import { use, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Room, VOTE_VALUES, VoteValue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { PokerCard } from "@/components/poker-card";
import { ParticipantList } from "@/components/participant-list";
import { RoomControls } from "@/components/room-controls";
import { CopyLinkButton } from "@/components/copy-link-button";
import { VotingGuide } from "@/components/voting-guide";
import { Home } from "lucide-react";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { id: roomId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimistic UI state for voting
  const [optimisticVote, setOptimisticVote] = useState<VoteValue | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<'voted' | 'thinking' | null>(null);

  // Reset trigger for VotingGuide (incremented to clear selections)
  const [guideResetKey, setGuideResetKey] = useState(0);

  // Track previous vote to detect when it changes to null (new round)
  const previousVoteRef = useRef<VoteValue | string | null | undefined>(undefined);

  // Guard to avoid stale polling overriding optimistic reset
  const pendingResetRef = useRef(false);
  const resetGuardUntilRef = useRef<number | null>(null);

  // Получение userId из localStorage при монтировании
  useEffect(() => {
    const storedUserId = localStorage.getItem(`user_${roomId}`);
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [roomId]);

  // Polling для обновления данных комнаты
  useEffect(() => {
    if (!userId) return;

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/room/${roomId}`);

        if (response.status === 404) {
          router.push("/");
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as Room;

          // Если только что нажали "Delete estimates", игнорим старые данные до тех пор,
          // пока сервер не подтвердит сброс (или пока не истечет таймаут).
          if (pendingResetRef.current) {
            const now = Date.now();
            const guardUntil = resetGuardUntilRef.current;
            if (guardUntil && now > guardUntil) {
              pendingResetRef.current = false;
              resetGuardUntilRef.current = null;
            } else {
              const allVotesNull = Object.values(data.participants).every(p => p.vote === null);
              const isResetState = data.revealed === false && allVotesNull;

              if (!isResetState) {
                return; // держим оптимистичный сброс, не перетираем UI старым состоянием
              }

              pendingResetRef.current = false;
              resetGuardUntilRef.current = null;
            }
          }

          setRoom(data);

          // Синхронизируем optimistic vote с сервером
          const serverVote = data.participants[userId]?.vote;

          // Очищаем optimisticVote ТОЛЬКО если сервер подтвердил наш голос
          // (serverVote === optimisticVote). 
          // Убрали serverVote === null, чтобы избежать race condition при голосовании.
          if (optimisticVote !== null && serverVote === optimisticVote) {
            setOptimisticVote(null);
            setOptimisticStatus(null);
          }

          setError(null);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room data");
      }
    };

    // Первая загрузка
    fetchRoom();

    // Polling каждые 3 секунды (оптимизировано для производительности)
    const interval = setInterval(fetchRoom, 3000);

    return () => clearInterval(interval);
  }, [roomId, userId, router, optimisticVote]);

  // Track previous revealed state to detect explicit room reset (true -> false)
  const previousRevealedRef = useRef<boolean | undefined>(undefined);

  // Auto-reset VotingGuide when new round starts (explicit reset or manual vote null)
  useEffect(() => {
    if (!userId || !room) return;

    const currentVote = optimisticVote ?? room.participants[userId]?.vote;
    const isRevealed = room.revealed;

    // Detect explicit room reset (moderator clicked "Delete estimates")
    // This happens when revealed changes from true to false
    const isExplicitReset = previousRevealedRef.current === true && isRevealed === false;

    // Detect transition to null vote (new round started on server)
    const isNewRoundOnServer = previousVoteRef.current !== undefined && previousVoteRef.current !== null && currentVote === null;

    if (isExplicitReset || isNewRoundOnServer) {
      setOptimisticVote(null); // Force clear optimistic state on reset
      setOptimisticStatus(null);
      setGuideResetKey(prev => prev + 1);
    }

    // Update refs
    previousVoteRef.current = currentVote;
    previousRevealedRef.current = isRevealed;
  }, [userId, room, optimisticVote]);

  // Вход в комнату
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsJoining(true);

    try {
      const response = await fetch(`/api/room/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.status === 404) {
        router.push("/");
        return;
      }

      const data = await response.json();

      if (response.ok && data.userId) {
        localStorage.setItem(`user_${roomId}`, data.userId);
        setUserId(data.userId);
      } else {
        setError("Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setError("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  // Голосование с Optimistic UI (supports null for vote deselection)
  const handleVote = useCallback(async (vote: VoteValue | null, status: 'voted' | 'thinking' = 'voted', fromManualClick = false) => {
    if (!userId) return;

    // Сохраняем предыдущее значение для возможного отката
    const previousVote = optimisticVote ?? (room?.participants[userId]?.vote as VoteValue | null) ?? null;

    // НЕМЕДЛЕННО обновляем UI (Optimistic Update)
    setOptimisticVote(vote);
    setOptimisticStatus(vote === null ? null : status);

    // If this was a manual click on PokerCard, reset the guide selections
    if (fromManualClick) {
      setGuideResetKey(prev => prev + 1);
    }

    // Отправляем запрос в фоне
    try {
      const response = await fetch(`/api/room/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote, status }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Session expired. Please rejoin the room.");
          setUserId(null);
          return;
        }
        // Откатываем изменения при ошибке
        setOptimisticVote(previousVote);
        setOptimisticStatus(previousVote === null ? null : 'voted');
        setError("Failed to vote. Please try again.");

        // Автоматически скрываем ошибку через 3 секунды
        setTimeout(() => setError(null), 3000);
      } else {
        // Успех - polling обновит данные с сервера
        setError(null);
      }
    } catch (error) {
      console.error("Error voting:", error);
      // Откатываем изменения при ошибке сети
      setOptimisticVote(previousVote);
      setOptimisticStatus(previousVote === null ? null : 'voted');
      setError("Network error. Please check your connection.");

      // Автоматически скрываем ошибку через 3 секунды
      setTimeout(() => setError(null), 3000);
    }
  }, [userId, roomId, optimisticVote, room]);

  // Показать/скрыть результаты (with Optimistic UI)
  const handleRevealToggle = async () => {
    if (!userId || !room) return;

    // Сохраняем предыдущее состояние для возможного отката
    const previousRevealed = room.revealed;

    // НЕМЕДЛЕННО обновляем UI (Optimistic Update)
    setRoom(prev => prev ? { ...prev, revealed: !prev.revealed } : null);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/room/${roomId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revealed: !previousRevealed }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Session expired. Please rejoin the room.");
          setUserId(null);
          return;
        }
        // Откатываем изменения при ошибке
        setRoom(prev => prev ? { ...prev, revealed: previousRevealed } : null);
        setError("Failed to toggle reveal. Please try again.");

        // Автоматически скрываем ошибку через 3 секунды
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("Error toggling reveal:", error);
      // Откатываем изменения при ошибке сети
      setRoom(prev => prev ? { ...prev, revealed: previousRevealed } : null);
      setError("Network error. Please check your connection.");

      // Автоматически скрываем ошибку через 3 секунды
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс голосов (with Optimistic UI)
  const handleReset = async () => {
    if (!userId || !room) return;

    // Блокируем перезапись UI старыми данными из polling на время сброса
    pendingResetRef.current = true;
    resetGuardUntilRef.current = Date.now() + 5000;

    // Сохраняем предыдущее состояние для возможного отката
    const previousRoom = { ...room };
    const previousOptimisticVote = optimisticVote;

    // НЕМЕДЛЕННО обновляем UI (Optimistic Update)
    setRoom(prev => {
      if (!prev) return null;
      const newParticipants = { ...prev.participants };
      Object.keys(newParticipants).forEach(uid => {
        newParticipants[uid] = { ...newParticipants[uid], vote: null };
      });
      return { ...prev, revealed: false, participants: newParticipants };
    });

    // Immediately reset optimistic vote and guide (don't wait for polling)
    setOptimisticVote(null);
    setOptimisticStatus(null);
    setGuideResetKey(prev => prev + 1);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/room/${roomId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Session expired. Please rejoin the room.");
          setUserId(null);
          return;
        }
        // Откатываем изменения при ошибке
        setRoom(previousRoom);
        setOptimisticVote(previousOptimisticVote);
        setError("Failed to reset votes. Please try again.");

        pendingResetRef.current = false;
        resetGuardUntilRef.current = null;

        // Автоматически скрываем ошибку через 3 секунды
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("Error resetting votes:", error);
      // Откатываем изменения при ошибке сети
      setRoom(previousRoom);
      setOptimisticVote(previousOptimisticVote);
      setError("Network error. Please check your connection.");

      pendingResetRef.current = false;
      resetGuardUntilRef.current = null;

      // Автоматически скрываем ошибку через 3 секунды
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Форма входа в комнату
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Room</CardTitle>
            <CardDescription>Room ID: {roomId}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isJoining}
                  className="text-lg"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full text-lg h-12"
                disabled={!name.trim() || isJoining}
              >
                {isJoining ? "Joining..." : "Join room"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Go to home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Загрузка комнаты
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading room...</p>
      </div>
    );
  }

  const currentUser = room.participants[userId];
  const isCreator = room.creatorId === userId;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Room: {roomId}</h1>
              {currentUser && (
                <p className="text-sm text-muted-foreground">
                  Logged in as {currentUser.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CopyLinkButton roomId={roomId} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Карточки для голосования */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Your estimate</h2>
          {/* Первый ряд: 0.5, 1, 2, 3, 5 */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-3">
            {VOTE_VALUES.slice(0, 5).map((value) => {
              // Используем optimistic vote для мгновенного отклика
              const currentVote = optimisticVote ?? currentUser?.vote;
              return (
                <PokerCard
                  key={value}
                  value={value}
                  isSelected={currentVote === value}
                  onClick={() => {
                    // Toggle: if already selected, deselect (vote null)
                    if (currentVote === value) {
                      handleVote(null, 'voted', true);
                    } else {
                      handleVote(value, 'voted', true);
                    }
                  }}
                />
              );
            })}
          </div>
          {/* Второй ряд: 8, 13, 21, ?, ☕️ */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {VOTE_VALUES.slice(5).map((value) => {
              // Используем optimistic vote для мгновенного отклика
              const currentVote = optimisticVote ?? currentUser?.vote;
              return (
                <PokerCard
                  key={value}
                  value={value}
                  isSelected={currentVote === value}
                  onClick={() => {
                    // Toggle: if already selected, deselect (vote null)
                    if (currentVote === value) {
                      handleVote(null, 'voted', true);
                    } else {
                      handleVote(value, 'voted', true);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Подсказка по системе голосования */}
          <VotingGuide
            onVote={(vote, status = 'thinking') => handleVote(vote as VoteValue, status, false)}
            resetTrigger={guideResetKey}
          />
        </div>

        {/* Список участников с контролами */}
        <ParticipantList
          participants={room.participants}
          revealed={room.revealed}
          creatorId={room.creatorId}
          currentUserId={userId}
          optimisticVote={optimisticVote}
          optimisticStatus={optimisticStatus}
        >
          {/* Контролы для модератора */}
          {isCreator && (
            <RoomControls
              roomId={roomId}
              userId={userId}
              revealed={room.revealed}
              onRevealToggle={handleRevealToggle}
              onReset={handleReset}
              isLoading={isLoading}
            />
          )}
        </ParticipantList>

        {/* Ошибки */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
