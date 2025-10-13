USE rms;

INSERT INTO users (name, email, role, dept) VALUES
('Admin User','admin@inst.edu','ADMIN','Admin'),
('Faculty One','fac1@inst.edu','FACULTY','CSE'),
('Student One','stu1@inst.edu','STUDENT','CSE');

INSERT INTO resources (name, location, capacity, equipment, restricted) VALUES
('Room A','Block 1',20, JSON_ARRAY('projector','whiteboard'), 0),
('Room B','Block 1',40, JSON_ARRAY('whiteboard'), 0),
('Lab Linux','Block 2',30, JSON_ARRAY('pcs','projector'), 1);
