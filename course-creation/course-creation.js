const translations = {
  en: {
    pageTitle: 'StudyWith | Course Creation',
    courseTitle: 'Course Title',
    enterCourseTitle: 'Enter course title',
    description: 'Description',
    enterDescription: 'Enter course description',
    thumbnail: 'Thumbnail',
    chooseFile: 'Choose File',
    noFileChosen: 'No file chosen',
    price: 'Price (USD)',
    enterPrice: 'Enter price',
    category: 'Category',
    selectCategory: 'Select a category',
    categoryError: 'Category is required.',
    educationLevel: 'Education Level',
    selectEducationLevel: 'Select an education level',
    educationError: 'Education level is required.',
    modules: 'Modules',
    addModule: 'Add Module',
    createCourse: 'Create Course',
    saveAsDraft: 'Save as Draft',
    programming: 'Programming',
    design: 'Design',
    marketing: 'Marketing',
    business: 'Business',
    languages: 'Languages',
    finance: 'Finance',
    personalDevelopment: 'Personal Development',
    art: 'Art',
    psychology: 'Psychology',
    healthcare: 'Health',
    cooking: 'Cooking',
    science: 'Science',
    gameDevelopment: 'Game Development',
    childcare: 'Childcare',
    noLevel: 'No Level',
    basicLevel: 'Basic Level',
    intermediateLevel: 'Intermediate Level',
    advancedLevel: 'Advanced Level',
    addLecture: 'Add Lecture',
    deleteModule: 'Delete Module',
    moduleTitle: "Module",
    enterModuleTitle: "Enter module title",
    lecture: "Lecture",
    lectureTitle: "Enter lecture title",
    enterLectureDescription: "Enter lecture description",
    chooseFiles: "Upload Materials (Video, PDF, etc.)",
    fillRequiredFields: "Please fill all required fields!",
  },
  ua: {
    pageTitle: 'StudyWith | Створення курсу',
    courseTitle: 'Назва курсу',
    enterCourseTitle: 'Введіть назву курсу',
    description: 'Опис',
    enterDescription: 'Введіть опис курсу',
    thumbnail: 'Мініатюра',
    chooseFile: 'Обрати файл',
    noFileChosen: 'Файл не обрано',
    price: 'Ціна (USD)',
    enterPrice: 'Введіть ціну',
    category: 'Категорія',
    selectCategory: 'Оберіть категорію',
    categoryError: 'Категорія є обов’язковою.',
    educationLevel: 'Рівень освіти',
    selectEducationLevel: 'Оберіть рівень освіти',
    educationError: 'Рівень освіти є обов’язковим.',
    modules: 'Модулі',
    addModule: 'Додати модуль',
    createCourse: 'Створити курс',
    saveAsDraft: 'Зберегти як чернетку',
    programming: 'Програмування',
    design: 'Дизайн',
    marketing: 'Маркетинг',
    business: 'Бізнес',
    languages: 'Мови',
    finance: 'Фінанси',
    personalDevelopment: 'Особистий розвиток',
    art: 'Мистецтво',
    psychology: 'Психологія',
    healthcare: 'Охорона здоров’я',
    cooking: 'Кулінарія',
    science: 'Наука',
    gameDevelopment: 'Розробка ігор',
    childcare: 'Догляд за дітьми',
    noLevel: 'Без рівня',
    basicLevel: 'Базовий рівень',
    intermediateLevel: 'Середній рівень',
    advancedLevel: 'Високий рівень',
    addLecture: 'Додати лекцію',
    deleteModule: 'Видалити модуль',
    moduleTitle: "Модуль",
    enterModuleTitle: "Введіть назву модуля",
    lecture: "Лекція",
    lectureTitle: "Введіть назву лекції",
    enterLectureDescription: "Введіть опис лекції",
    chooseFiles: "Завантажити матеріали (відео, PDF тощо)",
    fillRequiredFields: "Будь ласка, заповніть усі обов'язкові поля!",
  },
};

