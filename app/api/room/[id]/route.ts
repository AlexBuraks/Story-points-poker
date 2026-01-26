import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/redis";

// GET /api/room/[id] - Получение данных комнаты
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    
    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
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

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error("Error getting room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
