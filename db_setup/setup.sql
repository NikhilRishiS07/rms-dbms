-- Create the database
CREATE DATABASE IF NOT EXISTS RMS;

-- Select the database
USE RMS;

-------------------------------------------------
-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Faculty', 'Staff', 'Student') NOT NULL
);

-------------------------------------------------
-- Resources Table
CREATE TABLE Resources (
    resource_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    status ENUM('Available', 'Unavailable') DEFAULT 'Available',
    capacity INT NOT NULL,
    availability_start TIME NOT NULL,
    availability_end TIME NOT NULL,
    equipment VARCHAR(255),
    location VARCHAR(255)
);

-------------------------------------------------
-- Used_By Junction Table (explicit link between Users and Resources)
CREATE TABLE Used_By (
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    PRIMARY KEY (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES Resources(resource_id) ON DELETE CASCADE
);

-------------------------------------------------
-- Bookings Table references Used_By via (user_id, resource_id)
CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    status ENUM('Booked', 'Cancelled', 'Completed') DEFAULT 'Booked',
    FOREIGN KEY (user_id, resource_id) REFERENCES Used_By(user_id, resource_id) ON DELETE CASCADE
);
