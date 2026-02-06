import { NextRequest, NextResponse } from "next/server";
import { generateRoomId, generateUserId, generateAuthToken, saveRoom, ROOM_TTL } from "@/lib/redis";
import { Room } from "@/lib/types";

// POST /api/room - Создание новой комнаты
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Генерируем уникальные ID
    const roomId = generateRoomId();
    const userId = generateUserId();
    const authToken = generateAuthToken();
    const now = Date.now();

    // Создаем комнату
    const room: Room = {
      id: roomId,
      creatorId: userId,
      createdAt: now,
      lastActivity: now,
      revealed: false,
      participants: {
        [userId]: {
          name: name.trim(),
          vote: null,
          votedAt: null,
          isCreator: true,
          authToken,
        },
      },
    };

    // Сохраняем в Redis
    const saved = await saveRoom(room);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ roomId, userId }, { status: 201 });

    // Сохраняем сессию участника в HttpOnly cookie
    response.cookies.set(`sp_uid_${roomId}`, userId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ROOM_TTL,
    });
    response.cookies.set(`sp_token_${roomId}`, authToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ROOM_TTL,
    });

    return response;
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
