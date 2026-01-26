"use client";

import { use, useEffect, useState } from "react";
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
          const data = await response.json();
          setRoom(data);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room data");
      }
    };

    // Первая загрузка
    fetchRoom();

    // Polling каждые 2 секунды
    const interval = setInterval(fetchRoom, 2000);

    return () => clearInterval(interval);
  }, [roomId, userId, router]);

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

  // Голосование
  const handleVote = async (vote: VoteValue) => {
    if (!userId) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/room/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vote }),
      });

      if (!response.ok) {
        setError("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to vote");
    } finally {
      setIsLoading(false);
    }
  };

  // Показать/скрыть результаты
  const handleRevealToggle = async () => {
    if (!userId || !room) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/room/${roomId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, revealed: !room.revealed }),
      });

      if (!response.ok) {
        setError("Failed to toggle reveal");
      }
    } catch (error) {
      console.error("Error toggling reveal:", error);
      setError("Failed to toggle reveal");
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс голосов
  const handleReset = async () => {
    if (!userId) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/room/${roomId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        setError("Failed to reset votes");
      }
    } catch (error) {
      console.error("Error resetting votes:", error);
      setError("Failed to reset votes");
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
            {VOTE_VALUES.slice(0, 5).map((value) => (
              <PokerCard
                key={value}
                value={value}
                isSelected={currentUser?.vote === value}
                onClick={() => handleVote(value)}
              />
            ))}
          </div>
          {/* Второй ряд: 8, 13, 21, ?, ☕️ */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {VOTE_VALUES.slice(5).map((value) => (
              <PokerCard
                key={value}
                value={value}
                isSelected={currentUser?.vote === value}
                onClick={() => handleVote(value)}
              />
            ))}
          </div>
          
          {/* Подсказка по системе голосования */}
          <VotingGuide />
        </div>

        {/* Список участников с контролами */}
        <ParticipantList
          participants={room.participants}
          revealed={room.revealed}
          creatorId={room.creatorId}
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
