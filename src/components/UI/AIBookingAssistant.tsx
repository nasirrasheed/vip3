import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { VIPBookingAssistant, ChatMessage, BookingData } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';

interface AIBookingAssistantProps {
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

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
  const [sessionId] = useState(() => session_${Date.now()}_${Math.random().toString(36).substr(2, 9)});
  const [collectedData, setCollectedData] = useState<Partial<BookingData>>({});
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
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
        content: "Good day! I'm Alex, your VIP transport specialist. How may I assist you with your luxury travel needs today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setConversationContext(['greeting']);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !assistantRef.current) return;

    // Skip processing if user just said "what" or similar
    if (inputMessage.toLowerCase().match(/^(what|lol|haha|hi|hello)$/i)) {
      setInputMessage('');
      return;
    }

    console.log('Sending message:', inputMessage);

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
      // Analyze the conversation context to determine response
      const context = [...conversationContext];
      const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()?.content || '';
      
      // Process the message through the AI assistant with full context
      const result = await assistantRef.current.processMessage(
        inputMessage, 
        lastAssistantMessage, 
        collectedData,
        context
      );
      
      console.log('AI processing result:', result);

      // Update collected data if any was extracted
      if (result.extractedData) {
        setCollectedData(prev => ({ ...prev, ...result.extractedData }));
      }

      // Update conversation context
      if (result.context) {
        setConversationContext(result.context);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save conversation to database
      await saveConversation([...messages, userMessage, assistantMessage]);

      // If booking is ready, submit it
      if (result.bookingReady && result.extractedData) {
        try {
          console.log('Booking is ready, submitting...');
          const booking = await submitBooking(result.extractedData);
          console.log('Booking submitted successfully:', booking);
          
          const confirmationMessage: ChatMessage = {
            role: 'assistant',
            content: Your booking #${booking?.id.slice(0, 8)} has been confirmed. You'll receive a confirmation shortly. Is there anything else I can assist you with?,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        } catch (bookingError) {
          console.error('Booking submission error:', bookingError);
          setError('Failed to submit booking. Please try again.');
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: "I encountered an issue processing your booking. Please contact us directly at 07464 247 007 for immediate assistance.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
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

  const saveConversation = async (conversationMessages: ChatMessage[]) => {
    try {
      const formattedMessages = conversationMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));

      const { data, error } = await supabase
        .from('chat_conversations')
        .upsert({
          session_id: sessionId,
          messages: formattedMessages,
          collected_data: collectedData,
          context: conversationContext,
          updated_at: new Date().toISOString(),
          status: conversationContext.includes('booking_complete') ? 'completed' : 'active'
        }, {
          onConflict: 'session_id'
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const submitBooking = async (bookingData: BookingData) => {
    try {
      const formattedBooking = {
        conversation_id: sessionId,
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        pickup_location: bookingData.pickup_location,
        dropoff_location: bookingData.dropoff_location,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        vehicle_preference: bookingData.vehicle_preference,
        passenger_count: bookingData.passenger_count || 1,
        special_requirements: bookingData.special_requirements,
        journey_purpose: bookingData.purpose,
        additional_services: bookingData.additional_services,
        status: 'confirmed',
        extracted_data: bookingData
      };

      const { data, error } = await supabase
        .from('ai_bookings')
        .insert([formattedBooking])
        .select();

      if (error) throw error;

      // Update conversation with booking ID
      if (data && data[0]) {
        await supabase
          .from('chat_conversations')
          .update({ 
            booking_id: data[0].id,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
      }

      return data?.[0];
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
            className={fixed bottom-6 ${positionClasses[position]} z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110}
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
            className={fixed bottom-6 ${positionClasses[position]} z-50 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden}
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
                      className={flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}}
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
