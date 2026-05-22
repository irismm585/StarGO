import { storage } from './storage';
import { generateItinerary as deepseekGenerate } from './deepseek';
import { STORAGE_KEYS } from '../config';
import type {
  Itinerary,
  ItineraryGenerationParams,
  SavedItinerary,
} from '../types/itinerary';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function generateItinerary(
  params: ItineraryGenerationParams,
  signal?: AbortSignal,
): Promise<Itinerary> {
  return deepseekGenerate(params, signal);
}

export async function saveItinerary(
  userId: string,
  itinerary: Itinerary,
  params: ItineraryGenerationParams,
): Promise<SavedItinerary> {
  const saved = await storage.get<SavedItinerary[]>(STORAGE_KEYS.ITINERARIES) || [];

  const newItem: SavedItinerary = {
    id: generateId(),
    userId,
    title: `${params.eventName} · ${params.city}`,
    eventName: params.eventName,
    departureCity: params.departureCity,
    city: params.city,
    venueName: params.venueName,
    startDate: params.startDate,
    endDate: params.endDate,
    eventDate: params.eventDate,
    budget: params.budget,
    transportPref: params.transportPref,
    hotelPref: params.hotelPref,
    foodPref: params.foodPref,
    itineraryData: itinerary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saved.unshift(newItem);
  await storage.set(STORAGE_KEYS.ITINERARIES, saved);
  return newItem;
}

export async function getSavedItineraries(
  userId: string,
): Promise<SavedItinerary[]> {
  const saved = await storage.get<SavedItinerary[]>(STORAGE_KEYS.ITINERARIES) || [];
  return saved.filter((item) => item.userId === userId);
}

export async function getItineraryById(
  id: string,
): Promise<SavedItinerary | null> {
  const saved = await storage.get<SavedItinerary[]>(STORAGE_KEYS.ITINERARIES) || [];
  return saved.find((item) => item.id === id) || null;
}

export async function deleteItinerary(id: string): Promise<void> {
  const saved = await storage.get<SavedItinerary[]>(STORAGE_KEYS.ITINERARIES) || [];
  const filtered = saved.filter((item) => item.id !== id);
  await storage.set(STORAGE_KEYS.ITINERARIES, filtered);
}

export async function updateItinerary(
  id: string,
  itinerary: Itinerary,
  params: ItineraryGenerationParams,
): Promise<SavedItinerary> {
  const saved = await storage.get<SavedItinerary[]>(STORAGE_KEYS.ITINERARIES) || [];
  const index = saved.findIndex((item) => item.id === id);
  if (index === -1) throw new Error('Itinerary not found');

  const updated: SavedItinerary = {
    ...saved[index],
    title: `${params.eventName} · ${params.city}`,
    eventName: params.eventName,
    departureCity: params.departureCity,
    city: params.city,
    venueName: params.venueName,
    startDate: params.startDate,
    endDate: params.endDate,
    eventDate: params.eventDate,
    budget: params.budget,
    transportPref: params.transportPref,
    hotelPref: params.hotelPref,
    foodPref: params.foodPref,
    itineraryData: itinerary,
    updatedAt: new Date().toISOString(),
  };

  saved[index] = updated;
  await storage.set(STORAGE_KEYS.ITINERARIES, saved);
  return updated;
}
