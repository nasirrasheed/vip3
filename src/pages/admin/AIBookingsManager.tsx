import { useEffect, useState } from 'react';
import { supabase, AIBooking } from '../../lib/supabase'; 

export default function AIBookingsManager() {
  const [bookings, setBookings] = useState<AIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    setupRealtimeUpdates();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ai_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('ai_bookings_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ai_bookings'
      }, () => fetchBookings())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateStatus = async (id: string, newStatus: AIBooking['status']) => {
    try {
      const { error } = await supabase
        .from('ai_bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Bookings Manager</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Pickup</th>
              <th className="py-2 px-4 border-b">Dropoff</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Time</th>
              <th className="py-2 px-4 border-b">Passengers</th>
              <th className="py-2 px-4 border-b">Vehicle</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-4 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-xs text-gray-500">{booking.id.slice(0, 8)}...</td>
                  <td className="py-2 px-4 border-b">{booking.customer_name || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.customer_email || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.pickup_location || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.dropoff_location || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.booking_date || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.booking_time || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.passenger_count || '-'}</td>
                  <td className="py-2 px-4 border-b">{booking.vehicle_preference || '-'}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value as AIBooking['status'])}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
