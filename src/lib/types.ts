// lib/types.ts
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BookingData {
  customer_name: string;
  pickup_location: string;
  dropoff_location: string;
  booking_date: string;
  booking_time: string;
  number_of_passengers: number;
  vehicle_type: string;
  notes: string;
}
