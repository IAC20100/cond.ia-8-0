-- Execute este script no SQL Editor do Supabase para criar todas as tabelas necessárias.

-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. company_settings
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  document TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  signature_url TEXT,
  theme TEXT DEFAULT 'light',
  menu_order JSONB,
  tile_sizes JSONB,
  tile_order JSONB,
  hidden_tiles JSONB,
  font_size INTEGER DEFAULT 16,
  energy_data JSONB
);

-- 2. clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  locations JSONB,
  tower TEXT,
  unit TEXT,
  vehicles TEXT,
  pets TEXT,
  cistern_volume NUMERIC,
  reservoir_volume NUMERIC
);

-- 3. tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_number TEXT,
  title TEXT,
  type TEXT,
  status TEXT,
  maintenance_category TEXT,
  maintenance_subcategory TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE,
  technician TEXT,
  observations TEXT,
  color TEXT,
  reported_by TEXT,
  location TEXT,
  photo_before TEXT,
  budget_amount NUMERIC,
  budget_approved BOOLEAN,
  reported_problem TEXT,
  products_for_quote TEXT,
  service_report TEXT,
  checklist_results JSONB,
  images JSONB,
  history JSONB
);

-- 4. products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  unit TEXT
);

-- 5. quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE,
  items JSONB,
  total_value NUMERIC,
  status TEXT
);

-- 6. receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE,
  value NUMERIC,
  description TEXT
);

-- 7. costs
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT,
  value NUMERIC,
  date TIMESTAMP WITH TIME ZONE,
  category TEXT
);

-- 8. appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  type TEXT,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  notes TEXT
);

-- 9. checklist_items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task TEXT,
  category TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_ids JSONB
);

-- 10. suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  contact TEXT,
  phone TEXT,
  email TEXT,
  category TEXT
);

-- 11. supply_items
CREATE TABLE IF NOT EXISTS supply_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  category TEXT,
  current_stock NUMERIC,
  min_stock NUMERIC,
  unit TEXT,
  last_price NUMERIC,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL
);

-- 12. payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC,
  due_date TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  reference TEXT
);

-- 13. legal_agreements
CREATE TABLE IF NOT EXISTS legal_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  total_amount NUMERIC,
  installments INTEGER,
  remaining_installments INTEGER,
  status TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 14. scheduled_maintenances
CREATE TABLE IF NOT EXISTS scheduled_maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  standard_id TEXT,
  item TEXT,
  frequency TEXT,
  last_done TIMESTAMP WITH TIME ZONE,
  next_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  category TEXT
);

-- 15. consumption_readings
CREATE TABLE IF NOT EXISTS consumption_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT,
  previous_value NUMERIC,
  current_value NUMERIC,
  consumption NUMERIC,
  date TIMESTAMP WITH TIME ZONE,
  unit TEXT,
  billed BOOLEAN
);

-- 16. assemblies
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  options JSONB,
  votes JSONB,
  legal_validity_hash TEXT
);

-- 17. notices
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  content TEXT,
  date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tower TEXT,
  apartment_line TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE
);

-- 18. packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_name TEXT,
  apartment TEXT,
  tower TEXT,
  carrier TEXT,
  tracking_code TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  qr_code TEXT,
  photo_url TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL
);

-- 19. visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  document TEXT,
  type TEXT,
  apartment TEXT,
  tower TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  qr_code TEXT,
  status TEXT
);

-- 20. critical_events
CREATE TABLE IF NOT EXISTS critical_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device TEXT,
  location TEXT,
  type TEXT,
  status TEXT,
  last_update TIMESTAMP WITH TIME ZONE,
  description TEXT
);

-- 21. digital_folder
CREATE TABLE IF NOT EXISTS digital_folder (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE,
  amount NUMERIC,
  file_url TEXT,
  status TEXT,
  signatures JSONB
);

-- 22. supply_quotations
CREATE TABLE IF NOT EXISTS supply_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE,
  items JSONB,
  responses JSONB,
  status TEXT
);

-- 23. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  message TEXT,
  date TIMESTAMP WITH TIME ZONE,
  read BOOLEAN,
  type TEXT,
  link TEXT
);

-- 24. savings_goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  target_amount NUMERIC,
  current_amount NUMERIC,
  deadline TIMESTAMP WITH TIME ZONE,
  category TEXT,
  icon TEXT,
  status TEXT
);

-- 25. document_templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  category TEXT,
  description TEXT,
  legal_basis TEXT,
  content TEXT,
  file_url TEXT
);

-- 26. contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  category TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  value NUMERIC,
  payment_frequency TEXT,
  status TEXT,
  notes TEXT,
  file_url TEXT,
  alert_days INTEGER,
  alert_enabled BOOLEAN
);

-- 27. system_users
CREATE TABLE IF NOT EXISTS system_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);

-- 28. renovations
CREATE TABLE IF NOT EXISTS renovations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  art_file_url TEXT,
  technician_name TEXT
);

-- 29. moves
CREATE TABLE IF NOT EXISTS moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  status TEXT,
  notes TEXT
);

-- 30. billing_rules
CREATE TABLE IF NOT EXISTS billing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  days_before_due JSONB,
  days_after_due JSONB,
  message_template TEXT,
  active BOOLEAN
);

-- 31. budget_forecasts
CREATE TABLE IF NOT EXISTS budget_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE,
  month TEXT,
  monthly_projections JSONB,
  categories JSONB,
  insights JSONB,
  confidence NUMERIC
);

-- 32. feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  location_id TEXT,
  rating INTEGER,
  comment TEXT,
  user_name TEXT,
  date TIMESTAMP WITH TIME ZONE
);

-- 33. reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  area_name TEXT,
  date TIMESTAMP WITH TIME ZONE,
  start_time TEXT,
  end_time TEXT,
  status TEXT,
  notes TEXT
);

-- 34. staff
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  role TEXT,
  phone TEXT,
  email TEXT,
  shift TEXT,
  status TEXT
);

-- 35. keys
CREATE TABLE IF NOT EXISTS keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_name TEXT,
  location TEXT,
  status TEXT,
  borrowed_by TEXT,
  borrowed_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE
);

-- 36. classifieds
CREATE TABLE IF NOT EXISTS classifieds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  price NUMERIC,
  category TEXT,
  author_id TEXT,
  author_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  images JSONB,
  status TEXT
);

-- 37. lost_and_found
CREATE TABLE IF NOT EXISTS lost_and_found (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  location TEXT,
  date_found TIMESTAMP WITH TIME ZONE,
  status TEXT,
  images JSONB,
  reporter_id TEXT,
  reporter_name TEXT,
  returned_to TEXT,
  returned_at TIMESTAMP WITH TIME ZONE
);

-- Inserir configurações iniciais
INSERT INTO company_settings (name, theme) VALUES ('CONDFY.IA', 'light') ON CONFLICT DO NOTHING;
