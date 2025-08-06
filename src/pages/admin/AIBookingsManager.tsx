import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, Trash2, MessageSquare, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
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
      await fetchBookings(); // Refresh the list
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">AI Bookings Manager</h1>
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
                AI Bookings ({filteredBookings.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No AI bookings found</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedBooking?.id === booking.id ? 'bg-yellow-50' : ''
                    }`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {booking.customer_name || 'Anonymous'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {booking.pickup_location && booking.dropoff_location 
                        ? `${booking.pickup_location} → ${booking.dropoff_location}`
                        : 'Location details pending'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => deleteBooking(selectedBooking.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete booking"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.customer_name && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedBooking.customer_name}</span>
                      </div>
                    )}
                    {selectedBooking.customer_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${selectedBooking.customer_email}`} className="text-blue-600 hover:text-blue-800">
                          {selectedBooking.customer_email}
                        </a>
                      </div>
                    )}
                    {selectedBooking.customer_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${selectedBooking.customer_phone}`} className="text-blue-600 hover:text-blue-800">
                          {selectedBooking.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.pickup_location && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Pickup:</p>
                          <p>{selectedBooking.pickup_location}</p>
                        </div>
                      </div>
                    )}
                    {selectedBooking.dropoff_location && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Dropoff:</p>
                          <p>{selectedBooking.dropoff_location}</p>
                        </div>
                      </div>
                    )}
                    {(selectedBooking.booking_date || selectedBooking.booking_time) && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {selectedBooking.booking_date} {selectedBooking.booking_time}
                        </span>
                      </div>
                    )}
                    {selectedBooking.service_type && (
                      <p><strong>Service:</strong> {selectedBooking.service_type}</p>
                    )}
                    {selectedBooking.vehicle_preference && (
                      <p><strong>Vehicle:</strong> {selectedBooking.vehicle_preference}</p>
                    )}
                    {selectedBooking.passenger_count && (
                      <p><strong>Passengers:</strong> {selectedBooking.passenger_count}</p>
                    )}
                    {selectedBooking.special_requirements && (
                      <div>
                        <p className="font-medium">Special Requirements:</p>
                        <p className="whitespace-pre-wrap">{selectedBooking.special_requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'accepted')}
                      className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      disabled={selectedBooking.status === 'accepted'}
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                      className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      disabled={selectedBooking.status === 'rejected'}
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>Created: {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedBooking.updated_at).toLocaleString()}</p>
                </div>
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
    </div>
  );
}