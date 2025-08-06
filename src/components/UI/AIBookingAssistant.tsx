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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'name' | 'contact' | 'pickup' | 'destination' | 'datetime' | 'vehicle' | 'details' | 'confirm' | 'complete'>('greeting');
  const [collectedData, setCollectedData] = useState<Partial<BookingData>>({});
  
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
        content: "Hello there! 👋 I'm Alex from VIP Transport Services. It's a pleasure to assist you with your luxury chauffeur needs today. Could I start by getting your name, please?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setCurrentStep('name');
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
      // Store the user's response based on current step
      const updatedData = { ...collectedData };
      
      switch(currentStep) {
        case 'name':
          updatedData.customer_name = inputMessage;
          break;
        case 'contact':
          if (inputMessage.includes('@')) {
            updatedData.customer_email = inputMessage;
          } else {
            updatedData.customer_phone = inputMessage.replace(/[^\d+]/g, '');
          }
          break;
        case 'pickup':
          updatedData.pickup_location = inputMessage;
          break;
        case 'destination':
          updatedData.dropoff_location = inputMessage;
          break;
        case 'datetime':
          // Simple date/time parsing - would be enhanced in production
          if (inputMessage.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/)) {
            updatedData.booking_date = inputMessage;
          } else if (inputMessage.match(/\d{1,2}:\d{2}/)) {
            updatedData.booking_time = inputMessage;
          }
          break;
        case 'vehicle':
          updatedData.vehicle_preference = inputMessage;
          break;
        case 'details':
          updatedData.special_requirements = inputMessage;
          break;
      }
      
      setCollectedData(updatedData);
      console.log('Updated collected data:', updatedData);

      // Determine next step and response
      let nextStep = currentStep;
      let assistantResponse = "";
      let shouldProcess = false;

      switch(currentStep) {
        case 'name':
          assistantResponse = `Thank you, ${inputMessage}. How may we contact you? A phone number or email would be perfect.`;
          nextStep = 'contact';
          break;
          
        case 'contact':
          if (inputMessage.includes('@') && !updatedData.customer_phone) {
            assistantResponse = "Got your email. For faster coordination, could we also have a contact number? Otherwise, we'll proceed with email.";
          } else {
            assistantResponse = "Wonderful. Now, where will we be picking you up from today? Please include any specific details like building name or landmark.";
            nextStep = 'pickup';
          }
          break;
          
        case 'pickup':
          assistantResponse = "Noted. And what's your destination address? We'll ensure the most efficient route for you.";
          nextStep = 'destination';
          break;
          
        case 'destination':
          assistantResponse = "Excellent. When would you like this service? You can say something like 'Tomorrow at 3 PM' or 'August 15th at 8:30 AM'.";
          nextStep = 'datetime';
          break;
          
        case 'datetime':
          // Check if we have both date and time
          if (!updatedData.booking_date || !updatedData.booking_time) {
            assistantResponse = "Just to confirm, did you mean " + 
              (updatedData.booking_date ? updatedData.booking_date : "[date]") + 
              " at " + 
              (updatedData.booking_time ? updatedData.booking_time : "[time]") + 
              "? Or could you clarify the date and time?";
          } else {
            assistantResponse = `Got it - ${updatedData.booking_date} at ${updatedData.booking_time}. `;
            assistantResponse += "We offer a range of luxury vehicles - sedans (Mercedes S-Class, BMW 7 Series), SUVs (Range Rover, Mercedes GLS), or executive vans. Do you have a preference?";
            nextStep = 'vehicle';
          }
          break;
          
        case 'vehicle':
          assistantResponse = "Excellent choice. Is there anything special we should prepare for your journey? Child seats, wheelchair access, or perhaps champagne on arrival?";
          nextStep = 'details';
          break;
          
        case 'details':
          assistantResponse = "Thank you for those details. Let me summarize your booking:\n\n" +
            `• Name: ${updatedData.customer_name}\n` +
            `• Contact: ${updatedData.customer_phone || updatedData.customer_email}\n` +
            `• Pickup: ${updatedData.pickup_location}\n` +
            `• Destination: ${updatedData.dropoff_location}\n` +
            `• Date/Time: ${updatedData.booking_date} at ${updatedData.booking_time}\n` +
            `• Vehicle: ${updatedData.vehicle_preference}\n` +
            `• Special Requests: ${updatedData.special_requirements || 'None'}\n\n` +
            "Does everything look correct? We can proceed or make any adjustments needed.";
          nextStep = 'confirm';
          break;
          
        case 'confirm':
          if (inputMessage.toLowerCase().includes('yes') || 
              inputMessage.toLowerCase().includes('correct') ||
              inputMessage.toLowerCase().includes('proceed')) {
            assistantResponse = "Perfect! I'll finalize your booking now. One moment please...";
            nextStep = 'complete';
            shouldProcess = true;
          } else {
            assistantResponse = "I'd be happy to adjust anything. What would you like to change?";
            // Here you would add logic to handle changes
          }
          break;
      }
      
      if (!shouldProcess) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep(nextStep);
        await saveConversation([...messages, userMessage, assistantMessage]);
      } else {
        // Process the booking
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        const completeData = {
          ...updatedData,
          purpose: "Booking through chat assistant",
          additional_services: "Standard VIP service" + 
            (updatedData.special_requirements ? " with special requests" : "")
        } as BookingData;
        
        console.log('Processing booking with data:', completeData);
        const result = await assistantRef.current.processBooking(completeData);
        console.log('Booking processing result:', result);
        
        const resultMessage: ChatMessage = {
          role: 'assistant',
          content: result.response || `Your booking #${Math.random().toString(36).substr(2, 8).toUpperCase()} has been confirmed! You'll receive details shortly. Is there anything else I can assist with?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, resultMessage]);
        await saveConversation([...messages, userMessage, assistantMessage, resultMessage]);
        
        // Submit booking to database
        try {
          const booking = await submitBooking(completeData);
          console.log('Booking submitted successfully:', booking);
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
        content: "Apologies, I'm having some technical difficulties. Please bear with me or contact us directly at 07464 247 007 for immediate assistance.",
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
          updated_at: new Date().toISOString(),
          status: currentStep === 'complete' ? 'completed' : 'active'
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
