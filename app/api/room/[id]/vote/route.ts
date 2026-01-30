import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";
import { VOTE_VALUES } from "@/lib/types";

// POST /api/room/[id]/vote - Голосование
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { userId, vote, status: rawStatus } = body;

    // Нормализуем статус: если не передан или некорректный, используем 'voted'
    const status = (rawStatus === 'voted' || rawStatus === 'thinking') ? rawStatus : 'voted';

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Разрешаем vote: null для сброса голоса
    if (vote !== null && !VOTE_VALUES.includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Проверяем что пользователь в комнате
    if (!room.participants[userId]) {
      return NextResponse.json(
        { error: "User not in room" },
        { status: 403 }
      );
    }

    // Обновляем голос и статус участника
    room.participants[userId].vote = vote;
    room.participants[userId].votedAt = vote !== null ? Date.now() : null;
    room.participants[userId].status = status;
    room.lastActivity = Date.now();

    // Сохраняем обновленную комнату
    const saved = await saveRoom(room);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
