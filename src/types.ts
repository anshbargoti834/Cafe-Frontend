export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
}

export interface ReservationPayload {
  name: string;
  phone: string;
  email: string;
  numberOfGuests: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "18:00-19:00"
  specialNote?: string;
}

export interface AvailabilityResponse {
  date: string;
  timeSlot: string;
  remainingSeats: number;
  seatingLimitPerSlot: number;
}