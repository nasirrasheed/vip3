import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, Trash2, MessageSquare, Calendar, User, MapPin, Phone, Mail, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, AIBooking } from '../../lib/supabase';

export default function AIBookingsManager() {
  const [bookings, setBookings] = useState<AIBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AIBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AIBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [expandedFilters, setExpandedFilters] = useState(false);

  const statusOptions = ['pending', 'confirmed', 'accepted', 'rejected', 'completed', 'cancelled'];

  useEffect(() => {
    fetchBookings();
    const subscription = setupRealtimeUpdates();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    let results = bookings;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(booking => 
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.includes(searchTerm) ||
        booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dropoff_location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      results = results.filter(booking => statusFilter.includes(booking.status));
    }
    
    // Apply date sorting
    results = [...results].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredBookings(results);
  }, [bookings, searchTerm, statusFilter, dateSort]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const toggleDateSort = () => {
    setDateSort(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Bookings Manager</h1>
          <p className="text-sm text-gray-500">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {expandedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {expandedFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                  statusFilter.includes(status)
                    ? `bg-${getStatusColor(status).split(' ')[0]} text-${getStatusColor(status).split(' ')[1]}`
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <span className="capitalize">{status}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Journey
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={toggleDateSort}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {dateSort === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedBooking?.id === booking.id ? 'bg-yellow-50' : ''}`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer_name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.customer_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.pickup_location}
                      </div>
                      <div className="text-sm text-gray-500">
                        → {booking.dropoff_location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicle_preference || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.booking_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(booking.id, 'accepted');
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Accept booking"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(booking.id, 'rejected');
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Reject booking"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings match your criteria</p>
            </div>
          )}
        </div>

        {/* Booking Details Panel */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBooking.id);
                        alert('Booking ID copied to clipboard');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                      title="Copy booking ID"
                    >
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        #{selectedBooking.id.slice(0, 8)}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteBooking(selectedBooking.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete booking"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Customer Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 pb-2 border-b">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-gray-900">{selectedBooking.customer_name || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-gray-900">
                            {selectedBooking.customer_phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900">
                            {selectedBooking.customer_email || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 pb-2 border-b">Booking Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                          <p className="text-gray-900">
                            {selectedBooking.pickup_location || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Dropoff Location</p>
                          <p className="text-gray-900">
                            {selectedBooking.dropoff_location || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date & Time</p>
                          <p className="text-gray-900">
                            {selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString() : 'Not specified'} at {selectedBooking.booking_time || '--:--'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Vehicle</p>
                          <p className="text-gray-900">
                            {selectedBooking.vehicle_preference || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Passengers</p>
                          <p className="text-gray-900">
                            {selectedBooking.passenger_count || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      {selectedBooking.special_requirements && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Special Requirements</p>
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {selectedBooking.special_requirements}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Management */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 pb-2 border-b">Status Management</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'confirmed' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'accepted')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'completed')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'completed' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'cancelled' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
                    <p>Created: {new Date(selectedBooking.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedBooking.updated_at).toLocaleString()}</p>
                  </div>
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

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-yellow-100 text-yellow-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
