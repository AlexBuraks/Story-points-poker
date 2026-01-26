import { kv } from "@vercel/kv";
import { Room } from "./types";

const ROOM_TTL = 60 * 60 * 3; // 3 часа в секундах

// In-memory хранилище для локальной разработки без Redis
const inMemoryStore: Map<string, Room> = new Map();

// Проверка доступности Redis
const isRedisAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Логируем режим работы
if (typeof window === "undefined") {
  console.log(`🔧 Storage mode: ${isRedisAvailable ? "Redis (Vercel KV)" : "In-Memory (Local Dev)"}`);
}

// Генерация уникального ID для комнаты
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// Генерация уникального ID для пользователя
export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Получить комнату из Redis или in-memory
export async function getRoom(roomId: string): Promise<Room | null> {
  try {
    if (isRedisAvailable) {
      const room = await kv.get<Room>(`room:${roomId}`);
      return room;
    } else {
      // Локальная разработка - используем in-memory
      return inMemoryStore.get(roomId) || null;
    }
  } catch (error) {
    console.error("Error getting room:", error);
    // Fallback на in-memory если Redis упал
    return inMemoryStore.get(roomId) || null;
  }
}

// Сохранить комнату в Redis или in-memory
export async function saveRoom(room: Room): Promise<boolean> {
  try {
    if (isRedisAvailable) {
      await kv.set(`room:${room.id}`, room, { ex: ROOM_TTL });
      return true;
    } else {
      // Локальная разработка - используем in-memory
      inMemoryStore.set(room.id, room);
      
      // Эмуляция TTL - удаляем комнату через 3 часа
      setTimeout(() => {
        inMemoryStore.delete(room.id);
      }, ROOM_TTL * 1000);
      
      return true;
    }
  } catch (error) {
    console.error("Error saving room:", error);
    // Fallback на in-memory если Redis упал
    inMemoryStore.set(room.id, room);
    return true;
  }
}

// Обновить lastActivity комнаты (продлить TTL)
export async function updateRoomActivity(roomId: string): Promise<boolean> {
  const room = await getRoom(roomId);
  if (!room) return false;

  room.lastActivity = Date.now();
  return await saveRoom(room);
}
