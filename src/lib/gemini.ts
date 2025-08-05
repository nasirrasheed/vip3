import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, AIBooking } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface BookingData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_location?: string;
  dropoff_location?: string;
  booking_date?: string;
  booking_time?: string;
  service_type?: string;
  vehicle_preference?: string;
  passenger_count?: number;
  special_requirements?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class VIPBookingAssistant {
  private model;
  private conversationHistory: ChatMessage[] = [];
  private extractedData: BookingData = {};
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  private getSystemPrompt(): string {
    return `You are a professional VIP transport booking assistant for VIP Transport and Security. Your role is to help customers book luxury chauffeur services in a friendly, professional manner.

SERVICES AVAILABLE:
- Chauffeur Service (professional drivers for any occasion)
- Airport Transfers (flight monitoring, meet & greet)
- Wedding Transport (elegant vehicles for special days)
- Corporate Transport (executive business travel)
- Security Services (SIA-licensed close protection)
- Event Transport (premieres, galas, exclusive events)

BOOKING INFORMATION TO COLLECT:
1. Customer name
2. Contact details (email and/or phone)
3. Pickup location
4. Drop-off location (if different)
5. Date and time
6. Service type
7. Vehicle preference (if any)
8. Number of passengers
9. Special requirements

CONVERSATION GUIDELINES:
- Be warm, professional, and helpful
- Ask one question at a time to avoid overwhelming the customer
- Confirm details before finalizing
- If information is unclear, ask for clarification
- Mention that all bookings are subject to availability and admin approval
- Keep responses concise but informative

IMPORTANT: When you have collected sufficient information for a booking, end your response with the exact phrase: "BOOKING_READY_FOR_SUBMISSION"

Current extracted data: ${JSON.stringify(this.extractedData)}`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.extractBookingData(userMessage);

    const prompt = `${this.getSystemPrompt()}

CONVERSATION HISTORY:
${this.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please respond to the latest user message professionally and helpfully. If you have enough information to create a booking, include "BOOKING_READY_FOR_SUBMISSION" at the end of your response.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      const bookingReady = response.includes('BOOKING_READY_FOR_SUBMISSION');

      if (bookingReady) {
        await this.saveBookingToSupabase();
      }

      return {
        response: response.replace('BOOKING_READY_FOR_SUBMISSION', '').trim(),
        bookingReady,
        extractedData: this.extractedData
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        response: "I'm having technical difficulties. Please try again or contact us at 07464 247 007.",
        bookingReady: false,
        extractedData: this.extractedData
      };
    }
  }

  private async saveBookingToSupabase() {
    const newBooking: Partial<AIBooking> = {
      conversation_id: this.sessionId,
      customer_name: this.extractedData.customer_name,
      customer_email: this.extractedData.customer_email,
      customer_phone: this.extractedData.customer_phone,
      pickup_location: this.extractedData.pickup_location,
      dropoff_location: this.extractedData.dropoff_location,
      booking_date: this.extractedData.booking_date,
      booking_time: this.extractedData.booking_time,
      service_type: this.extractedData.service_type,
      vehicle_preference: this.extractedData.vehicle_preference,
      passenger_count: this.extractedData.passenger_count,
      special_requirements: this.extractedData.special_requirements,
      extracted_data: this.extractedData,
      status: 'pending',
    };

    const { error } = await supabase.from('ai_bookings').insert(newBooking);

    if (error) {
      console.error('❌ Error inserting booking into Supabase:', error);
    } else {
      console.log('✅ Booking successfully saved to Supabase.');
    }
  }

  private extractBookingData(message: string): void {
    const lower = message.toLowerCase();

    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) this.extractedData.customer_email = emailMatch[0];

    const phoneMatch = message.match(/(\+44|0)\s?(\d{4})\s?(\d{3})\s?(\d{3})/);
    if (phoneMatch) this.extractedData.customer_phone = phoneMatch[0];

    if (lower.includes('my name is') || lower.includes("i'm ") || lower.includes('i am ')) {
      const nameMatch = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) this.extractedData.customer_name = nameMatch[1].trim();
    }

    if (lower.includes('from ') && lower.includes(' to ')) {
      const locMatch = message.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
      if (locMatch) {
        this.extractedData.pickup_location = locMatch[1].trim();
        this.extractedData.dropoff_location = locMatch[2].trim();
      }
    }

    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(tomorrow|today|next week|next month)/i,
    ];
    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        this.extractedData.booking_date = match[0];
        break;
      }
    }

    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) this.extractedData.booking_time = timeMatch[0];

    const paxMatch = message.match(/(\d+)\s+(passenger|people|person)/i);
    if (paxMatch) this.extractedData.passenger_count = parseInt(paxMatch[1]);
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  getExtractedData(): BookingData {
    return this.extractedData;
  }

  resetConversation(): void {
    this.conversationHistory = [];
    this.extractedData = {};
  }
}
