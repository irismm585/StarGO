import { storage } from './storage';
import { STORAGE_KEYS } from '../config';
import { MOCK_BUDDIES } from '../constants/buddies';
import type { BuddyProfile, FriendRequest } from '../types/buddy';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllBuddies(userId?: string): Promise<BuddyProfile[]> {
  const saved = await storage.get<string[]>(STORAGE_KEYS.BUDDIES);
  const friendIds = saved || [];
  const pendingRequests = await getPendingRequestIds(userId);

  return MOCK_BUDDIES.map((buddy) => {
    const isFriend = friendIds.includes(buddy.id);
    const reqStatus = pendingRequests.find((r) => r.toBuddyId === buddy.id);
    return {
      ...buddy,
      isFriend,
      friendRequestStatus: isFriend ? 'accepted' : reqStatus ? 'pending' : 'none',
    };
  });
}

export async function getFriendBuddies(): Promise<BuddyProfile[]> {
  const all = await getAllBuddies();
  return all.filter((b) => b.isFriend);
}

export async function getDiscoverBuddies(): Promise<BuddyProfile[]> {
  const all = await getAllBuddies();
  return all.filter((b) => !b.isFriend);
}

export async function sendFriendRequest(
  userId: string,
  buddyId: string,
): Promise<void> {
  const requests =
    (await storage.get<Record<string, FriendRequest>>(
      STORAGE_KEYS.FRIEND_REQUESTS,
    )) || {};

  const key = `${userId}_${buddyId}`;
  if (requests[key]) return; // Already exists

  requests[key] = {
    id: generateId(),
    fromUserId: userId,
    toBuddyId: buddyId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests);
}

export async function acceptFriendRequest(
  userId: string,
  buddyId: string,
): Promise<void> {
  const requests =
    (await storage.get<Record<string, FriendRequest>>(
      STORAGE_KEYS.FRIEND_REQUESTS,
    )) || {};

  const key = `${buddyId}_${userId}`; // Incoming: buddyId sent request to userId
  if (requests[key]) {
    requests[key].status = 'accepted';
    await storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests);
  }

  // Add to friends list
  const saved = (await storage.get<string[]>(STORAGE_KEYS.BUDDIES)) || [];
  if (!saved.includes(buddyId)) {
    saved.push(buddyId);
    await storage.set(STORAGE_KEYS.BUDDIES, saved);
  }
}

export async function declineFriendRequest(
  userId: string,
  buddyId: string,
): Promise<void> {
  const requests =
    (await storage.get<Record<string, FriendRequest>>(
      STORAGE_KEYS.FRIEND_REQUESTS,
    )) || {};

  const key = `${buddyId}_${userId}`;
  if (requests[key]) {
    delete requests[key];
    await storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests);
  }
}

async function getPendingRequestIds(
  userId?: string,
): Promise<{ toBuddyId: string }[]> {
  if (!userId) return [];
  const requests =
    (await storage.get<Record<string, FriendRequest>>(
      STORAGE_KEYS.FRIEND_REQUESTS,
    )) || {};

  return Object.values(requests).filter(
    (r) => r.fromUserId === userId && r.status === 'pending',
  );
}

export async function addFriend(buddyId: string): Promise<void> {
  const saved = (await storage.get<string[]>(STORAGE_KEYS.BUDDIES)) || [];
  if (!saved.includes(buddyId)) {
    saved.push(buddyId);
    await storage.set(STORAGE_KEYS.BUDDIES, saved);
  }
}

export async function removeFriend(buddyId: string): Promise<void> {
  const saved = (await storage.get<string[]>(STORAGE_KEYS.BUDDIES)) || [];
  const updated = saved.filter((id) => id !== buddyId);
  await storage.set(STORAGE_KEYS.BUDDIES, updated);
}
