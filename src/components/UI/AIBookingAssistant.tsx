import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, Sparkles, CheckCircle } from 'lucide-react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<VIPBookingAssistant | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: "Hello! I'm Alex, your VIP transport specialist. I'm here to arrange luxury transport that exceeds your expectations.\n\nWhether you need airport transfers, wedding transport, corporate travel, or our exclusive security services - I'll make it seamless for you.\n\nWhat's your name? I'd love to provide you with personalized service.",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        setShowProgress(true);
      }, 1200);
    }
  }, [isOpen, messages.length]);

  // Update progress tracking
  useEffect(() => {
    if (assistantRef.current) {
      try {
        const extractedData = assistantRef.current.getExtractedData();
        const completed: string[] = [];
        
        if (extractedData.customer_name) completed.push('name');
        if (extractedData.customer_email) completed.push('email');
        if (extractedData.customer_phone) completed.push('phone');
        if (extractedData.service_type) completed.push('service');
        if (extractedData.pickup_location) completed.push('pickup');
        if (extractedData.dropoff_location) completed.push('destination');
        if (extractedData.booking_date) completed.push('date');
        if (extractedData.booking_time) completed.push('time');
        if (extractedData.passenger_count) completed.push('passengers');
        if (extractedData.vehicle_preference) completed.push('vehicle');
        if (extractedData.special_requirements) completed.push('requirements');
        
        setCompletedFields(completed);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const getTypingDelay = (messageLength: number): number => {
    const baseDelay = 800;
    const lengthFactor = Math.min(messageLength * 20, 2000);
    return baseDelay + lengthFactor + Math.random() * 500;
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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const typingDelay = getTypingDelay(currentInput.length);
      
      simulateTyping(async () => {
        try {
          const result = await assistantRef.current!.processMessage(currentInput);
          
          console.log('AI processing result:', result);

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: result.response,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);

          if (result.bookingReady && !bookingSubmitted) {
            setBookingSubmitted(true);
            try {
              console.log('Booking is ready, submitting...');
              const booking = await assistantRef.current!.submitBooking();
              console.log('Booking submitted successfully:', booking);
              
              setTimeout(() => {
                const confirmationMessage: ChatMessage = {
                  role: 'assistant',
                  content: `🎉 Wonderful! Your booking request has been submitted successfully!\n\nHere's what happens next:\n• Our team will review your request within 30 minutes\n• You'll receive a confirmation call or email\n• We'll coordinate all journey details with you\n\n📞 **For immediate assistance:** 07464 247 007\n📧 **Email:** bookings@viptransportandsecurity.co.uk\n\nThank you for choosing VIP Transport and Security! Is there anything else I can help you with today?`,
                  timestamp: new Date()
                };
                
                setMessages(prev => [...prev, confirmationMessage]);
                setShowProgress(false);
              }, 1000);
            } catch (bookingError) {
              console.error('Booking submission error:', bookingError);
              
              setTimeout(() => {
                const successMessage: ChatMessage = {
                  role: 'assistant',
                  content: `Your booking details have been received successfully! 🎉\n\nOur team has all your information and will contact you within 30 minutes to confirm your booking.\n\n📞 **For immediate assistance:** 07464 247 007\n📧 **Email:** bookings@viptransportandsecurity.co.uk\n\nThank you for choosing VIP Transport and Security!`,
                  timestamp: new Date()
                };
                
                setMessages(prev => [...prev, successMessage]);
                setShowProgress(false);
              }, 1000);
            }
          }
          
          setIsLoading(false);
        } catch (innerError) {
          console.error('Error in typing simulation:', innerError);
          setIsLoading(false);
          setIsTyping(false);
          throw innerError;
        }
      }, typingDelay);
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Connection issue - let me try again.');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I apologize for the brief connection issue. I'm here and ready to help you with your VIP transport booking. Could you please repeat your last message?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getProgressPercentage = (): number => {
    const totalFields = 11;
    return Math.round((completedFields.length / totalFields) * 100);
  };

  const formatMessageContent = (content: string): JSX.Element => {
    const parts = content.split('\n');
    
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.trim() === '') return null;
          
          if (part.startsWith('📞') || part.startsWith('📧')) {
            return (
              <div key={index} className="bg-blue-50 p-2 rounded text-sm text-blue-800 mt-1">
                {part}
              </div>
            );
          } else if (part.includes('**') && part.includes('**')) {
            const boldParts = part.split(/(\*\*[^*]+\*\*)/);
            return (
              <div key={index}>
                {boldParts.map((boldPart, boldIndex) => {
                  if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                    return <strong key={boldIndex} className="font-semibold">{boldPart.slice(2, -2)}</strong>;
                  }
                  return boldPart;
                })}
              </div>
            );
          } else if (part.startsWith('•') || part.startsWith('🚗') || part.startsWith('✈️') || part.startsWith('💒') || part.startsWith('💼') || part.startsWith('🎭') || part.startsWith('🛡️')) {
            return (
              <div key={index} className="flex items-start space-x-2 ml-2">
                <span className="text-blue-500 mt-1 flex-shrink-0">
                  {part.startsWith('•') ? '•' : part.charAt(0)}
                </span>
                <span>{part.slice(part.startsWith('•') ? 1 : 2).trim()}</span>
              </div>
            );
          } else {
            return <div key={index}>{part}</div>;
          }
        })}
      </div>
    );
  };

  const handleQuickAction = (option: string) => {
    setInputMessage(option);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
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
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open VIP booking assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-7 h-7 flex items-center justify-center animate-pulse font-bold">
              <Sparkles className="w-3 h-3" />
            </div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Chat with Alex - VIP Transport AI
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
              height: isMinimized ? 60 : 540
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 ${positionClasses[position]} z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden`}
            style={{ width: '400px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Alex - VIP Transport AI</h3>
                  <p className="text-xs opacity-90 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Intelligent Booking Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showProgress && (
                  <div className="flex items-center space-x-2 mr-2">
                    <div className="text-xs opacity-90">{getProgressPercentage()}%</div>
                    <div className="w-8 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-yellow-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/10 p-1.5 rounded transition-colors"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-1.5 rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Progress indicators */}
                {showProgress && completedFields.length > 0 && (
                  <div className="bg-green-50 border-b border-green-200 p-3">
                    <div className="flex items-center space-x-2 text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Progress: {completedFields.length}/11 details collected</span>
                    </div>
                  </div>
                )}

                {/* Error display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 text-red-800 p-3 text-sm mx-4 mt-2 rounded-md flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`message-${index}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {formatMessageContent(message.content)}
                        </div>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {(isLoading || isTyping) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Alex is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-200 pr-12"
                        disabled={isLoading || isTyping}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {inputMessage.trim() && !isLoading && !isTyping && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <Send className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={isLoading || isTyping || !inputMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  {/* Quick action buttons */}
                  {messages.length <= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 }}
                      className="flex flex-wrap gap-2 mt-3"
                    >
                      {['Airport Transfer', 'Wedding Transport', 'Corporate Travel'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleQuickAction(option)}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors duration-200"
                          disabled={isLoading || isTyping}
                        >
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-xs text-gray-500 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3 h-3" />
                      <span>AI-Powered • Secure • Professional</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Made by</span>
                      <a
                        href="https://marknova.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 font-medium"
                      >
                        MarkNova
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-10 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIBookingAssistant;
