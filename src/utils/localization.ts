import type { MockEvent } from '../constants/events';
import type { BuddyProfile } from '../types/buddy';
import type { ChatRoom } from '../types/chat';
import type { Language } from '../constants/i18n';

/**
 * Return the localized version of an event based on the current language.
 */
export function localizeEvent(
  event: MockEvent,
  language: Language,
): MockEvent {
  if (language === 'zh') return event;

  return {
    ...event,
    eventName: event.eventNameEn ?? event.eventName,
    artistName: event.artistNameEn ?? event.artistName,
    venueName: event.venueNameEn ?? event.venueName,
    city: event.cityEn ?? event.city,
    description: event.descriptionEn ?? event.description,
  };
}

/**
 * Return the localized version of a buddy profile based on the current language.
 */
export function localizeBuddy(
  buddy: BuddyProfile,
  language: Language,
): BuddyProfile {
  if (language === 'zh') return buddy;

  return {
    ...buddy,
    name: buddy.nameEn ?? buddy.name,
    city: buddy.cityEn ?? buddy.city,
    interests: buddy.interestsEn ?? buddy.interests,
    bio: buddy.bioEn ?? buddy.bio,
  };
}

/**
 * Return the localized version of a chat room based on the current language.
 */
export function localizeRoom(
  room: ChatRoom,
  language: Language,
): ChatRoom {
  if (language === 'zh') return room;

  return {
    ...room,
    name: room.nameEn ?? room.name,
    description: room.descriptionEn ?? room.description,
  };
}
