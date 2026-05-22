import { storage } from './storage';
import { generateMemorialContent as deepseekGenerate } from './deepseek';
import { STORAGE_KEYS } from '../config';
import type {
  MemorialGenerationParams,
  MemorialContent,
  SavedMemorial,
} from '../types/memorial';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function generateContent(
  params: MemorialGenerationParams,
  signal?: AbortSignal,
): Promise<{ content: MemorialContent; contentEn: MemorialContent }> {
  const bilingual = await deepseekGenerate(params, signal);
  return { content: bilingual.zh, contentEn: bilingual.en };
}

export async function saveMemorial(
  userId: string,
  content: MemorialContent,
  contentEn?: MemorialContent,
): Promise<SavedMemorial> {
  const saved = await storage.get<SavedMemorial[]>(STORAGE_KEYS.MEMORIALS) || [];

  const newItem: SavedMemorial = {
    id: generateId(),
    userId,
    eventName: content.eventName,
    content: { ...content, userId },
    ...(contentEn ? { contentEn: { ...contentEn, userId } } : {}),
    createdAt: new Date().toISOString(),
  };

  saved.unshift(newItem);
  await storage.set(STORAGE_KEYS.MEMORIALS, saved);
  return newItem;
}

export async function getSavedMemorials(
  userId: string,
): Promise<SavedMemorial[]> {
  const saved = await storage.get<SavedMemorial[]>(STORAGE_KEYS.MEMORIALS) || [];
  return saved.filter((item) => item.userId === userId);
}

export async function deleteMemorial(id: string): Promise<void> {
  const saved = await storage.get<SavedMemorial[]>(STORAGE_KEYS.MEMORIALS) || [];
  const filtered = saved.filter((item) => item.id !== id);
  await storage.set(STORAGE_KEYS.MEMORIALS, filtered);
}
