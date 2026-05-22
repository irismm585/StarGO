export type ChatRoomType = 'artist' | 'venue' | 'event';

export interface ChatRoom {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  type: ChatRoomType;
  relatedEntity: string;
  coverImageUrl?: string;
  memberCount: number;
  isVerified: boolean;
  isJoined: boolean;
  lastMessage?: ChatMessage;
  createdAt: string;
}

export interface ItineraryShareInfo {
  id: string;
  eventName: string;
  city: string;
  venueName: string;
  startDate: string;
  endDate: string;
  eventDate: string;
  budget: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
  isAlert: boolean;
  alertReason?: string;
  itineraryShare?: ItineraryShareInfo;
}

export interface KeywordFilterResult {
  isBlocked: boolean;
  matchedKeywords: string[];
  sanitizedContent: string;
}

export interface SendMessageParams {
  roomId: string;
  content: string;
  userId: string;
  username: string;
  itineraryShare?: ItineraryShareInfo;
}
