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
    createGenerTest:'Create general test',
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
    createTest: 'Create Test',
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
    createGenerTest:'Створити загальний тест',
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
    createTest: 'Створити тест',
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
  
// Завантажуємо модулі з localStorage при завантаженні сторінки
window.addEventListener("load", () => {
  const storedModules = JSON.parse(localStorage.getItem("modules"));
  if (storedModules) {
    moduleCounter = storedModules.length + 1;
    storedModules.forEach((moduleData) => {
      addModule(moduleData);
    });
  }
});

  addModuleBtn.addEventListener("click", () => {
    const moduleId = `module-${moduleCounter++}`;
    const moduleData = { id: moduleId, title: "", lectures: [] };  
    
    addModule(moduleData);
    saveModulesToLocalStorage();
  });
  
  
  // function addModule(moduleData) {
  //   const moduleDiv = document.createElement("div");
  //   moduleDiv.classList.add("module");
  //   moduleDiv.id = moduleData.id;
  
  //   const moduleTitle = translations[userLang].moduleTitle;
  //   const enterModuleTitle = translations[userLang].enterModuleTitle;
  
  //   moduleDiv.innerHTML = `
  //     <p class="title-2">${moduleTitle} ${moduleCounter - 1}</p>
  //     <input type="text" placeholder="${enterModuleTitle}" value="${moduleData.title}">
  //     <div class="lectures"></div>
  //     <button class="add-lecture-btn">${translations[userLang].addLecture}</button>
  //     <button class="delete-module-btn">${translations[userLang].deleteModule}</button>
  //   `;
  
  //   modulesList.appendChild(moduleDiv);
  
  //   const addLectureBtn = moduleDiv.querySelector(".add-lecture-btn");
  //   const deleteModuleBtn = moduleDiv.querySelector(".delete-module-btn");
  //   let lectureCounter = 1;
  
  //   addLectureBtn.addEventListener("click", (event) => {
  //     event.preventDefault();
  //     const lecturesDiv = moduleDiv.querySelector(".lectures");
  //     const lectureDiv = document.createElement("div");
  //     lectureDiv.classList.add("lecture");
  
  //     const lectureTitle = translations[userLang].lectureTitle;
  //     const enterLectureDescription = translations[userLang].enterLectureDescription;
  //     const uploadVideoLabel = translations[userLang].uploadVideo;
  //     const chooseVideoLabel = translations[userLang].chooseVideo;
  
  //     lectureDiv.innerHTML = `
  //       <div class="container">
  //         <p class="title-3">${translations[userLang].lecture} ${lectureCounter}</p>
  //         <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
  //       </div>
  //       <input type="text" placeholder="${lectureTitle}">
  //       <label class="title-3" for="lecture-description">${translations[userLang].enterLectureDescription}</label>
  //       <textarea placeholder="${enterLectureDescription}" rows="5"></textarea>
  //       <label class="upload">${translations[userLang].chooseVideo}</label>
  //       <div class="custom-file-container">
  //         <label class="custom-file-upload">
  //           ${translations[userLang].chooseFile}
  //           <input class="lecture-video" name="lecture_video" type="file" accept="video/*" />
  //         </label>
  //         <div class="file-names-list"></div>
  //       </div>
  //       <label class="upload">${translations[userLang].chooseFiles}</label>
  //       <div class="custom-file-container">
  //         <label class="custom-file-upload">
  //           ${translations[userLang].chooseFile}
  //           <input class="lecture-materials" name="lecture_files" type="file" />
  //         </label>
  //         <div class="file-names-list"></div>
  //       </div>
  //     `;
  
  //     lecturesDiv.appendChild(lectureDiv);
  
  //     const deleteLectureBtn = lectureDiv.querySelector(".delete-lecture-btn");
  //     deleteLectureBtn.addEventListener("click", () => {
  //       lectureDiv.remove();
  //       saveModulesToLocalStorage();
  //     });
  
  //     // Обробка завантаження файлів для лекцій
  //     handleFileInputs(lectureDiv, 'lecture-video');
  //     handleFileInputs(lectureDiv, 'lecture-materials');
      
  //     lectureCounter++;
  //     updateLectureNumbers(moduleDiv);
  //     saveModulesToLocalStorage();
  //   });
  
  //   deleteModuleBtn.addEventListener("click", () => {
  //     if (confirm(translations[userLang].confirmDeleteModule)) {
  //       moduleDiv.remove();
  //       saveModulesToLocalStorage();
  //       updateModuleNumbers();
  //     }
  //   });
  
  //   updateModuleNumbers();
  //   saveModulesToLocalStorage();
  // }
  //Обробник ля створення загального тесту
  const createGeneralTestBtn = document.getElementById("create-general-test-btn");

    // Додаємо обробник події для переходу на сторінку створення загального тесту
    createGeneralTestBtn.addEventListener("click", () => {
        window.location.href = "/test-creation?general=true";
    });
  function addModule(moduleData = { title: "", lectures: [] }) {
    const moduleDiv = document.createElement("div");
    moduleDiv.classList.add("module");
  
    moduleDiv.innerHTML = `
      <p class="title-2">${translations[userLang].moduleTitle} ${moduleCounter - 1}</p>
      <input type="text" placeholder="${translations[userLang].enterModuleTitle}" value="${moduleData.title}">
      <div class="lectures"></div>
      <button class="add-lecture-btn">${translations[userLang].addLecture}</button>
      <button class="delete-module-btn">${translations[userLang].deleteModule}</button>
      <button class="create-test-btn">${translations[userLang].createTest}</button>
    `;
  
    modulesList.appendChild(moduleDiv);
  
    // Відновлення лекцій модуля
    if (moduleData.lectures && moduleData.lectures.length > 0) {
      moduleData.lectures.forEach((lectureData) => {
        addLecture(moduleDiv, lectureData);
      });
    }
  
    moduleDiv.querySelector(".add-lecture-btn").addEventListener("click", () => {
      addLecture(moduleDiv);
      saveModulesToLocalStorage();
    });
  
    moduleDiv.querySelector(".delete-module-btn").addEventListener("click", () => {
      if (confirm(translations[userLang].confirmDeleteModule)) {
        moduleDiv.remove();
        saveModulesToLocalStorage();
        updateModuleNumbers();
      }
    });
    moduleDiv.querySelector(".create-test-btn").addEventListener("click", () => {
      const moduleTitle = moduleDiv.querySelector("input").value.trim();
      if (moduleTitle) {
          window.location.href = `/test-creation?module=${encodeURIComponent(moduleTitle)}`;
      } else {
          alert("Please enter a module title before creating a test.");
      }
    });
  
    saveModulesToLocalStorage();
  }
  
  
  function addLecture(moduleDiv, lectureData = {}) {
    
    const lecturesDiv = moduleDiv.querySelector(".lectures");
    const lectureDiv = document.createElement("div");
    lectureDiv.classList.add("lecture");
  
    if (lectureData.videoFile) lectureDiv.dataset.videoFile = lectureData.videoFile;
    if (lectureData.materialsFiles) lectureDiv.dataset.materialsFiles = JSON.stringify(lectureData.materialsFiles);
  
    lectureDiv.innerHTML = `
      <div class="container">
        <p class="title-3">${translations[userLang].lecture} ${lecturesDiv.children.length + 1}</p>
        <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
      </div>
      <input type="text" placeholder="${translations[userLang].lectureTitle}" value="${lectureData.title || ""}">
      <label class="title-3">${translations[userLang].enterLectureDescription}</label>
      <textarea placeholder="${translations[userLang].enterLectureDescription}" rows="5">${lectureData.description || ""}</textarea>
      
      <label class="upload">${translations[userLang].chooseVideo}</label>
      <div class="custom-file-container">
        <label class="custom-file-upload">
          ${translations[userLang].chooseFile}
          <input class="lecture-video" name="lecture_video" type="file" accept="video/*" />
        </label>
        <div class="file-names-list">${lectureData.videoFile ? `<span>${lectureData.videoFile}</span>` : ""}</div>
      </div>
      
      <label class="upload">${translations[userLang].chooseFiles}</label>
      <div class="custom-file-container">
        <label class="custom-file-upload">
          ${translations[userLang].chooseFile}
          <input class="lecture-materials" name="lecture_files" type="file" multiple />
        </label>
        <div class="file-names-list">
          ${lectureData.materialsFiles ? lectureData.materialsFiles.map(file => `<span>${file}</span>`).join("") : ""}
        </div>
      </div>
    `;
  
    lecturesDiv.appendChild(lectureDiv);
  
    // Оновлення списку файлів при виборі
    lectureDiv.querySelector(".lecture-video").addEventListener("change", function () {
      updateFileNamesList(this, lectureDiv.querySelector(".file-names-list"));
    });
  
    lectureDiv.querySelector(".lecture-materials").addEventListener("change", function () {
      updateFileNamesList(this, lectureDiv.querySelectorAll(".file-names-list")[1]);
    });
  
    // Видалення лекції
    lectureDiv.querySelector(".delete-lecture-btn").addEventListener("click", () => {
      lectureDiv.remove();
      saveModulesToLocalStorage();
      updateLectureNumbers(moduleDiv);
    });
  
    lectureDiv.querySelector("input[type='text']").addEventListener("input", saveModulesToLocalStorage);
    lectureDiv.querySelector("textarea").addEventListener("input", saveModulesToLocalStorage);
  
    saveModulesToLocalStorage();
  }
  
  function updateFileNamesList(inputElement, fileNamesList) {
    const files = Array.from(inputElement.files).map(file => file.name);
    fileNamesList.innerHTML = files.length > 0 ? files.map(name => `<span>${name}</span>`).join("") : "";
    saveModulesToLocalStorage();
  }
  
  
  // // Функція для обробки файлів (матеріалів та відео)
  // function handleFileInputs(lectureDiv, inputClass) {
  //   const input = lectureDiv.querySelector(`.${inputClass}`);
  //   const fileNamesList = lectureDiv.querySelector(`.file-names-list`);
  
  //   input.addEventListener("change", function (event) {
  //     const files = event.target.files;
  //     fileNamesList.innerHTML = ''; 
  
  //     Array.from(files).forEach(file => {
  //       const fileNameItem = document.createElement("div");
  //       fileNameItem.classList.add("file-name-item");
  //       fileNameItem.innerHTML = `
  //         <span class="file-name">${file.name}</span>
  //         <button class="delete-file-btn">✖</button>
  //       `;
  //       fileNamesList.appendChild(fileNameItem);
  
  //       const deleteFileBtn = fileNameItem.querySelector(".delete-file-btn");
  //       deleteFileBtn.addEventListener("click", () => {
  //         fileNamesList.removeChild(fileNameItem);
  //       });
  //     });
  //   });
  // }
  
  // Оновлює номера лекцій
  function updateLectureNumbers(moduleDiv) {
    const lectures = moduleDiv.querySelectorAll('.lecture');
    lectures.forEach((lecture, index) => {
      const titleElement = lecture.querySelector('.title-3');
      if (titleElement) {
        titleElement.textContent = `${translations[userLang].lecture} ${index + 1}`;
      }
    });
  }
  
  // Оновлює номери модулів
  function updateModuleNumbers() {
    const modules = document.querySelectorAll(".module");
    modules.forEach((moduleDiv, index) => {
      const moduleTitle = moduleDiv.querySelector(".title-2");
      moduleTitle.innerText = `${translations[userLang].moduleTitle} ${index + 1}`;
    });
  }
  
  function saveModulesToLocalStorage() {
    const modules = [];
    document.querySelectorAll(".module").forEach((moduleDiv) => {
      const moduleTitle = moduleDiv.querySelector("input[type='text']").value;
      const lectures = [];
  
      moduleDiv.querySelectorAll(".lecture").forEach((lectureDiv) => {
        const lectureTitle = lectureDiv.querySelector("input[type='text']").value || "";
        const lectureDescription = lectureDiv.querySelector("textarea").value || "";
        
        // Отримання вибраних файлів
        const videoFileInput = lectureDiv.querySelector(".lecture-video");
        const materialsFileInput = lectureDiv.querySelector(".lecture-materials");
  
        // Назви файлів для відображення
        const videoFile = videoFileInput.files.length > 0 ? videoFileInput.files[0].name : lectureDiv.dataset.videoFile || "";
        const materialsFiles = materialsFileInput.files.length > 0 
          ? Array.from(materialsFileInput.files).map(file => file.name) 
          : lectureDiv.dataset.materialsFiles ? JSON.parse(lectureDiv.dataset.materialsFiles) : [];
  
        lectures.push({
          title: lectureTitle,
          description: lectureDescription,
          videoFile: videoFile,
          materialsFiles: materialsFiles
        });
  
        // Оновлення data-атрибутів
        lectureDiv.dataset.videoFile = videoFile;
        lectureDiv.dataset.materialsFiles = JSON.stringify(materialsFiles);
      });
  
      modules.push({ title: moduleTitle, lectures });
    });
  
    localStorage.setItem("modules", JSON.stringify(modules));
  }
  
}); 
 
  const categoryWrapper = document.querySelector('.custom-select-wrapper#category-wrapper');
  const educationWrapper = document.querySelector('.custom-select-wrapper#education-wrapper');

  const categoryTrigger = categoryWrapper.querySelector('.select-trigger');
  const categoryOptions = categoryWrapper.querySelector('.options');
  const categorySpan = categoryTrigger.querySelector('span');

  const educationTrigger = educationWrapper.querySelector('.select-trigger');
  const educationOptions = educationWrapper.querySelector('.options');
  const educationSpan = educationTrigger.querySelector('span');

  
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