function applyLanguage(lang) {
  const langData = translations[lang];
  document.title = langData.pageTitle;

  document.querySelectorAll('[data-lang]').forEach(element => {
    const langKey = element.getAttribute('data-lang');
    const translation = langData[langKey];
    if (translation !== undefined) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.setAttribute('placeholder', translation);
      } else {
        element.textContent = translation;
      }
    }
  });

  localStorage.setItem('language', lang);  
}
document.addEventListener('DOMContentLoaded', () => {
  const userLang = localStorage.getItem('language') || 'en';
  applyLanguage(userLang);

  // Language Switcher
  const languageEnButton = document.getElementById("language-en");
  const languageUaButton = document.getElementById("language-ua");

  if (languageEnButton) {
    languageEnButton.addEventListener("click", () => {
      applyLanguage('en');
      localStorage.setItem('language', 'en');
    });
  }

  if (languageUaButton) {
    languageUaButton.addEventListener("click", () => {
      applyLanguage('ua');
      localStorage.setItem('language', 'ua');
    });
  }

  function updateFileName() {
    const fileInput = document.getElementById("course-thumbnail");
    const fileName = document.getElementById("file-name");

    if (fileInput.files.length > 0) {
      fileName.textContent = fileInput.files[0].name;
      fileName.classList.add("selected");
    } else {
      fileName.textContent = "No file chosen"
      fileName.classList.remove("selected");
    }
  }

  function closeAllSelects() {
    document.querySelectorAll('.custom-select').forEach(select => {
      select.classList.remove('open');
    });
  }

  document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelector('.options');
    const span = trigger.querySelector('span');

    trigger.addEventListener('click', () => {
      const isOpen = select.classList.contains('open');
      closeAllSelects();
      if (!isOpen) {
        select.classList.add('open');
      }
    });

    options.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        span.textContent = option.textContent;
        select.classList.remove('open');
        trigger.dataset.value = option.dataset.value;
      });
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.custom-select')) {
      closeAllSelects();
    }
  });

  const addModuleBtn = document.getElementById("add-module-btn");
  const modulesList = document.getElementById("modules-list");
  let moduleCounter = 1;

  addModuleBtn.addEventListener("click", () => {
    const moduleId = `module-${moduleCounter++}`;
    const moduleDiv = document.createElement("div");
    moduleDiv.classList.add("module");
    moduleDiv.id = moduleId;

    moduleDiv.innerHTML = `
      <p class="title-2">Module ${moduleCounter - 1}</p>
      <input type="text" placeholder="Module Title"> 
      <div class="lectures"></div>
      <button class="add-lecture-btn">Add Lecture</button>
      <button class="delete-module-btn">Delete Module</button>
    `;

    modulesList.appendChild(moduleDiv);

    const addLectureBtn = moduleDiv.querySelector(".add-lecture-btn");
    const deleteModuleBtn = moduleDiv.querySelector(".delete-module-btn");
    let lectureCounter = 1;

    addLectureBtn.addEventListener("click", (event) => {
      event.preventDefault();

      const lecturesDiv = moduleDiv.querySelector(".lectures");
      const lectureDiv = document.createElement("div");
      lectureDiv.classList.add("lecture");
      lectureDiv.innerHTML = `
        <div class="container">
          <p class="title-3">Lecture ${lectureCounter}</p>
          <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
        </div>
        <input type="text" placeholder="Lecture Title">
        <label class="title-3" for="lecture-description">Description</label>
        <textarea placeholder="Enter lecture description" rows="5"></textarea>
        <label class="upload">Upload Materials (Video, PDF, etc.)</label>
        <div class="custom-file-container">
          <label class="custom-file-upload">
            Choose Files
            <input class="lecture-materials" type="file" multiple />
          </label>
          <div class="file-names-list"></div>
        </div>
      `;
      lecturesDiv.appendChild(lectureDiv);
      lectureCounter++;

      const deleteLectureBtn = lectureDiv.querySelector(".delete-lecture-btn");
      deleteLectureBtn.addEventListener("click", () => {
        lectureDiv.remove();
        updateLectureNumbers(moduleDiv);
      });

      updateLectureNumbers(moduleDiv);
    });

    deleteModuleBtn.addEventListener("click", () => {
      const moduleTitle = moduleDiv.querySelector(".title-2").innerText;
      if (confirm(`Are you sure you want to delete ${moduleTitle}?`)) {
        moduleDiv.remove();
        updateModuleNumbers();
      }
    });

    updateModuleNumbers();
  });

  function updateLectureNumbers(moduleDiv) {
    const lecturesDiv = moduleDiv.querySelector(".lectures");
    const lectures = lecturesDiv.querySelectorAll(".lecture");

    lectures.forEach((lectureDiv, index) => {
      const lectureTitle = lectureDiv.querySelector(".title-3");
      lectureTitle.innerText = `Lecture ${index + 1}`;
    });
  }

  function updateModuleNumbers() {
    const modules = document.querySelectorAll(".module");
    modules.forEach((moduleDiv, index) => {
      const moduleTitle = moduleDiv.querySelector(".title-2");
      moduleTitle.innerText = `Module ${index + 1}`;
    });
  }


  const categoryWrapper = document.querySelector('.custom-select-wrapper#category-wrapper');
  const educationWrapper = document.querySelector('.custom-select-wrapper#education-wrapper');

  const categoryTrigger = categoryWrapper.querySelector('.select-trigger');
  const categoryOptions = categoryWrapper.querySelector('.options');
  const categorySpan = categoryTrigger.querySelector('span');

  const educationTrigger = educationWrapper.querySelector('.select-trigger');
  const educationOptions = educationWrapper.querySelector('.options');
  const educationSpan = educationTrigger.querySelector('span');

  // Обробка вибору категорії
