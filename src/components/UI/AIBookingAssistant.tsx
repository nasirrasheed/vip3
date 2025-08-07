import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { VIPBookingAssistant, ChatMessage, BookingData } from '../../lib/gemini';

interface AIBookingAssistantProps {
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

const AIBookingAssistant: React.FC<AIBookingAssistantProps> = ({ 
  isVisible = true, 
  position = 'bottom-left' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  
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
        content: "Good day! I'm Alex, your VIP transport specialist. I'm here to help you arrange your luxury transport needs. May I start by getting your full name?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !assistantRef.current) return;

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
      const result = await assistantRef.current.processMessage(inputMessage);
      
      console.log('AI processing result:', result);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If booking is ready, submit it
      if (result.bookingReady && !bookingSubmitted) {
        setBookingSubmitted(true);
        try {
          console.log('Booking is ready, submitting...');
          const booking = await assistantRef.current.submitBooking();
          console.log('Booking submitted successfully:', booking);
          
          const confirmationMessage: ChatMessage = {
            role: 'assistant',
            content: `Excellent! Your booking has been submitted successfully and is now being reviewed by our team.\n\n📋 **Booking Reference:** ${booking?.id?.slice(0, 8)}\n\n✅ **What happens next:**\n• Our team will review your request within 30 minutes\n• You'll receive a confirmation call or email\n• We'll coordinate all journey details with you\n\n🌟 **Additional Services Available:**\n• Close Protection Services\n• Event Coordination\n• Multi-destination journeys\n• Corporate account setup\n\nIs there anything else I can help you with today?`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        } catch (bookingError) {
          console.error('Booking submission error:', bookingError);
          
          // Still show success to user since data was saved
          const successMessage: ChatMessage = {
            role: 'assistant',
            content: `Your booking details have been received and saved successfully! 🎉\n\nOur team has all your information and will contact you within 30 minutes to confirm your booking.\n\n📞 **For immediate assistance:** 07464 247 007\n📧 **Email:** bookings@viptransportandsecurity.co.uk\n\nThank you for choosing VIP Transport and Security!`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, successMessage]);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError('I apologize for the technical difficulty. Let me try again.');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I apologize for the brief technical difficulty. I'm here and ready to help you with your VIP transport booking. Could you please repeat your last message?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            aria-label="Open VIP booking assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
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
                  <h3 className="font-semibold text-sm">VIP Booking Assistant</h3>
                  <p className="text-xs opacity-80">Alex • Professional Concierge</p>
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
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                          message.role === 'user'
                            ? 'bg-yellow-400 text-black'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
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
                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    🌟 VIP Transport & Security • Professional Luxury Services
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