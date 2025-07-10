/*
  # Complete VIP Transport and Security Database Setup

  1. New Tables
    - `services` - Transport and security services
    - `blog_posts` - Blog articles and insights  
    - `testimonials` - Client testimonials
    - `gallery_images` - Gallery images organized by categories
    - `inquiries` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access and public read access

  3. Sample Data
    - Insert default services, testimonials, blog posts, and gallery images
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;

-- Services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text NOT NULL,
  icon text DEFAULT 'Car',
  image_url text,
  features text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE blog_posts (
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
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_initial text NOT NULL,
  content text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  service_type text,
  is_active boolean DEFAULT true,
  status text DEFAULT 'approved',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Gallery images table
CREATE TABLE gallery_images (
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
CREATE TABLE inquiries (
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

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND status = 'approved');

CREATE POLICY "Public can read active gallery images"
  ON gallery_images FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can create inquiries"
  ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can submit testimonials"
  ON testimonials FOR INSERT
  TO anon, authenticated
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

CREATE POLICY "Authenticated users can manage inquiries"
  ON inquiries FOR ALL
  TO authenticated
  USING (true);

-- Insert default services
INSERT INTO services (title, slug, description, short_description, icon, features, order_index) VALUES
('Chauffeur Service', 'chauffeur-service', 
'Professional chauffeur-driven transport for all occasions. Our experienced chauffeurs provide reliable, punctual service with immaculately maintained vehicles. Whether for business meetings, special events, or personal travel, we ensure a comfortable and professional journey every time. Our chauffeurs are fully licensed, uniformed professionals with extensive local knowledge and customer service expertise.',
'Professional chauffeur-driven transport with experienced, uniformed drivers.',
'Car',
ARRAY['Immaculately presented vehicles', 'Professional uniformed chauffeurs', 'On-time arrival guarantee', 'Privacy glass and climate control', 'Complete discretion at all times', 'Professional service standards'],
1),

('Airport Transfers', 'airport-transfers',
'Reliable airport transfer services with flight monitoring and meet & greet service. Our chauffeurs track your flight status and adjust pickup times accordingly, ensuring seamless arrivals and departures. We provide door-to-door service with luggage assistance and comfortable vehicles. Real-time flight monitoring ensures we are always ready for your arrival.',
'Reliable airport transfers with flight monitoring and meet & greet service.',
'Plane',
ARRAY['Flight monitoring and tracking', 'Meet and greet service', 'Luggage assistance', 'Door-to-door service', 'Real-time schedule adjustments', 'Comfortable waiting areas'],
2),

('Wedding Transport', 'wedding-transport',
'Elegant wedding transport services to make your special day perfect. We coordinate with your wedding planner to ensure timely arrivals and provide beautifully presented vehicles with professional chauffeurs. Our service includes bridal party transport and guest shuttle services. Every detail is carefully planned to complement your special day.',
'Elegant wedding transport with coordination and beautifully presented vehicles.',
'Heart',
ARRAY['Wedding day coordination', 'Beautifully presented vehicles', 'Bridal party transport', 'Guest shuttle services', 'Timeline coordination', 'Professional wedding chauffeurs'],
3),

('Corporate Transport', 'corporate-transport',
'Executive transport solutions for business professionals and corporate events. We provide reliable, punctual service for board meetings, client entertainment, and corporate functions. Our professional chauffeurs understand the importance of discretion and punctuality in business settings. Perfect for executive travel and corporate hospitality.',
'Executive transport for business meetings and corporate events.',
'Briefcase',
ARRAY['Executive vehicle selection', 'Business-focused service', 'Punctuality guarantee', 'Discretion and confidentiality', 'Corporate account management', 'Professional presentation'],
4),

('Security Services', 'security-services',
'Professional security services including close protection and risk assessment. Our SIA-licensed security operatives provide comprehensive protection services tailored to individual client requirements. We offer both armed and unarmed security solutions with experienced personnel trained in threat assessment and emergency response.',
'Professional security services with SIA-licensed operatives and risk assessment.',
'Shield',
ARRAY['SIA-licensed operatives', 'Close protection services', 'Risk assessment', 'Emergency response training', 'Threat evaluation', 'Comprehensive security solutions'],
5),

('Event Transport', 'event-transport',
'Specialized transport for premieres, galas, and exclusive events. Our team coordinates with event organizers to ensure seamless arrivals and departures. We provide red carpet service and can accommodate large groups with our fleet of luxury vehicles. Perfect for high-profile events requiring professional coordination.',
'Specialized transport for premieres, galas, and exclusive events.',
'Calendar',
ARRAY['Event coordination', 'Red carpet service', 'Large group accommodation', 'Luxury vehicle fleet', 'Professional event management', 'Seamless logistics'],
6);

-- Insert testimonials
INSERT INTO testimonials (client_name, client_initial, content, service_type, rating, status) VALUES
('Corporate Executive', 'J.M.', 
'Outstanding professional service. The chauffeur was punctual, courteous, and maintained the highest standards throughout our business trip. The vehicle was immaculate and the service exceeded our expectations. Highly recommended for corporate transport needs.',
'Corporate Transport', 5, 'approved'),

('Wedding Client', 'S.K.', 
'Perfect service for our wedding day. The coordination was flawless, the vehicle was beautifully presented, and the chauffeur made our special day even more memorable. Every detail was handled professionally and we could not have asked for better service.',
'Wedding Transport', 5, 'approved'),

('Private Client', 'A.R.', 
'Reliable and discreet service for our airport transfers. The flight monitoring and meet & greet service made our journey completely stress-free. Professional service that exceeded our expectations and we will definitely use again.',
'Airport Transfers', 5, 'approved'),

('Event Organizer', 'M.T.', 
'Excellent coordination for our corporate event. The team managed multiple pickups seamlessly and all guests arrived on time. The level of professionalism and attention to detail was outstanding. We will definitely use their services again.',
'Event Transport', 5, 'approved'),

('Business Client', 'D.L.',
'Exceptional chauffeur service for our important client meetings. The punctuality, vehicle presentation, and professional demeanor of the chauffeur reflected perfectly on our business. This is the standard we expect and VIP Transport delivered.',
'Chauffeur Service', 5, 'approved');

-- Insert blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, author, is_published) VALUES
('The Importance of Professional Chauffeur Services', 'importance-professional-chauffeur-services',
'Discover why professional chauffeur services are essential for business executives and discerning clients who value reliability, comfort, and discretion.',
'<h2>Professional Standards and Training</h2><p>In today''s fast-paced business environment, professional chauffeur services have become an essential requirement for executives and discerning clients. The benefits extend far beyond simple transportation, offering a comprehensive solution that enhances productivity, ensures reliability, and maintains professional standards.</p><p>Professional chauffeurs undergo extensive training in customer service, route planning, and vehicle maintenance. They understand the importance of punctuality, discretion, and maintaining the highest standards of service delivery. This training ensures that every journey meets the exacting standards expected by our clients.</p><h2>Business Productivity</h2><p>With a professional chauffeur, business executives can utilize travel time productively, making calls, reviewing documents, or preparing for meetings while enjoying a comfortable and secure environment. This transforms travel time from lost productivity into valuable working time.</p><h2>Reliability and Peace of Mind</h2><p>Professional chauffeur services provide guaranteed reliability with backup vehicles and 24/7 support, ensuring that important appointments are never missed due to transport issues. This reliability is essential for business success and personal peace of mind.</p>',
'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg',
'Editorial Team', true),

('Airport Transfer Best Practices', 'airport-transfer-best-practices',
'Learn about the key elements that make airport transfers seamless, from flight monitoring to meet and greet services.',
'<h2>Flight Monitoring Technology</h2><p>Effective airport transfers require careful planning, real-time monitoring, and professional execution. Understanding the best practices ensures a smooth and stress-free travel experience for all our clients.</p><p>Modern airport transfer services utilize advanced flight tracking systems to monitor delays, gate changes, and arrival times, allowing for dynamic scheduling adjustments. This technology ensures that our chauffeurs are always ready when you need them.</p><h2>Meet and Greet Services</h2><p>Professional meet and greet services include assistance with luggage, navigation through the airport, and escort to the waiting vehicle, providing a seamless transition from flight to ground transport. Our chauffeurs are trained to provide discrete assistance while maintaining professional standards.</p><h2>Route Planning and Traffic Management</h2><p>Experienced chauffeurs use real-time traffic data and alternative route planning to ensure timely arrivals, even during peak traffic periods. This expertise is essential for maintaining schedules and ensuring punctual arrivals.</p>',
'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg',
'Editorial Team', true),

('Wedding Transport Planning Guide', 'wedding-transport-planning-guide',
'A comprehensive guide to planning wedding transport, ensuring your special day runs smoothly with professional chauffeur services.',
'<h2>Timeline Coordination</h2><p>Wedding transport planning requires careful coordination and attention to detail to ensure that your special day proceeds without any transportation-related stress. Professional planning makes all the difference.</p><p>Successful wedding transport involves detailed timeline coordination with wedding planners, venues, and photographers to ensure all parties arrive at the right place at the right time. This coordination is essential for a smooth wedding day experience.</p><h2>Vehicle Selection and Presentation</h2><p>Choosing the appropriate vehicle involves considering the wedding style, number of passengers, and venue requirements. Professional presentation includes vehicle decoration and chauffeur attire coordination to complement your wedding theme.</p><h2>Backup Planning</h2><p>Professional wedding transport services always include backup vehicles and contingency plans to handle any unexpected situations that may arise on your wedding day. This preparation ensures that nothing can disrupt your special day.</p>',
'https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg',
'Editorial Team', true);

-- Insert gallery images
INSERT INTO gallery_images (title, description, image_url, category, caption, order_index) VALUES
('Professional Chauffeur Service', 'Executive chauffeur service in Central London', 
'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg', 
'Chauffeur Services', 'Executive Service – Central London, 2024', 1),

('Airport Transfer Service', 'Professional airport transfer at Heathrow', 
'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg', 
'Airport Transfers', 'Airport Transfer – Heathrow Terminal, 2024', 2),

('Wedding Transport', 'Elegant wedding transport service', 
'https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg', 
'Weddings', 'Wedding Service – London Venue, 2024', 3),

('Corporate Event', 'Corporate transport coordination', 
'https://images.pexels.com/photos/1181348/pexels-photo-1181348.jpeg', 
'Corporate Events', 'Corporate Event – City of London, 2024', 4),

('Security Service', 'Professional security escort service', 
'https://images.pexels.com/photos/1125328/pexels-photo-1125328.jpeg', 
'Security Services', 'Security Detail – Central London, 2024', 5),

('Event Transport', 'Premium event transport service', 
'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg', 
'Corporate Events', 'Premium Event – West London, 2024', 6);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active, status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);