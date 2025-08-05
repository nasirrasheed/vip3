import { useEffect, useState } from 'react';
import { supabase, AIBooking } from '../../lib/supabase'; 

export default function AIBookingsManager() {
  const [bookings, setBookings] = useState<AIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      if (error) throw error;
      console.log('Status updated successfully');
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
      
      <div className="mb-4">
        <button 
          onClick={fetchBookings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Bookings
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          {/* ... rest of your table code remains the same ... */}
        </table>
      </div>
    </div>
  );
}
