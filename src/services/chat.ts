import { storage } from './storage';
import { STORAGE_KEYS } from '../config';
import { checkForScalping } from '../constants/keywords';
import type {
  ChatRoom,
  ChatMessage,
  KeywordFilterResult,
  SendMessageParams,
} from '../types/chat';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Mock chat rooms data
const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'room_1',
    name: 'Taylor Swift 中国粉丝团',
    description: '霉霉中国粉丝交流群，分享演出信息和观演心得',
    type: 'artist',
    relatedEntity: 'Taylor Swift',
    memberCount: 15234,
    isVerified: false,
    isJoined: false,
    createdAt: '2025-01-01T00:00:00Z',
    nameEn: 'Taylor Swift China Fan Club',
    descriptionEn: 'Swiftie community in China, sharing concert info and fan experiences',
  },
  {
    id: 'room_2',
    name: '音乐节搭子',
    description: '寻找音乐节搭子，一起拼房拼车',
    type: 'event',
    relatedEntity: '音乐节',
    memberCount: 8932,
    isVerified: false,
    isJoined: false,
    createdAt: '2025-02-15T00:00:00Z',
    nameEn: 'Music Festival Buddy Finder',
    descriptionEn: 'Find music festival buddies, share rides and hotel rooms',
  },
  {
    id: 'room_3',
    name: '国家体育场（鸟巢）攻略',
    description: '鸟巢观演经验分享，座位推荐和场馆tips',
    type: 'venue',
    relatedEntity: '国家体育场',
    memberCount: 12567,
    isVerified: false,
    isJoined: false,
    createdAt: '2025-03-01T00:00:00Z',
    nameEn: 'Bird\'s Nest Stadium Guide',
    descriptionEn: 'Venue tips, seat recommendations, and insider advice for the National Stadium',
  },
  {
    id: 'room_4',
    name: 'K-pop 拼盘演唱会',
    description: 'K-pop家族演唱会信息交流和组团',
    type: 'event',
    relatedEntity: 'K-pop Concert',
    memberCount: 6789,
    isVerified: false,
    isJoined: false,
    createdAt: '2025-04-10T00:00:00Z',
    nameEn: 'K-pop Concert Group',
    descriptionEn: 'K-pop family concert info exchange and group meetups',
  },
  {
    id: 'room_5',
    name: '周杰伦嘉年华巡演',
    description: '杰伦粉集合！分享巡演信息和各地观演攻略',
    type: 'artist',
    relatedEntity: '周杰伦',
    memberCount: 21345,
    isVerified: false,
    isJoined: false,
    createdAt: '2025-01-20T00:00:00Z',
    nameEn: 'Jay Chou Carnival Tour',
    descriptionEn: 'Jay Chou fans unite! Share tour info and concert tips from different cities',
  },
];

export async function getChatRooms(): Promise<ChatRoom[]> {
  const saved = await storage.get<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS);
  if (saved) {
    // Merge saved join state with mock data
    const merged = MOCK_ROOMS.map((room) => {
      const savedRoom = saved.find((r) => r.id === room.id);
      return {
        ...room,
        isJoined: savedRoom?.isJoined ?? false,
      };
    });
    // Also include dynamic rooms (like event group chats) that aren't in MOCK_ROOMS
    const dynamicRooms = saved.filter(
      (r) => !MOCK_ROOMS.some((mock) => mock.id === r.id)
    );
    return [...merged, ...dynamicRooms];
  }
  return MOCK_ROOMS;
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const rooms = await storage.get<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS) || [];
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], isJoined: true };
  } else {
    const room = MOCK_ROOMS.find((r) => r.id === roomId);
    if (room) {
      rooms.push({ ...room, isJoined: true });
    }
  }
  await storage.set(STORAGE_KEYS.CHAT_ROOMS, rooms);
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const rooms = await storage.get<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS) || [];
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], isJoined: false };
    await storage.set(STORAGE_KEYS.CHAT_ROOMS, rooms);
  }
}

export async function getMessages(
  roomId: string,
  limit = 50,
): Promise<ChatMessage[]> {
  const key = `${STORAGE_KEYS.CHAT_MESSAGES_PREFIX}${roomId}`;
  const messages = await storage.get<ChatMessage[]>(key) || [];
  return messages.slice(-limit);
}

export async function sendMessage(
  params: SendMessageParams,
): Promise<{ message: ChatMessage | null; filterResult: KeywordFilterResult }> {
  const filterResult = checkForScalping(params.content);

  if (filterResult.isBlocked) {
    return { message: null, filterResult };
  }

  const message: ChatMessage = {
    id: generateId(),
    roomId: params.roomId,
    userId: params.userId,
    username: params.username,
    displayName: params.username,
    content: params.content,
    timestamp: new Date().toISOString(),
    isAlert: false,
    ...(params.itineraryShare ? { itineraryShare: params.itineraryShare } : {}),
  };

  const key = `${STORAGE_KEYS.CHAT_MESSAGES_PREFIX}${params.roomId}`;
  const messages = await storage.get<ChatMessage[]>(key) || [];
  messages.push(message);
  await storage.set(key, messages);

  return { message, filterResult };
}

/**
 * Get or create a chat room for an event.
 * Ensures the same event always maps to the same room.
 */
export async function getOrCreateEventRoom(
  event: { id: string; eventName: string; eventNameEn?: string; artistName: string; artistNameEn?: string; venueName: string; venueNameEn?: string; city: string; cityEn?: string },
  userId: string,
): Promise<ChatRoom> {
  const eventRoomId = `event_room_${event.id}`;
  const rooms = await storage.get<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS) || [];
  const existing = rooms.find((r) => r.id === eventRoomId);

  if (existing) {
    // Ensure the user is joined
    if (!existing.isJoined) {
      await joinRoom(eventRoomId, userId);
    }
    return { ...existing, isJoined: true };
  }

  // Create new room for this event
  const newRoom: ChatRoom = {
    id: eventRoomId,
    name: event.eventName,
    nameEn: event.eventNameEn,
    description: `${event.artistName} @ ${event.venueName} · ${event.city}`,
    descriptionEn: event.artistNameEn
      ? `${event.artistNameEn} @ ${event.venueNameEn || event.venueName} · ${event.cityEn || event.city}`
      : `${event.artistName} @ ${event.venueNameEn || event.venueName} · ${event.cityEn || event.city}`,
    type: 'event',
    relatedEntity: event.eventName,
    memberCount: 1,
    isVerified: true,
    isJoined: true,
    createdAt: new Date().toISOString(),
  };

  rooms.push(newRoom);
  await storage.set(STORAGE_KEYS.CHAT_ROOMS, rooms);

  return newRoom;
}

export { checkForScalping as checkMessageContent };
