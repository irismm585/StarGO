import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL,
} from '@env';

export const config = {
  deepseek: {
    apiKey: DEEPSEEK_API_KEY || '',
    baseUrl: DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: DEEPSEEK_MODEL || 'deepseek-v4-flash',
    defaultTemperature: 1.0,
    maxTokens: 4096,
  },
  app: {
    name: 'StarGo',
    version: '1.0.0',
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'stargo_auth_token',
  USER_DATA: 'stargo_user_data',
  ITINERARIES: 'stargo_itineraries',
  CHAT_ROOMS: 'stargo_chat_rooms',
  CHAT_MESSAGES_PREFIX: 'stargo_chat_messages_',
  MEMORIALS: 'stargo_memorials',
  THEME: 'stargo_theme',
  BUDDIES: 'stargo_buddies',
  FRIEND_REQUESTS: 'stargo_friend_requests',
  BUDDY_POSTS: 'stargo_buddy_posts',
};
