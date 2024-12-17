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

const modulesList = document.getElementById("modules-list");
const addModuleBtn = document.getElementById("add-module-btn");

let moduleCounter = 1;

addModuleBtn.addEventListener("click", () => {
  const moduleId = `module-${moduleCounter++}`;
  const moduleDiv = document.createElement("div");
  moduleDiv.classList.add("module");
  moduleDiv.id = moduleId;

  moduleDiv.innerHTML = `
        <p class="title-2">Module ${moduleCounter - 1}</p>
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

  addLectureBtn.addEventListener("click", () => {
    const lecturesDiv = moduleDiv.querySelector(".lectures");
    const lectureDiv = document.createElement("div");
    lectureDiv.classList.add("lecture");
    lectureDiv.innerHTML = `
          <div class="container">
              <p class="title-3">Lecture ${lectureCounter++}</p>
              <button class="delete-lecture-btn"><img src="../images/delete.png" alt=""></button>
          </div> 
          <input type="text" placeholder="Lecture Title">
          
          <label class="upload">Upload Materials (Video, PDF, etc.)</label> 
          <br/> 
          <div class="container">
          <label class="custom-file-upload">
              Choose Files
              <input class="lecture-materials" type="file" multiple />
          </label>
          <div class="file-names-list"></div></div>     
      `;
  
    lecturesDiv.appendChild(lectureDiv);
  
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
  
    lectureDiv
      .querySelector(".delete-lecture-btn")
      .addEventListener("click", () => {
        lectureDiv.remove();
      });
  });
  

  deleteModuleBtn.addEventListener("click", () => {
    if (
      confirm(`Are you sure you want to delete Module ${moduleCounter - 1}?`)
    ) {
      moduleDiv.remove();
    }
  });
});
// Закриваємо всі відкриті селекти
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
  

document
  .getElementById("create-course")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const courseTitle = document.getElementById("course-title").value;
    const courseDescription =
      document.getElementById("course-description").value;

    const modules = [];
    document.querySelectorAll(".module").forEach((moduleDiv) => {
      const module = {
        title: moduleDiv.querySelector(".title-2").innerText,
        lectures: [],
      };
      moduleDiv.querySelectorAll(".lecture").forEach((lectureDiv) => {
        const lectureTitle = lectureDiv.querySelector("input").value;
        const materials = lectureDiv.querySelector(".lecture-materials").files;
        module.lectures.push({
          title: lectureTitle,
          materials: Array.from(materials).map((file) => file.name),
        });
      });
      modules.push(module);
    });

    const courseData = {
      title: courseTitle,
      description: courseDescription,
      modules: modules,
    };

    console.log(courseData);
    alert("Course created successfully!");
    this.reset();
    modulesList.innerHTML = "";
  });
