-- Створення таблиці користувачів
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_password TEXT NOT NULL,
  phone_number VARCHAR(30),
  role VARCHAR(50) CHECK (role IN ('student', 'teacher')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  profile_image VARCHAR(255) DEFAULT '/images/user-avatar.png',
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE
);
-- ADD COLUMN profile_image VARCHAR(255) DEFAULT '/images/user-avatar.png';



-- Створення таблиці викладачів
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(150),
    dob DATE,
    gender VARCHAR(50), 
    country VARCHAR(100),
    city VARCHAR(100),
    phone_number VARCHAR(30),
    zip_code VARCHAR(20),
    specialty VARCHAR(255),
    professional_experience DATE,
    experience TEXT,
    about TEXT,
    education TEXT,
    hobbies TEXT,
    language TEXT,
    certificates BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_stripe_account VARCHAR(255)
);

-- UPDATE teachers
-- SET author_stripe_account = 'acct_1QbnQ7GXqLYAoPtN'
-- WHERE id = 1;

-- Створення таблиці студентів
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(150) ,
    date_of_birth DATE,
    phone_number VARCHAR(30),
    additional_info TEXT,
    profile_image VARCHAR(255) DEFAULT '/images/user-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- -- якщо вже стовпець є і треба змінити
-- ALTER TABLE students
-- ALTER COLUMN profile_image SET DEFAULT '/images/user-avatar.png';

-- UPDATE students
-- SET profile_image = '/images/user-avatar.png'
-- WHERE id = 1;


-- Створення таблиці категорій
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (id, name) VALUES
(1, 'Programming'),
(2, 'Design'),
(3, 'Marketing'),
(4, 'Business'),
(5, 'Languages'),
(6, 'Finance'),
(7, 'Personal Development'),
(8, 'Art'),
(9, 'Psychology'),
(10, 'Health'),
(11, 'Cooking'),
(12, 'Science'),
(13, 'Game Development'),
(14, 'Childcare');

-- Створення таблиці рівнів освіти
CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);


INSERT INTO education_levels (id, name, description) VALUES
(1, 'No level', 'No specific education level'),
(2, 'Basic level', 'Basic understanding of the subject'),
(3, 'Intermediate level', 'Intermediate knowledge and skills in the subject'),
(4, 'Advanced level', 'Advanced expertise in the subject');


-- Створення таблиці курсів
CREATE TABLE all_courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    author_id INT,
    price NUMERIC(10, 2),
    description TEXT,
    category_id INT,
    image_url VARCHAR(1024),
    education_level_id INT,
    status VARCHAR(20) DEFAULT 'draft',  -- Course status: 'draft' or 'published'
    test_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_stripe_account VARCHAR(255),
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_education_level FOREIGN KEY (education_level_id) REFERENCES education_levels(id) ON DELETE SET NULL
); 

-- Створення таблиці тегів
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
    test_link VARCHAR(255),
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
    file_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);


-- таблиця з відгуками 
CREATE TABLE teacher_reviews (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subquestions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  subquestion_text TEXT NOT NULL
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  subquestion_id INTEGER REFERENCES subquestions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці запису на курс
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES all_courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE lecture_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lecture_id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES all_courses(id),
    amount INTEGER,
    platform_fee INTEGER,
    teacher_amount INTEGER,
    stripe_session_id TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
    parent_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES all_courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ALTER TABLE comments ADD COLUMN parent_user_id INTEGER REFERENCES users(id);
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES all_courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id) -- Уникнення дублювання записів
);


