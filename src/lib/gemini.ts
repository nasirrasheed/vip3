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
  private userInterestLevel: 'high' | 'medium' | 'low' | 'disinterested' = 'medium';
  private conversationContext: string = '';

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

  private services = [
    {
      name: 'Chauffeur Service',
      description: 'Professional chauffeur-driven transport for all occasions',
      vehicles: ['Executive Sedan', 'Luxury SUV', 'Premium MPV']
    },
    {
      name: 'Airport Transfers',
      description: 'Reliable transfers with flight monitoring and meet & greet',
      vehicles: ['Executive Sedan', 'Luxury SUV', 'Premium MPV']
    },
    {
      name: 'Wedding Transport',
      description: 'Elegant transport for your special day',
      vehicles: ['Rolls Royce', 'Bentley', 'Luxury Sedan']
    },
    {
      name: 'Corporate Transport',
      description: 'Executive business travel solutions',
      vehicles: ['Executive Sedan', 'Luxury SUV', 'Premium MPV']
    },
    {
      name: 'Event Transport',
      description: 'Specialized transport for premieres and galas',
      vehicles: ['Rolls Royce', 'Bentley', 'Luxury SUV']
    },
    {
      name: 'Security Services',
      description: 'Professional close protection with SIA-licensed operatives',
      vehicles: ['Armored Vehicle', 'Executive SUV', 'Security Escort']
    }
  ];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('VIP Booking Assistant initialized with session:', sessionId);
  }

  private analyzeUserInterest(userMessage: string): void {
    const message = userMessage.toLowerCase();
    
    // Disinterest indicators
    const disinterestKeywords = [
      'not interested', 'no thanks', 'not now', 'maybe later', 'cancel',
      'stop', 'don\'t want', 'not looking', 'just browsing', 'just checking',
      'too expensive', 'can\'t afford', 'not ready', 'think about it'
    ];

    // High interest indicators
    const highInterestKeywords = [
      'yes', 'definitely', 'absolutely', 'perfect', 'great', 'excellent',
      'book now', 'let\'s do it', 'sounds good', 'i need', 'urgent'
    ];

    // Medium interest indicators
    const mediumInterestKeywords = [
      'maybe', 'possibly', 'considering', 'looking into', 'exploring',
      'what are the options', 'tell me more', 'how much', 'available'
    ];

    if (disinterestKeywords.some(keyword => message.includes(keyword))) {
      this.userInterestLevel = 'disinterested';
    } else if (highInterestKeywords.some(keyword => message.includes(keyword))) {
      this.userInterestLevel = 'high';
    } else if (mediumInterestKeywords.some(keyword => message.includes(keyword))) {
      this.userInterestLevel = 'medium';
    }
  }

  private getNextStep(): string {
    const currentIndex = this.stepOrder.indexOf(this.currentStep);
    if (currentIndex < this.stepOrder.length - 1) {
      return this.stepOrder[currentIndex + 1];
    }
    return 'completed';
  }

  private getConversationalResponse(step: string, userMessage?: string): string {
    // Handle disinterested users immediately
    if (this.userInterestLevel === 'disinterested') {
      return "That's perfectly fine! No worries at all. If you change your mind in the future, I'll be here to help. Have a wonderful day! 😊\n\nFeel free to reach out anytime if you need our VIP transport services.";
    }

    const responses = {
      greeting: "Good day! I'm Alex, your VIP transport specialist. I'm here to help you arrange luxury transport that matches your expectations. \n\nWhether you need airport transfers, wedding transport, corporate travel, or our exclusive security services - I'm here to make it seamless for you.\n\nMay I start by getting your name?",
      
      name: this.getNameResponse(userMessage),
      
      email: `Thank you${this.extractedData.customer_name ? ', ' + this.extractedData.customer_name.split(' ')[0] : ''}! To ensure we can send you confirmation details and stay in touch about your booking, could you share your email address with me?`,
      
      phone: "Perfect! Now, may I have your phone number? This helps us coordinate your journey perfectly and provide you with real-time updates about your chauffeur's arrival.",
      
      service_type: this.getServiceTypeResponse(),
      
      pickup_location: this.getPickupLocationResponse(),
      
      dropoff_location: "Excellent! And where would you like us to take you? Please share your destination address or location name.",
      
      booking_date: "Perfect! When would you like to travel? Please let me know your preferred date (for example: 25th December 2024 or 25/12/2024).",
      
      booking_time: "Great! What time would you prefer? Please let me know your preferred pickup time (for example: 2:30 PM or 14:30).",
      
      passenger_count: "Wonderful! How many passengers will be traveling? This helps me suggest the most suitable vehicle for your comfort.",
      
      vehicle_preference: this.getVehiclePreferenceResponse(),
      
      special_requirements: "Excellent choice! Do you have any special requirements for your journey? \n\nFor example:\n• Child seats or accessibility needs\n• Refreshments or specific amenities\n• Multiple stops or route preferences\n• Privacy requirements\n• Specific arrival protocols\n\nOr simply let me know if you don't have any special needs.",
      
      confirmation: this.getConfirmationResponse(),
      
      submission: "Wonderful! Your booking request has been submitted successfully and is now with our operations team. 🎉\n\nHere's what happens next:\n• Our team will review your request within 30 minutes\n• You'll receive a confirmation call or email\n• We'll coordinate all journey details with you\n\n📞 **For immediate assistance:** 07464 247 007\n📧 **Email:** bookings@viptransportandsecurity.co.uk\n\nThank you for choosing VIP Transport and Security! Is there anything else I can help you with today?"
    };
    
    return responses[step] || "I'm here to help you with your VIP transport needs. How may I assist you?";
  }

  private getNameResponse(userMessage?: string): string {
    if (userMessage && this.extractedData.customer_name) {
      const firstName = this.extractedData.customer_name.split(' ')[0];
      return `Lovely to meet you, ${firstName}! I'm delighted to help you arrange your transport today.`;
    }
    return "I'd love to know your name so I can provide you with personalized service.";
  }

  private getServiceTypeResponse(): string {
    return `Wonderful! We offer several premium services. Which one interests you today?\n\n🚗 **Chauffeur Service** - Professional transport for any occasion\n✈️ **Airport Transfers** - Reliable transfers with flight monitoring\n💒 **Wedding Transport** - Elegant vehicles for your special day\n💼 **Corporate Transport** - Executive business travel\n🎭 **Event Transport** - Red carpet service for premieres & galas\n🛡️ **Security Services** - Close protection with SIA-licensed operatives\n\nWhich service would work best for you?`;
  }

  private getPickupLocationResponse(): string {
    const serviceType = this.extractedData.service_type;
    if (serviceType?.includes('Airport')) {
      return "Perfect choice! Are you traveling from your home, hotel, or office to the airport? Please share your pickup address.";
    } else if (serviceType?.includes('Wedding')) {
      return "How exciting! Where shall we collect you for your special day? This could be your home, hotel, or getting-ready venue.";
    } else if (serviceType?.includes('Corporate')) {
      return "Excellent! Where would you like us to pick you up? Your office, hotel, or another location?";
    }
    return "Excellent choice! Where would you like us to collect you? Please provide your pickup address or location name.";
  }

  private getVehiclePreferenceResponse(): string {
    const serviceType = this.extractedData.service_type;
    const passengerCount = this.extractedData.passenger_count || 1;
    
    let suggestions = [];
    
    if (serviceType?.includes('Wedding')) {
      suggestions = ['Rolls Royce - Ultimate luxury for your special day', 'Bentley - Sophisticated elegance', 'Luxury Sedan - Classic and refined'];
    } else if (serviceType?.includes('Corporate')) {
      suggestions = ['Executive Sedan - Professional and discreet', 'Luxury SUV - Spacious and prestigious', 'Premium MPV - Perfect for teams'];
    } else if (serviceType?.includes('Security')) {
      suggestions = ['Armored Vehicle - Maximum protection', 'Executive SUV - Secure and comfortable', 'Security Escort - Multi-vehicle protection'];
    } else {
      if (passengerCount <= 3) {
        suggestions = ['Executive Sedan - Comfortable and professional', 'Luxury SUV - Spacious and prestigious'];
      } else {
        suggestions = ['Luxury SUV - Spacious for your group', 'Premium MPV - Perfect for larger parties'];
      }
    }

    return `Based on your ${serviceType?.toLowerCase() || 'transport needs'} and ${passengerCount} passenger${passengerCount > 1 ? 's' : ''}, here are my recommendations:\n\n${suggestions.map((s, i) => `• ${s}`).join('\n')}\n\nWhich would you prefer, or would you like me to select the most suitable option for you?`;
  }

  private getConfirmationResponse(): string {
    return `Perfect! Let me confirm all your booking details:\n\n${this.getBookingSummary()}\n\nDoes everything look correct? Please reply 'yes' to confirm your booking, or let me know if you'd like to change anything.`;
  }

  private extractDataFromResponse(userMessage: string, step: string): void {
    const message = userMessage.trim();
    
    switch (step) {
      case 'name':
        if (message.length > 1 && !message.toLowerCase().includes('not interested')) {
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
        const lowerMessage = message.toLowerCase();
        const serviceMap = {
          'chauffeur': 'Chauffeur Service',
          'airport': 'Airport Transfers',
          'wedding': 'Wedding Transport',
          'corporate': 'Corporate Transport',
          'event': 'Event Transport',
          'security': 'Security Services'
        };
        
        for (const [key, value] of Object.entries(serviceMap)) {
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
        } else if (message.toLowerCase().includes('today') || message.toLowerCase().includes('tomorrow')) {
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
        } else if (message.toLowerCase().includes('one') || message.toLowerCase().includes('just me')) {
          this.extractedData.passenger_count = 1;
        }
        break;
        
      case 'vehicle_preference':
        if (message.toLowerCase().includes('no preference') || message.toLowerCase().includes('you choose')) {
          this.extractedData.vehicle_preference = 'No specific preference - please select suitable vehicle';
        } else {
          this.extractedData.vehicle_preference = message;
        }
        break;
        
      case 'special_requirements':
        if (message.toLowerCase().includes('none') || message.toLowerCase().includes('no special') || message.toLowerCase().includes('nothing')) {
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
    return `📋 **Your Booking Summary**
    
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
    
    // Analyze user interest level
    this.analyzeUserInterest(userMessage);
    
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.conversationHistory.push(userChatMessage);

    // If user is disinterested, end conversation gracefully
    if (this.userInterestLevel === 'disinterested') {
      const response = this.getConversationalResponse('greeting', userMessage);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.conversationHistory.push(assistantMessage);
      await this.saveConversation();
      
      return {
        response,
        bookingReady: false,
        extractedData: this.extractedData
      };
    }

    // Extract data from user response
    if (this.currentStep !== 'greeting') {
      this.extractDataFromResponse(userMessage, this.currentStep);
    }

    let response = '';
    let bookingReady = false;

    // Handle confirmation step
    if (this.currentStep === 'confirmation') {
      if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('correct') || userMessage.toLowerCase().includes('confirm')) {
        this.currentStep = 'submission';
        bookingReady = true;
        response = "Excellent! I'm processing your booking request now...";
      } else {
        response = "Of course! What would you like to change? I can update any of the details for you.";
        // Reset to appropriate step based on what they want to change
        this.currentStep = 'name';
      }
    } else if (this.currentStep === 'submission') {
      response = this.getConversationalResponse('submission');
    } else {
      // Check if current step is complete and move to next
      if (this.isStepComplete(this.currentStep)) {
        this.currentStep = this.getNextStep();
      }

      // Generate appropriate response
      response = this.getConversationalResponse(this.currentStep, userMessage);
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
        const dateStr = this.extractedData.booking_date.toLowerCase();
        if (dateStr.includes('today')) {
          const today = new Date();
          formattedDate = today.toISOString().split('T')[0];
        } else if (dateStr.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          formattedDate = tomorrow.toISOString().split('T')[0];
        } else {
          const dateMatch = this.extractedData.booking_date.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const fullYear = year.length === 2 ? `20${year}` : year;
            formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
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
    this.userInterestLevel = 'medium';
  }
}