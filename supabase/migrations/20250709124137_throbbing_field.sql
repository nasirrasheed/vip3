/*
  # VIP Transport and Security Database Schema

  1. New Tables
    - `services` - Transport and security services
    - `blog_posts` - Blog articles and insights
    - `testimonials` - Client testimonials
    - `gallery_images` - Gallery images organized by categories
    - `inquiries` - Contact form submissions

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

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

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

-- Insert VIP Transport and Security services
INSERT INTO services (title, slug, description, short_description, icon, order_index) VALUES
('Chauffeur Service', 'chauffeur-service', 'Professional chauffeur-driven transport for all occasions. Our experienced chauffeurs provide reliable, punctual service with immaculately maintained vehicles. Whether for business meetings, special events, or personal travel, we ensure a comfortable and professional journey every time.', 'Professional chauffeur-driven transport with experienced, uniformed drivers.', 'Car', 1),
('Airport Transfers', 'airport-transfers', 'Reliable airport transfer services with flight monitoring and meet & greet service. Our chauffeurs track your flight status and adjust pickup times accordingly, ensuring seamless arrivals and departures. We provide door-to-door service with luggage assistance and comfortable vehicles.', 'Reliable airport transfers with flight monitoring and meet & greet service.', 'Plane', 2),
('Wedding Transport', 'wedding-transport', 'Elegant wedding transport services to make your special day perfect. We coordinate with your wedding planner to ensure timely arrivals and provide beautifully presented vehicles with professional chauffeurs. Our service includes bridal party transport and guest shuttle services.', 'Elegant wedding transport with coordination and beautifully presented vehicles.', 'Heart', 3),
('Corporate Transport', 'corporate-transport', 'Executive transport solutions for business professionals and corporate events. We provide reliable, punctual service for board meetings, client entertainment, and corporate functions. Our professional chauffeurs understand the importance of discretion and punctuality in business settings.', 'Executive transport for business meetings and corporate events.', 'Briefcase', 4),
('Security Services', 'security-services', 'Professional security services including close protection and risk assessment. Our SIA-licensed security operatives provide comprehensive protection services tailored to individual client requirements. We offer both armed and unarmed security solutions with experienced personnel.', 'Professional security services with SIA-licensed operatives and risk assessment.', 'Shield', 5),
('Event Transport', 'event-transport', 'Specialized transport for premieres, galas, and exclusive events. Our team coordinates with event organizers to ensure seamless arrivals and departures. We provide red carpet service and can accommodate large groups with our fleet of luxury vehicles.', 'Specialized transport for premieres, galas, and exclusive events.', 'Calendar', 6);

-- Insert testimonials
INSERT INTO testimonials (client_name, client_initial, content, service_type, rating) VALUES
('Corporate Executive', 'J.M.', 'Outstanding professional service. The chauffeur was punctual, courteous, and maintained the highest standards throughout our business trip. Highly recommended for corporate transport needs.', 'Corporate Transport', 5),
('Wedding Client', 'S.K.', 'Perfect service for our wedding day. The coordination was flawless, the vehicle was immaculate, and the chauffeur made our special day even more memorable. Thank you for the exceptional service.', 'Wedding Transport', 5),
('Private Client', 'A.R.', 'Reliable and discreet service for our airport transfers. The flight monitoring and meet & greet service made our journey stress-free. Professional service that exceeded our expectations.', 'Airport Transfers', 5),
('Event Organizer', 'M.T.', 'Excellent coordination for our corporate event. The team managed multiple pickups seamlessly and all guests arrived on time. Professional service that we will definitely use again.', 'Event Transport', 5);

-- Insert blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, author, is_published) VALUES
('The Importance of Professional Chauffeur Services', 'importance-professional-chauffeur-services', 'Discover why professional chauffeur services are essential for business executives and discerning clients who value reliability, comfort, and discretion.', '<p>In today''s fast-paced business environment, professional chauffeur services have become an essential requirement for executives and discerning clients. The benefits extend far beyond simple transportation, offering a comprehensive solution that enhances productivity, ensures reliability, and maintains professional standards.</p><h2>Professional Standards and Training</h2><p>Professional chauffeurs undergo extensive training in customer service, route planning, and vehicle maintenance. They understand the importance of punctuality, discretion, and maintaining the highest standards of service delivery.</p><h2>Business Productivity</h2><p>With a professional chauffeur, business executives can utilize travel time productively, making calls, reviewing documents, or preparing for meetings while enjoying a comfortable and secure environment.</p><h2>Reliability and Peace of Mind</h2><p>Professional chauffeur services provide guaranteed reliability with backup vehicles and 24/7 support, ensuring that important appointments are never missed due to transport issues.</p>', 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg', 'Editorial Team', true),
('Airport Transfer Best Practices', 'airport-transfer-best-practices', 'Learn about the key elements that make airport transfers seamless, from flight monitoring to meet and greet services.', '<p>Effective airport transfers require careful planning, real-time monitoring, and professional execution. Understanding the best practices ensures a smooth and stress-free travel experience.</p><h2>Flight Monitoring Technology</h2><p>Modern airport transfer services utilize advanced flight tracking systems to monitor delays, gate changes, and arrival times, allowing for dynamic scheduling adjustments.</p><h2>Meet and Greet Services</h2><p>Professional meet and greet services include assistance with luggage, navigation through the airport, and escort to the waiting vehicle, providing a seamless transition from flight to ground transport.</p><h2>Route Planning and Traffic Management</h2><p>Experienced chauffeurs use real-time traffic data and alternative route planning to ensure timely arrivals, even during peak traffic periods.</p>', 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg', 'Editorial Team', true),
('Wedding Transport Planning Guide', 'wedding-transport-planning-guide', 'A comprehensive guide to planning wedding transport, ensuring your special day runs smoothly with professional chauffeur services.', '<p>Wedding transport planning requires careful coordination and attention to detail to ensure that your special day proceeds without any transportation-related stress.</p><h2>Timeline Coordination</h2><p>Successful wedding transport involves detailed timeline coordination with wedding planners, venues, and photographers to ensure all parties arrive at the right place at the right time.</p><h2>Vehicle Selection and Presentation</h2><p>Choosing the appropriate vehicle involves considering the wedding style, number of passengers, and venue requirements. Professional presentation includes vehicle decoration and chauffeur attire coordination.</p><h2>Backup Planning</h2><p>Professional wedding transport services always include backup vehicles and contingency plans to handle any unexpected situations that may arise on your wedding day.</p>', 'https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg', 'Editorial Team', true);

-- Insert gallery images
INSERT INTO gallery_images (title, description, image_url, category, caption, order_index) VALUES
('Professional Chauffeur Service', 'Executive chauffeur service in London', 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg', 'Chauffeur Services', 'Executive Service – Central London, 2024', 1),
('Airport Transfer Service', 'Professional airport transfer', 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg', 'Airport Transfers', 'Airport Transfer – Heathrow Terminal, 2024', 2),
('Wedding Transport', 'Elegant wedding transport service', 'https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg', 'Weddings', 'Wedding Service – London Venue, 2024', 3),
('Corporate Event', 'Corporate transport coordination', 'https://images.pexels.com/photos/1181348/pexels-photo-1181348.jpeg', 'Corporate Events', 'Corporate Event – City of London, 2024', 4),
('Security Service', 'Professional security escort', 'https://images.pexels.com/photos/1125328/pexels-photo-1125328.jpeg', 'Security Services', 'Security Detail – Central London, 2024', 5),
('Event Transport', 'Premium event transport service', 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg', 'Corporate Events', 'Premium Event – West London, 2024', 6);