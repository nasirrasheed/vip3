/*
  # Create initial schema for luxury transport website

  1. New Tables
    - `services` - Transport and security services
    - `blog_posts` - Blog articles and insights
    - `testimonials` - Client testimonials
    - `gallery_images` - Gallery images organized by categories
    - `inquiries` - Contact form submissions
    - `admin_users` - Admin panel users

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access and public read access
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text NOT NULL,
  icon text,
  image_url text,
  features text[],
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image_url text,
  author text DEFAULT 'Editorial Team',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_initial text NOT NULL,
  content text NOT NULL,
  rating integer DEFAULT 5,
  service_type text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  caption text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text,
  preferred_date text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Public can read active gallery images"
  ON gallery_images FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Public can create inquiries"
  ON inquiries FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin policies (for authenticated users)
CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage gallery images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (true);

-- Insert default services
INSERT INTO services (title, slug, description, short_description, icon, order_index) VALUES
('Wedding Chauffeur', 'wedding-chauffeur', 'We understand that your wedding is one of the most important days of your life. Our chauffeur-driven service offers smooth, discreet, and elegant transport tailored to your day. Every journey is meticulously planned for timing, comfort, and presentation.', 'Elegant wedding transport with professional chauffeurs for your special day.', 'Heart', 1),
('Airport Transfers', 'airport-transfers', 'Professional airport transfer services ensuring punctual arrivals and departures. Our experienced chauffeurs monitor flight schedules and provide seamless door-to-door service with complete discretion.', 'Reliable airport transfers with flight monitoring and meet & greet service.', 'Plane', 2),
('Corporate Travel', 'corporate-travel', 'Executive transport solutions for business professionals. From board meetings to client entertainment, our service ensures you arrive refreshed and on schedule with complete confidentiality.', 'Executive transport for business meetings and corporate events.', 'Briefcase', 3),
('Event Transport', 'event-transport', 'Specialist transport for premieres, galas, and exclusive events. Our team coordinates with event organizers to ensure seamless arrivals and departures with appropriate security protocols.', 'Seamless transport for premieres, galas, and exclusive events.', 'Calendar', 4),
('VIP & Celebrity Transport', 'vip-celebrity-transport', 'Discreet transport services for high-profile clients requiring enhanced privacy and security. Our vetted chauffeurs are trained in confidentiality protocols and emergency procedures.', 'Discreet transport for high-profile clients with enhanced security.', 'Star', 5),
('Close Protection Services', 'close-protection-services', 'Professional security services providing personal protection and risk assessment. Our SIA-licensed operatives offer comprehensive security solutions tailored to individual client requirements.', 'Professional close protection and security services by SIA-licensed operatives.', 'Shield', 6);

-- Insert default testimonials
INSERT INTO testimonials (client_name, client_initial, content, service_type) VALUES
('Anonymous Client', 'A.M.', 'Exceptional service from start to finish. The chauffeur was punctual, professional, and maintained complete discretion throughout our journey.', 'VIP Transport'),
('Business Executive', 'J.K.', 'Outstanding corporate transport service. The attention to detail and reliability exceeded our expectations for such an important client meeting.', 'Corporate Travel'),
('Wedding Client', 'S.R.', 'Made our wedding day perfect with seamless transport coordination. The vehicle was immaculate and the service was flawless.', 'Wedding Chauffeur');

-- Insert default gallery images
INSERT INTO gallery_images (title, description, image_url, category, caption, order_index) VALUES
('Wedding Arrival', 'Professional wedding transport service', 'https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg', 'Weddings', 'Client Arrival – London Wedding Venue, 2024', 1),
('Airport Transfer', 'Executive airport transfer service', 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg', 'Airport Transfers', 'Executive Transfer – Heathrow Airport, 2024', 2),
('Corporate Event', 'Corporate transport service', 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg', 'Corporate & Red Carpet Events', 'Corporate Event – City of London, 2024', 3),
('Security Escort', 'Professional security escort service', 'https://images.pexels.com/photos/1181348/pexels-photo-1181348.jpeg', 'Security Escorts', 'Security Detail – Central London, 2024', 4);