let tagsList = JSON.parse(localStorage.getItem('tagsList')) || [];
document.addEventListener('DOMContentLoaded', function () {
  const tagsInput = document.getElementById("course-tags");
  const tagsListContainer = document.getElementById("tags-list");

  // Читання часу останнього відвідування
  const lastVisitTime = localStorage.getItem('lastVisitTime');
  const currentTime = new Date().getTime();

  // Перевіряємо, чи пройшло більше 10 секунд після останнього відвідування
  if (lastVisitTime && (currentTime - lastVisitTime > 10000)) {
    // Якщо так, очищаємо теги
    tagsList = [];
    saveTagsToLocalStorage();
  }

  updateTagsDisplay();

  // Додаємо нові теги по Enter
  tagsInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagsInput.value.trim();
      if (tag && !tagsList.includes(tag) && tagsList.length < 10) {  
        tagsList.push(tag);
        tagsInput.value = '';
        updateTagsDisplay();
        saveTagsToLocalStorage();
        tagsInput.focus();  // Refocus the input after adding tag
      }
    }
  });

  // Очищення тегів
  function clearTags() {
    tagsList = [];  // Очистити список тегів
    updateTagsDisplay();  // Перерендерити відображення тегів
    saveTagsToLocalStorage();  // Зберегти порожній список в localStorage
  }

  // Оновлення відображення тегів
  function updateTagsDisplay() {
    tagsListContainer.innerHTML = '';
    tagsList.forEach(tag => {
      const tagDiv = document.createElement('div');
      tagDiv.classList.add('tag');
      tagDiv.textContent = tag;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '✖';
      deleteButton.classList.add('delete-tag');
      deleteButton.addEventListener('click', () => {
        tagsList.splice(tagsList.indexOf(tag), 1);
        updateTagsDisplay();
        saveTagsToLocalStorage();
      });

      tagDiv.appendChild(deleteButton);
      tagsListContainer.appendChild(tagDiv);
    });
  }

  // Збереження тегів в localStorage
  function saveTagsToLocalStorage() {
    localStorage.setItem('tagsList', JSON.stringify(tagsList));
    localStorage.setItem('lastVisitTime', currentTime);  // Зберігаємо час останнього відвідування
  }

  // Збереження часу при покиданні сторінки
  window.addEventListener("beforeunload", function () {
    localStorage.setItem('lastVisitTime', new Date().getTime());
  });
});



