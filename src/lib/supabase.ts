import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  client_initial: string;
  content: string;
  rating: number;
  service_type?: string;
  is_active: boolean;
  created_at: string;
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
  created_at: string;
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
  created_at: string;
};