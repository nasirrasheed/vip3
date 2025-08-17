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
  private conversationContext: string = '';
  private hasGreeted: boolean = false;
  private offTopicCount: number = 0;
  private bookingCancelled: boolean = false;

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

  private analyzeUserMessage(userMessage: string): {
    isBookingCancellation: boolean;
    sentiment: 'positive' | 'negative' | 'neutral' | 'confused';
    intent: 'booking' | 'question' | 'smalltalk' | 'complaint' | 'goodbye' | 'cancellation';
    containsData: boolean;
    extractedFields: string[];
  } {
    const message = userMessage.toLowerCase().trim();
    
    // ONLY these phrases should cancel booking - be very specific
    const bookingCancellationKeywords = [
      'cancel booking', 'cancel the booking', 'cancel this booking', 'cancel my booking',
      'stop booking', 'stop the booking', 'don\'t book', 'not interested in booking',
      'cancel this', 'cancel it', 'forget booking', 'forget the booking',
      'i don\'t want to book', 'don\'t want booking', 'no booking',
      'cancel order', 'cancel reservation', 'cancel service',
      'end booking', 'abort booking', 'quit booking'
    ];

    // These are NOT cancellation - just negative responses to specific questions
    const nonCancellationNegatives = [
      'no email', 'don\'t have email', 'no phone', 'don\'t have phone',
      'no special requirements', 'no requirements', 'nothing special',
      'no preference', 'no specific', 'don\'t mind', 'don\'t care',
      'no idea', 'don\'t know', 'not sure', 'maybe later'
    ];

    // Check for actual booking cancellation
    const isBookingCancellation = bookingCancellationKeywords.some(keyword => 
      message.includes(keyword)) && 
      !nonCancellationNegatives.some(phrase => message.includes(phrase));

    // Improved data detection
    const extractedFields = this.detectDataInMessage(message);
    const containsData = extractedFields.length > 0;
    
    // Enhanced sentiment analysis
    let sentiment: 'positive' | 'negative' | 'neutral' | 'confused' = 'neutral';
    let intent: 'booking' | 'question' | 'smalltalk' | 'complaint' | 'goodbye' | 'cancellation' = 'booking';

    if (isBookingCancellation) {
      sentiment = 'negative';
      intent = 'cancellation';
    } else if (message.match(/\b(yes|yeah|yep|sure|okay|ok|alright|definitely|absolutely|perfect|great|excellent|sounds good|let\'s do it)\b/)) {
      sentiment = 'positive';
    } else if (message.match(/\b(what|how|when|where|why|which|who|can you|do you|will you|\?)\b/)) {
      intent = 'question';
    } else if (message.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|how are you|weather|nice day|thank you|thanks)\b/)) {
      intent = 'smalltalk';
      sentiment = 'positive';
    } else if (message.match(/\b(expensive|too much|cheap|disappointed|problem|issue|wrong|bad|terrible|awful|hate)\b/) && !nonCancellationNegatives.some(phrase => message.includes(phrase))) {
      sentiment = 'negative';
      intent = 'complaint';
    }

    // Detect confusion
    if (message.match(/\b(what|huh|confused|don\'t understand|what do you mean|unclear)\b/)) {
      sentiment = 'confused';
    }

    return { 
      isBookingCancellation, 
      sentiment, 
      intent, 
      containsData, 
      extractedFields 
    };
  }

  private detectDataInMessage(message: string): string[] {
    const fields = [];
    
    // Email detection
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message)) {
      fields.push('email');
    }
    
    // Phone detection
    if (/(\+44|0)[\s-]?(\d{4})[\s-]?(\d{3})[\s-]?(\d{3})|(\d{5})[\s-]?(\d{6})|\b\d{10,15}\b/.test(message)) {
      fields.push('phone');
    }
    
    // Date detection
    if (/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})|today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(message)) {
      fields.push('date');
    }
    
    // Time detection
    if (/\d{1,2}[:\.]?\d{0,2}\s?(am|pm|AM|PM)|morning|afternoon|evening|noon/i.test(message)) {
      fields.push('time');
    }
    
    // Location detection (basic)
    if (message.match(/\b(street|road|avenue|lane|drive|airport|hotel|station|terminal|address)\b/i) ||
        message.match(/\b[A-Z][a-z]+ [A-Z][a-z]+/)) {
      if (message.match(/\bfrom\b|\bpickup\b|\bcollect\b|\bstart\b/i)) {
        fields.push('pickup_location');
      }
      if (message.match(/\bto\b|\bdrop\b|\bdestination\b|\bgoing\b/i)) {
        fields.push('dropoff_location');
      }
      if (!fields.includes('pickup_location') && !fields.includes('dropoff_location')) {
        fields.push('location');
      }
    }
    
    // Service type detection
    if (message.match(/\b(airport|wedding|corporate|business|chauffeur|event|security|transfer)\b/i)) {
      fields.push('service_type');
    }
    
    // Passenger count detection
    if (/\b(\d+|one|two|three|four|five|six|seven|eight)\s*(passenger|person|people)\b/i.test(message) ||
        /\bjust me\b|myself only|solo/i.test(message)) {
      fields.push('passenger_count');
    }
    
    // Name detection (if it looks like a name)
    if (message.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) || 
        message.match(/^[A-Z][a-z]+$/)) {
      fields.push('name');
    }

    return fields;
  }

  private extractMultipleDataFromResponse(userMessage: string): void {
    const message = userMessage.trim();
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    if (!this.extractedData.customer_name) {
      const nameMatch = message.match(/(?:i'm|i am|name is|call me)\s+([a-zA-Z\s]+)/i) ||
                       message.match(/^([a-zA-Z\s]{2,50})$/) ||
                       message.match(/\bmy name is ([a-zA-Z\s]+)/i);
      if (nameMatch && nameMatch[1].trim().length > 1) {
        this.extractedData.customer_name = nameMatch[1].trim();
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
      const phoneMatch = message.match(/(\+44|0)[\s-]?(\d{4})[\s-]?(\d{3})[\s-]?(\d{3})|(\d{5})[\s-]?(\d{6})|\b\d{10,15}\b/);
      if (phoneMatch) {
        this.extractedData.customer_phone = phoneMatch[0];
      }
    }
    
    // Extract service type
    if (!this.extractedData.service_type) {
      const serviceMap = {
        'chauffeur': 'Chauffeur Service',
        'airport': 'Airport Transfers',
        'transfer': 'Airport Transfers',
        'wedding': 'Wedding Transport',
        'corporate': 'Corporate Transport',
        'business': 'Corporate Transport',
        'event': 'Event Transport',
        'security': 'Security Services'
      };
      
      for (const [key, value] of Object.entries(serviceMap)) {
        if (lowerMessage.includes(key)) {
          this.extractedData.service_type = value;
          break;
        }
      }
    }
    
    // Extract pickup and dropoff locations
    const locationPatterns = [
      // From X to Y
      /from\s+(.+?)\s+to\s+(.+?)(?:\.|$|,)/i,
      // Pickup from X, going to Y
      /pickup\s+(?:from\s+)?(.+?)(?:\s+(?:and\s+)?(?:going\s+)?to\s+(.+?))?(?:\.|$|,)/i,
      // Going from X to Y
      /going\s+from\s+(.+?)\s+to\s+(.+?)(?:\.|$|,)/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1] && !this.extractedData.pickup_location) {
          this.extractedData.pickup_location = match[1].trim();
        }
        if (match[2] && !this.extractedData.dropoff_location) {
          this.extractedData.dropoff_location = match[2].trim();
        }
        break;
      }
    }
    
    // Extract date
    if (!this.extractedData.booking_date) {
      if (lowerMessage.includes('today')) {
        this.extractedData.booking_date = 'Today';
      } else if (lowerMessage.includes('tomorrow')) {
        this.extractedData.booking_date = 'Tomorrow';
      } else {
        const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          this.extractedData.booking_date = dateMatch[0];
        } else {
          const dayMatch = message.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
          if (dayMatch) {
            this.extractedData.booking_date = dayMatch[0];
          }
        }
      }
    }
    
    // Extract time
    if (!this.extractedData.booking_time) {
      const timeMatch = message.match(/(\d{1,2}[:\.]?\d{0,2}\s?(?:am|pm|AM|PM))/);
      if (timeMatch) {
        this.extractedData.booking_time = timeMatch[0];
      } else if (lowerMessage.includes('morning')) {
        this.extractedData.booking_time = 'Morning';
      } else if (lowerMessage.includes('afternoon')) {
        this.extractedData.booking_time = 'Afternoon';
      } else if (lowerMessage.includes('evening')) {
        this.extractedData.booking_time = 'Evening';
      }
    }
    
    // Extract passenger count
    if (!this.extractedData.passenger_count) {
      const countMatch = message.match(/\b(\d+)\s*(?:passenger|person|people)\b/i);
      if (countMatch) {
        this.extractedData.passenger_count = parseInt(countMatch[1]);
      } else if (lowerMessage.includes('just me') || lowerMessage.includes('myself only')) {
        this.extractedData.passenger_count = 1;
      } else {
        const numberWords = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        
        for (const [word, num] of Object.entries(numberWords)) {
          if (lowerMessage.includes(word)) {
            this.extractedData.passenger_count = num;
            break;
          }
        }
      }
    }
    
    // Extract vehicle preference
    if (!this.extractedData.vehicle_preference) {
      if (lowerMessage.includes('no preference') || 
          lowerMessage.includes('you choose') ||
          lowerMessage.includes('surprise me') ||
          lowerMessage.includes('don\'t mind') ||
          lowerMessage.includes('any car')) {
        this.extractedData.vehicle_preference = 'No specific preference - please select suitable vehicle';
      } else {
        const vehicles = ['sedan', 'suv', 'rolls royce', 'bentley', 'luxury', 'executive', 'mpv'];
        for (const vehicle of vehicles) {
          if (lowerMessage.includes(vehicle)) {
            this.extractedData.vehicle_preference = message;
            break;
          }
        }
      }
    }
    
    // Extract special requirements
    if (!this.extractedData.special_requirements) {
      if (lowerMessage.includes('no requirements') || 
          lowerMessage.includes('no special') || 
          lowerMessage.includes('nothing special') ||
          lowerMessage.includes('none') ||
          lowerMessage.includes('no extras')) {
        this.extractedData.special_requirements = 'None';
      } else if (lowerMessage.includes('child seat') || 
                 lowerMessage.includes('wheelchair') || 
                 lowerMessage.includes('refreshment') ||
                 lowerMessage.includes('stop') ||
                 lowerMessage.includes('water')) {
        this.extractedData.special_requirements = message;
      }
    }
  }

  private generateIntelligentResponse(userMessage: string, analysis: any): string {
    // Handle booking cancellation
    if (analysis.isBookingCancellation) {
      this.bookingCancelled = true;
      return "I understand - no problem at all! Your booking request has been cancelled. If you ever need VIP transport services in the future, I'll be here to help. Have a wonderful day! 😊";
    }

    // Extract any data from the message first
    this.extractMultipleDataFromResponse(userMessage);

    // Acknowledge extracted data intelligently
    let acknowledgment = '';
    const newlyExtracted = [];

    if (this.extractedData.customer_name && !acknowledgment.includes('name')) {
      newlyExtracted.push(`name (${this.extractedData.customer_name.split(' ')[0]})`);
    }
    if (this.extractedData.customer_email && !acknowledgment.includes('email')) {
      newlyExtracted.push('email');
    }
    if (this.extractedData.pickup_location && !acknowledgment.includes('pickup')) {
      newlyExtracted.push('pickup location');
    }
    if (this.extractedData.dropoff_location && !acknowledgment.includes('destination')) {
      newlyExtracted.push('destination');
    }
    if (this.extractedData.booking_date && !acknowledgment.includes('date')) {
      newlyExtracted.push(`date (${this.extractedData.booking_date})`);
    }
    if (this.extractedData.booking_time && !acknowledgment.includes('time')) {
      newlyExtracted.push(`time (${this.extractedData.booking_time})`);
    }

    if (newlyExtracted.length > 0) {
      if (newlyExtracted.length === 1) {
        acknowledgment = `Perfect! I've got your ${newlyExtracted[0]}.`;
      } else if (newlyExtracted.length === 2) {
        acknowledgment = `Excellent! I've noted your ${newlyExtracted[0]} and ${newlyExtracted[1]}.`;
      } else {
        const last = newlyExtracted.pop();
        acknowledgment = `Fantastic! I've captured your ${newlyExtracted.join(', ')}, and ${last}.`;
      }
    }

    // Get next needed information
    const nextStep = this.getNextMissingStep();
    
    if (nextStep === 'confirmation') {
      return `${acknowledgment}\n\n${this.getConfirmationResponse()}`;
    }

    const nextQuestion = this.getContextualQuestion(nextStep);
    
    if (acknowledgment && nextQuestion) {
      return `${acknowledgment}\n\n${nextQuestion}`;
    } else if (nextQuestion) {
      return nextQuestion;
    } else if (acknowledgment) {
      return acknowledgment;
    }

    return this.getStepResponse(this.currentStep, userMessage);
  }

  private getNextMissingStep(): string {
    const requiredSteps = [
      'name', 'email', 'phone', 'service_type', 'pickup_location', 
      'dropoff_location', 'booking_date', 'booking_time', 'passenger_count'
    ];
    
    for (const step of requiredSteps) {
      if (!this.isStepComplete(step)) {
        return step;
      }
    }
    
    // Optional steps
    if (!this.extractedData.vehicle_preference) return 'vehicle_preference';
    if (!this.extractedData.special_requirements) return 'special_requirements';
    
    return 'confirmation';
  }

  private getContextualQuestion(step: string): string {
    const questions = {
      name: "What's your name? I'd love to provide personalized service!",
      email: "Could you share your email address? I'll send you confirmation details there.",
      phone: "What's your phone number? This helps us coordinate your journey perfectly.",
      service_type: "What type of transport service do you need?\n\n🚗 **Chauffeur Service** - Professional transport for any occasion\n✈️ **Airport Transfers** - Reliable with flight monitoring\n💒 **Wedding Transport** - Elegant for your special day\n💼 **Corporate Transport** - Executive business travel\n🎭 **Event Transport** - Red carpet service\n🛡️ **Security Services** - Professional protection",
      pickup_location: "Where would you like us to pick you up?",
      dropoff_location: "What's your destination?",
      booking_date: "What date do you need the transport? (You can say it any way like 'tomorrow', 'Dec 25th', or '25/12/2024')",
      booking_time: "What time works best for pickup?",
      passenger_count: "How many passengers will be traveling?",
      vehicle_preference: this.getVehicleRecommendation(),
      special_requirements: "Any special requirements? (Child seats, refreshments, multiple stops, or just let me know if everything's straightforward!)"
    };

    return questions[step] || "Let me get the next detail for your booking.";
  }

  private handleOffTopicGently(userMessage: string, analysis: any): string {
    this.offTopicCount++;
    
    const responses = {
      question: [
        "That's a great question! I'll be happy to answer that once we get your booking sorted.",
        "I'd love to help with that! Let me quickly finish getting your transport details first.",
        "Good question! I can definitely help with that after we arrange your journey."
      ],
      smalltalk: [
        "That's lovely! I appreciate the chat.",
        "Thank you for sharing! That's nice to hear.",
        "That sounds wonderful!"
      ],
      complaint: [
        "I understand your concerns, and I want to make sure you have an excellent experience.",
        "Thank you for that feedback - I'll make sure we exceed your expectations.",
        "I appreciate you sharing that. Let's ensure everything is perfect for you."
      ]
    };

    let responseType = 'smalltalk';
    if (analysis.intent === 'question') responseType = 'question';
    else if (analysis.intent === 'complaint') responseType = 'complaint';

    const responseOptions = responses[responseType];
    const response = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    const nextStep = this.getNextMissingStep();
    const nextQuestion = this.getContextualQuestion(nextStep);

    return `${response} ${nextQuestion}`;
  }

  private getStepResponse(step: string, userMessage: string): string {
    if (step === 'greeting') {
      if (!this.hasGreeted) {
        this.hasGreeted = true;
        return "Hello! I'm Alex, your VIP transport specialist. I'm here to arrange luxury transport that exceeds your expectations.\n\nWhether you need airport transfers, wedding transport, corporate travel, or our exclusive security services - I'll make it seamless for you.\n\nWhat's your name? I'd love to provide you with personalized service.";
      }
    }

    return this.getContextualQuestion(step);
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

  private getVehicleRecommendation(): string {
    const serviceType = this.extractedData.service_type;
    const passengerCount = this.extractedData.passenger_count || 1;
    
    let recommendations = [];
    
    if (serviceType?.includes('Wedding')) {
      recommendations = [
        'Rolls Royce - Ultimate luxury for your special day',
        'Bentley - Sophisticated elegance', 
        'Luxury Sedan - Classic refinement'
      ];
    } else if (serviceType?.includes('Corporate')) {
      recommendations = [
        'Executive Sedan - Professional and discreet',
        'Luxury SUV - Spacious and prestigious'
      ];
    } else if (serviceType?.includes('Security')) {
      recommendations = [
        'Armored Vehicle - Maximum protection',
        'Executive SUV - Secure yet comfortable'
      ];
    } else {
      if (passengerCount <= 3) {
        recommendations = [
          'Executive Sedan - Comfortable and professional',
          'Luxury SUV - Spacious and prestigious'
        ];
      } else {
        recommendations = [
          'Luxury SUV - Perfect for your group',
          'Premium MPV - Spacious for larger parties'
        ];
      }
    }

    return `Based on your needs, here are my recommendations:\n\n${recommendations.map(r => `• ${r}`).join('\n')}\n\nWhich appeals to you, or would you like me to choose the best option?`;
  }

  private getConfirmationResponse(): string {
    return `Perfect! Let me confirm everything for you:\n\n${this.getBookingSummary()}\n\nDoes this all look correct? Just say 'yes' to confirm and I'll submit your booking, or let me know if you'd like to change anything!`;
  }

  private getBookingSummary(): string {
    return `📋 **Your VIP Transport Booking**
    
👤 **Name:** ${this.extractedData.customer_name}
📧 **Email:** ${this.extractedData.customer_email}
📱 **Phone:** ${this.extractedData.customer_phone}
🚗 **Service:** ${this.extractedData.service_type}
📍 **Pickup:** ${this.extractedData.pickup_location}
🎯 **Destination:** ${this.extractedData.dropoff_location}
📅 **Date:** ${this.extractedData.booking_date}
⏰ **Time:** ${this.extractedData.booking_time}
👥 **Passengers:** ${this.extractedData.passenger_count}
🚙 **Vehicle:** ${this.extractedData.vehicle_preference || 'Best suitable option'}
📝 **Requirements:** ${this.extractedData.special_requirements || 'Standard service'}`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    console.log('Processing message:', userMessage, 'Current step:', this.currentStep);
    
    // Add to conversation history
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.conversationHistory.push(userChatMessage);

    // Check if booking was cancelled
    if (this.bookingCancelled) {
      return {
        response: "Your booking has been cancelled. If you need anything else, I'm here to help!",
        bookingReady: false,
        extractedData: this.extractedData
      };
    }

    // Analyze the message
    const analysis = this.analyzeUserMessage(userMessage);
    
    let response = '';
    let bookingReady = false;

    // Handle confirmation step
    if (this.currentStep === 'confirmation') {
      if (userMessage.toLowerCase().match(/\b(yes|yep|yeah|correct|confirm|looks good|perfect|submit|book it|go ahead)\b/)) {
        this.currentStep = 'submission';
        bookingReady = true;
        response = "Excellent! I'm processing your booking request now... 🎉";
      } else if (userMessage.toLowerCase().match(/\b(no|nope|change|wrong|incorrect|fix|update|modify)\b/)) {
        response = "Of course! What would you like to change? Just tell me which detail needs updating.";
      } else {
        response = "Should I go ahead and submit this booking, or would you like to change something?";
      }
    } else if (this.currentStep === 'submission') {
      response = "🎉 Wonderful! Your booking request has been submitted successfully!\n\nHere's what happens next:\n• Our team will review your request within 30 minutes\n• You'll receive a confirmation call or email\n• We'll coordinate all journey details with you\n\n📞 **For immediate assistance:** 07464 247 007\n📧 **Email:** bookings@viptransportandsecurity.co.uk\n\nThank you for choosing VIP Transport and Security!";
    } else {
      // Handle off-topic messages gently
      if (!analysis.containsData && analysis.intent !== 'booking' && analysis.intent !== 'cancellation') {
        response = this.handleOffTopicGently(userMessage, analysis);
      } else {
        // Generate intelligent response
        response = this.generateIntelligentResponse(userMessage, analysis);
      }

      // Update current step to next missing step
      this.currentStep = this.getNextMissingStep();
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
        status: this.currentStep === 'submission' ? 'completed' : this.bookingCancelled ? 'cancelled' : 'active'
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
    this.hasGreeted = false;
    this.offTopicCount = 0;
    this.bookingCancelled = false;
  }
}
