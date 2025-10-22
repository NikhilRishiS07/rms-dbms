-- Insert Users
INSERT INTO Users (name, email, pwd_hash, role) VALUES
('Alice Johnson', 'alice@example.com', '123', 'Admin'),
('Bob Smith', 'bob@example.com', '123', 'Faculty'),
('Carol Lee', 'carol@example.com', '123', 'Staff'),
('David Kim', 'david@example.com', '123', 'Student');

-- Insert Resources
INSERT INTO Resources (name, status, capacity, availability_start, availability_end, equipment, location) VALUES
('Lecture Hall 101', 'Available', 100, '08:00:00', '18:00:00', 'Projector, Sound System', 'Building A'),
('Computer Lab 203', 'Available', 30, '09:00:00', '17:00:00', 'Computers, Printers', 'Building B'),
('Conference Room 1', 'Unavailable', 50, '08:30:00', '16:30:00', 'Video Conferencing', 'Building C');

-- Insert Used_By associations
INSERT INTO Used_By (user_id, resource_id) VALUES
(1, 1),  -- Alice uses Lecture Hall 101
(2, 2),  -- Bob uses Computer Lab 203
(3, 2),  -- Carol also uses Computer Lab 203
(4, 1);  -- David uses Lecture Hall 101

-- Insert Bookings (make sure to use correct user_id, resource_id pairs)
INSERT INTO Bookings (start_time, end_time, user_id, resource_id, status) VALUES
('2025-10-23 09:00:00', '2025-10-23 11:00:00', 1, 1, 'Booked'),
('2025-10-23 13:00:00', '2025-10-23 15:00:00', 2, 2, 'Booked'),
('2025-10-24 10:00:00', '2025-10-24 12:00:00', 4, 1, 'Cancelled');
