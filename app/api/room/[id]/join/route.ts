import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom, generateUserId } from "@/lib/redis";

// POST /api/room/[id]/join - Вход в комнату
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
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

    // Генерируем userId для нового участника
    const userId = generateUserId();

    // Добавляем участника в комнату
    room.participants[userId] = {
      name: name.trim(),
      vote: null,
      votedAt: null,
      isCreator: false,
    };

    room.lastActivity = Date.now();

    // Сохраняем обновленную комнату
    const saved = await saveRoom(room);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }

    return NextResponse.json({ userId }, { status: 200 });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
