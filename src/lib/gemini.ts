import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

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
  private sessionId: string = crypto.randomUUID(); // generate a unique session id

  constructor() {
    this.model = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY).getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  private getSystemPrompt(): string {
    return `You are a professional VIP transport booking assistant for VIP Transport and Security. Your role is to help customers book luxury chauffeur services.

SERVICES:
- Chauffeur Service
- Airport Transfers
- Wedding Transport
- Corporate Transport
- Security Services
- Event Transport

BOOKING FIELDS TO COLLECT:
1. Customer name
2. Contact details
3. Pickup & Drop-off location
4. Date & time
5. Service type
6. Vehicle preference
7. Passenger count
8. Special requirements

Respond clearly and professionally. Once all necessary data is collected, reply with "BOOKING_READY_FOR_SUBMISSION".

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

Please respond to the latest user message professionally. Include "BOOKING_READY_FOR_SUBMISSION" if ready to submit.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      const bookingReady = response.includes('BOOKING_READY_FOR_SUBMISSION');

      // ✅ Save to Supabase when booking is ready
      if (bookingReady) {
        const { error: bookingError, data: bookingData } = await supabase
          .from('ai_bookings')
          .insert({
            conversation_id: this.sessionId,
            ...this.extractedData,
            extracted_data: this.extractedData
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Supabase insert error (ai_bookings):', bookingError);
        } else {
          // Optional: link booking back to inquiries table
          await supabase
            .from('inquiries')
            .update({ booking_id: bookingData.id })
            .eq('session_id', this.sessionId);
        }
      }

      return {
        response: response.replace('BOOKING_READY_FOR_SUBMISSION', '').trim(),
        bookingReady,
        extractedData: this.extractedData
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        response: "I’m experiencing technical difficulties. Please try again later or call us directly.",
        bookingReady: false,
        extractedData: this.extractedData
      };
    }
  }

  private extractBookingData(message: string): void {
    const lower = message.toLowerCase();

    // Extract email
    const email = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (email) this.extractedData.customer_email = email[0];

    // Phone
    const phone = message.match(/(\+44|0)\s?\d{4}\s?\d{3}\s?\d{3}/);
    if (phone) this.extractedData.customer_phone = phone[0];

    // Name
    if (lower.includes('my name is') || lower.includes("i'm") || lower.includes("i am")) {
      const name = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i);
      if (name) this.extractedData.customer_name = name[1].trim();
    }

    // Locations
    if (lower.includes('from') && lower.includes('to')) {
      const loc = message.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
      if (loc) {
        this.extractedData.pickup_location = loc[1].trim();
        this.extractedData.dropoff_location = loc[2].trim();
      }
    }

    // Date
    const date = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (date) this.extractedData.booking_date = date[0];

    // Time
    const time = message.match(/(\d{1,2}):(\d{2})\s?(am|pm)?/i);
    if (time) this.extractedData.booking_time = time[0];

    // Passengers
    const passengers = message.match(/(\d+)\s+(passenger|people|person)/i);
    if (passengers) this.extractedData.passenger_count = parseInt(passengers[1]);

    // Service type
    const services = ['chauffeur', 'airport', 'wedding', 'corporate', 'security', 'event'];
    for (const s of services) {
      if (lower.includes(s)) {
        this.extractedData.service_type = s;
        break;
      }
    }
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
    this.sessionId = crypto.randomUUID(); // Reset session
  }
}