categoryTrigger.addEventListener('click', (event) => {
  event.preventDefault();
  categoryWrapper.classList.toggle('open');
  educationWrapper.classList.remove('open');
});

categoryOptions.querySelectorAll('.option').forEach(option => {
  option.addEventListener('click', (event) => {
    event.preventDefault();
    categorySpan.textContent = option.textContent;
    categoryTrigger.dataset.value = option.dataset.value;
    categoryWrapper.classList.remove('open');
  });
});

// Обробка вибору рівня освіти
educationTrigger.addEventListener('click', (event) => {
  event.preventDefault();
  educationWrapper.classList.toggle('open');
  categoryWrapper.classList.remove('open');
});

educationOptions.querySelectorAll('.option').forEach(option => {
  option.addEventListener('click', (event) => {
    event.preventDefault();
    educationSpan.textContent = option.textContent;
    educationTrigger.dataset.value = option.dataset.value;
    educationWrapper.classList.remove('open');
  });
});

// Закриття списків при кліку поза межами
document.addEventListener('click', (event) => {
  if (!event.target.closest('.custom-select-wrapper')) {
    categoryWrapper.classList.remove('open');
    educationWrapper.classList.remove('open');
  }
});




// Перевірка значення категорії та рівня освіти перед відправкою
document.getElementById('create-course').addEventListener('submit', function(e) {
  e.preventDefault();

  const courseTitle = document.getElementById('course-title').value;
  const courseDescription = document.getElementById('course-description').value;
  const coursePrice = document.getElementById('course-price').value;
  
  const categoryId = categoryTrigger.dataset.value; // Отримуємо ID категорії
  const educationLevel = educationTrigger.dataset.value; // Отримуємо ID рівня освіти
  const courseThumbnail = document.getElementById('course-thumbnail').files[0];

  const categoryError = document.querySelector(".category-error");
  const educationError = document.querySelector(".education-error");

  const authData = getAuthDataFromStorage();
  const authorId = authData ? authData.userId : null;

  const categorySelected = categoryId && categoryId !== "Select a category"; // Перевірка вибору категорії
  const educationSelected = educationLevel && educationLevel !== "Select an education level"; // Перевірка вибору рівня освіти

  let isValid = true;

  // Перевірка на вибір категорії
  if (!categorySelected) {
    if (categoryError) {
      categoryError.style.display = "block";
    }
    isValid = false;
  } else {
    if (categoryError) {
      categoryError.style.display = "none";
    }
  }

  // Перевірка на вибір рівня освіти
  if (!educationSelected) {
    if (educationError) {
      educationError.style.display = "block";
    }
    isValid = false;
  } else {
    if (educationError) {
      educationError.style.display = "none";
    }
  }

  if (!isValid) {
    return;
  }

  // Створення FormData для відправки даних на сервер
  const formData = new FormData();
  formData.append('course_title', courseTitle);
  formData.append('course_description', courseDescription);
  formData.append('course_price', coursePrice);
  formData.append('course_category', categoryId); // Передача ID категорії
  formData.append('education_level', educationLevel); // Передача ID рівня освіти
  formData.append('course_thumbnail', courseThumbnail);
  formData.append('author_id', authorId);

  // Відправка даних на сервер
  fetch('/api/courses/create', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Course created successfully!');
    } else {
      alert('Error creating course: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error creating course!');
  });
});
});