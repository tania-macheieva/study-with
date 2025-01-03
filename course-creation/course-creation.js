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
    confirmDeleteModule: 'Are you sure you want to delete this module?',

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
    confirmDeleteModule: 'Ви впевнені, що хочете видалити цей модуль?',

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
  
    // Додаємо переклад для модуля
    const moduleTitle = translations[userLang].moduleTitle;
    const enterModuleTitle = translations[userLang].enterModuleTitle;
  
    moduleDiv.innerHTML = `
      <p class="title-2">${moduleTitle} ${moduleCounter - 1}</p>
      <input type="text" placeholder="${enterModuleTitle}">
      <div class="lectures"></div>
      <button class="add-lecture-btn">${translations[userLang].addLecture}</button>
      <button class="delete-module-btn">${translations[userLang].deleteModule}</button>
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
    
      const lectureTitle = translations[userLang].lectureTitle;
      const enterLectureDescription = translations[userLang].enterLectureDescription;
    
      lectureDiv.innerHTML = `
        <div class="container">
          <p class="title-3">${translations[userLang].lecture} ${lectureCounter}</p>
          <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
        </div>
        <input type="text" placeholder="${lectureTitle}">
        <label class="title-3" for="lecture-description">${translations[userLang].enterLectureDescription}</label>
        <textarea placeholder="${enterLectureDescription}" rows="5"></textarea>
        <label class="upload">${translations[userLang].chooseFiles}</label>
        <div class="custom-file-container">
          <label class="custom-file-upload">
            ${translations[userLang].chooseFile}
            <input class="lecture-materials" name="lecture_files" id="lecture-materials-${lectureCounter}" type="file" multiple />
          </label>
          <div class="file-names-list" id="file-names-list-${lectureCounter}"></div>
        </div>
      `;
    
      lecturesDiv.appendChild(lectureDiv);
      lectureCounter++;

      // Add event listener for file input
      const lectureMaterialsInput = lectureDiv.querySelector(`#lecture-materials-${lectureCounter - 1}`);
      const fileNamesList = lectureDiv.querySelector(`#file-names-list-${lectureCounter - 1}`);
      
      lectureMaterialsInput.addEventListener("change", function(event) {
        const files = Array.from(event.target.files);
         

        files.forEach(file => {
          const fileNameItem = document.createElement("div");
          fileNameItem.classList.add("file-name-item");
          fileNameItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <button class="delete-file-btn">✖</button>
          `;
          fileNamesList.appendChild(fileNameItem);

          const deleteFileBtn = fileNameItem.querySelector(".delete-file-btn");
          deleteFileBtn.addEventListener("click", () => {
            const index = files.indexOf(file);
            if (index > -1) {
              files.splice(index, 1); // Remove the file from the list
            }
            fileNameItem.remove();
          });
        });
      });
       
      updateLectureNumbers(moduleDiv);
    });

    function updateLectureNumbers(moduleDiv) {
      const lectures = moduleDiv.querySelectorAll(".lecture");
      lectures.forEach((lectureDiv, index) => {
        const lectureTitle = lectureDiv.querySelector(".title-3");
        lectureTitle.innerText = `${translations[userLang].lecture} ${index + 1}`;
      });
    }    

    deleteModuleBtn.addEventListener("click", () => {
      if (confirm(translations[userLang].confirmDeleteModule)) {
        moduleDiv.remove();
        updateModuleNumbers();
      }
    });

    // Function to update module numbers
    function updateModuleNumbers() {
      const modules = document.querySelectorAll(".module");
      modules.forEach((moduleDiv, index) => {
        const moduleTitle = moduleDiv.querySelector(".title-2");
        moduleTitle.innerText = `${translations[userLang].moduleTitle} ${index + 1}`;
      });
    }

    updateModuleNumbers();
  });

});

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

document.getElementById("course-thumbnail").addEventListener("change", function () {
  const fileNameSpan = document.getElementById("file-name");
  const fileName = this.files[0]?.name || "No file chosen";
  fileNameSpan.textContent = fileName;
});

document.addEventListener('DOMContentLoaded', function () {
  const tagsInput = document.getElementById("course-tags");
  const tagsListContainer = document.getElementById("tags-list");
  const tagsList = [];

  // Обробник для натискання клавіші Enter
  tagsInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Зупиняємо стандартну поведінку (перехід на новий рядок)
      
      const tag = tagsInput.value.trim();
      if (tag && !tagsList.includes(tag)) {
        tagsList.push(tag);
        tagsInput.value = ''; // очищуємо поле після введення
        updateTagsDisplay();
      }
    }
  });

  // Функція для оновлення відображення списку тегів
  function updateTagsDisplay() {
    tagsListContainer.innerHTML = ''; // очищуємо попередні теги
    tagsList.forEach(tag => {
      const tagDiv = document.createElement('div');
      tagDiv.classList.add('tag');
      tagDiv.textContent = tag;
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '✖';
      deleteButton.classList.add('delete-tag');
      deleteButton.addEventListener('click', () => {
        tagsList.splice(tagsList.indexOf(tag), 1);
        updateTagsDisplay(); // Оновлюємо відображення після видалення
      });
      tagDiv.appendChild(deleteButton);
      tagsListContainer.appendChild(tagDiv);
    });
  }




// Перевірка значення категорії та рівня освіти перед відправкою
document.getElementById('create-course').addEventListener('submit', function(e) {
  e.preventDefault();

  const courseTitle = document.getElementById('course-title').value;
  const courseDescription = document.getElementById('course-description').value;
  const coursePrice = document.getElementById('course-price').value;
  
  const categoryId = categoryTrigger.dataset.value;
  const educationLevel = educationTrigger.dataset.value;
  const courseThumbnail = document.getElementById('course-thumbnail').files[0];

  const modules = [];
  let moduleCounter = 1;
  document.querySelectorAll('.module').forEach(moduleDiv => {
    const moduleTitle = moduleDiv.querySelector('input').value;
    const lectures = [];

    moduleDiv.querySelectorAll('.lecture').forEach(lectureDiv => {
      const lectureTitle = lectureDiv.querySelector('input').value;
      const lectureDescription = lectureDiv.querySelector('textarea').value;
      const lectureOrderNum = moduleCounter;
   
      lectures.push({ title: lectureTitle, description: lectureDescription, order_num: lectureOrderNum });
    });

    modules.push({ title: moduleTitle, order_num: moduleCounter, lectures: lectures });
    moduleCounter++;
  });

  // Дочекаємось завантаження DOM, щоб гарантувати, що елементи доступні
document.addEventListener('DOMContentLoaded', function() {
  // Знайдемо елемент input за ID
  const lectureMaterialsInput = document.getElementById('lecture-materials');
  let submitButton = document.getElementById('submitLectureMaterials');

  // Перевіримо, чи елемент існує
  if (lectureMaterialsInput && submitButton) {
    // Додаємо обробник події на кнопку
    submitButton.addEventListener('click', function() {
      // Перевіримо, чи є вибрані матеріали
      if (lectureMaterialsInput.files.length > 0) {
        // Отримуємо файл
        let selectedFile = lectureMaterialsInput.files[0];
        console.log('Selected file:', selectedFile.name);

        // Тут можна виконати додаткові дії з файлом, наприклад, завантаження
      } else {
        console.log('No file selected');
      }
    });
  } else {
    console.log('Elements not found');
  }
});

  const categoryError = document.querySelector(".category-error");
  const educationError = document.querySelector(".education-error");

  const authData = getAuthDataFromStorage();
  const authorId = authData ? authData.userId : null;

  const categorySelected = categoryId && categoryId !== "Select a category"; 
  const educationSelected = educationLevel && educationLevel !== "Select an education level";

  let isValid = true;

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

  const formData = new FormData(); 
  formData.append('course_title', courseTitle);
  formData.append('course_description', courseDescription);
  formData.append('course_price', coursePrice);
  formData.append('course_category', categoryId);
  formData.append('education_level', educationLevel);
  formData.append('course_thumbnail', courseThumbnail);
  formData.append('author_id', authorId);
  formData.append('modules', JSON.stringify(modules));
  formData.append('tags', JSON.stringify(tagsList));

  const lectureFiles = document.querySelectorAll('.lecture-materials');
  lectureFiles.forEach(input => {
    if (input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        formData.append('lecture_files', file);
      });
    }
  });

  // Відправка даних на сервер
  fetch('/api/courses/create', {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Мережна помилка');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      alert('Курс успішно створено!');
    } else {
      alert('Помилка при створенні курсу: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Помилка:', error);
    alert('Помилка при створенні курсу! ' + error.message);
  });
});    });