function saveDraftAutomatically() {
  console.log("Автозбереження викликано");
 
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

    const tags = JSON.parse(localStorage.getItem('tagsList')) || [];

    
    const existingCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
    const existingModules = existingCourseData.modules || [];

    const modules = [];
    document.querySelectorAll('.module').forEach((moduleDiv, moduleIndex) => {
      const moduleId = moduleDiv.dataset.id && !moduleDiv.dataset.id.startsWith('module-') 
          ? parseInt(moduleDiv.dataset.id, 10) 
          : null; 
      const moduleTitle = moduleDiv.querySelector('input').value;
      const lectures = [];
  
      moduleDiv.querySelectorAll('.lecture').forEach((lectureDiv, lectureIndex) => {
          const lectureId = lectureDiv.dataset.id && !lectureDiv.dataset.id.startsWith('lecture-')
              ? parseInt(lectureDiv.dataset.id, 10)
              : null; 
          const lectureTitle = lectureDiv.querySelector('input').value;
          const lectureDescription = lectureDiv.querySelector('textarea').value;
  
          lectures.push({
              id: lectureId, 
              title: lectureTitle,
              description: lectureDescription,
              order_num: lectureIndex + 1,
          });
      });
  
      modules.push({
          id: moduleId, 
          title: moduleTitle,
          order_num: moduleIndex + 1,
          lectures: lectures,
      });
  });
  

    
    const removedModules = existingModules.filter(existingModule => !modules.some(module => module.id === existingModule.id));


     
    if (courseThumbnail) {
        localStorage.setItem('courseThumbnail', courseThumbnail.name);
    }

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
const addedLectureFiles = [];
const formData = new FormData();
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


const lectureVideos = document.querySelectorAll('.lecture-video');
lectureVideos.forEach(input => {
  if (input.files.length > 0) {
    Array.from(input.files).forEach(file => {
      
      formData.append('lecture_videos', file);
    });
  }
});

const courseData = {
  title: courseTitle,
  description: courseDescription,
  category: courseCategory,
  authorId: authorId,
  educationLevel: courseEducationLevel,
  price: coursePrice,
  tags: tags,
  modules: modules,
  removedModules: removedModules.map(module => module.id),
  thumbnail: courseThumbnail ? courseThumbnail.name : null, 
  lectureFiles: addedLectureFiles.map(file => file.name), 
};

localStorage.setItem('courseDraft', JSON.stringify(courseData));

    
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
    formData.append('modules', JSON.stringify(modules)); 
    formData.append('removed_modules', JSON.stringify(courseData.removedModules)); 


    fetch('/api/courses/save-draft', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Course saved as draft!");
        } else {
            alert("Failed to save draft: " + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the draft.');
    });
  }

