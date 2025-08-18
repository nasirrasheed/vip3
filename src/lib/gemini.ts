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
  estimated_duration?: string;
  return_journey?: boolean;
  additional_stops?: string[];
  budget_range?: string;
  occasion_details?: string;
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
  private currentContext: string = 'greeting';
  private hasGreeted: boolean = false;
  private bookingCancelled: boolean = false;
  private dataUpdateMode: boolean = false;
  private lastExtractedField: string = '';

  private ukServices = [
    {
      name: 'Chauffeur Service',
      description: 'Professional chauffeur-driven transport for all occasions across the UK',
      vehicles: ['Executive Sedan', 'Luxury SUV', 'Premium MPV', 'Mercedes S-Class', 'BMW 7 Series'],
      occasions: ['Business meetings', 'Shopping trips', 'Sightseeing', 'General transport']
    },
    {
      name: 'Preferred Chauffeur Services for Hotel Weddings',
      description: 'Luxury wedding transport with elegant vehicles and professional service',
      vehicles: ['Rolls Royce Phantom', 'Bentley Mulsanne', 'Rolls Royce Ghost', 'Classic Bentley', 'Mercedes S-Class'],
      occasions: ['Bride & Groom transport', 'Wedding party', 'Guest transfers', 'Reception transport']
    },
    {
      name: 'Race Day Transport',
      description: 'Premium transport to UK racing events with style and punctuality',
      vehicles: ['Luxury SUV', 'Executive Sedan', 'Premium MPV', 'Range Rover', 'Mercedes GLS'],
      occasions: ['Ascot', 'Cheltenham', 'Goodwood', 'Silverstone', 'Epsom Derby']
    },
    {
      name: 'Corporate Transport',
      description: 'Professional business travel solutions across the UK',
      vehicles: ['Executive Sedan', 'Luxury SUV', 'Mercedes E-Class', 'BMW 5 Series', 'Audi A6'],
      occasions: ['Airport transfers', 'Business meetings', 'Conference transport', 'Executive travel']
    },
    {
      name: 'Prom Parties',
      description: 'Make your prom night unforgettable with luxury transport',
      vehicles: ['Stretch Limousine', 'Party Bus', 'Luxury SUV', 'Executive Sedan'],
      occasions: ['School proms', 'University balls', 'Graduation parties', 'Special occasions']
    },
    {
      name: 'Security Services',
      description: 'Professional close protection with SIA-licensed operatives across the UK',
      vehicles: ['Armored Vehicle', 'Executive Security SUV', 'Discreet Sedan', 'Security Escort Vehicle'],
      occasions: ['VIP protection', 'Executive security', 'Event security', 'Personal protection']
    },
    {
      name: 'Event Transport',
      description: 'Specialized luxury transport for premieres, galas, and exclusive events',
      vehicles: ['Rolls Royce', 'Bentley', 'Luxury Limousine', 'Executive SUV'],
      occasions: ['Red carpet events', 'Theatre premieres', 'Gala dinners', 'Award ceremonies']
    }
  ];

  private ukLocations = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Liverpool',
    'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Wakefield', 'Coventry', 'Nottingham', 'Newcastle',
    'Belfast', 'Brighton', 'Hull', 'Plymouth', 'Stoke-on-Trent', 'Wolverhampton', 'Derby', 'Southampton',
    'Portsmouth', 'York', 'Peterborough', 'Dudley', 'Northampton', 'Luton', 'Warrington', 'Bournemouth',
    'Reading', 'Southend-on-Sea', 'Middlesbrough', 'Sunderland', 'Warwick', 'Cambridge', 'Oxford',
    'Heathrow Airport', 'Gatwick Airport', 'Manchester Airport', 'Birmingham Airport', 'Edinburgh Airport',
    'Glasgow Airport', 'Bristol Airport', 'Liverpool Airport', 'Leeds Bradford Airport'
  ];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Enhanced VIP Booking Assistant initialized with session:', sessionId);
  }

  private isNonUKLocation(message: string): boolean {
    const nonUKKeywords = [
      'new york', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam', 'dubai', 'tokyo', 'singapore',
      'usa', 'america', 'france', 'germany', 'spain', 'italy', 'netherlands', 'japan', 'china',
      'australia', 'canada', 'india', 'pakistan', 'bangladesh', 'nigeria', 'brazil', 'mexico',
      'outside uk', 'international', 'abroad', 'overseas', 'foreign country'
    ];
    
    const lowerMessage = message.toLowerCase();
    return nonUKKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private analyzeMessageIntelligently(userMessage: string): {
    intent: 'booking' | 'question' | 'smalltalk' | 'complaint' | 'goodbye' | 'cancellation' | 'update' | 'suggestion_request';
    sentiment: 'positive' | 'negative' | 'neutral' | 'confused' | 'excited';
    isBookingCancellation: boolean;
    isDataUpdate: boolean;
    extractedData: Partial<BookingData>;
    confidence: number;
    suggestedResponse: string;
    isNonUKRequest: boolean;
  } {
    const message = userMessage.toLowerCase().trim();
    
    // Check for non-UK requests
    const isNonUKRequest = this.isNonUKLocation(userMessage);
    
    // Detect booking cancellation - more specific patterns
    const cancellationPhrases = [
      'cancel booking', 'cancel the booking', 'cancel this booking', 'cancel my booking',
      'i don\'t want to book', 'don\'t want booking', 'no booking', 'forget booking',
      'cancel this', 'cancel it', 'stop booking', 'abort booking', 'not interested anymore',
      'changed my mind', 'don\'t need transport', 'cancel everything'
    ];
    
    const isBookingCancellation = cancellationPhrases.some(phrase => message.includes(phrase));
    
    // Detect data updates
    const updatePhrases = [
      'change', 'update', 'modify', 'correction', 'actually', 'instead', 'rather',
      'i meant', 'sorry', 'wait', 'correction', 'edit', 'fix', 'replace',
      'oh i forgot', 'i forgot to mention', 'also need', 'one more thing'
    ];
    
    const isDataUpdate = updatePhrases.some(phrase => message.includes(phrase));
    
    // Extract data intelligently
    const extractedData = this.extractDataIntelligently(userMessage);
    
    // Determine intent
    let intent: 'booking' | 'question' | 'smalltalk' | 'complaint' | 'goodbye' | 'cancellation' | 'update' | 'suggestion_request' = 'booking';
    
    if (isBookingCancellation) {
      intent = 'cancellation';
    } else if (isDataUpdate) {
      intent = 'update';
    } else if (message.includes('suggest') || message.includes('recommend') || message.includes('what do you think') || 
               message.includes('which is better') || message.includes('help me choose')) {
      intent = 'suggestion_request';
    } else if (message.match(/\b(what|how|when|where|why|which|who|can you|do you|will you|is it|are you)\b/)) {
      intent = 'question';
    } else if (message.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|how are you|weather|nice day)\b/)) {
      intent = 'smalltalk';
    } else if (message.match(/\b(expensive|cheap|disappointed|problem|issue|wrong|bad|terrible|awful|hate)\b/)) {
      intent = 'complaint';
    } else if (message.match(/\b(goodbye|bye|thanks|thank you|see you|have a good day)\b/)) {
      intent = 'goodbye';
    }
    
    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' | 'confused' | 'excited' = 'neutral';
    
    if (message.match(/\b(excited|amazing|fantastic|perfect|excellent|wonderful|great|awesome|love it)\b/)) {
      sentiment = 'excited';
    } else if (message.match(/\b(yes|yeah|sure|okay|sounds good|perfect|great|excellent|wonderful)\b/)) {
      sentiment = 'positive';
    } else if (message.match(/\b(confused|don\'t understand|what do you mean|unclear|huh)\b/)) {
      sentiment = 'confused';
    } else if (message.match(/\b(no|nope|don\'t|won\'t|can\'t|bad|terrible|awful|hate)\b/) && !isBookingCancellation) {
      sentiment = 'negative';
    }
    
    // Calculate confidence based on data extraction and clarity
    const confidence = Math.min(1.0, 0.5 + (Object.keys(extractedData).length * 0.1) + (intent === 'booking' ? 0.3 : 0.1));
    
    return {
      intent,
      sentiment,
      isBookingCancellation,
      isDataUpdate,
      extractedData,
      confidence,
      suggestedResponse: '',
      isNonUKRequest
    };
  }

  private extractDataIntelligently(message: string): Partial<BookingData> {
    const extracted: Partial<BookingData> = {};
    const lowerMessage = message.toLowerCase();
    
    // Enhanced name extraction
    if (!this.extractedData.customer_name) {
      const namePatterns = [
        /(?:i'm|i am|name is|call me|this is)\s+([a-zA-Z][\w\s]{1,30})/i,
        /^([A-Z][a-z]+ [A-Z][a-z]+)$/,
        /^([A-Z][a-z]+)$/
      ];
      
      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match && match[1].trim().length > 1 && match[1].trim().length < 50) {
          const name = match[1].trim();
          if (!name.includes('@') && !name.includes('http') && !/\d{5,}/.test(name)) {
            extracted.customer_name = name;
            break;
          }
        }
      }
    }
    
    // Enhanced email extraction
    if (!this.extractedData.customer_email) {
      const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        extracted.customer_email = emailMatch[0];
      }
    }
    
    // Enhanced phone extraction
    if (!this.extractedData.customer_phone) {
      const phonePatterns = [
        /(\+44\s?[\d\s-]{10,})/,
        /(0\d{4}\s?\d{3}\s?\d{3})/,
        /(\d{5}\s?\d{6})/,
        /(\d{11})/,
        /(07\d{9})/
      ];
      
      for (const pattern of phonePatterns) {
        const match = message.match(pattern);
        if (match) {
          extracted.customer_phone = match[1].replace(/\s+/g, ' ').trim();
          break;
        }
      }
    }
    
    // Intelligent service type detection
    if (!this.extractedData.service_type) {
      const serviceKeywords = {
        'Chauffeur Service': ['chauffeur', 'driver', 'general transport', 'personal driver'],
        'Preferred Chauffeur Services for Hotel Weddings': ['wedding', 'bride', 'groom', 'marriage', 'ceremony'],
        'Race Day Transport': ['race', 'racing', 'ascot', 'cheltenham', 'goodwood', 'silverstone', 'epsom'],
        'Corporate Transport': ['corporate', 'business', 'executive', 'meeting', 'conference', 'office'],
        'Prom Parties': ['prom', 'graduation', 'school dance', 'university ball', 'formal'],
        'Security Services': ['security', 'protection', 'bodyguard', 'vip protection', 'secure transport'],
        'Event Transport': ['event', 'premiere', 'gala', 'red carpet', 'theatre', 'awards']
      };
      
      for (const [service, keywords] of Object.entries(serviceKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          extracted.service_type = service;
          break;
        }
      }
    }
    
    // Advanced location extraction with context awareness
    const locationPatterns = [
      // Full address patterns
      /\b(\d+\s+[A-Za-z\s]+(street|road|avenue|lane|drive|way|place|court|crescent|close|park|square|gardens?)[^,\n]*)/i,
      // Postcode patterns
      /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i,
      // Airport patterns
      /\b(heathrow|gatwick|stansted|luton|manchester|birmingham|edinburgh|glasgow|bristol|liverpool|leeds\s*bradford)\s*airport\b/i,
      // Hotel patterns
      /\b(hilton|marriott|sheraton|hyatt|intercontinental|premier\s*inn|travelodge|holiday\s*inn)[^,\n]*/i,
      // Train station patterns
      /\b([a-z\s]+)\s*(station|rail|train\s*station)\b/i,
      // General location patterns
      /\b(central\s*london|city\s*centre?|downtown|west\s*end|canary\s*wharf)/i
    ];
    
    for (const pattern of locationPatterns) {
      const matches = [...message.matchAll(new RegExp(pattern.source, 'gi'))];
      
      for (const match of matches) {
        const location = match[1] || match[0];
        const cleanLocation = location.trim();
        
        // Determine if it's pickup or dropoff based on context
        const beforeLocation = message.substring(0, match.index).toLowerCase();
        const afterLocation = message.substring(match.index + match[0].length).toLowerCase();
        
        const pickupKeywords = ['from', 'pick up', 'pickup', 'collect', 'start', 'leaving', 'departing'];
        const dropoffKeywords = ['to', 'drop off', 'drop', 'destination', 'going', 'arriving', 'ending'];
        
        const isPickup = pickupKeywords.some(keyword => beforeLocation.includes(keyword));
        const isDropoff = dropoffKeywords.some(keyword => beforeLocation.includes(keyword)) ||
                         dropoffKeywords.some(keyword => afterLocation.includes(keyword));
        
        if (isPickup && !this.extractedData.pickup_location) {
          extracted.pickup_location = cleanLocation;
        } else if (isDropoff && !this.extractedData.dropoff_location) {
          extracted.dropoff_location = cleanLocation;
        } else if (!this.extractedData.pickup_location && !isDropoff) {
          extracted.pickup_location = cleanLocation;
        } else if (!this.extractedData.dropoff_location && !isPickup) {
          extracted.dropoff_location = cleanLocation;
        }
      }
    }
    
    // Smart date extraction
    if (!this.extractedData.booking_date) {
      const today = new Date();
      const dateKeywords = {
        'today': today.toISOString().split('T')[0],
        'tomorrow': new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      for (const [keyword, date] of Object.entries(dateKeywords)) {
        if (lowerMessage.includes(keyword)) {
          extracted.booking_date = date;
          break;
        }
      }
      
      // Date patterns
      const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        /(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
        /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i
      ];
      
      for (const pattern of datePatterns) {
        const match = message.match(pattern);
        if (match) {
          extracted.booking_date = match[0];
          break;
        }
      }
    }
    
    // Smart time extraction
    if (!this.extractedData.booking_time && !message.includes('@')) {
      const timePatterns = [
        /(\d{1,2}[:\.]?\d{0,2}\s?(?:am|pm|AM|PM))/,
        /(?:at\s+)?(\d{1,2}[:\.]?\d{2})(?![A-Za-z])/,
        /\b(morning|afternoon|evening|noon)\b/i,
        /(\d{1,2})\s*o'?clock/i
      ];
      
      for (const pattern of timePatterns) {
        const match = message.match(pattern);
        if (match) {
          extracted.booking_time = match[1] || match[0];
          break;
        }
      }
    }
    
    // Intelligent passenger count extraction
    if (!this.extractedData.passenger_count) {
      const numberWords = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      
      // Direct number response
      if (/^\s*\d+\s*$/.test(message.trim())) {
        const count = parseInt(message.trim());
        if (count >= 1 && count <= 20) {
          extracted.passenger_count = count;
        }
      } else {
        // Pattern matching
        const countPattern = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:passenger|person|people|pax)\b/i;
        const match = message.match(countPattern);
        
        if (match) {
          const countStr = match[1].toLowerCase();
          extracted.passenger_count = numberWords[countStr] || parseInt(countStr);
        } else if (lowerMessage.includes('just me') || lowerMessage.includes('myself only')) {
          extracted.passenger_count = 1;
        }
      }
    }
    
    // Vehicle preference extraction
    if (!this.extractedData.vehicle_preference) {
      const vehicleKeywords = [
        'rolls royce', 'bentley', 'mercedes', 'bmw', 'audi', 'range rover',
        'sedan', 'suv', 'limousine', 'luxury car', 'executive car'
      ];
      
      for (const vehicle of vehicleKeywords) {
        if (lowerMessage.includes(vehicle)) {
          extracted.vehicle_preference = vehicle;
          break;
        }
      }
      
      if (lowerMessage.includes('no preference') || lowerMessage.includes('you choose')) {
        extracted.vehicle_preference = 'No specific preference';
      }
    }
    
    // Special requirements extraction
    if (!this.extractedData.special_requirements) {
      const requirementKeywords = [
        'child seat', 'wheelchair', 'refreshment', 'water', 'stop', 'multiple stops',
        'flowers', 'champagne', 'red carpet', 'photography', 'decoration'
      ];
      
      const foundRequirements = requirementKeywords.filter(req => lowerMessage.includes(req));
      
      if (foundRequirements.length > 0) {
        extracted.special_requirements = foundRequirements.join(', ');
      } else if (lowerMessage.includes('no requirements') || lowerMessage.includes('nothing special')) {
        extracted.special_requirements = 'None';
      }
    }
    
    return extracted;
  }

  private generateIntelligentResponse(userMessage: string, analysis: any): string {
    // Handle non-UK requests
    if (analysis.isNonUKRequest) {
      return `I appreciate your interest! However, our VIP transport services are exclusively available within the United Kingdom. We operate throughout England, Scotland, Wales, and Northern Ireland.\n\nIf you have any transport needs within the UK, I'd be delighted to help arrange luxury travel for you. Where in the UK would you like to travel?`;
    }

    // Handle booking cancellation
    if (analysis.isBookingCancellation) {
      this.bookingCancelled = true;
      return `I completely understand - no worries at all! Your booking request has been cancelled.\n\nIf you ever need our premium transport services in the future, I'll be right here to help. Have a wonderful day! 😊`;
    }

    // Handle data updates
    if (analysis.isDataUpdate) {
      return this.handleDataUpdate(userMessage, analysis.extractedData);
    }

    // Handle suggestion requests
    if (analysis.intent === 'suggestion_request') {
      return this.generateSuggestion(userMessage);
    }

    // Merge newly extracted data
    const newlyExtracted = analysis.extractedData;
    Object.assign(this.extractedData, newlyExtracted);

    // Generate acknowledgment and next question
    const acknowledgment = this.generateSmartAcknowledgment(newlyExtracted);
    const nextQuestion = this.getNextIntelligentQuestion();

    if (this.isBookingComplete()) {
      return `${acknowledgment}\n\n${this.generateBookingConfirmation()}`;
    }

    if (acknowledgment && nextQuestion) {
      return `${acknowledgment}\n\n${nextQuestion}`;
    } else if (nextQuestion) {
      return nextQuestion;
    } else if (acknowledgment) {
      return acknowledgment;
    }

    // Handle off-topic gently
    return this.handleOffTopicIntelligently(userMessage, analysis);
  }

  private handleDataUpdate(userMessage: string, extractedData: Partial<BookingData>): string {
    const updates = [];
    
    for (const [key, value] of Object.entries(extractedData)) {
      if (value) {
        const oldValue = this.extractedData[key];
        this.extractedData[key] = value;
        
        const fieldName = this.getFieldDisplayName(key);
        if (oldValue) {
          updates.push(`${fieldName} updated from "${oldValue}" to "${value}"`);
        } else {
          updates.push(`${fieldName} set to "${value}"`);
        }
      }
    }
    
    if (updates.length === 0) {
      return "I'd be happy to help you update any details. What would you like to change?";
    }
    
    const updateMessage = updates.length === 1 
      ? `Perfect! I've ${updates[0]}.`
      : `Excellent! I've made these updates:\n${updates.map(u => `• ${u}`).join('\n')}`;
    
    const nextQuestion = this.getNextIntelligentQuestion();
    return nextQuestion ? `${updateMessage}\n\n${nextQuestion}` : `${updateMessage}\n\nIs there anything else you'd like to update?`;
  }

  private generateSuggestion(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('vehicle') || lowerMessage.includes('car')) {
      return this.suggestVehicle();
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('what kind')) {
      return this.suggestService();
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('when')) {
      return this.suggestTime();
    }
    
    return "I'd be happy to make recommendations! What specific aspect would you like suggestions for - the vehicle type, service, timing, or something else?";
  }

  private suggestVehicle(): string {
    const serviceType = this.extractedData.service_type;
    const passengerCount = this.extractedData.passenger_count || 1;
    
    if (serviceType?.includes('Wedding')) {
      return `For your wedding, I'd recommend:\n\n🚗 **Rolls Royce Phantom** - Ultimate luxury and elegance\n🚙 **Bentley Mulsanne** - Classic sophistication\n🏎️ **Mercedes S-Class** - Modern luxury with style\n\nThe Rolls Royce would create the most memorable entrance. Which appeals to you?`;
    }
    
    if (serviceType?.includes('Corporate')) {
      return `For corporate transport, I suggest:\n\n💼 **Mercedes E-Class** - Professional and discreet\n🚙 **BMW 7 Series** - Executive prestige\n🚗 **Audi A6** - Modern business luxury\n\nAll offer Wi-Fi and privacy for business calls. Which would suit your needs?`;
    }
    
    if (passengerCount > 4) {
      return `For your group of ${passengerCount}, I recommend:\n\n🚌 **Luxury Mercedes V-Class** - Spacious and comfortable\n🚙 **Range Rover** - Premium SUV with excellent space\n🚐 **Premium MPV** - Maximum comfort for larger groups\n\nWhich sounds most suitable?`;
    }
    
    return `Based on your needs, here are my top recommendations:\n\n🚗 **Executive Sedan** - Classic comfort and elegance\n🚙 **Luxury SUV** - Spacious with commanding presence\n🏎️ **Premium Vehicle** - Ultimate luxury experience\n\nWhat type of journey experience are you looking for?`;
  }

  private suggestService(): string {
    return `We offer several premium services across the UK:\n\n🚗 **Chauffeur Service** - Professional transport for any occasion\n✈️ **Airport Transfers** - Reliable with flight monitoring\n💒 **Wedding Transport** - Make your day unforgettable\n💼 **Corporate Transport** - Executive business travel\n🎉 **Event Transport** - Red carpet treatment\n🛡️ **Security Services** - VIP protection available\n🏇 **Race Day Transport** - Premium service to racing events\n\nWhat type of occasion or journey do you have in mind?`;
  }

  private suggestTime(): string {
    const serviceType = this.extractedData.service_type;
    
    if (serviceType?.includes('Airport')) {
      return `For airport transfers, I recommend:\n\n✈️ **Departure**: 3 hours before international flights, 2 hours for domestic\n🛬 **Arrival**: We monitor your flight and adjust pickup time automatically\n\nWhat's your flight time, and I'll suggest the perfect pickup schedule?`;
    }
    
    if (serviceType?.includes('Wedding')) {
      return `For wedding transport timing:\n\n👰 **Bride**: Usually 30-45 minutes before ceremony\n🤵 **Groom**: 1 hour before ceremony\n🎉 **Reception**: Coordinate with your photographer for perfect timing\n\nWhat time is your ceremony?`;
    }
    
    return `I can help optimize your timing! Consider:\n\n🚗 **Traffic patterns**: Earlier morning or late evening for smoother journeys\n📅 **Day of week**: Weekends typically have less business traffic\n⏰ **Flexibility**: Allowing extra time ensures a relaxed experience\n\nWhat time works best for your schedule?`;
  }

  private generateSmartAcknowledgment(extractedData: Partial<BookingData>): string {
    const acknowledgments = [];
    
    for (const [key, value] of Object.entries(extractedData)) {
      if (value) {
        const fieldName = this.getFieldDisplayName(key);
        acknowledgments.push(`${fieldName}: ${value}`);
      }
    }
    
    if (acknowledgments.length === 0) return '';
    
    const enthusiasm = ['Perfect!', 'Excellent!', 'Wonderful!', 'Fantastic!'][Math.floor(Math.random() * 4)];
    
    if (acknowledgments.length === 1) {
      return `${enthusiasm} I've noted your ${acknowledgments[0]}.`;
    } else {
      return `${enthusiasm} I've captured:\n${acknowledgments.map(a => `✓ ${a}`).join('\n')}`;
    }
  }

  private getFieldDisplayName(key: string): string {
    const fieldNames = {
      customer_name: 'name',
      customer_email: 'email address',
      customer_phone: 'phone number',
      service_type: 'service type',
      pickup_location: 'pickup location',
      dropoff_location: 'destination',
      booking_date: 'travel date',
      booking_time: 'pickup time',
      passenger_count: 'passenger count',
      vehicle_preference: 'vehicle preference',
      special_requirements: 'special requirements',
      estimated_duration: 'journey duration',
      return_journey: 'return journey',
      additional_stops: 'additional stops',
      budget_range: 'budget range',
      occasion_details: 'occasion details'
    };
    
    return fieldNames[key] || key;
  }

  private getNextIntelligentQuestion(): string {
    const missing = this.getMissingRequiredData();
    
    if (missing.length === 0) {
      // Check for optional enhancements
      if (!this.extractedData.vehicle_preference) {
        return this.suggestVehicle();
      }
      if (!this.extractedData.special_requirements) {
        return "Any special requirements? Perhaps refreshments, child seats, or additional stops? Or shall we keep it straightforward?";
      }
      return null;
    }

    const nextField = missing[0];
    return this.getContextualQuestion(nextField);
  }

  private getMissingRequiredData(): string[] {
    const required = [
      'customer_name', 'customer_email', 'customer_phone', 'service_type',
      'pickup_location', 'dropoff_location', 'booking_date', 'booking_time', 'passenger_count'
    ];
    
    return required.filter(field => !this.extractedData[field]);
  }

  private getContextualQuestion(field: string): string {
    const questions = {
      customer_name: "What's your name? I'd love to provide you with personalized service! 😊",
      
      customer_email: "Could you share your email address? I'll send you all the confirmation details and journey updates there.",
      
      customer_phone: "What's your phone number? This helps our chauffeur coordinate with you directly for a seamless experience.",
      
      service_type: this.getServiceTypeQuestion(),
      
      pickup_location: this.getPickupLocationQuestion(),
      
      dropoff_location: "Perfect! And where would you like us to take you? (Full address or landmark works great)",
      
      booking_date: "What date do you need the transport? You can say it however feels natural - 'tomorrow', 'next Friday', '25th December', etc.",
      
      booking_time: this.getTimeQuestion(),
      
      passenger_count: "How many passengers will be traveling? Just so I can ensure we have the perfect vehicle size.",
      
      vehicle_preference: this.suggestVehicle(),
      
      special_requirements: "Any special touches you'd like? Child seats, refreshments, multiple stops, or shall we keep everything standard?"
    };

    return questions[field] || `Could you provide your ${this.getFieldDisplayName(field)}?`;
  }

  private getServiceTypeQuestion(): string {
    return `What type of luxury transport do you need? We specialize in:\n\n🚗 **Chauffeur Service** - Professional transport for any occasion\n✈️ **Airport Transfers** - Reliable with flight monitoring & meet-and-greet\n💒 **Wedding Transport** - Elegant vehicles for your special day\n💼 **Corporate Transport** - Executive business travel solutions\n🎉 **Prom Parties** - Make it unforgettable with luxury transport\n🛡️ **Security Services** - VIP protection with trained operatives\n🏇 **Race Day Transport** - Premium service to UK racing events\n🎭 **Event Transport** - Red carpet treatment for premieres & galas\n\nWhich service interests you most?`;
  }

  private getPickupLocationQuestion(): string {
    const serviceType = this.extractedData.service_type;
    
    if (serviceType?.includes('Airport')) {
      return "Where shall we pick you up? Your home address, hotel, or office? (A full address helps us plan the perfect route)";
    }
    
    if (serviceType?.includes('Wedding')) {
      return "Where would you like us to collect you on your special day? Your home, bridal suite, or another location?";
    }
    
    return "Where would you like us to pick you up? A full address or well-known landmark works perfectly.";
  }

  private getTimeQuestion(): string {
    const serviceType = this.extractedData.service_type;
    
    if (serviceType?.includes('Airport')) {
      return "What time is your flight? I'll calculate the perfect pickup time considering traffic and check-in requirements.";
    }
    
    if (serviceType?.includes('Wedding')) {
      return "What time is your ceremony? I'll ensure you arrive with perfect timing - relaxed and radiant!";
    }
    
    return "What time works best for pickup? You can say it any way - '3pm', '15:30', 'mid-morning', etc.";
  }

  private isBookingComplete(): boolean {
    const required = this.getMissingRequiredData();
    return required.length === 0;
  }

  private generateBookingConfirmation(): string {
    return `Wonderful! Let me confirm all your details:\n\n${this.getDetailedBookingSummary()}\n\n✨ **Does everything look perfect?** Just say 'yes' to confirm and I'll submit your luxury transport booking!\n\nOr let me know if you'd like to adjust anything - I'm here to make sure everything is exactly as you want it! 😊`;
  }

  private getDetailedBookingSummary(): string {
    const data = this.extractedData;
    
    return `🎯 **Your VIP Transport Booking Summary**

👤 **Client:** ${data.customer_name}
📧 **Email:** ${data.customer_email}  
📱 **Phone:** ${data.customer_phone}
🚗 **Service:** ${data.service_type}
📍 **Pickup:** ${data.pickup_location}
🎯 **Destination:** ${data.dropoff_location}
📅 **Date:** ${data.booking_date}
⏰ **Time:** ${data.booking_time}
👥 **Passengers:** ${data.passenger_count}
🚙 **Vehicle:** ${data.vehicle_preference || 'Best suitable luxury vehicle'}
✨ **Special Requirements:** ${data.special_requirements || 'Standard premium service'}`;
  }

  private handleOffTopicIntelligently(userMessage: string, analysis: any): string {
    const responses = {
      question: [
        "That's a great question! I'll be delighted to answer that once we get your luxury transport arranged.",
        "Excellent question! Let me finish collecting your booking details first, then I'll be happy to help with that.",
        "I'd love to help with that! Let's quickly complete your transport booking, then I can assist you further."
      ],
      
      smalltalk: [
        "That's lovely to hear! I appreciate you sharing that with me.",
        "Thank you for that - it's always nice to have a friendly chat!",
        "That sounds wonderful! I enjoy getting to know our clients."
      ],
      
      complaint: [
        "I completely understand your concerns, and I want to ensure you have an exceptional experience with us.",
        "Thank you for that feedback - it helps me make sure we exceed your expectations.",
        "I appreciate you sharing that. Let's make sure everything is absolutely perfect for your journey."
      ]
    };

    const responseType = analysis.intent in responses ? analysis.intent : 'smalltalk';
    const responseOptions = responses[responseType];
    const response = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    
    const nextQuestion = this.getNextIntelligentQuestion();
    
    if (nextQuestion) {
      return `${response}\n\n${nextQuestion}`;
    }
    
    return `${response} Is there anything else about your transport booking I can help you with?`;
  }

  async processMessage(userMessage: string): Promise<{ response: string; bookingReady: boolean; extractedData: BookingData }> {
    console.log('Processing intelligent message:', userMessage);
    
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
        response: "Your booking has been cancelled. If you'd like to make a new booking or need any assistance, I'm here to help! 😊",
        bookingReady: false,
        extractedData: this.extractedData
      };
    }

    // Handle greeting
    if (!this.hasGreeted && this.conversationHistory.length === 1) {
      this.hasGreeted = true;
      const greetingResponse = this.generateGreeting();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: greetingResponse,
        timestamp: new Date()
      };
      this.conversationHistory.push(assistantMessage);
      
      await this.saveConversation();
      
      return {
        response: greetingResponse,
        bookingReady: false,
        extractedData: this.extractedData
      };
    }

    // Intelligent analysis
    const analysis = this.analyzeMessageIntelligently(userMessage);
    
    let response = '';
    let bookingReady = false;

    // Handle confirmation
    if (this.isBookingComplete() && !analysis.isBookingCancellation && !analysis.isDataUpdate) {
      if (userMessage.toLowerCase().match(/\b(yes|yep|yeah|correct|confirm|looks good|perfect|submit|book it|go ahead|that's right|exactly)\b/)) {
        bookingReady = true;
        response = this.generateSubmissionResponse();
      } else if (userMessage.toLowerCase().match(/\b(no|nope|change|wrong|incorrect|fix|update|modify|edit)\b/)) {
        response = "Of course! What would you like to change? Just tell me which detail needs updating and I'll fix it right away.";
      } else {
        response = this.generateIntelligentResponse(userMessage, analysis);
      }
    } else {
      response = this.generateIntelligentResponse(userMessage, analysis);
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

  private generateGreeting(): string {
    return `Hello! I'm Alex, your VIP transport specialist. Welcome to the UK's premier luxury transport service! ✨

I'm here to arrange exceptional transport that exceeds your expectations. Whether you need:

🚗 **Professional chauffeur services**
✈️ **Luxury airport transfers** 
💒 **Elegant wedding transport**
💼 **Executive corporate travel**
🎉 **Special event transport**
🛡️ **VIP security services**

I'll make it absolutely seamless for you across England, Scotland, Wales, and Northern Ireland.

What's your name? I'd love to provide you with personalized service! 😊`;
  }

  private generateSubmissionResponse(): string {
    return `🎉 **Absolutely wonderful!** Your luxury transport booking is being processed now...

Here's what happens next:

⚡ **Immediate**: Booking confirmation sent to your email
📞 **Within 15 minutes**: Personal call from our operations team  
🚗 **24 hours before**: Your chauffeur's contact details and vehicle information
📱 **Journey day**: Live tracking and direct contact with your chauffeur

🔥 **For urgent matters**: 07464 247 007
📧 **Email**: bookings@viptransportandsecurity.co.uk

Thank you for choosing our VIP service! We're excited to provide you with an exceptional journey experience! ✨`;
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
        status: this.bookingCancelled ? 'cancelled' : this.isBookingComplete() ? 'completed' : 'active',
        extracted_data: this.extractedData
      };

      const { error } = await supabase
        .from('chat_conversations')
        .upsert(conversationData, { 
          onConflict: 'session_id' 
        });

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error in saveConversation:', error);
    }
  }

  async submitBooking(): Promise<any> {
    try {
      console.log('Submitting intelligent booking with data:', this.extractedData);
      
      // Enhanced date formatting
      let formattedDate = null;
      let formattedTime = null;
      
      if (this.extractedData.booking_date) {
        const dateStr = this.extractedData.booking_date.toLowerCase();
        if (dateStr.includes('today')) {
          formattedDate = new Date().toISOString().split('T')[0];
        } else if (dateStr.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          formattedDate = tomorrow.toISOString().split('T')[0];
        } else {
          // Handle various date formats
          const dateFormats = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
          ];
          
          for (const format of dateFormats) {
            const match = this.extractedData.booking_date.match(format);
            if (match) {
              const [, part1, part2, part3] = match;
              let year, month, day;
              
              if (part1.length === 4) {
                [year, month, day] = [part1, part2, part3];
              } else {
                [day, month, year] = [part1, part2, part3];
                if (year.length === 2) year = `20${year}`;
              }
              
              formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              break;
            }
          }
        }
      }
      
      if (this.extractedData.booking_time) {
        const timeStr = this.extractedData.booking_time.toLowerCase();
        
        // Handle AM/PM format
        const amPmMatch = timeStr.match(/(\d{1,2})[:\.]?(\d{0,2})\s?(am|pm)/);
        if (amPmMatch) {
          let [, hours, minutes = '00', period] = amPmMatch;
          hours = parseInt(hours);
          if (period === 'pm' && hours !== 12) hours += 12;
          if (period === 'am' && hours === 12) hours = 0;
          formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        } else {
          // Handle 24-hour format
          const timeMatch = timeStr.match(/(\d{1,2})[:\.](\d{2})/);
          if (timeMatch) {
            formattedTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00`;
          }
        }
      }

      const enhancedBookingData = {
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
        estimated_duration: this.extractedData.estimated_duration || null,
        return_journey: this.extractedData.return_journey || false,
        additional_stops: this.extractedData.additional_stops || null,
        budget_range: this.extractedData.budget_range || null,
        occasion_details: this.extractedData.occasion_details || null,
        extracted_data: this.extractedData,
        status: 'pending',
        intelligence_level: 'enhanced',
        booking_source: 'ai_assistant_v2'
      };

      console.log('Enhanced booking data:', enhancedBookingData);

      const { data, error } = await supabase
        .from('ai_bookings')
        .insert([enhancedBookingData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

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
      console.error('Error submitting enhanced booking:', error);
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
    this.currentContext = 'greeting';
    this.hasGreeted = false;
    this.bookingCancelled = false;
    this.dataUpdateMode = false;
    this.lastExtractedField = '';
  }

  // Additional utility methods for enhanced intelligence
  
  private calculateEstimatedDuration(pickup: string, dropoff: string): string {
    // Simple heuristic for journey time estimation
    const isAirport = (location: string) => location.toLowerCase().includes('airport');
    const isLongDistance = (p: string, d: string) => {
      const longDistancePairs = [
        ['london', 'manchester'], ['london', 'birmingham'], ['london', 'leeds'],
        ['manchester', 'birmingham'], ['glasgow', 'edinburgh']
      ];
      return longDistancePairs.some(([city1, city2]) =>
        (p.toLowerCase().includes(city1) && d.toLowerCase().includes(city2)) ||
        (p.toLowerCase().includes(city2) && d.toLowerCase().includes(city1))
      );
    };
    
    if (isAirport(pickup) || isAirport(dropoff)) {
      return '1-3 hours depending on location and traffic';
    }
    
    if (isLongDistance(pickup, dropoff)) {
      return '3-5 hours';
    }
    
    return '30 minutes - 2 hours depending on traffic';
  }

  private suggestReturnJourney(): boolean {
    const serviceType = this.extractedData.service_type;
    return serviceType?.includes('Airport') || 
           serviceType?.includes('Event') || 
           serviceType?.includes('Corporate');
  }

  private getLocationSuggestions(partialLocation: string): string[] {
    return this.ukLocations.filter(location => 
      location.toLowerCase().includes(partialLocation.toLowerCase())
    ).slice(0, 5);
  }
}
