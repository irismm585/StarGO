export type MemorialTemplate =
  | 'concert_recap'
  | 'festival_vlog'
  | 'fan_appreciation'
  | 'meet_greet_story'
  | 'venue_review'
  | 'travel_memory';

export interface MemorialGenerationParams {
  eventName: string;
  artistName?: string;
  venueName: string;
  city: string;
  date: string;
  template: MemorialTemplate;
  personalHighlights?: string;
  mood?: string;
}

export interface MemorialContent {
  id?: string;
  userId?: string;
  eventName: string;
  template: MemorialTemplate;
  captions: {
    short: string;
    medium: string;
    long: string;
  };
  hashtags: string[];
  suggestedPosts: {
    platform: 'instagram' | 'twitter' | 'tiktok' | 'facebook';
    content: string;
  }[];
  createdAt?: string;
}

export interface SavedMemorial {
  id: string;
  userId: string;
  eventName: string;
  content: MemorialContent;
  createdAt: string;
}
