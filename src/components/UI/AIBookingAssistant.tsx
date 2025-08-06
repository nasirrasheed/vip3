import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Crown, Phone } from 'lucide-react';
import { VIPBookingAssistant, ChatMessage, BookingData } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';

interface AIBookingAssistantProps {
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  onBookingComplete?: (booking: BookingData) => void;
  existingCustomerId?: string;
  existingBookingData?: Partial<BookingData>;
}

const AIBookingAssistant: React.FC<AIBookingAssistantProps> = ({ 
  isVisible = true, 
  position = 'bottom-right',
  onBookingComplete,
  existingCustomerId,
  existingBookingData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => existingCustomerId || `vip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [collectedData, setCollectedData] = useState<Partial<BookingData>>(existingBookingData || {});
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<VIPBookingAssistant | null>(null);

  // Initialize the assistant
  useEffect(() => {
    if (!assistantRef.current) {
      assistantRef.current = new VIPBookingAssistant(sessionId);
      console.log('VIP Assistant initialized with session:', sessionId);
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
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: existingBookingData 
          ? `Welcome back! I see you'd like to modify your existing booking. I'm here to help you with any changes to your VIP transport arrangement.`
          : "Good day! Welcome to VIP Transport Services. I'm Alex, your personal transport concierge. I'm here to arrange your luxury travel experience with our premium fleet. How may I assist you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setConversationContext(['greeting']);
    }
  }, [isOpen, messages.length, existingBookingData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n').map((line, index) => (
        <div key={index} className={index > 0 ? 'mt-1' : ''}>
          <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
        </div>
      ));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !assistantRef.current) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Process the message through the AI assistant
      const result = await assistantRef.current.processMessage(
        inputMessage,
        messages.filter(m => m.role === 'assistant').pop()?.content || '',
        collectedData,
        conversationContext
      );
      
      console.log('AI processing result:', result);

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        data_collected: result.extractedData
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update collected data if any was extracted
      if (result.extractedData) {
        const newData = { ...collectedData, ...result.extractedData };
        setCollectedData(newData);
      }

      // Update conversation context
      if (result.context) {
        setConversationContext(result.context);
      }

      // Save conversation to database
      await saveConversation([...messages, userMessage, assistantMessage]);

      // If booking is ready, submit it
      if (result.bookingReady && result.extractedData) {
        try {
          console.log('Booking is ready, submitting...');
          const booking = await submitBooking(result.extractedData);
          console.log('Booking submitted successfully:', booking);
          
          // Notify parent component if callback provided
          if (onBookingComplete) {
            onBookingComplete(result.extractedData);
          }

          const confirmationMessage: ChatMessage = {
            id: `msg_${Date.now()}_confirm`,
            role: 'assistant',
            content: `Your VIP booking #${booking?.id.slice(0, 8)} has been confirmed. You'll receive a confirmation shortly. Is there anything else I can assist you with?`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          await saveConversation([...messages, userMessage, assistantMessage, confirmationMessage]);
        } catch (bookingError) {
          console.error('Booking submission error:', bookingError);
          setError('Failed to submit booking. Please try again.');
          const errorMessage: ChatMessage = {
            id: `msg_${Date.now()}_error`,
            role: 'assistant',
            content: "I encountered an issue processing your booking. Please contact us directly at +44 7464 247 007 for immediate assistance.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          await saveConversation([...messages, userMessage, assistantMessage, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Connection error. Please check your internet connection.');
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: "Apologies, I'm experiencing technical difficulties. Please contact us directly at +44 7464 247 007 or try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveConversation([...messages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversationMessages: ChatMessage[]) => {
    try {
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        data_collected: msg.data_collected
      }));

      const { data, error } = await supabase
        .from('vip_chat_conversations')
        .upsert({
          session_id: sessionId,
          messages: formattedMessages,
          collected_data: collectedData,
          context: conversationContext,
          updated_at: new Date().toISOString(),
          status: conversationContext.includes('booking_complete') ? 'completed' : 'active',
          is_vip: true
        }, {
          onConflict: 'session_id'
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving VIP conversation:', error);
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
        vehicle_preference: bookingData.vehicle_preference || 'Premium Sedan',
        passenger_count: bookingData.passenger_count || 1,
        special_requirements: bookingData.special_requirements,
        journey_purpose: bookingData.purpose || 'Personal',
        additional_services: bookingData.additional_services,
        status: 'confirmed',
        extracted_data: bookingData,
        is_vip: true,
        priority_level: 'high'
      };

      const { data, error } = await supabase
        .from('vip_bookings')
        .insert([formattedBooking])
        .select();

      if (error) throw error;

      // Update conversation with booking ID
      if (data && data[0]) {
        await supabase
          .from('vip_chat_conversations')
          .update({ 
            booking_id: data[0].id,
            updated_at: new Date().toISOString(),
            status: 'completed'
          })
          .eq('session_id', sessionId);
      }

      return data?.[0];
    } catch (error) {
      console.error('Error submitting VIP booking:', error);
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
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-gradient-to-r from-vip-gold to-vip-gold-dark text-vip-black p-4 rounded-full shadow-luxury transition-all duration-300 hover:scale-110`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open VIP chat assistant"
          >
            <Crown className="w-6 h-6 mr-2" />
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-2 -right-2 bg-vip-accent text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              VIP
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
              height: isMinimized ? 80 : 600
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-white rounded-lg shadow-luxury border border-vip-gold/20 overflow-hidden`}
            style={{ width: '420px' }}
          >
            <div className="bg-gradient-to-r from-vip-black to-vip-black/90 text-vip-gold p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-vip-gold rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-vip-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">VIP Transport Concierge</h3>
                  <p className="text-xs opacity-80 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Alex • Available 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-vip-gold hover:bg-vip-gold/10 p-1 rounded"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-vip-gold hover:bg-vip-gold/10 p-1 rounded"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {error && (
                  <div className="bg-red-100 text-red-800 p-2 text-sm mx-4 mt-2 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-vip-light/30">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm px-4 py-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-vip-gold text-vip-black'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                        }`}
                      >
                        <div className="text-sm">
                          {typeof message.content === 'string' 
                            ? formatMessageContent(message.content)
                            : message.content
                          }
                        </div>
                        <p className="text-xs opacity-60 mt-2">
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
                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-vip-gold rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-vip-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-vip-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-vip-gold focus:border-vip-gold text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-vip-gold hover:bg-vip-gold-dark text-vip-black px-3 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>🔒 Premium & Confidential Service</span>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>+44 7464 247 007</span>
                    </div>
                  </div>
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
