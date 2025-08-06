import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB66RXtmuEvvh42ZGPLxk57nZ8JRht14QE');

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
    console.log('VIP Booking Assistant initialized with session:', sessionId);
  }

  private getSystemPrompt(): string {
    return `You are a professional VIP transport booking assistant for VIP Transport and Security, a luxury chauffeur service in the UK.

Your role is to help customers book premium transport services including:
- Chauffeur Service
- Airport Transfers  
- Wedding Transport
- Corporate Transport
- Security Services
- Event Transport

IMPORTANT INSTRUCTIONS:
1. Be professional, courteous, and maintain VIP-level service standards
2. Ask for booking details naturally in conversation
3. Extract: name, email, phone, pickup location, dropoff location, date, time, service type, vehicle preference, passenger count, special requirements
4. When you have enough information for a booking, say "BOOKING_READY_FOR_SUBMISSION" at the end of your response
5. Always confirm details before submitting

Current extracted data: ${JSON.stringify(this.extractedData)}

Respond professionally and help complete their booking.`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    console.log('Processing message:', userMessage);
    this.conversationHistory.push({ role: 'user', content: userMessage, timestamp: new Date() });
    this.extractBookingData(userMessage);
    console.log('Extracted data so far:', this.extractedData);

    const prompt = `${this.getSystemPrompt()}

Conversation History:
${this.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User just said: "${userMessage}"

Please respond professionally and help with their VIP transport booking.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      console.log('AI Response:', response);

      this.conversationHistory.push({ role: 'assistant', content: response, timestamp: new Date() });

      const bookingReady = response.includes('BOOKING_READY_FOR_SUBMISSION');
      console.log('Booking ready:', bookingReady);

      if (bookingReady) {
        console.log('Attempting to save booking...');
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
    try {
      console.log('Saving booking to Supabase...', this.extractedData);
      
      const bookingData = {
        conversation_id: this.sessionId,
        customer_name: this.extractedData.customer_name || null,
        customer_email: this.extractedData.customer_email || null,
        customer_phone: this.extractedData.customer_phone || null,
        pickup_location: this.extractedData.pickup_location || null,
        dropoff_location: this.extractedData.dropoff_location || null,
        booking_date: this.extractedData.booking_date || null,
        booking_time: this.extractedData.booking_time || null,
        service_type: this.extractedData.service_type || null,
        vehicle_preference: this.extractedData.vehicle_preference || null,
        passenger_count: this.extractedData.passenger_count || 1,
        special_requirements: this.extractedData.special_requirements || null,
        extracted_data: this.extractedData,
        status: 'pending'
      };

      console.log('Booking data to insert:', bookingData);

      const { data, error } = await supabase
        .from('ai_bookings')
        .insert([bookingData])
        .select();

      if (error) {
        console.error('Supabase error saving booking:', error);
        throw error;
      }

      console.log('Booking saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
      throw error;
    }
  }

  private async saveConversation() {
    try {
      console.log('Saving conversation to Supabase...');
      
      const conversationData = {
        session_id: this.sessionId,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        status: 'completed'
      };

      const { data, error } = await supabase
        .from('chat_conversations')
        .upsert(conversationData, { 
          onConflict: 'session_id' 
        })
        .select();

      if (error) {
        console.error('Supabase error saving conversation:', error);
        throw error;
      }

      console.log('Conversation saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving conversation to Supabase:', error);
      throw error;
    }
  }

  private extractBookingData(message: string): void {
    console.log('Extracting booking data from:', message);
    const lower = message.toLowerCase();
    
    // Extract email
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      this.extractedData.customer_email = emailMatch[0];
      console.log('Extracted email:', emailMatch[0]);
    }
    
    // Extract phone (UK format)
    const phoneMatch = message.match(/(\+44|0)\s?(\d{4})\s?(\d{3})\s?(\d{3})|(\d{5})\s?(\d{6})/);
    if (phoneMatch) {
      this.extractedData.customer_phone = phoneMatch[0];
      console.log('Extracted phone:', phoneMatch[0]);
    }
    
    // Extract name
    if (lower.includes('my name is') || lower.includes("i'm ") || lower.includes('i am ')) {
      const nameMatch = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        this.extractedData.customer_name = nameMatch[1].trim();
        console.log('Extracted name:', nameMatch[1].trim());
      }
    }
    
    // Extract locations
    if (lower.includes('from ') && lower.includes(' to ')) {
      const locMatch = message.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
      if (locMatch) {
        this.extractedData.pickup_location = locMatch[1].trim();
        this.extractedData.dropoff_location = locMatch[2].trim();
        console.log('Extracted locations:', locMatch[1].trim(), 'to', locMatch[2].trim());
      }
    }
    
    // Extract date
    const dateMatch = message.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) {
      this.extractedData.booking_date = dateMatch[0];
      console.log('Extracted date:', dateMatch[0]);
    }
    
    // Extract time
    const timeMatch = message.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
    if (timeMatch) {
      this.extractedData.booking_time = timeMatch[0];
      console.log('Extracted time:', timeMatch[0]);
    }
    
    // Extract passenger count
    const paxMatch = message.match(/(\d+)\s+(passenger|people|person)/i);
    if (paxMatch) {
      this.extractedData.passenger_count = parseInt(paxMatch[1]);
      console.log('Extracted passenger count:', parseInt(paxMatch[1]));
    }
    
    console.log('Current extracted data:', this.extractedData);
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
