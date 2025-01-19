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
    createCourse: 'Publish Course',
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
    chooseFiles: "Upload Materials (PDF, DOCX etc.)",
    uploadVideo: "Upload Video",
    chooseVideo: "Choose Video",
    videoFileChosen: "No video chosen",
    fillRequiredFields: "Please fill all required fields!",
    confirmDeleteModule: 'Are you sure you want to delete this module?',
    courseTags: "Course Tags (hidden from users)",
    enterTags: "Enter tags",
    tagTip: "To add a tag, press ENTER",
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
    createCourse: 'Опублікувати курс',
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
    chooseFiles: "Завантажити матеріали (PDF, DOCX тощо)",
    uploadVideo: "Завантажити відео",
    chooseVideo: "Оберіть відео",
    videoFileChosen: "Відео не вибрано",
    fillRequiredFields: "Будь ласка, заповніть усі обов'язкові поля!",
    confirmDeleteModule: 'Ви впевнені, що хочете видалити цей модуль?',
    courseTags: "Теги курсу (приховані від користувачів)",
    enterTags: "Введіть теги",
    tagTip: "Щоб додати тег, натисніть ENTER",
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
    const fileInput = document.getElementById("course_thumbnail");
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
     
 // Функція для оновлення нумерації лекцій
 function updateLectureNumbers(moduleDiv) {
  const lectures = moduleDiv.querySelectorAll('.lecture');
  lectures.forEach((lecture, index) => {
    const titleElement = lecture.querySelector('.title-3');
    if (titleElement) {
      titleElement.textContent = `${translations[userLang].lecture} ${index + 1}`;
    }
  });
}

addLectureBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const lecturesDiv = moduleDiv.querySelector(".lectures");
  const lectureDiv = document.createElement("div");
  lectureDiv.classList.add("lecture");

  const lectureTitle = translations[userLang].lectureTitle;
  const enterLectureDescription = translations[userLang].enterLectureDescription;
  const uploadVideoLabel = translations[userLang].uploadVideo;
  const chooseVideoLabel = translations[userLang].chooseVideo;

  lectureDiv.innerHTML = `
    <div class="container">
      <p class="title-3">${translations[userLang].lecture} ${lectureCounter}</p>
      <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
    </div>
    <input type="text" placeholder="${lectureTitle}">
    <label class="title-3" for="lecture-description">${translations[userLang].enterLectureDescription}</label>
    <textarea placeholder="${enterLectureDescription}" rows="5"></textarea>

    <label class="upload" ">${translations[userLang].chooseVideo}</label>
    <div class="custom-file-container"  style="margin-bottom: 15px;">
      <label class="custom-file-upload">
        ${translations[userLang].chooseFile}
        <input class="lecture-video" name="lecture_video" id="lecture-video-${lectureCounter}" type="file" accept="video/*" />
      </label>
      <div class="file-names-list" id="video-names-list-${lectureCounter}"></div>
    </div>
    <label class="upload" >${translations[userLang].chooseFiles}</label>
    <div class="custom-file-container">
      <label class="custom-file-upload">
        ${translations[userLang].chooseFile}
        <input class="lecture-materials" name="lecture_files" id="lecture-materials-${lectureCounter}" type="file" />
      </label>
      <div class="file-names-list" id="file-names-list-${lectureCounter}"></div>
    </div>

    
  `;

  lecturesDiv.appendChild(lectureDiv);

  const deleteLectureBtn = lectureDiv.querySelector(".delete-lecture-btn");
  deleteLectureBtn.addEventListener("click", () => {
    lectureDiv.remove(); // Видаляємо лекцію
    updateLectureNumbers(moduleDiv); // Оновлюємо нумерацію
  });

  // Обробка файлів для лекції
  const lectureMaterialsInput = lectureDiv.querySelector(`#lecture-materials-${lectureCounter}`);
  const fileNamesList = lectureDiv.querySelector(`#file-names-list-${lectureCounter}`); 
  lectureMaterialsInput.addEventListener("change", function(event) {
    const file = event.target.files[0]; // Вибирається тільки перший файл
    fileNamesList.innerHTML = ''; 
    if (file) {
      const fileNameItem = document.createElement("div");
      fileNameItem.classList.add("file-name-item");
      fileNameItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <button class="delete-file-btn">✖</button>
      `;
      fileNamesList.appendChild(fileNameItem);

      const deleteFileBtn = fileNameItem.querySelector(".delete-file-btn");
      deleteFileBtn.addEventListener("click", () => {
        fileNamesList.innerHTML = ''; // Очищаємо список файлів
      });
    }
  });

  // Обробка відеофайлів для лекції
  const lectureVideoInput = lectureDiv.querySelector(`#lecture-video-${lectureCounter}`);
  const videoNamesList = lectureDiv.querySelector(`#video-names-list-${lectureCounter}`);
  lectureVideoInput.addEventListener("change", function(event) {
    const file = event.target.files[0]; // Вибирається тільки перший файл
    videoNamesList.innerHTML = ''; 
    if (file) {
      const fileNameItem = document.createElement("div");
      fileNameItem.classList.add("file-name-item");
      fileNameItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <button class="delete-file-btn">✖</button>
      `;
      videoNamesList.appendChild(fileNameItem);

      const deleteFileBtn = fileNameItem.querySelector(".delete-file-btn");
      deleteFileBtn.addEventListener("click", () => {
        videoNamesList.innerHTML = ''; // Очищаємо список відеофайлів
      });
    }
  });

  lectureCounter++;
  updateLectureNumbers(moduleDiv);
});

   
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

document.getElementById("course_thumbnail").addEventListener("change", function () {
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
  document.getElementById("save-draft-btn").addEventListener("click", function() {
    const courseThumbnailElement = document.getElementById('course_thumbnail').files[0];
    const courseThumbnail = courseThumbnailElement ? courseThumbnailElement : null;

    const authData = getAuthDataFromStorage();
    const authorId = authData ? authData.userId : null;

    const courseTitleElement = document.querySelector("input[data-lang='enterCourseTitle']");
    const courseTitle = courseTitleElement ? courseTitleElement.value : '';

    const courseDescriptionElement = document.querySelector("textarea[data-lang='enterDescription']");
    const courseDescription = courseDescriptionElement ? courseDescriptionElement.value : '';

    const coursePriceElement = document.querySelector("input[data-lang='enterPrice']");
    const coursePrice = coursePriceElement && coursePriceElement.value ? parseFloat(coursePriceElement.value) : 0;

    const categoryWrapper = document.getElementById('category-wrapper');
    const courseCategoryElement = categoryWrapper ? categoryWrapper.querySelector('.select-trigger') : null;
    const courseCategory = courseCategoryElement && courseCategoryElement.dataset.value ? parseInt(courseCategoryElement.dataset.value, 10) : null;

    const educationWrapper = document.getElementById('education-wrapper');
    const courseEducationLevelElement = educationWrapper ? educationWrapper.querySelector('.select-trigger') : null;
    const courseEducationLevel = courseEducationLevelElement && courseEducationLevelElement.dataset.value ? parseInt(courseEducationLevelElement.dataset.value, 10) : null;

    const tags = tagsList;

    // Getting existing modules from localStorage
    const existingCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
    const existingModules = existingCourseData.modules || [];

    const modules = [];
    document.querySelectorAll('.module').forEach((moduleDiv, moduleIndex) => {
      const moduleId = moduleDiv.dataset.id && !moduleDiv.dataset.id.startsWith('module-') 
          ? parseInt(moduleDiv.dataset.id, 10) 
          : null; // Use null for new modules
      const moduleTitle = moduleDiv.querySelector('input').value;
      const lectures = [];
  
      moduleDiv.querySelectorAll('.lecture').forEach((lectureDiv, lectureIndex) => {
          const lectureId = lectureDiv.dataset.id && !lectureDiv.dataset.id.startsWith('lecture-')
              ? parseInt(lectureDiv.dataset.id, 10)
              : null; // Use null for new lectures
          const lectureTitle = lectureDiv.querySelector('input').value;
          const lectureDescription = lectureDiv.querySelector('textarea').value;
  
          lectures.push({
              id: lectureId, // Send null for new lectures
              title: lectureTitle,
              description: lectureDescription,
              order_num: lectureIndex + 1,
          });
      });
  
      modules.push({
          id: moduleId, // Send null for new modules
          title: moduleTitle,
          order_num: moduleIndex + 1,
          lectures: lectures,
      });
  });
  

    // Find and track removed modules
    const removedModules = existingModules.filter(existingModule => !modules.some(module => module.id === existingModule.id));

    const courseData = {
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        authorId: authorId,
        educationLevel: courseEducationLevel,
        tags: tags,
        modules: modules,
        removedModules: removedModules.map(module => module.id), // Only send IDs of removed modules
    };

    // Save course data in localStorage
    localStorage.setItem('courseDraft', JSON.stringify(courseData));

    if (courseThumbnail) {
        localStorage.setItem('courseThumbnail', courseThumbnail.name);
    }
// Дочекаємось завантаження DOM, щоб гарантувати, що елементи доступні
document.addEventListener('DOMContentLoaded', function() {
  // Знайдемо елемент input за ID
  const lectureMaterialsInput = document.getElementById('lecture-materials');
  const submitButton = document.getElementById('submitLectureMaterials');
  fileNamesList.innerHTML = '';

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
        alert('Please select a file before submitting.');
      }
    });
  } else {
    console.log('Elements not found');
  }
});
    // Send data to the server using FormData
    const formData = new FormData();
    formData.append('course_data', JSON.stringify(courseData));
    if (courseThumbnail) {
        formData.append('course_thumbnail', courseThumbnail);
    }

    formData.append('course_title', courseTitle);
    formData.append('course_description', courseDescription);
    formData.append('course_price', coursePrice);
    formData.append('course_category', courseCategory);
    formData.append('education_level', courseEducationLevel);
    formData.append('author_id', authorId);
    formData.append('tags', JSON.stringify(tags));
    formData.append('modules', JSON.stringify(modules)); // Send modules as a JSON string
    formData.append('removed_modules', JSON.stringify(courseData.removedModules)); // Send removed module IDs
// Масив для зберігання унікальних файлів
const addedLectureFiles = [];

const lectureFiles = document.querySelectorAll('.lecture-materials');
lectureFiles.forEach(input => {
  if (input.files.length > 0) {
    Array.from(input.files).forEach(file => {
      // Перевірка, чи файл вже додано
      if (!addedLectureFiles.some(addedFile => addedFile.name === file.name && addedFile.size === file.size)) {
        addedLectureFiles.push(file); // Додаємо файл у масив
        formData.append('lecture_files', file); // Додаємо файл до formData
      }
    });
  }
});

// Додаємо відеофайли
const lectureVideos = document.querySelectorAll('.lecture-video');
lectureVideos.forEach(input => {
  if (input.files.length > 0) {
    Array.from(input.files).forEach(file => {
      // Додаємо відеофайл до formData
      formData.append('lecture_videos', file);
    });
  }
});
    fetch('/api/courses/save-draft', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Course saved as draft!");
        } else {
            alert("Failed to save draft: " + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the draft.');
    });
});

  
  window.addEventListener('load', function() {
    const savedCourseData = localStorage.getItem('courseDraft');
    if (savedCourseData) {
      const courseData = JSON.parse(savedCourseData);
      console.log('Loaded course data from localStorage:', courseData);
  
      // Populate form fields
      const courseTitleElement = document.querySelector("input[data-lang='enterCourseTitle']");
      if (courseTitleElement) courseTitleElement.value = courseData.title;
      
      const courseDescriptionElement = document.querySelector("textarea[data-lang='enterDescription']");
      if (courseDescriptionElement) courseDescriptionElement.value = courseData.description;
  
      const coursePriceElement = document.querySelector("input[data-lang='enterPrice']");
      if (coursePriceElement) coursePriceElement.value = courseData.price || '';
  
      const tagsElement = document.getElementById('course-tags');
      if (tagsElement) tagsElement.value = courseData.tags.join(', ');
  
      // Populate modules and lectures dynamically
      // You can add dynamic logic here for populating modules if needed
    }
  });


  document.getElementById('create-course').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const courseTitle = document.getElementById('course-title').value;
    const courseDescription = document.getElementById('course-description').value;
    const coursePrice = document.getElementById('course-price').value;
    
    const categoryId = categoryTrigger.dataset.value;
    const educationLevel = educationTrigger.dataset.value;
    const courseThumbnail = document.getElementById('course_thumbnail').files[0];
  
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
      const lectureMaterialsInput = document.getElementById('lecture-materials');
      const submitButton = document.getElementById('submitLectureMaterials');
      fileNamesList.innerHTML = '';
  
      if (lectureMaterialsInput && submitButton) {
        submitButton.addEventListener('click', function() {
          if (lectureMaterialsInput.files.length > 0) {
            let selectedFile = lectureMaterialsInput.files[0];
            console.log('Selected file:', selectedFile.name);
          } else {
            console.log('No file selected');
            alert('Please select a file before submitting.');
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
  
    // Масив для зберігання унікальних файлів
    const addedLectureFiles = [];
  
    const lectureFiles = document.querySelectorAll('.lecture-materials');
    lectureFiles.forEach(input => {
      if (input.files.length > 0) {
        Array.from(input.files).forEach(file => {
          if (!addedLectureFiles.some(addedFile => addedFile.name === file.name && addedFile.size === file.size)) {
            addedLectureFiles.push(file);
            formData.append('lecture_files', file);
          }
        });
      }
    });
  
    // Додаємо відеофайли
    const lectureVideos = document.querySelectorAll('.lecture-video');
    lectureVideos.forEach(input => {
      if (input.files.length > 0) {
        Array.from(input.files).forEach(file => {
          formData.append('lecture_videos', file);
        });
      }
    });
  
    // Відправка даних на сервер
    fetch('/api/courses/create', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Course created successfully!');
        } else {
          alert('Failed to create the course: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the course.');
      });
  });
});   