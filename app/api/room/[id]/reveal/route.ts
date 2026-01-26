import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";

// POST /api/room/[id]/reveal - Показать/скрыть результаты (только модератор)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { userId, revealed } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (typeof revealed !== "boolean") {
      return NextResponse.json(
        { error: "Revealed must be a boolean" },
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

    // Проверяем что пользователь - создатель комнаты
    if (room.creatorId !== userId) {
      return NextResponse.json(
        { error: "Only room creator can reveal results" },
        { status: 403 }
      );
    }

    // Обновляем статус revealed
    room.revealed = revealed;
    room.lastActivity = Date.now();

    // Сохраняем обновленную комнату
    const saved = await saveRoom(room);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to update room" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error revealing results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
