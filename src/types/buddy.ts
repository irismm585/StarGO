export interface BuddyProfile {
  id: string;
  name: string;
  nameEn?: string;
  avatar: string; // emoji or URL
  city: string;
  cityEn?: string;
  gender: 'male' | 'female';
  age: number;
  interests: string[];
  interestsEn?: string[];
  isFriend: boolean;
  friendRequestStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  bio?: string;
  bioEn?: string;
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
