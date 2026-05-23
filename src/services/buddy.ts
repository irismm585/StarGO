import { storage } from './storage';
import { STORAGE_KEYS } from '../config';
import { MOCK_BUDDIES, MOCK_BUDDY_POSTS } from '../constants/buddies';
import type { BuddyProfile, FriendRequest, BuddyPost, BuddyFilter, BuddyPurpose } from '../types/buddy';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Buddies ──

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

// ── Dynamic Match Calculation ──

/**
 * Purpose rarity weights — having a rare/niche purpose adds value
 * because it signals deeper engagement in specific activities.
 */
const PURPOSE_RARITY: Record<string, number> = {
  share_hotel: 4,    // 3/8 buddies
  share_ride: 4,     // 3/8
  queue_together: 3, // 4/8 — more common
  meal_buddy: 8,     // 0/8 — rarest
  photo_help: 5,     // 3/8
  look_out: 5,       // 3/8
  chat_experience: 2,// 4/8 — most common, lowest value
};

export function calculateMatchPercentage(
  buddy: BuddyProfile,
  filter: BuddyFilter,
): number {
  let score = 0;

  // ─── Profile-based base score (0-70 pts) ───
  // This ensures differentiation even without active filters

  // 1. Purpose diversity & rarity (0-30 pts)
  // More purposes = more flexibility. Rare purposes = more valuable.
  const rarityScore = buddy.purpose.reduce(
    (sum, p) => sum + (PURPOSE_RARITY[p] || 3),
    0,
  );
  // Normalize: 2 common purposes = ~4-6, 3 diverse purposes = ~12-17
  // Scale to max 30
  score += Math.min(Math.round(rarityScore * 1.8), 30);

  // 2. Interest breadth (0-18 pts)
  // More interests = higher chance of common ground
  score += Math.min(buddy.interests.length * 6, 18);

  // 3. Travel style flexibility (0-12 pts)
  score += Math.min(buddy.travelStyle.length * 5, 12);

  // 4. Bio quality (0-10 pts)
  // Detailed bios indicate more engaging companions
  if (buddy.bio) {
    const bioLen = buddy.bio.length;
    if (bioLen >= 18) score += 10;
    else if (bioLen >= 10) score += 6;
    else score += 3;
  }

  // ─── Filter bonus (0-30 pts) ───
  // These are conditional on the user actively filtering

  // 5. Same city (0-12 pts)
  if (filter.city && buddy.city.includes(filter.city)) {
    score += 12;
  }

  // 6. Purpose alignment with filter (0-10 pts)
  if (filter.purpose.length > 0) {
    const overlap = buddy.purpose.filter((p) => filter.purpose.includes(p)).length;
    score += Math.min(overlap * 5, 10);
  }

  // 7. Gender preference match (0-8 pts)
  if (filter.gender !== 'all' && buddy.gender === filter.gender) {
    score += 8;
  }

  return Math.min(Math.max(Math.round(score), 1), 99);
}

// ── Filters ──

export function filterBuddies(
  buddies: BuddyProfile[],
  filter: BuddyFilter,
): BuddyProfile[] {
  return buddies
    .filter((b) => {
      if (filter.gender !== 'all' && b.gender !== filter.gender) return false;
      if (filter.purpose.length > 0) {
        const hasPurpose = b.purpose.some((p) => filter.purpose.includes(p));
        if (!hasPurpose) return false;
      }
      if (filter.city && !b.city.includes(filter.city)) return false;
      return true;
    })
    .map((b) => ({
      ...b,
      matchPercentage: calculateMatchPercentage(b, filter),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ── Posts ──

export async function getBuddyPosts(): Promise<BuddyPost[]> {
  const saved = await storage.get<BuddyPost[]>(STORAGE_KEYS.BUDDY_POSTS);
  const userPosts = saved || [];
  // Merge with mock posts — cast purpose to BuddyPurpose[]
  const typedMockPosts: BuddyPost[] = MOCK_BUDDY_POSTS.map((p) => ({
    ...p,
    purpose: p.purpose as BuddyPurpose[],
  }));
  return [...typedMockPosts, ...userPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createBuddyPost(post: Omit<BuddyPost, 'id' | 'createdAt'>): Promise<BuddyPost> {
  const saved = (await storage.get<BuddyPost[]>(STORAGE_KEYS.BUDDY_POSTS)) || [];
  const newPost: BuddyPost = {
    ...post,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  saved.push(newPost);
  await storage.set(STORAGE_KEYS.BUDDY_POSTS, saved);
  return newPost;
}

export async function deleteBuddyPost(postId: string): Promise<void> {
  const saved = (await storage.get<BuddyPost[]>(STORAGE_KEYS.BUDDY_POSTS)) || [];
  const filtered = saved.filter((p) => p.id !== postId);
  await storage.set(STORAGE_KEYS.BUDDY_POSTS, filtered);
}

// ── Friend Requests ──

export async function sendFriendRequest(
  userId: string,
  buddyId: string,
): Promise<void> {
  const requests =
    (await storage.get<Record<string, FriendRequest>>(
      STORAGE_KEYS.FRIEND_REQUESTS,
    )) || {};

  const key = `${userId}_${buddyId}`;
  if (requests[key]) return;

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

  const key = `${buddyId}_${userId}`;
  if (requests[key]) {
    requests[key].status = 'accepted';
    await storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests);
  }

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
