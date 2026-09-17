-- Database Schema for Bus Booking System
-- Updated for bus_booking_db

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('PASSENGER', 'ADMIN') NOT NULL DEFAULT 'PASSENGER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buses Table
CREATE TABLE IF NOT EXISTS buses (
    bus_id INT PRIMARY KEY AUTO_INCREMENT,
    bus_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    bus_type ENUM('AC', 'Non-AC', 'Luxury') NOT NULL,
    operator_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(user_id)
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    user_id INT NOT NULL,
    seat_number INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('CONFIRMED', 'CANCELLED', 'PENDING') DEFAULT 'PENDING',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY unique_booking (route_id, seat_number)
);

-- Sample Data
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@busapp.com', 'admin123', 'ADMIN'),
('John Passenger', 'john@busapp.com', 'pass123', 'PASSENGER');

INSERT INTO buses (bus_name, bus_number, total_seats, available_seats, bus_type, operator_id) VALUES 
('Express 01', 'AP-01-AB-1234', 42, 42, 'AC', 1),
('Deluxe 02', 'AP-02-AB-5678', 35, 35, 'Luxury', 1),
('Economy 03', 'AP-03-AB-9012', 50, 50, 'Non-AC', 1);

INSERT INTO routes (bus_id, source, destination, departure_time, arrival_time, fare) VALUES 
(1, 'Hyderabad', 'Bangalore', '2026-05-20 06:00:00', '2026-05-20 14:00:00', 500),
(2, 'Hyderabad', 'Chennai', '2026-05-20 08:00:00', '2026-05-20 18:00:00', 700),
(3, 'Bangalore', 'Hyderabad', '2026-05-20 10:00:00', '2026-05-20 18:00:00', 500);

-- Create Indexes for Performance
CREATE INDEX idx_routes_source_dest ON routes(source, destination);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_route ON bookings(route_id);

-- Verify Installation
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM buses;
SELECT * FROM routes;
