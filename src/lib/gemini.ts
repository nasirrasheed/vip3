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
  private hasGreeted: boolean = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Smart data extraction that captures everything at once
  private extractAllData(message: string): void {
    const text = message.toLowerCase();

    // Extract name (various patterns)
    if (!this.extractedData.customer_name) {
      const namePatterns = [
        /(?:i'm|i am|my name is|name's|this is|call me)\s+([a-zA-Z\s]{2,30})/i,
        /^hi,?\s*(?:i'm\s+)?([a-zA-Z\s]{2,30})(?:[,.]|$)/i,
        /^([a-zA-Z\s]{2,30})(?:\s*[,.]?\s*(?:[a-zA-Z0-9._%+-]+@|\+?\d))/
      ];

      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match) {
          const name = match[1].trim();
          if (name.length > 1 && !name.includes('@') && !text.includes('don\'t') && !text.includes('no ')) {
            this.extractedData.customer_name = name;
            break;
          }
        }
      }
    }

    // Extract email
    if (!this.extractedData.customer_email) {
      const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        this.extractedData.customer_email = emailMatch[0];
      }
    }

    // Extract phone
    if (!this.extractedData.customer_phone) {
      const phoneMatch = message.match(/(?:\+44|0)[\s-]?\d{3,4}[\s-]?\d{3}[\s-]?\d{3,4}|\b\d{10,11}\b/);
      if (phoneMatch) {
        this.extractedData.customer_phone = phoneMatch[0];
      }
    }

    // Extract service type intelligently
    if (!this.extractedData.service_type) {
      const serviceKeywords = {
        'airport': 'Airport Transfers',
        'wedding': 'Wedding Transport', 
        'corporate': 'Corporate Transport',
        'business': 'Corporate Transport',
        'chauffeur': 'Chauffeur Service',
        'event': 'Event Transport',
        'security': 'Security Services'
      };

      for (const [keyword, service] of Object.entries(serviceKeywords)) {
        if (text.includes(keyword)) {
          this.extractedData.service_type = service;
          break;
        }
      }
    }

    // Extract locations (pickup and destination)
    if (!this.extractedData.pickup_location || !this.extractedData.dropoff_location) {
      const locationPatterns = [
        /from\s+([^to]+?)\s+to\s+(.+?)(?:\s+on|\s+at|\s*$)/i,
        /pickup\s+from\s+([^,]+?)(?:\s+to|\s+and|\s*$)/i,
        /to\s+([^,]+?)(?:\s+from|\s*$)/i
      ];

      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match) {
          if (pattern.source.includes('from') && pattern.source.includes('to')) {
            if (!this.extractedData.pickup_location) this.extractedData.pickup_location = match[1].trim();
            if (!this.extractedData.dropoff_location) this.extractedData.dropoff_location = match[2].trim();
          } else if (pattern.source.includes('pickup') && !this.extractedData.pickup_location) {
            this.extractedData.pickup_location = match[1].trim();
          } else if (pattern.source.includes('to') && !this.extractedData.dropoff_location) {
            this.extractedData.dropoff_location = match[1].trim();
          }
        }
      }
    }

    // Extract date
    if (!this.extractedData.booking_date) {
      const datePatterns = [
        /\b(today|tomorrow|next\s+\w+day)\b/i,
        /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
        /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}\b/i
      ];

      for (const pattern of datePatterns) {
        const match = message.match(pattern);
        if (match) {
          this.extractedData.booking_date = match[0];
          break;
        }
      }
    }

    // Extract time
    if (!this.extractedData.booking_time) {
      const timeMatch = message.match(/\b\d{1,2}:?\d{0,2}\s*(?:am|pm|AM|PM)\b|\b\d{1,2}:\d{2}\b/);
      if (timeMatch) {
        this.extractedData.booking_time = timeMatch[0];
      }
    }

    // Extract passenger count
    if (!this.extractedData.passenger_count) {
      const passengerMatch = message.match(/\b(\d+)\s*(?:passenger|people|person)/i);
      if (passengerMatch) {
        this.extractedData.passenger_count = parseInt(passengerMatch[1]);
      } else if (text.includes('just me') || text.includes('myself')) {
        this.extractedData.passenger_count = 1;
      }
    }
  }

  // Determine what we still need
  private getMissingInfo(): string[] {
    const missing = [];
    if (!this.extractedData.customer_name) missing.push('name');
    if (!this.extractedData.customer_email) missing.push('email');
    if (!this.extractedData.customer_phone) missing.push('phone');
    if (!this.extractedData.service_type) missing.push('service');
    if (!this.extractedData.pickup_location) missing.push('pickup');
    if (!this.extractedData.dropoff_location) missing.push('destination');
    if (!this.extractedData.booking_date) missing.push('date');
    if (!this.extractedData.booking_time) missing.push('time');
    if (!this.extractedData.passenger_count) missing.push('passengers');
    return missing;
  }

  // Generate natural, intelligent responses
  private generateResponse(userMessage: string): string {
    const text = userMessage.toLowerCase().trim();
    
    // Handle cancellation (only strong negative intent)
    if (text.match(/\b(cancel|stop|quit|forget it|not interested|leave me alone)\b/) && 
        !text.match(/\b(no special|no requirements|nothing special)\b/)) {
      return "No problem at all! Have a great day.";
    }

    // Extract data first
    this.extractAllData(userMessage);
    const missing = this.getMissingInfo();

    // Initial greeting
    if (!this.hasGreeted) {
      this.hasGreeted = true;
      if (missing.length === 9) { // Nothing extracted yet
        return "Hi! I'm Alex. I help arrange VIP transport. What's your name?";
      } else {
        const name = this.extractedData.customer_name ? ` ${this.extractedData.customer_name.split(' ')[0]}` : '';
        return `Hi${name}! I can see you need transport. Let me get the remaining details.`;
      }
    }

    // Handle optional fields being declined
    if (text.match(/\b(no|none|nothing|skip|leave it|no thanks|nah)\b/) && 
        text.length < 20) {
      if (missing.includes('service') && missing.length === 1) {
        this.extractedData.special_requirements = 'None';
        return "Got it. Let me confirm everything...";
      }
    }

    // If we have everything, confirm
    if (missing.length === 0) {
      return this.getConfirmation();
    }

    // Ask for the next most important missing piece naturally
    return this.askForNextInfo(missing);
  }

  private askForNextInfo(missing: string[]): string {
    const firstName = this.extractedData.customer_name?.split(' ')[0] || '';

    if (missing.includes('name')) {
      return "What's your name?";
    }
    
    if (missing.includes('service')) {
      return "What type of transport do you need? Airport transfer, wedding, corporate, or something else?";
    }
    
    if (missing.includes('pickup')) {
      const service = this.extractedData.service_type;
      if (service?.includes('Airport')) {
        return "Where should we pick you up for your airport transfer?";
      }
      return "Where do you need pickup from?";
    }
    
    if (missing.includes('destination')) {
      return "And where are you going?";
    }
    
    if (missing.includes('date')) {
      return "What date do you need this?";
    }
    
    if (missing.includes('time')) {
      return "What time works for you?";
    }
    
    if (missing.includes('email')) {
      return `Thanks ${firstName}! What's your email address?`;
    }
    
    if (missing.includes('phone')) {
      return "And your phone number?";
    }
    
    if (missing.includes('passengers')) {
      return "How many passengers?";
    }

    // Ask about vehicle preference (optional)
    return "Any vehicle preference, or should I choose the best option for you?";
  }

  private getConfirmation(): string {
    const summary = `Perfect! Here's what I have:

${this.extractedData.customer_name}
${this.extractedData.service_type}
From: ${this.extractedData.pickup_location}
To: ${this.extractedData.dropoff_location}
Date: ${this.extractedData.booking_date}
Time: ${this.extractedData.booking_time}
Passengers: ${this.extractedData.passenger_count}
Email: ${this.extractedData.customer_email}
Phone: ${this.extractedData.customer_phone}

Ready to book this?`;
    
    return summary;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.conversationHistory.push(userChatMessage);

    let response = '';
    let bookingReady = false;

    const text = userMessage.toLowerCase().trim();

    // Handle confirmation
    if (this.getMissingInfo().length === 0 && text.match(/\b(yes|yeah|yep|confirm|book|go ahead|looks good)\b/)) {
      bookingReady = true;
      response = "Booking confirmed! You'll hear from us within 30 minutes.";
    } else {
      response = this.generateResponse(userMessage);
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    this.conversationHistory.push(assistantMessage);

    await this.saveConversation();

    return {
      response,
      bookingReady,
      extractedData: this.extractedData
    };
  }

  private async saveConversation() {
    try {
      const conversationData = {
        session_id: this.sessionId,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        status: 'active'
      };

      await supabase
        .from('chat_conversations')
        .upsert(conversationData, { onConflict: 'session_id' });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async submitBooking(): Promise<any> {
    try {
      const bookingData = {
        conversation_id: this.sessionId,
        customer_name: this.extractedData.customer_name,
        customer_email: this.extractedData.customer_email,
        customer_phone: this.extractedData.customer_phone,
        pickup_location: this.extractedData.pickup_location,
        dropoff_location: this.extractedData.dropoff_location,
        booking_date: this.extractedData.booking_date,
        booking_time: this.extractedData.booking_time,
        service_type: this.extractedData.service_type,
        passenger_count: this.extractedData.passenger_count || 1,
        special_requirements: this.extractedData.special_requirements || 'None',
        vehicle_preference: this.extractedData.vehicle_preference || 'Best available',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('ai_bookings')
        .insert([bookingData])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Error submitting booking:', error);
      throw error;
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
    this.hasGreeted = false;
  }
}
