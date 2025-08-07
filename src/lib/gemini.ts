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
  private currentStep: string = 'greeting';
  private stepOrder = [
    'greeting',
    'name',
    'email', 
    'phone',
    'service_type',
    'pickup_location',
    'dropoff_location',
    'booking_date',
    'booking_time',
    'passenger_count',
    'vehicle_preference',
    'special_requirements',
    'confirmation',
    'submission'
  ];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('VIP Booking Assistant initialized with session:', sessionId);
  }

  private getNextStep(): string {
    const currentIndex = this.stepOrder.indexOf(this.currentStep);
    if (currentIndex < this.stepOrder.length - 1) {
      return this.stepOrder[currentIndex + 1];
    }
    return 'completed';
  }

  private getStepQuestion(step: string): string {
    const questions = {
      greeting: "Good day! I'm Alex, your VIP transport specialist. I'm here to help you arrange your luxury transport needs. May I start by getting your full name?",
      name: "Thank you! Could you please provide your full name for the booking?",
      email: "Perfect! Now, may I have your email address so we can send you the booking confirmation?",
      phone: "Excellent! Could you please share your phone number? This helps us coordinate your journey and provide updates.",
      service_type: "Wonderful! Now, which of our premium services would you like to book today?\n\n• Chauffeur Service - Professional chauffeur-driven transport\n• Airport Transfers - Reliable transfers with flight monitoring\n• Wedding Transport - Elegant transport for your special day\n• Corporate Transport - Executive business travel\n• Event Transport - Specialized transport for premieres and galas\n• Security Services - Professional close protection services\n\nWhich service interests you?",
      pickup_location: "Excellent choice! Where would you like us to pick you up? Please provide the full address or location name.",
      dropoff_location: "Perfect! And where would you like us to take you? Please provide the destination address or location name.",
      booking_date: "Thank you! What date would you prefer for your journey? Please provide the date in DD/MM/YYYY format (e.g., 25/12/2024).",
      booking_time: "Excellent! What time would you like us to arrive for pickup? Please specify the time (e.g., 2:30 PM or 14:30).",
      passenger_count: "Perfect! How many passengers will be traveling with us today?",
      vehicle_preference: "Wonderful! Do you have any specific vehicle preferences? We offer:\n\n• Executive Sedan - Professional and comfortable\n• Luxury SUV - Spacious and prestigious\n• Premium MPV - Perfect for groups\n• Rolls Royce - Ultimate luxury experience\n• Bentley - Sophisticated elegance\n\nOr simply let me know if you have no specific preference.",
      special_requirements: "Excellent! Do you have any special requirements for your journey? This could include:\n\n• Child seats\n• Wheelchair accessibility\n• Refreshments\n• Specific route preferences\n• Additional stops\n• Privacy requirements\n\nOr simply say 'none' if you don't have any special needs.",
      confirmation: "Perfect! Let me confirm all your booking details:\n\n{booking_summary}\n\nIs all this information correct? Please reply 'yes' to confirm or let me know what needs to be changed.",
      submission: "Thank you for choosing VIP Transport and Security! Your booking has been submitted successfully. Our team will review your request and contact you within 30 minutes to confirm all arrangements.\n\nYour booking reference: {booking_id}\n\nIs there anything else I can help you with today?"
    };
    
    return questions[step] || "I'm here to help you with your VIP transport needs. How may I assist you?";
  }

  private extractDataFromResponse(userMessage: string, step: string): void {
    const message = userMessage.trim();
    
    switch (step) {
      case 'name':
        if (message.length > 1) {
          this.extractedData.customer_name = message;
        }
        break;
        
      case 'email':
        const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          this.extractedData.customer_email = emailMatch[0];
        }
        break;
        
      case 'phone':
        const phoneMatch = message.match(/(\+44|0)[\s-]?(\d{4})[\s-]?(\d{3})[\s-]?(\d{3})|(\d{5})[\s-]?(\d{6})/);
        if (phoneMatch) {
          this.extractedData.customer_phone = phoneMatch[0];
        } else if (message.match(/\d{10,}/)) {
          this.extractedData.customer_phone = message;
        }
        break;
        
      case 'service_type':
        const services = {
          'chauffeur': 'Chauffeur Service',
          'airport': 'Airport Transfers',
          'wedding': 'Wedding Transport',
          'corporate': 'Corporate Transport',
          'event': 'Event Transport',
          'security': 'Security Services'
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [key, value] of Object.entries(services)) {
          if (lowerMessage.includes(key)) {
            this.extractedData.service_type = value;
            break;
          }
        }
        break;
        
      case 'pickup_location':
        if (message.length > 3) {
          this.extractedData.pickup_location = message;
        }
        break;
        
      case 'dropoff_location':
        if (message.length > 3) {
          this.extractedData.dropoff_location = message;
        }
        break;
        
      case 'booking_date':
        const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          this.extractedData.booking_date = message;
        }
        break;
        
      case 'booking_time':
        const timeMatch = message.match(/\d{1,2}[:\.]?\d{0,2}\s?(am|pm|AM|PM)?/);
        if (timeMatch) {
          this.extractedData.booking_time = message;
        }
        break;
        
      case 'passenger_count':
        const countMatch = message.match(/\d+/);
        if (countMatch) {
          this.extractedData.passenger_count = parseInt(countMatch[0]);
        }
        break;
        
      case 'vehicle_preference':
        if (message.toLowerCase().includes('no preference') || message.toLowerCase().includes('none')) {
          this.extractedData.vehicle_preference = 'No specific preference';
        } else {
          this.extractedData.vehicle_preference = message;
        }
        break;
        
      case 'special_requirements':
        if (message.toLowerCase().includes('none') || message.toLowerCase().includes('no')) {
          this.extractedData.special_requirements = 'None';
        } else {
          this.extractedData.special_requirements = message;
        }
        break;
    }
  }

  private isStepComplete(step: string): boolean {
    switch (step) {
      case 'name': return !!this.extractedData.customer_name;
      case 'email': return !!this.extractedData.customer_email;
      case 'phone': return !!this.extractedData.customer_phone;
      case 'service_type': return !!this.extractedData.service_type;
      case 'pickup_location': return !!this.extractedData.pickup_location;
      case 'dropoff_location': return !!this.extractedData.dropoff_location;
      case 'booking_date': return !!this.extractedData.booking_date;
      case 'booking_time': return !!this.extractedData.booking_time;
      case 'passenger_count': return !!this.extractedData.passenger_count;
      case 'vehicle_preference': return !!this.extractedData.vehicle_preference;
      case 'special_requirements': return !!this.extractedData.special_requirements;
      default: return true;
    }
  }

  private getBookingSummary(): string {
    return `📋 **Booking Summary**
    
👤 **Name:** ${this.extractedData.customer_name}
📧 **Email:** ${this.extractedData.customer_email}
📱 **Phone:** ${this.extractedData.customer_phone}
🚗 **Service:** ${this.extractedData.service_type}
📍 **Pickup:** ${this.extractedData.pickup_location}
🎯 **Destination:** ${this.extractedData.dropoff_location}
📅 **Date:** ${this.extractedData.booking_date}
⏰ **Time:** ${this.extractedData.booking_time}
👥 **Passengers:** ${this.extractedData.passenger_count}
🚙 **Vehicle:** ${this.extractedData.vehicle_preference}
📝 **Requirements:** ${this.extractedData.special_requirements}`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    console.log('Processing message:', userMessage, 'Current step:', this.currentStep);
    
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.conversationHistory.push(userChatMessage);

    // Extract data from user response
    if (this.currentStep !== 'greeting') {
      this.extractDataFromResponse(userMessage, this.currentStep);
    }

    let response = '';
    let bookingReady = false;

    // Handle confirmation step
    if (this.currentStep === 'confirmation') {
      if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('correct')) {
        this.currentStep = 'submission';
        bookingReady = true;
        response = "Perfect! I'm submitting your booking now. Please wait a moment...";
      } else {
        response = "I understand you'd like to make some changes. Could you please tell me what needs to be updated?";
        // Reset to appropriate step based on what they want to change
        this.currentStep = 'name';
      }
    } else if (this.currentStep === 'submission') {
      response = "Your booking has been submitted successfully! Our team will contact you shortly. Is there anything else I can help you with?";
    } else {
      // Check if current step is complete and move to next
      if (this.isStepComplete(this.currentStep)) {
        this.currentStep = this.getNextStep();
      }

      // Generate appropriate response
      if (this.currentStep === 'confirmation') {
        response = this.getStepQuestion(this.currentStep).replace('{booking_summary}', this.getBookingSummary());
      } else {
        response = this.getStepQuestion(this.currentStep);
      }
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    this.conversationHistory.push(assistantMessage);

    // Save conversation
    await this.saveConversation();

    console.log('Current extracted data:', this.extractedData);
    console.log('Booking ready:', bookingReady);

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
        status: this.currentStep === 'submission' ? 'completed' : 'active'
      };

      const { error } = await supabase
        .from('chat_conversations')
        .upsert(conversationData, { 
          onConflict: 'session_id' 
        });

      if (error) {
        console.error('Error saving conversation:', error);
      } else {
        console.log('Conversation saved successfully');
      }
    } catch (error) {
      console.error('Error in saveConversation:', error);
    }
  }

  async submitBooking(): Promise<any> {
    try {
      console.log('Submitting booking with data:', this.extractedData);
      
      // Format date and time properly
      let formattedDate = null;
      let formattedTime = null;
      
      if (this.extractedData.booking_date) {
        const dateMatch = this.extractedData.booking_date.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const fullYear = year.length === 2 ? `20${year}` : year;
          formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      if (this.extractedData.booking_time) {
        const timeStr = this.extractedData.booking_time.toLowerCase();
        if (timeStr.includes('pm') || timeStr.includes('am')) {
          const timeMatch = timeStr.match(/(\d{1,2})[:\.]?(\d{0,2})\s?(am|pm)/);
          if (timeMatch) {
            let [, hours, minutes = '00', period] = timeMatch;
            hours = parseInt(hours);
            if (period === 'pm' && hours !== 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
          }
        } else {
          const timeMatch = timeStr.match(/(\d{1,2})[:\.](\d{2})/);
          if (timeMatch) {
            formattedTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00`;
          }
        }
      }

      const bookingData = {
        conversation_id: this.sessionId,
        customer_name: this.extractedData.customer_name || null,
        customer_email: this.extractedData.customer_email || null,
        customer_phone: this.extractedData.customer_phone || null,
        pickup_location: this.extractedData.pickup_location || null,
        dropoff_location: this.extractedData.dropoff_location || null,
        booking_date: formattedDate,
        booking_time: formattedTime,
        service_type: this.extractedData.service_type || null,
        vehicle_preference: this.extractedData.vehicle_preference || null,
        passenger_count: this.extractedData.passenger_count || 1,
        special_requirements: this.extractedData.special_requirements || null,
        extracted_data: this.extractedData,
        status: 'pending'
      };

      console.log('Formatted booking data:', bookingData);

      const { data, error } = await supabase
        .from('ai_bookings')
        .insert([bookingData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Booking saved successfully:', data);

      // Update conversation with booking ID
      if (data && data[0]) {
        await supabase
          .from('chat_conversations')
          .update({ 
            booking_id: data[0].id,
            status: 'completed'
          })
          .eq('session_id', this.sessionId);
      }

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
    this.currentStep = 'greeting';
  }
}