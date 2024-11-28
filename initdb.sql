CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_password TEXT NOT NULL,
  phone_number VARCHAR(15),
  role VARCHAR(50) CHECK (role IN ('student', 'teacher')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name, email, user_password, phone_number, role) VALUES
  ('John Doe', 'john@example.com', 'test1234', '+380685671890', 'teacher'),
  ('Jane Smith', 'jane@example.com', 'test5678', '+380976544121', 'student');