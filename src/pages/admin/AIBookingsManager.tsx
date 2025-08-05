import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Eye, MessageSquare, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AIBooking {
  id: string;
  conversation_id: string;
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
  extracted_data: any;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ChatConversation {
  id: string;
  session_id: string;
  messages: any[];
  booking_id?: string;
  status: string;
  created_at: string;
}

const AIBookingsManager = () => {
  const [bookings, setBookings] = useState<AIBooking[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<AIBooking | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchConversations();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching AI bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const updateBookingStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('ai_bookings')
        .update({ 
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchBookings();
      
      // Show success message to user through the chat if needed
      if (status === 'accepted' || status === 'rejected') {
        // You could implement a notification system here
        console.log(`Booking ${status}:`, id);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const { error } = await supabase
        .from('ai_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const viewConversation = (booking: AIBooking) => {
    const conversation = conversations.find(c => c.session_id === booking.conversation_id);
    if (conversation) {
      setSelectedConversation(conversation);
      setShowConversation(true);
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">AI Booking Requests</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Booking Requests ({filteredBookings.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedBooking?.id === booking.id ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      {booking.customer_name || 'Anonymous Customer'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {booking.pickup_location && (
                      <p>From: {booking.pickup_location}</p>
                    )}
                    {booking.dropoff_location && (
                      <p>To: {booking.dropoff_location}</p>
                    )}
                    {booking.booking_date && (
                      <p>Date: {booking.booking_date} {booking.booking_time}</p>
                    )}
                    {booking.service_type && (
                      <p>Service: {booking.service_type}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => viewConversation(selectedBooking)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Conversation"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteBooking(selectedBooking.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Booking"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selectedBooking.customer_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <p className="text-gray-900">{selectedBooking.customer_name}</p>
                  </div>
                )}

                {selectedBooking.customer_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${selectedBooking.customer_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedBooking.customer_email}
                      </a>
                    </div>
                  </div>
                )}

                {selectedBooking.customer_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${selectedBooking.customer_phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedBooking.customer_phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedBooking.pickup_location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{selectedBooking.pickup_location}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.dropoff_location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{selectedBooking.dropoff_location}</p>
                    </div>
                  </div>
                )}

                {(selectedBooking.booking_date || selectedBooking.booking_time) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedBooking.booking_date} {selectedBooking.booking_time}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBooking.service_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <p className="text-gray-900">{selectedBooking.service_type}</p>
                  </div>
                )}

                {selectedBooking.passenger_count && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{selectedBooking.passenger_count}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.vehicle_preference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Preference</label>
                    <p className="text-gray-900">{selectedBooking.vehicle_preference}</p>
                  </div>
                )}

                {selectedBooking.special_requirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedBooking.special_requirements}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea
                    value={selectedBooking.admin_notes || ''}
                    onChange={(e) => {
                      setSelectedBooking({
                        ...selectedBooking,
                        admin_notes: e.target.value
                      });
                    }}
                    onBlur={() => {
                      if (selectedBooking.admin_notes !== undefined) {
                        updateBookingStatus(selectedBooking.id, selectedBooking.status, selectedBooking.admin_notes);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
                    rows={3}
                    placeholder="Add notes about this booking..."
                  />
                </div>

                {selectedBooking.status === 'pending' && (
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'accepted')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a booking to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Modal */}
      {showConversation && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Chat Conversation</h2>
              <button
                onClick={() => setShowConversation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedConversation.messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBookingsManager;