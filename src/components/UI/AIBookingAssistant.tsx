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

  if (!isVisible) return null;

  const positionClasses = {
    'bottom-right': 'right-6',
    'bottom-left': 'left-6'
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 500
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden`}
            style={{ width: '380px' }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">VIP Concierge</h3>
                  <p className="text-xs opacity-80">Alex • Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-black/10 p-1 rounded"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-black/10 p-1 rounded"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {error && (
                  <div className="bg-red-100 text-red-800 p-2 rounded text-sm mx-4 mt-2">
                    {error}
                  </div>
                )}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-yellow-400 text-black'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    VIP Transport Services • 24/7 Luxury Chauffeur Solutions
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIBookingAssistant;
