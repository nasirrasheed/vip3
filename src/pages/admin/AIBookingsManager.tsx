import { useEffect, useState } from 'react';
import { supabase, AIBooking } from '../lib/supabase';

export default function AIBookingAssistant() {
  const [bookings, setBookings] = useState<AIBooking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('ai_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data);
    }
  };

  return (
    <div>
      <h1>AI Bookings</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pickup</th>
            <th>Dropoff</th>
            <th>Date</th>
            <th>Time</th>
            <th>Passengers</th>
            <th>Vehicle</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{booking.customer_name}</td>
              <td>{booking.pickup_location}</td>
              <td>{booking.dropoff_location}</td>
              <td>{booking.booking_date}</td>
              <td>{booking.booking_time}</td>
              <td>{booking.number_of_passengers}</td>
              <td>{booking.vehicle_type}</td>
              <td>{booking.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
