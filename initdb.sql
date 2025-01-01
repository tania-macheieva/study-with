CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_password TEXT NOT NULL,
  phone_number VARCHAR(15),
  role VARCHAR(50) CHECK (role IN ('student', 'teacher')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Зв'язок із таблицею users
    dob DATE,                          -- Дата народження
    gender VARCHAR(50),                -- Стать
    country VARCHAR(100),              -- Країна
    city VARCHAR(100),                 -- Місто
    phone_number VARCHAR(15),
    zip_code VARCHAR(20),              -- Поштовий індекс
    specialty VARCHAR(255),            -- Спеціалізація
    professional_experience DATE,      -- Дата початку професійної діяльності
    about TEXT,                        -- Коротка інформація
    certificates BYTEA,                -- Сертифікати у форматі BLOB
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Зв'язок із таблицею users
    date_of_birth DATE,
    class VARCHAR(50), -- Наприклад, "10A" або "11B"
    phone_number VARCHAR(15),
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name, email, user_password, phone_number, role) VALUES
  ('John Doe', 'john@example.com', 'test1234', '+380685671890', 'teacher'),
  ('Jane Smith', 'jane@example.com', 'test5678', '+380976544121', 'student');

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,        
    name VARCHAR(50) UNIQUE NOT NULL 
);

CREATE TABLE all_courses (
    id SERIAL PRIMARY KEY,              
    name VARCHAR(100) NOT NULL,         
    author_id INT NOT NULL,             
    price NUMERIC(10, 2),               
    description TEXT NOT NULL,                   
    category_id INT NOT NULL, 
    image_url VARCHAR(1024),           
    CONSTRAINT fk_author
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE saved_courses (
    id SERIAL PRIMARY KEY,                 
    user_id INT NOT NULL,                 
    course_id INT NOT NULL, 
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_course
        FOREIGN KEY (course_id) REFERENCES all_courses (id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)           
);
