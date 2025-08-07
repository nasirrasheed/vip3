import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, Trash2, MessageSquare, Calendar, User, MapPin, Phone, Mail, Clock, Car, Users, FileText } from 'lucide-react';
import { supabase, AIBooking } from '../../lib/supabase'; 

export default function AIBookingsManager() {
  const [bookings, setBookings] = useState<AIBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AIBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
    const subscription = setupRealtimeUpdates();
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const fetchBookings = async () => {
    console.log('Fetching bookings...');
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ai_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    console.log('Setting up realtime updates...');
    try {
      const channel = supabase
        .channel('ai_bookings_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_bookings'
        }, (payload) => {
          console.log('Realtime change received:', payload);
          fetchBookings();
        })
        .subscribe((status, err) => {
          if (err) {
            console.error('Realtime subscription error:', err);
            setError('Realtime connection failed');
          }
          console.log('Realtime subscription status:', status);
        });

      return channel;
    } catch (err) {
      console.error('Error setting up realtime:', err);
      setError('Failed to setup realtime updates');
      return null;
    }
  };

  const updateStatus = async (id: string, newStatus: AIBooking['status']) => {
    try {
      console.log(`Updating status for booking ${id} to ${newStatus}`);
      const { error } = await supabase
        .from('ai_bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }
      
      console.log('Status updated successfully');
      await fetchBookings();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
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
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError(err.message || 'Failed to delete booking');
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Not specified';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">AI Bookings Manager</h1>
          <p className="text-gray-600 mt-1">Manage bookings created through the AI assistant</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all">All Status ({bookings.length})</option>
            <option value="pending">Pending ({bookings.filter(b => b.status === 'pending').length})</option>
            <option value="accepted">Accepted ({bookings.filter(b => b.status === 'accepted').length})</option>
            <option value="rejected">Rejected ({bookings.filter(b => b.status === 'rejected').length})</option>
            <option value="completed">Completed ({bookings.filter(b => b.status === 'completed').length})</option>
            <option value="cancelled">Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Bookings ({filteredBookings.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No AI bookings found</p>
                  <p className="text-sm">Bookings will appear here when customers use the AI assistant</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedBooking?.id === booking.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                    }`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.customer_name || 'Anonymous Customer'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {booking.customer_email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span>{booking.service_type || 'Service not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{booking.booking_date ? formatDate(booking.booking_date) : 'Date TBD'}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {booking.pickup_location && booking.dropoff_location 
                            ? `${booking.pickup_location} → ${booking.dropoff_location}`
                            : 'Locations to be confirmed'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
                      <span>{new Date(booking.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => deleteBooking(selectedBooking.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Delete booking"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-yellow-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedBooking.customer_name || 'Not provided'}</span>
                    </div>
                    {selectedBooking.customer_email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <a href={`mailto:${selectedBooking.customer_email}`} className="text-blue-600 hover:text-blue-800">
                          {selectedBooking.customer_email}
                        </a>
                      </div>
                    )}
                    {selectedBooking.customer_phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phone:</span>
                        <a href={`tel:${selectedBooking.customer_phone}`} className="text-blue-600 hover:text-blue-800">
                          {selectedBooking.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Journey Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                    Journey Details
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.pickup_location && (
                      <div>
                        <span className="font-medium text-green-600">Pickup Location:</span>
                        <p className="text-gray-800 mt-1">{selectedBooking.pickup_location}</p>
                      </div>
                    )}
                    {selectedBooking.dropoff_location && (
                      <div>
                        <span className="font-medium text-red-600">Drop-off Location:</span>
                        <p className="text-gray-800 mt-1">{selectedBooking.dropoff_location}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-yellow-600" />
                    Service Details
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(selectedBooking.booking_date)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Time:</span>
                      <span>{formatTime(selectedBooking.booking_time)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Service:</span>
                      <span>{selectedBooking.service_type || 'Not specified'}</span>
                    </div>
                    {selectedBooking.vehicle_preference && (
                      <div className="flex items-center space-x-3">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Vehicle:</span>
                        <span>{selectedBooking.vehicle_preference}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Passengers:</span>
                      <span>{selectedBooking.passenger_count || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedBooking.special_requirements && selectedBooking.special_requirements !== 'None' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                      Special Requirements
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedBooking.special_requirements}</p>
                    </div>
                  </div>
                )}

                {/* Status Management */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Status Management</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'accepted')}
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                      disabled={selectedBooking.status === 'accepted'}
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                      disabled={selectedBooking.status === 'rejected'}
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'completed')}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                      disabled={selectedBooking.status === 'completed'}
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 space-y-1">
                  <p><strong>Created:</strong> {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  <p><strong>Updated:</strong> {new Date(selectedBooking.updated_at).toLocaleString()}</p>
                  <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
                  <p><strong>Conversation ID:</strong> {selectedBooking.conversation_id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Booking</h3>
              <p>Click on a booking from the list to view detailed information and manage its status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}