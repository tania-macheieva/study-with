-- Створення таблиці користувачів
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_password TEXT NOT NULL,
  phone_number VARCHAR(15),
  role VARCHAR(50) CHECK (role IN ('student', 'teacher')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Створення таблиці викладачів
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dob DATE,
    gender VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    phone_number VARCHAR(15),
    zip_code VARCHAR(20),
    specialty VARCHAR(255),
    professional_experience DATE,
    about TEXT,
    certificates BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці студентів
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    phone_number VARCHAR(15),
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці категорій
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
Створення таблиці рівнів освіти
CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE all_courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    author_id INT NOT NULL,
    price NUMERIC(10, 2),
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(1024),
    education_level_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_education_level FOREIGN KEY (education_level_id) REFERENCES education_levels(id) ON DELETE SET NULL
);




CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Створення таблиці зв'язку курсів і тегів
CREATE TABLE course_tags (
    course_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES all_courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Створення таблиці збережених курсів
CREATE TABLE saved_courses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES all_courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);

-- Створення таблиці модулів
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES all_courses(id) ON DELETE CASCADE
);

-- Створення таблиці лекцій
CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Створення таблиці файлів лекцій
CREATE TABLE lecture_files (
    id SERIAL PRIMARY KEY,
    lecture_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);