setInterval(saveDraftAutomatically, 10000);  


// window.addEventListener('beforeunload', () => {
//   // Зберігаємо час закриття сторінки в localStorage
//   localStorage.setItem('lastClosedTime', Date.now());
//   const selectedCategory = localStorage.getItem('selectedCategory');

//   // Зберігаємо дані чернетки
//   const courseData = {
//     title: document.querySelector("input[data-lang='enterCourseTitle']").value,
//     description: document.querySelector("textarea[data-lang='enterDescription']").value,
//     price: document.querySelector("input[data-lang='enterPrice']").value,
//     category: courseCategory,
//     educationLevel: courseEducationLevel,
//     tags: JSON.parse(localStorage.getItem('tags')) || [],
//     modules: [...document.querySelectorAll('#modules-container .module')].map(module => {
//       return {
//         id: module.dataset.id,
//         title: module.querySelector('input[type="text"]').value,
//         lectures: [...module.querySelectorAll('.lecture')].map(lecture => {
//           return {
//             id: lecture.dataset.id,
//             title: lecture.querySelector('input[type="text"]').value,
//             description: lecture.querySelector('textarea').value
//           };
//         })
//       };
//     }),
//     lectureFiles: [...document.querySelectorAll('#file-names-list li')].map(fileItem => fileItem.textContent),
//     lectureVideos: [...document.querySelectorAll('#video-names-list li')].map(videoItem => videoItem.textContent),

