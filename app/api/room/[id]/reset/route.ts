import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRoom, saveRoom } from "@/lib/redis";

// POST /api/room/[id]/reset - Удалить все голоса (только модератор)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get(`sp_uid_${roomId}`)?.value;
    const authToken = cookieStore.get(`sp_token_${roomId}`)?.value;

    if (!userId || !authToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Проверяем что пользователь - создатель комнаты
    const participant = room.participants[userId];
    if (!participant || !participant.authToken || participant.authToken !== authToken) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 403 }
      );
    }

    if (room.creatorId !== userId) {
      return NextResponse.json(
        { error: "Only room creator can reset votes" },
        { status: 403 }
      );
    }

    // Сбрасываем все голоса
    Object.keys(room.participants).forEach((participantId) => {
      room.participants[participantId].vote = null;
      room.participants[participantId].votedAt = null;
    });

    // Скрываем результаты
    room.revealed = false;
    room.lastActivity = Date.now();

    // Сохраняем обновленную комнату
    const saved = await saveRoom(room);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to reset votes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error resetting votes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
