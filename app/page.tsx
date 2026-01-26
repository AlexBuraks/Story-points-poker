"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Создание новой комнаты
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.roomId && data.userId) {
        // Сохраняем userId в localStorage для идентификации
        localStorage.setItem(`user_${data.roomId}`, data.userId);
        // Редирект в комнату
        router.push(`/room/${data.roomId}`);
      } else {
        alert("Failed to create room. Please try again.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Theme toggle в правом верхнем углу */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Главная карточка */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🚀 Growth team / Discovercars.com<br/>Story Points Poker</CardTitle>
          <CardDescription>
            Simple and fast Planning Poker for teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="text-lg"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full text-lg h-12"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "Create room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
