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
    image_url VARCHAR(1024), --прев'ю курсу
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
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


CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_num INT NOT NULL,  -- порядок модуля в курсі
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES all_courses (id) ON DELETE CASCADE
);

CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,  -- текст лекції або посилання на відео
    order_num INT NOT NULL,  -- порядок лекції в модулі
    CONSTRAINT fk_module FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
);

CREATE TABLE lecture_files (
    id SERIAL PRIMARY KEY,              
    lecture_id INT NOT NULL,             
    file_name VARCHAR(255) NOT NULL,     
    file_url VARCHAR(1024) NOT NULL,     
    file_type VARCHAR(50),             
    CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE  
);