//   };

//   localStorage.setItem('courseDraft', JSON.stringify(courseData));
//   const thumbnail = document.querySelector("#course_thumbnail").files[0] ? document.querySelector("#course_thumbnail").files[0].name : null;
//   if (thumbnail) {
//     localStorage.setItem('courseThumbnail', thumbnail);
//   }

// });

// window.addEventListener('load', () => {
//   const lastClosedTime = localStorage.getItem('lastClosedTime');
//   if (lastClosedTime) {
//     const elapsedTime = Date.now() - parseInt(lastClosedTime, 10);
//     // Якщо минуло більше 10 секунд, очищаємо чернетку, окрім authorId
//     if (elapsedTime > 10000) {
//       const authorId = JSON.parse(localStorage.getItem('courseDraft'))?.authorId || null;
//       localStorage.setItem('courseDraft', JSON.stringify({ authorId }));
//       console.log("Чернетка очищена, окрім authorId");
//     }
//   }

//   // Завантажуємо дані чернетки з localStorage
//   const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};

//   // Заповнюємо поля форми
//   const courseTitleElement = document.querySelector("input[data-lang='enterCourseTitle']");
//   if (courseTitleElement) {
//     courseTitleElement.value = savedCourseData.title || '';
//   }

//   const courseDescriptionElement = document.querySelector("textarea[data-lang='enterDescription']");
//   if (courseDescriptionElement) {
//     courseDescriptionElement.value = savedCourseData.description || '';
//   }

