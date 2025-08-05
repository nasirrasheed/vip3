// Based on all the code you've provided, here's a comprehensive check and fix pass across your system
// to ensure AI bookings are saved and shown in the admin panel.

// --- FILE: lib/gemini.ts ---
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

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
    return `You are a professional VIP transport booking assistant for VIP Transport and Security...`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    this.conversationHistory.push({ role: 'user', content: userMessage, timestamp: new Date() });
    this.extractBookingData(userMessage);

    const prompt = `${this.getSystemPrompt()}

CONVERSATION HISTORY:
${this.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please respond...`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      this.conversationHistory.push({ role: 'assistant', content: response, timestamp: new Date() });

      const bookingReady = response.includes('BOOKING_READY_FOR_SUBMISSION');

      if (bookingReady) {
        await this.saveBookingToSupabase();
        await this.saveConversation();
      }

      return {
        response: response.replace('BOOKING_READY_FOR_SUBMISSION', '').trim(),
        bookingReady,
        extractedData: this.extractedData
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        response: "I'm having technical difficulties. Please try again.",
        bookingReady: false,
        extractedData: this.extractedData
      };
    }
  }

  private async saveBookingToSupabase() {
   const { error } = await supabase.from('ai_bookings').insert({
  conversation_id: this.sessionId,
  customer_name: this.extractedData.customer_name,
  pickup_location: this.extractedData.pickup_location,
  dropoff_location: this.extractedData.dropoff_location,
  booking_date: this.extractedData.booking_date,
  booking_time: this.extractedData.booking_time,
  number_of_passengers: this.extractedData.passenger_count, // renamed
  vehicle_type: this.extractedData.vehicle_preference,      // renamed
  notes: this.extractedData.special_requirements,           // renamed
  extracted_data: this.extractedData,
  status: 'pending',
});


  private async saveConversation() {
   const { error } = await supabase.from('chat_conversations').upsert({
  session_id: this.sessionId,
  messages: this.conversationHistory,
  booking_id: bookingInsertResult.data?.[0]?.id ?? null,
  status: 'completed',
  updated_at: new Date().toISOString(),
}, {
  onConflict: 'session_id',
});

if (error) {
  console.error('Error saving conversation:', error);
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
    const dateMatch = message.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) this.extractedData.booking_date = dateMatch[0];
    const timeMatch = message.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
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
