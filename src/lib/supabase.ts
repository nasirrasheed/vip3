import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});



// Type definitions
export type Service = {
  id: string; 
  title: string;
  slug: string;
  description: string;
  short_description: string;
  icon?: string;
  image_url?: string;
  features?: string[];
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  author: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  client_initial: string;
  content: string;
  rating: number;
  service_type?: string;
  is_active: boolean;
  created_at?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  caption?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service_type?: string;
  preferred_date?: string;
  message: string;
  status: string;
  created_at?: string;
};

export type CompanyLogo = {
  id: string;
  name: string;
  logo_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
};

export type AIBooking = {
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
};

export type ChatConversation = {
  id: string;
  session_id: string;
  messages: { role: string; content: string }[];
  booking_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
};

// Enhanced helper functions with better logging
export const createAIBooking = async (bookingData: Omit<AIBooking, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('Attempting to create booking:', bookingData);
  
  try {
    const { data, error, status } = await supabase
      .from('ai_bookings')
      .insert([{
        ...bookingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    console.log('Insert status:', status);
    
    if (error) {
      console.error('Supabase insertion error:', error);
      throw error;
    }

    console.log('Booking created successfully:', data);
    return data?.[0];
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

export const createChatConversation = async (conversationData: Omit<ChatConversation, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([{
        ...conversationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error('Chat conversation error:', error);
      throw error;
    }
    return data?.[0];
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
};

export const updateChatConversation = async (sessionId: string, updates: Partial<ChatConversation>) => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Failed to update conversation:', error);
    throw error;
  }
};

// Add a function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('ai_bookings')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    return { connected: true, data };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return { connected: false, error };
  }
};