//   const coursePriceElement = document.querySelector("input[data-lang='enterPrice']");
//   if (coursePriceElement) {
//     coursePriceElement.value = savedCourseData.price || '';
//   }

//   // Перевірка категорії
//   const categoryWrapper = document.getElementById('category-wrapper');
// const selectTriggerCategory = categoryWrapper.querySelector('.select-trigger');
// const optionsCategory = categoryWrapper.querySelectorAll('.option');

// optionsCategory.forEach(option => {
//   option.addEventListener('click', () => {
//     const selectedValue = option.dataset.value;
//     localStorage.setItem('selectedCategory', selectedValue);

//     // Оновлення тексту вибраної категорії
//     selectTriggerCategory.querySelector('span').textContent = option.textContent;

//     // Видаляємо клас "selected" з усіх елементів
//     optionsCategory.forEach(opt => opt.classList.remove('selected'));
//     option.classList.add('selected');
//   });
// });
// const savedCategory = localStorage.getItem('selectedCategory');

// if (savedCategory) {
//   const selectedOptionCategory = [...optionsCategory].find(option => option.dataset.value === savedCategory);
//   if (selectedOptionCategory) {
//     selectedOptionCategory.classList.add('selected');
//     selectTriggerCategory.querySelector('span').textContent = selectedOptionCategory.textContent;
//   }
// }



  // // Перевірка рівня освіти
  // const educationWrapper = document.getElementById('education-wrapper');
  // const selectTriggerEducation = educationWrapper.querySelector('.select-trigger');
  // const optionsEducation = educationWrapper.querySelectorAll('.option');
  
  // // Збереження вибраного рівня освіти в localStorage
  // optionsEducation.forEach(option => {
  //   option.addEventListener('click', () => {
  //     const selectedValue = option.dataset.value;
  //     localStorage.setItem('selectedEducationLevel', selectedValue);
  
  //     // Оновлюємо текст тригера
  //     selectTriggerEducation.querySelector('span').textContent = option.textContent;
  
  //     // Додаємо клас 'selected' до вибраного елемента
  //     optionsEducation.forEach(opt => opt.classList.remove('selected'));
  //     option.classList.add('selected');
  //   });
  // });
  // const savedEducationLevel = localStorage.getItem('selectedEducationLevel');

  // if (savedEducationLevel) {
  //   const selectedOption = [...optionsEducation].find(option => option.dataset.value === savedEducationLevel);
  //   if (selectedOption) {
  //     selectedOption.classList.add('selected');
  //     selectTriggerEducation.querySelector('span').textContent = selectedOption.textContent;
  //   }
  // }
  

  // // Виведення тегів
  // const tagsInput = document.getElementById('course-tags');
  // const tagsList = document.getElementById('tags-list');
  // let existingTags = savedCourseData.tags || [];

  // existingTags.forEach(tag => {
  //   const tagElement = document.createElement('div');
  //   tagElement.textContent = tag;
  //   tagElement.classList.add('tag');
  //   tagsList.appendChild(tagElement);
  // });

  // tagsInput.value = savedCourseData.tags ? savedCourseData.tags.join(', ') : '';

  // tagsInput.addEventListener('keydown', function (e) {
  //   if (e.key === 'Enter' && tagsInput.value.trim()) {
  //     const newTag = tagsInput.value.trim();

  //     if (!existingTags.includes(newTag)) {
  //       existingTags.push(newTag);
  //       localStorage.setItem('tags', JSON.stringify(existingTags));

  //       const tagElement = document.createElement('div');
  //       tagElement.textContent = newTag;
  //       tagElement.classList.add('tag');
  //       tagsList.appendChild(tagElement);

  //       tagsInput.value = '';
  //     }
  //   }
  // });
