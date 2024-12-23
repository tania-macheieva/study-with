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

document.addEventListener('DOMContentLoaded', () => {
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
      <div class="lectures">
        <!-- List of lectures will be added here -->
      </div>
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
          <p class="title-3">Lecture ${lectureCounter++}</p>
          <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
        </div>
        <input type="text" placeholder="Lecture Title">
        <label class="title-3" for="lecture-description">Description</label>
          <textarea placeholder="Enter lecture  description" rows="5"></textarea>
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

      updateLectureNumbers(moduleDiv);

      
      const fileInput = lectureDiv.querySelector(".lecture-materials");
      const fileNamesList = lectureDiv.querySelector(".file-names-list");

      fileInput.addEventListener("change", () => {
        const files = Array.from(fileInput.files);

        files.forEach((file) => {
          const fileItem = document.createElement("div");
          fileItem.classList.add("file-name-item");
          fileItem.innerHTML = `
            <span>${file.name}</span>
            <button class="delete-file-btn"><i class="fas fa-times"></i></button>
          `;

          fileItem.querySelector(".delete-file-btn").addEventListener("click", () => {
            fileItem.remove();
          });

          fileNamesList.appendChild(fileItem);
        });

        fileInput.value = "";
      });

      
      const deleteLectureBtn = lectureDiv.querySelector(".delete-lecture-btn");
      deleteLectureBtn.addEventListener("click", () => {
        lectureDiv.remove();
        updateLectureNumbers(moduleDiv);  
      });
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
    lecturesDiv.querySelectorAll(".lecture").forEach((lectureDiv, index) => {
      const lectureTitle = lectureDiv.querySelector(".title-3");
      lectureTitle.innerText = `Lecture ${index + 1}`; 
    });
  }

  
  function updateModuleNumbers() {
    document.querySelectorAll(".module").forEach((moduleDiv, index) => {
      const moduleTitle = moduleDiv.querySelector(".title-2");
      moduleTitle.innerText = `Module ${index + 1}`; 
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
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

  
  educationTrigger.addEventListener('click', (event) => {
    event.preventDefault(); 
    educationWrapper.classList.toggle('open');
    categoryWrapper.classList.remove('open'); 
  });

  
  categoryOptions.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', (event) => {
      event.preventDefault(); 
      categorySpan.textContent = option.textContent;
      categoryTrigger.dataset.value = option.dataset.value; 
      categoryWrapper.classList.remove('open'); 
    });
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

  
  document.getElementById('create-course').addEventListener('submit', function(e) {
    e.preventDefault();

    // Збір даних з форми
    const courseTitle = document.getElementById('course-title').value;
    const courseDescription = document.getElementById('course-description').value;
    const coursePrice = document.getElementById('course-price').value;
    const courseCategory = document.querySelector('.custom-select .select-trigger span').textContent;
    const educationLevel = document.querySelector('#education-wrapper .select-trigger span').textContent;
    const courseThumbnail = document.getElementById('course-thumbnail').files[0];  // файл мініатюри

    // Отримання даних про авторизацію
    const authData = getAuthDataFromStorage();  // Якщо немає токену в URL, беремо з локального сховища
    const authorId = authData ? authData.userId : null;

    // Валідація даних
    if (!courseTitle || !courseDescription || !coursePrice || !courseCategory || !educationLevel || !authorId) {
        alert('Please fill all required fields!');
        return;
    }

    const formData = new FormData();
    formData.append('course_title', courseTitle);
    formData.append('course_description', courseDescription);
    formData.append('course_price', coursePrice);
    formData.append('course_category', courseCategory);
    formData.append('education_level', educationLevel);
    formData.append('course_thumbnail', courseThumbnail);
    formData.append('author_id', authorId); // Додаємо author_id

    // Відправка запиту на сервер
    fetch('/api/courses/create', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Course created successfully!');
            // Направити користувача на сторінку курсу або очистити форму
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