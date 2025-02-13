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
    addGenerTest:'Add general test',
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
    addTest:'Add Test',
    enterTestlink:'Insert link to test',
    moduleTitle: "Module",
    enterModuleTitle: "Enter module title",
    lecture: "Lecture",
    lectureTitle: "Enter lecture title",
    enterLectureDescription: "Enter lecture description",
    chooseFiles: "Upload Materials (PDF, DOCX etc.)",
    chooseVideo: "Upload Video",
    chooseAudio: "Upload Audio",
    videoFileChosen: "No video chosen",
    fillRequiredFields: "Please fill all required fields!",
    confirmDeleteModule: 'Are you sure you want to delete this module?',
    courseTags: "Course Tags (hidden from users)",
    enterTags: "Enter tags",
    tagTip: "To add a tag, press ENTER",
    note: "* Note: Lecture description or uploaded files will not be saved after refreshing or closing the page. Please add them again.",
    restriction: "* Note: You can only add one type of content: video, audio, materials, or description.",
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
    addGenerTest:'Додати загальний тест',
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
    addTest:'Додати тест',
    enterTestlink:'Вставте посилання на тест',
    moduleTitle: "Модуль",
    enterModuleTitle: "Введіть назву модуля",
    lecture: "Лекція",
    lectureTitle: "Введіть назву лекції",
    enterLectureDescription: "Введіть опис лекції",
    chooseFiles: "Завантажити матеріали (PDF, DOCX тощо)",
    chooseVideo: "Завантажити відео",
    chooseAudio: "Завантажити аудіо",
    videoFileChosen: "Відео не вибрано",
    fillRequiredFields: "Будь ласка, заповніть усі обов'язкові поля!",
    confirmDeleteModule: 'Ви впевнені, що хочете видалити цей модуль?',
    courseTags: "Теги курсу (приховані від користувачів)",
    enterTags: "Введіть теги",
    tagTip: "Щоб додати тег, натисніть ENTER",
    note: "Примітка: Опис лекції або завантажені файли не будуть збережені після оновлення або закриття сторінки. Будь ласка, додайте їх знову.",
    restriction: "* Примітка: Ви можете додати лише один тип контенту: відео, аудіо, матеріали або опис.",
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
  
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("lastExitTime", Date.now());
  });
  
  // Перевіряємо, скільки часу минуло з моменту виходу
  window.addEventListener("load", () => {
    const lastExitTime = localStorage.getItem("lastExitTime");
    if (lastExitTime && Date.now() - lastExitTime > 10000) { // 10 секунд
      localStorage.removeItem("modules"); // Очищаємо дані
    }
  
    // Далі твій код, який завантажує модулі (якщо вони залишились)
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
  
  const createGeneralTestBtn = document.getElementById("create-general-test-btn");

    // Додаємо обробник події для переходу на сторінку створення загального тесту
    createGeneralTestBtn.addEventListener("click", () => {
        window.location.href = "/test-creation?general=true";
    });
  const addGeneralTestBtn = document.getElementById("add-general-test-btn");
  addGeneralTestBtn.addEventListener("click", () => {
    if (!document.querySelector(".gener-test-link-input")) {
        const testInputDiv = document.createElement("div");
        testInputDiv.innerHTML = `
            <input type="text" class="gener-test-link-input"  data-lang="enterTestlink" placeholder="Insert link to test">
        `;
        // Додаємо поле після кнопки
        addGeneralTestBtn.after(testInputDiv);
    }
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
      <button class="add-test-btn">${translations[userLang].addTest}</button>
    `;
  
    modulesList.appendChild(moduleDiv);
  
    // Відновлення лекцій модуля
    if (moduleData.lectures && moduleData.lectures.length > 0) {
      moduleData.lectures.forEach((lectureData) => {
        addLecture(moduleDiv, lectureData);
      });
    }
    const moduleTitleInput = moduleDiv.querySelector("input[type='text']");
    moduleTitleInput.addEventListener("input", saveModulesToLocalStorage);
    
    moduleDiv.querySelector(".add-lecture-btn").addEventListener("click", (e) => {
      e.preventDefault();  
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
    moduleDiv.querySelector(".add-test-btn").addEventListener("click", () => {
      if (!moduleDiv.querySelector(".test-link-input")) {
          const testInputDiv = document.createElement("div");
          testInputDiv.innerHTML = `
              <input type="text" class="test-link-input" data-lang="enterTestlink" placeholder="Insert link to test">
          `;
          moduleDiv.appendChild(testInputDiv);
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
    if (lectureData.audioFile) lectureDiv.dataset.audioFile = lectureData.audioFile;

    lectureDiv.innerHTML = `
      <div class="container">
        <p class="title-3">${translations[userLang].lecture} ${lecturesDiv.children.length + 1}</p>
        <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
      </div>
      <input type="text" placeholder="${translations[userLang].lectureTitle}" value="${lectureData.title || ""}">
      <label class="title-3">${translations[userLang].enterLectureDescription}</label>
      <textarea class="lecture-description" placeholder="${translations[userLang].enterLectureDescription}" rows="5">${lectureData.description || ""}</textarea>
      <div class="restriction" style="color: #ff2600; font-size:13px; margin-top: 0px; font-weight: 430; margin-bottom: 15px" data-lang="restriction"> ${translations[userLang].restriction}</div>


      <div class="note-container">
        <label class="upload">${translations[userLang].chooseVideo}</label>
        <div class="custom-file-container">
          <label class="custom-file-upload" id="upload">
            ${translations[userLang].chooseFile}
            <input class="lecture-video" name="lecture_video" type="file" accept="video/*" />
          </label>
          <div class="file-names-list">${lectureData.videoFile ? `<span>${lectureData.videoFile}</span>` : ""}</div>
        </div>
      </div>

      <div class="note-container">
        <label class="upload">${translations[userLang].chooseFiles}</label>
        <div class="custom-file-container">
          <label class="custom-file-upload" id="upload">
            ${translations[userLang].chooseFile}
            <input class="lecture-materials" name="lecture_files" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.svg,.webp" />

          </label>
          <div class="file-names-list">
            ${lectureData.materialsFiles ? lectureData.materialsFiles.map(file => `<span>${file}</span>`).join("") : ""}
          </div>
        </div>
      </div>

      <div class="note-container">
        <label class="upload">${translations[userLang].chooseAudio}</label>
        <div class="custom-file-container">
          <label class="custom-file-upload" id="upload">
            ${translations[userLang].chooseFile}
            <input class="lecture-audio" name="lecture_audio" type="file" accept="audio/*" />
          </label>
          <div class="file-names-list">${lectureData.audioFile ? `<span>${lectureData.audioFile}</span>` : ""}</div>
        </div>
        <div class="file-warning" style="color: #ff2600; font-size:13px; margin-top: 0px; font-weight: 430; margin-bottom: 15px" data-lang="note"> ${translations[userLang].note}</div>     
      </div>`;

    lecturesDiv.appendChild(lectureDiv);

    const inputs = {
      video: lectureDiv.querySelector(".lecture-video"),
      materials: lectureDiv.querySelector(".lecture-materials"),
      audio: lectureDiv.querySelector(".lecture-audio"),
      description: lectureDiv.querySelector(".lecture-description"),
    };
 

    function disableOtherInputs(selectedInput) {
      let isDisabled = inputs.description.value.trim().length > 0 || inputs.video.files.length > 0 || 
      inputs.materials.files.length > 0 || inputs.audio.files.length > 0;

      Object.values(inputs).forEach(input => {
          if (input !== selectedInput) {
              input.disabled = isDisabled;
              input.style.backgroundColor = isDisabled ? "#e0e0e0" : "";  
              input.style.cursor = isDisabled ? "not-allowed" : "";  
          }
      });
  
      document.querySelectorAll("#upload").forEach(label => {
        let input = label.querySelector("input");
        if (input !== selectedInput) {
            label.style.backgroundColor = isDisabled ? "#888888" : "";  
            label.style.cursor = isDisabled ? "not-allowed" : "";
          }
      });
    }
    Object.values(inputs).forEach(input => {
      input.addEventListener("change", function() {
          disableOtherInputs(this);
      });
    });

    inputs.description.addEventListener("input", function () {
      disableOtherInputs(this);
    });
    
    // Перевіряємо textarea після завантаження сторінки
    document.addEventListener("DOMContentLoaded", function() {
        disableOtherInputs(inputs.description);
    });

    function updateFileNamesList(input, fileListDiv) {
        fileListDiv.innerHTML = Array.from(input.files).map(file => `<span>${file.name}</span>`).join("");
        disableOtherInputs(input);
    }

    inputs.video.addEventListener("change", function () {
        updateFileNamesList(this, lectureDiv.querySelectorAll(".file-names-list")[0]);
    });

    inputs.materials.addEventListener("change", function () {
        updateFileNamesList(this, lectureDiv.querySelectorAll(".file-names-list")[1]);
    });

    inputs.audio.addEventListener("change", function () {
        updateFileNamesList(this, lectureDiv.querySelectorAll(".file-names-list")[2]);
    });

    inputs.description.addEventListener("input", function () {
        disableOtherInputs(this);
    });

    lectureDiv.querySelector(".delete-lecture-btn").addEventListener("click", () => {
        lectureDiv.remove();
        saveModulesToLocalStorage();
        updateLectureNumbers(moduleDiv);
    });
    lectureDiv.querySelector("input[type='text']").addEventListener("input", saveModulesToLocalStorage);
    lectureDiv.querySelector("textarea").addEventListener("input", saveModulesToLocalStorage);

}

  
  function updateFileNamesList(inputElement, fileNamesList) {
    const files = Array.from(inputElement.files).map(file => file.name);
    fileNamesList.innerHTML = files.length > 0 ? files.map(name => `<span>${name}</span>`).join("") : ""; 
  }

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
    moduleDiv.dataset.index = index + 1; // Оновлюємо dataset для збереження порядку
  });

  moduleCounter = modules.length + 1; // Оновлення лічильника модулів
}

  
  function saveModulesToLocalStorage() {
    const modules = [];
    document.querySelectorAll(".module").forEach((moduleDiv) => {
      const moduleTitle = moduleDiv.querySelector("input[type='text']").value;
      const testLinkInput = moduleDiv.querySelector(".test-link-input"); // Отримуємо поле для посилання на тест
      const testLink = testLinkInput ? testLinkInput.value.trim() : ""; // Беремо значення або порожній рядок
      const lectures = [];
  
      moduleDiv.querySelectorAll(".lecture").forEach((lectureDiv) => {
        const lectureTitle = lectureDiv.querySelector("input[type='text']").value || ""; 
        
        lectures.push({
          title: lectureTitle, 
        });
   
      });
  
      modules.push({ title: moduleTitle, testLink: testLink,  lectures });
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

  const lastVisitTime = localStorage.getItem('lastVisitTime');
  const currentTime = new Date().getTime();

  if (lastVisitTime && (currentTime - lastVisitTime > 10000)) {
    tagsList = [];
    saveTagsToLocalStorage();
  }

  updateTagsDisplay();

  // Додаємо нові теги по Enter
  tagsInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagsInput.value.trim();
      if (tag && !tagsList.includes(tag) && tagsList.length < 5) {  
        tagsList.push(tag);
        tagsInput.value = '';
        updateTagsDisplay();
        saveTagsToLocalStorage();
        tagsInput.focus();  
      }
    }
  });

  // Очищення тегів
  function clearTags() {
    tagsList = []; 
    updateTagsDisplay(); 
    saveTagsToLocalStorage();  
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
    localStorage.setItem('lastVisitTime', currentTime);
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

    const GenTestLinkInput = document.querySelector(".gener-test-link-input"); 
    const GenTestLink = GenTestLinkInput ? GenTestLinkInput.value.trim() : ""; 

    const tags = JSON.parse(localStorage.getItem('tagsList')) || [];

    
    const existingCourseData = JSON.parse(localStorage.getItem('courseDraft')) || {};
    const existingModules = existingCourseData.modules || [];

    const modules = [];
    document.querySelectorAll('.module').forEach((moduleDiv, moduleIndex) => {
      const moduleId = moduleDiv.dataset.id && !moduleDiv.dataset.id.startsWith('module-') 
          ? parseInt(moduleDiv.dataset.id, 10) 
          : null; 
      const moduleTitle = moduleDiv.querySelector('input').value;
      const testLinkInput = moduleDiv.querySelector(".test-link-input"); // Отримуємо поле для посилання на тест
      const testLink = testLinkInput ? testLinkInput.value.trim() : ""; // Беремо значення або порожній рядок
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
          test_link: testLink, 
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

const lectureAudio = document.querySelectorAll('.lecture-audio');
lectureAudio.forEach(input => {
  if (input.files.length > 0) {
    Array.from(input.files).forEach(file => {
      
      formData.append('lecture_audio', file);
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
  test_link: GenTestLink,
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
    formData.append('test_link',GenTestLink);


    fetch('/api/courses/save-draft', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
   
  }

setInterval(saveDraftAutomatically, 10000);  

window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastClosedTime', Date.now());
});

window.addEventListener('load', () => {
  const lastClosedTime = localStorage.getItem('lastClosedTime'); 
  if (lastClosedTime) {
      const elapsedTime = Date.now() - parseInt(lastClosedTime, 10);
      if (elapsedTime > 10000) { // змінити
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
  window.location.href = '/profile-teacher';
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
  
    const lectureAudio = document.querySelectorAll('.lecture-audio');
    lectureAudio.forEach(input => {
      if (input.files.length > 0) {
        Array.from(input.files).forEach(file => {
          formData.append('lecture_audio', file);
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
          window.location.href = '/profile-teacher';
        } 
        
      });
  });  