export type BuddyPurpose = 'share_hotel' | 'share_ride' | 'queue_together' | 'meal_buddy' | 'photo_help' | 'look_out' | 'chat_experience';

export const BUDDY_PURPOSE_OPTIONS: { key: BuddyPurpose; labelZh: string; labelEn: string; icon: string }[] = [
  { key: 'share_hotel', labelZh: '拼房', labelEn: 'Share Hotel', icon: '🏨' },
  { key: 'share_ride', labelZh: '拼车', labelEn: 'Share Ride', icon: '🚗' },
  { key: 'queue_together', labelZh: '一起排队', labelEn: 'Queue Together', icon: '🎯' },
  { key: 'meal_buddy', labelZh: '拼饭', labelEn: 'Meal Buddy', icon: '🍽️' },
  { key: 'photo_help', labelZh: '拍照互助', labelEn: 'Photo Help', icon: '📸' },
  { key: 'look_out', labelZh: '互相照应', labelEn: 'Look Out', icon: '🤝' },
  { key: 'chat_experience', labelZh: '交流心得', labelEn: 'Share Experiences', icon: '💬' },
];

export function getPurposeLabel(key: BuddyPurpose, language: 'zh' | 'en'): string {
  const opt = BUDDY_PURPOSE_OPTIONS.find((o) => o.key === key);
  if (!opt) return key;
  return language === 'zh' ? opt.labelZh : opt.labelEn;
}

export function getPurposeIcon(key: BuddyPurpose): string {
  return BUDDY_PURPOSE_OPTIONS.find((o) => o.key === key)?.icon || '📌';
}

export interface BuddyProfile {
  id: string;
  name: string;
  nameEn?: string;
  avatar: string;
  city: string;
  cityEn?: string;
  gender: 'male' | 'female';
  age: number;
  interests: string[];
  interestsEn?: string[];
  purpose: BuddyPurpose[];
  purposeEn?: string[];
  travelStyle: string[];
  travelStyleEn?: string[];
  matchPercentage: number;
  isFriend: boolean;
  friendRequestStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  bio?: string;
  bioEn?: string;
}

export interface BuddyPost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  eventName: string;
  eventDate: string;
  city: string;
  venueName?: string;
  purpose: BuddyPurpose[];
  genderPreference: 'male' | 'female' | 'any';
  description: string;
  createdAt: string;
  itineraryId?: string;
}

export interface BuddyFilter {
  gender: 'all' | 'male' | 'female';
  purpose: BuddyPurpose[];
  city: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toBuddyId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface BuddyChatMessage {
  id: string;
  buddyId: string;
  userId: string;
  content: string;
  timestamp: string;
  isFromBuddy: boolean;
}
