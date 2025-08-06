import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { VIPBookingAssistant, ChatMessage, BookingData } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';

interface AIBookingAssistantProps {
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

const REQUIRED_FIELDS: (keyof BookingData)[] = [
  'customer_name',
  'customer_phone',
  'pickup_location',
  'dropoff_location',
  'booking_date',
  'booking_time'
];

const AIBookingAssistant: React.FC<AIBookingAssistantProps> = ({ 
  isVisible = true, 
  position = 'bottom-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [collectedData, setCollectedData] = useState<Partial<BookingData>>({});
  const [currentStep, setCurrentStep] = useState<'greeting' | 'collecting' | 'confirming' | 'completed'>('greeting');
  const [existingBookingId, setExistingBookingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<VIPBookingAssistant | null>(null);

  // Initialize the assistant
  useEffect(() => {
    if (!assistantRef.current) {
      assistantRef.current = new VIPBookingAssistant(sessionId);
      console.log('AI Assistant initialized with session:', sessionId);
    }
  }, [sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: "Good day! I'm Alex, your VIP transport specialist. May I have your name please?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setCurrentStep('greeting');
    }
  }, [isOpen, messages.length]);

  // Check for existing customer when name is provided
  useEffect(() => {
    if (collectedData.customer_name && collectedData.customer_phone && currentStep === 'greeting') {
      checkExistingCustomer();
    }
  }, [collectedData.customer_name, collectedData.customer_phone]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkExistingCustomer = async () => {
    if (!collectedData.customer_name || !collectedData.customer_phone) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_bookings')
        .select('*')
        .or(`customer_name.ilike.%${collectedData.customer_name}%,customer_phone.eq.${collectedData.customer_phone}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingBookingId(data[0].id);
        const existingBooking = data[0];
        
        const existingBookingMessage: ChatMessage = {
          role: 'assistant',
          content: `Welcome back ${collectedData.customer_name}! I see you've booked with us before. Would you like to modify your existing booking or create a new one?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, existingBookingMessage]);
        setCurrentStep('collecting');
      } else {
        proceedWithNewBooking();
      }
    } catch (error) {
      console.error('Error checking existing customer:', error);
      proceedWithNewBooking();
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithNewBooking = () => {
    const nextMessage: ChatMessage = {
      role: 'assistant',
      content: `Thank you ${collectedData.customer_name}. Could you please share your pickup location?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, nextMessage]);
    setCurrentStep('collecting');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !assistantRef.current) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Handle different conversation stages
      switch (currentStep) {
        case 'greeting':
          await handleGreetingStage(userMessage);
          break;
        case 'collecting':
          await handleCollectingStage(userMessage);
          break;
        case 'confirming':
          await handleConfirmingStage(userMessage);
          break;
        case 'completed':
          await handleCompletedStage(userMessage);
          break;
      }

      // Save conversation after each step
      await saveConversation();
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Connection error. Please check your internet connection.');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Apologies, I'm experiencing some technical difficulties. Please bear with me or contact us directly at 07464 247 007.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGreetingStage = async (userMessage: ChatMessage) => {
    // Extract name and phone number from initial message
    const extractedData = extractContactInfo(userMessage.content);
    
    if (!extractedData.name) {
      const reply: ChatMessage = {
        role: 'assistant',
        content: "I didn't catch your name. Could you please tell me your full name?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reply]);
      return;
    }

    setCollectedData(prev => ({
      ...prev,
      customer_name: extractedData.name,
      customer_phone: extractedData.phone || prev.customer_phone
    }));

    if (!extractedData.phone) {
      const phoneRequest: ChatMessage = {
        role: 'assistant',
        content: `Thank you ${extractedData.name}. Could you please share your contact number?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, phoneRequest]);
    }
  };

  const handleCollectingStage = async (userMessage: ChatMessage) => {
    // Use AI to extract information from the message
    const extractionResult = await assistantRef.current!.extractBookingInfo(
      userMessage.content,
      collectedData,
      getNextRequiredField()
    );

    // Update collected data
    const newData = { ...collectedData, ...extractionResult };
    setCollectedData(newData);

    // Check if we have all required information
    if (hasAllRequiredFields(newData)) {
      await transitionToConfirmation(newData);
    } else {
      // Ask for next piece of information
      const nextField = getNextRequiredField();
      const nextQuestion = getQuestionForField(nextField);
      
      const nextMessage: ChatMessage = {
        role: 'assistant',
        content: nextQuestion,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, nextMessage]);
    }
  };

  const handleConfirmingStage = async (userMessage: ChatMessage) => {
    // Check if user confirmed or wants to change something
    const isConfirmation = userMessage.content.toLowerCase().includes('yes') || 
                         userMessage.content.toLowerCase().includes('confirm');
    
    if (isConfirmation) {
      // Submit the booking
      const booking = await submitBooking(collectedData as BookingData);
      
      const confirmationMessage: ChatMessage = {
        role: 'assistant',
        content: `Your booking #${booking.id.slice(0, 8)} has been confirmed! You'll receive a confirmation shortly. Is there anything else I can assist you with?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setCurrentStep('completed');
    } else {
      // User wants to change something - extract what they want to change
      const changeRequest = await assistantRef.current!.identifyChangeRequest(
        userMessage.content,
        collectedData
      );
      
      if (changeRequest.field) {
        // Update the field to be empty so we'll collect it again
        setCollectedData(prev => ({ ...prev, [changeRequest.field]: undefined }));
        
        const changeMessage: ChatMessage = {
          role: 'assistant',
          content: getQuestionForField(changeRequest.field as keyof BookingData),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, changeMessage]);
        setCurrentStep('collecting');
      } else {
        // Couldn't identify what to change
        const clarificationMessage: ChatMessage = {
          role: 'assistant',
          content: "I apologize, I didn't understand what you'd like to change. Could you please specify which detail you'd like to update?",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, clarificationMessage]);
      }
    }
  };

  const handleCompletedStage = async (userMessage: ChatMessage) => {
    // Check if user needs additional assistance
    const needsHelp = userMessage.content.toLowerCase().includes('help') || 
                     userMessage.content.toLowerCase().includes('assist');
    
    if (needsHelp) {
      const helpMessage: ChatMessage = {
        role: 'assistant',
        content: "Of course! What else can I help you with today?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, helpMessage]);
    } else {
      const closingMessage: ChatMessage = {
        role: 'assistant',
        content: "Thank you for choosing our VIP service. Have a wonderful day!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, closingMessage]);
      setTimeout(() => setIsOpen(false), 3000);
    }
  };

  const getNextRequiredField = (): keyof BookingData => {
    const missingFields = REQUIRED_FIELDS.filter(field => !collectedData[field]);
    return missingFields[0] || 'special_requirements';
  };

  const hasAllRequiredFields = (data: Partial<BookingData>): boolean => {
    return REQUIRED_FIELDS.every(field => data[field]);
  };

  const getQuestionForField = (field: keyof BookingData): string => {
    const questions: Record<keyof BookingData, string> = {
      customer_name: "May I have your name please?",
      customer_phone: "Could you please share your contact number?",
      customer_email: "What email should we send the confirmation to?",
      pickup_location: "Where would you like to be picked up from?",
      dropoff_location: "What is your destination?",
      booking_date: "What date would you like the service for?",
      booking_time: "What time would you like the pickup?",
      vehicle_preference: "Do you have a preferred vehicle type? (e.g., Mercedes S-Class, Range Rover)",
      passenger_count: "How many passengers will there be?",
      special_requirements: "Any special requirements we should know about?",
      purpose: "May I ask the purpose of your journey? (e.g., business, airport transfer, wedding)",
      additional_services: "Would you like any additional services? (e.g., child seat, meet & greet)"
    };
    
    return questions[field] || "Could you please provide that information?";
  };

  const transitionToConfirmation = async (data: Partial<BookingData>) => {
    // Generate a summary of the booking details
    const summary = await assistantRef.current!.generateBookingSummary(data);
    
    const confirmationMessage: ChatMessage = {
      role: 'assistant',
      content: `Please confirm your booking details:\n\n${summary}\n\nType 'YES' to confirm or tell me what you'd like to change.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setCurrentStep('confirming');
  };

  const extractContactInfo = (text: string): { name?: string; phone?: string } => {
    // Simple extraction - in a real app you'd use more sophisticated NLP
    const phoneRegex = /(\+?\d[\d\s-]{7,}\d)/;
    const nameRegex = /(?:my name is|i am|name's|called)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i;
    
    const phoneMatch = text.match(phoneRegex);
    const nameMatch = text.match(nameRegex) || text.split(' ').length > 1 ? [null, text.trim()] : null;
    
    return {
      name: nameMatch ? nameMatch[1] : undefined,
      phone: phoneMatch ? phoneMatch[1].replace(/\s+/g, '') : undefined
    };
  };

  const saveConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .upsert({
          session_id: sessionId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          collected_data: collectedData,
          updated_at: new Date().toISOString(),
          status: currentStep === 'completed' ? 'completed' : 'active',
          booking_id: existingBookingId
        }, {
          onConflict: 'session_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const submitBooking = async (bookingData: BookingData) => {
    try {
      const bookingPayload = {
        ...bookingData,
        conversation_id: sessionId,
        status: 'confirmed'
      };

      let booking;
      
      if (existingBookingId) {
        // Update existing booking
        const { data, error } = await supabase
          .from('ai_bookings')
          .update(bookingPayload)
          .eq('id', existingBookingId)
          .select();
        
        if (error) throw error;
        booking = data?.[0];
      } else {
        // Create new booking
        const { data, error } = await supabase
          .from('ai_bookings')
          .insert([bookingPayload])
          .select();
        
        if (error) throw error;
        booking = data?.[0];
        setExistingBookingId(booking?.id || null);
      }

      // Update conversation with booking ID
      if (booking) {
        await supabase
          .from('chat_conversations')
          .update({ 
            booking_id: booking.id,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
      }

      return booking;
    } catch (error) {
      console.error('Error submitting booking:', error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ... (rest of your component code remains the same)
};

export default AIBookingAssistant;
