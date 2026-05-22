export interface ActivityItem {
  time: string; // HH:MM
  activity: string;
  location: string;
  details: string;
  tips: string;
}

export interface DaySchedule {
  day: string; // "第X天"
  date: string; // YYYY-MM-DD
  schedule: ActivityItem[];
}

export interface TransportObj {
  to: string;
  local: string;
  back: string;
}

export interface HotelItem {
  name: string;
  address: string;
  price: string;
  reason: string;
}

export interface FoodItem {
  name: string;
  address: string;
  recommendation: string;
}

export interface BudgetObj {
  total: string;
  breakdown: Record<string, string>;
}

export interface Itinerary {
  overview: string;
  days: DaySchedule[];
  transport: TransportObj;
  hotel: HotelItem[];
  food: FoodItem[];
  venueTips: string[];
  budget: BudgetObj;
  notes: string[];
}

export interface ItineraryGenerationParams {
  eventName: string;
  venueName: string;
  departureCity: string;
  city: string;
  startDate: string;
  endDate: string;
  eventDate: string;
  budget: number;
  transportPref: string;
  hotelPref: string;
  foodPref: string;
}

export interface SavedItinerary {
  id: string;
  userId: string;
  title: string;
  eventName: string;
  departureCity: string;
  city: string;
  venueName: string;
  startDate: string;
  endDate: string;
  eventDate: string;
  budget: number;
  transportPref: string;
  hotelPref: string;
  foodPref: string;
  itineraryData: Itinerary;
  createdAt: string;
  updatedAt: string;
}
