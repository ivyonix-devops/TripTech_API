CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  role ENUM('logistics', 'owner', 'vendor', 'driver', 'admin') NOT NULL,
  status ENUM('Pending', 'Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Pending',
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invitation_id VARCHAR(100) NOT NULL UNIQUE,
  request_id VARCHAR(100) UNIQUE,
  invitation_type ENUM('TO', 'VENDOR', 'LOGISTICS_COORDINATOR') NOT NULL,
  from_user_id INT,
  from_role VARCHAR(50),
  to_email VARCHAR(255),
  to_role VARCHAR(50),
  lc_name VARCHAR(255),
  lc_company_name VARCHAR(255),
  to_name VARCHAR(255),
  vendor_name VARCHAR(255),
  send_to ENUM('TO', 'VENDOR', 'BOTH'),
  manual_entry BOOLEAN,
  status ENUM('Request_Sent', 'Accepted', 'Rejected', 'Pending') NOT NULL DEFAULT 'Pending',
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_date TIMESTAMP,
  response_notes TEXT,
  FOREIGN KEY (from_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS registration_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255),
  role VARCHAR(50),
  status VARCHAR(50),
  registration_type ENUM('Self_Registration', 'Manual_Entry', 'Invite_Based'),
  username_generated VARCHAR(100),
  password_generated BOOLEAN,
  ip_address VARCHAR(45),
  user_agent TEXT,
  activation_token VARCHAR(255),
  activation_sent BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  license_plate VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INT,
  vehicle_class VARCHAR(100),
  vendor_id INT,
  seating_capacity INT,
  status ENUM('Active', 'Inactive', 'Maintenance') NOT NULL DEFAULT 'Inactive',
  assigned_driver_id INT,
  vin VARCHAR(100),
  fuel_type VARCHAR(50),
  registration_date DATE,
  registration_expiry DATE,
  insurance_expiry DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  license_number VARCHAR(100) NOT NULL UNIQUE,
  license_expiry DATE,
  license_class VARCHAR(50),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_vehicle_id INT,
  assigned_trip_id INT,
  date_of_birth DATE,
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS trip_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  type VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Inactive',
  postal_code VARCHAR(20),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id VARCHAR(50) NOT NULL UNIQUE,
  origin_location VARCHAR(255),
  destination_location VARCHAR(255),
  scheduled_date DATE,
  scheduled_time TIME,
  estimated_duration INT,
  distance_km DECIMAL(10, 2),
  status ENUM('Draft', 'Confirmed', 'In_Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft',
  trip_owner_id INT,
  vendor_id INT,
  vehicle_id INT,
  driver_id INT,
  passengers_count INT,
  cargo_details TEXT,
  cargo_weight DECIMAL(10, 2),
  special_requirements TEXT,
  trip_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_owner_id) REFERENCES trip_owners(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trip_costs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  cost_type VARCHAR(100),
  description TEXT,
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_incharges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  coordinator_id INT,
  responsibility TEXT,
  contact_person VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS operations_team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(100),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS owner_operations_team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES trip_owners(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_type VARCHAR(255) NOT NULL,
  trip_name VARCHAR(255) NOT NULL,
  triptype_status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  triptype_remarks TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