//   const thumbnailInput = document.querySelector("#course_thumbnail");
//   const fileNameSpan = document.querySelector("#file-name");

//   // Відновлення thumbnail з localStorage
//   const savedThumbnail = localStorage.getItem('courseThumbnail');
//   if (savedThumbnail) {
//     fileNameSpan.textContent = savedThumbnail;
//   }

//   thumbnailInput.addEventListener('change', (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       fileNameSpan.textContent = file.name;
//       // Зберігаємо в localStorage
//       localStorage.setItem('courseThumbnail', file.name);
//     }
//   });


//   // Перевірка та відображення модулів і лекцій
//   const modulesContainer = document.getElementById('modules-container');
//   if (modulesContainer && savedCourseData.modules) {
//     savedCourseData.modules.forEach(module => {
//       const moduleElement = document.createElement('div');
//       moduleElement.classList.add('module');
//       moduleElement.dataset.id = module.id;
//       moduleElement.innerHTML = `
//         <input type="text" value="${module.title}" />
//         <div class="lectures"></div>
//       `;

//       const lecturesContainer = moduleElement.querySelector('.lectures');
//       module.lectures.forEach(lecture => {
//         const lectureElement = document.createElement('div');
//         lectureElement.classList.add('lecture');
//         lectureElement.dataset.id = lecture.id;
//         lectureElement.innerHTML = `
//           <input type="text" value="${lecture.title}" />
//           <textarea>${lecture.description}</textarea>
//         `;
//         lecturesContainer.appendChild(lectureElement);
//       });

//       modulesContainer.appendChild(moduleElement);
//     });
//   }

//   // Виведення файлів лекцій
//   const fileNamesList = document.getElementById('file-names-list');
//   if (fileNamesList && savedCourseData.lectureFiles) {
//     savedCourseData.lectureFiles.forEach(fileName => {
//       const fileItem = document.createElement('li');
//       fileItem.textContent = fileName;
//       fileNamesList.appendChild(fileItem);
//     });
//   }

//   // Виведення відео лекцій
//   const videoNamesList = document.getElementById('video-names-list');
//   if (videoNamesList && savedCourseData.lectureVideos) {
//     savedCourseData.lectureVideos.forEach(videoName => {
//       const videoItem = document.createElement('li');
//       videoItem.textContent = videoName;
//       videoNamesList.appendChild(videoItem);
//     });
//   }
// });

window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastClosedTime', Date.now());
});

window.addEventListener('load', () => {
  const lastClosedTime = localStorage.getItem('lastClosedTime'); 
  if (lastClosedTime) {
      const elapsedTime = Date.now() - parseInt(lastClosedTime, 10);
      if (elapsedTime > 1000) { // 2 хвилини
          const authorId = JSON.parse(localStorage.getItem('courseDraft'))?.authorId || null;
          localStorage.setItem('courseDraft', JSON.stringify({ authorId }));
      }
  }
  const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
  
  if (Object.keys(savedCourseData).length === 1 && savedCourseData.authorId !== undefined) {
      console.log("Чернетка очищена, окрім authorId");
      document.querySelector("input[data-lang='enterCourseTitle']").value = '';
      document.querySelector("textarea[data-lang='enterDescription']").value = '';
      document.querySelector("#course-price").value = ''; 

      const categoryElement = document.getElementById('category-wrapper')?.querySelector('.select-trigger');
      if (categoryElement) categoryElement.dataset.value = '';
      const educationElement = document.getElementById('education-wrapper')?.querySelector('.select-trigger');
      if (educationElement) educationElement.dataset.value = '';
  } else {
      console.log("Завантажені дані чернетки з localStorage:", savedCourseData);
  // Відновлення заголовку, опису та ціни курсу
  const courseTitleElement = document.querySelector("input[data-lang='enterCourseTitle']");
  if (courseTitleElement) courseTitleElement.value = savedCourseData.title || '';

  const courseDescriptionElement = document.querySelector("textarea[data-lang='enterDescription']");
  if (courseDescriptionElement) courseDescriptionElement.value = savedCourseData.description || '';

  const coursePriceElement = document.querySelector("input[data-lang='enterPrice']");
  if (coursePriceElement) coursePriceElement.value = savedCourseData.price || '';

  // Відновлення збереженої категорії
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    const categoryElement = document.querySelector('#category-wrapper .select-trigger');
    const selectedOption = document.querySelector(`.option[data-value="${savedCategory}"]`);
    if (categoryElement && selectedOption) {
      categoryElement.dataset.value = savedCategory;
      categoryElement.querySelector('span').textContent = selectedOption.textContent;
    }
  }

  // Відновлення збереженого рівня освіти
  if (savedCourseData.educationLevel) {
    const educationElement = document.querySelector('#education-wrapper .select-trigger');
    const selectedOption = document.querySelector(`#education-wrapper .option[data-value="${savedCourseData.educationLevel}"]`);
    if (educationElement && selectedOption) {
      educationElement.dataset.value = savedCourseData.educationLevel;
      educationElement.querySelector('span').textContent = selectedOption.textContent;
    }
  }  }
});
// Обробка вибору категорії
document.querySelectorAll('#category-wrapper .option').forEach(option => {
  option.addEventListener('click', () => {
    const selectedCategory = option.getAttribute('data-value');
    const categoryElement = document.querySelector('#category-wrapper .select-trigger');
    if (categoryElement) {
      categoryElement.dataset.value = selectedCategory;
      categoryElement.querySelector('span').textContent = option.textContent;
      localStorage.setItem('selectedCategory', selectedCategory);
    }
  });
});

// Обробка вибору рівня освіти
document.querySelectorAll('#education-wrapper .option').forEach(option => {
  option.addEventListener('click', () => {
    const selectedEducationLevel = option.getAttribute('data-value');
    const educationElement = document.querySelector('#education-wrapper .select-trigger');
    if (educationElement) {
      educationElement.dataset.value = selectedEducationLevel;
      educationElement.querySelector('span').textContent = option.textContent;

      // Оновлюємо тільки рівень освіти, не чіпаючи інші дані
      const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
      savedCourseData.educationLevel = selectedEducationLevel;
      localStorage.setItem('courseDraft', JSON.stringify(savedCourseData));
    }
  });
});

// Збереження введених даних у localStorage в режимі реального часу
document.querySelector("input[data-lang='enterCourseTitle']").addEventListener('input', (e) => {
  const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
  savedCourseData.title = e.target.value;
  localStorage.setItem('courseDraft', JSON.stringify(savedCourseData));
});

document.querySelector("textarea[data-lang='enterDescription']").addEventListener('input', (e) => {
  const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
  savedCourseData.description = e.target.value;
  localStorage.setItem('courseDraft', JSON.stringify(savedCourseData));
});

document.querySelector("input[data-lang='enterPrice']").addEventListener('input', (e) => {
  const savedCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
  savedCourseData.price = e.target.value;
  localStorage.setItem('courseDraft', JSON.stringify(savedCourseData));
});

  
document.getElementById("save-draft-btn").addEventListener("click", function() {   
  saveDraftAutomatically();
  // window.location.href = '/profile-teacher';
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
  
    
    const lectureVideos = document.querySelectorAll('.lecture-video');
    lectureVideos.forEach(input => {
      if (input.files.length > 0) {
        Array.from(input.files).forEach(file => {
          formData.append('lecture_videos', file);
        });
      }
    });
  
    
    fetch('/api/courses/create', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) { 
          // window.location.href = '/profile-teacher';
        } else {
          alert('Failed to create the course: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the course.');
      });
  });  