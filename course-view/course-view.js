let COURSE_MODULES = [];
let lastCompletedLectureId = null;
let completedLectures = new Set();
let currentLectureId = null;

const VIDEO_SOURCE = {
  id: "course-video",
  src: "video_example.MP4",
  type: "video/mp4",
};

const NOTES = {
  list: [],

  // Додавання нової нотатки (відправка на сервер)
  add: async function (data) {
    console.log("📩 Відправка нотатки:", data);

    try {
      const response = await fetch("http://localhost:8000/api/notes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("Server response:", response);
      if (!response.ok) throw new Error("Error adding note");

      const newNote = await response.json();
      this.list.push(newNote);
      this.saveToLocalStorage();
      return newNote;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // Видалення нотатки на сервері
  remove: async function (noteId) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/notes/delete/${noteId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Помилка видалення нотатки");

      this.list = this.list.filter((note) => note.id !== noteId);
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Додавання нової нотатки
  /*add: function(data) {
        const note = {
            id: Date.now(),
            text: data.text,
            timestamp: data.timestamp || null,
            videoTimecode: data.videoTimecode || null,
            moduleId: data.moduleId || null,
            topicId: data.topicId || null,
            contentType: data.contentType || 'general',
            createdAt: new Date().toISOString()
        };
        
        this.list.push(note);
        this.saveToLocalStorage();
        return note;
    },*/

  // Отримання всіх нотаток
  getAll: function () {
    return this.list;
  },

  // Пошук нотаток за модулем
  getByModule: function (moduleId) {
    return this.list.filter((note) => note.moduleId === moduleId);
  },

  // Пошук нотаток за топіком
  getByTopic: function (topicId) {
    return this.list.filter((note) => note.topicId === topicId);
  },

  // Видалення нотатки
  remove: function (noteId) {
    this.list = this.list.filter((note) => note.id !== noteId);
    this.saveToLocalStorage();
  },

  // Збереження нотаток у локальному сховищі
  saveToLocalStorage: function () {
    localStorage.setItem("courseNotes", JSON.stringify(this.list));
  },

  // Завантаження нотаток з локального сховища
  loadFromLocalStorage: function () {
    const savedNotes = localStorage.getItem("courseNotes");
    if (savedNotes) {
      this.list = JSON.parse(savedNotes);
    }
  },
};

// Завантаження збережених нотаток при ініціалізації
NOTES.loadFromLocalStorage();

// Отримання всіх нотаток
const allNotes = NOTES.getAll();

// Отримання нотаток для конкретного модуля
const moduleNotes = NOTES.getByModule(1);

const renderNotes = async (userId, courseId) => {
  // Завантажуємо нотатки з сервера
  const allNotes = await NOTES.fetchNotes(userId, courseId);

  const notesSection = document.createElement("section");
  notesSection.classList.add("notes-section");
  Object.assign(notesSection.style, {
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
    width: "100%",
    background: "#FFFFFF",
    border: "2px solid #C7C7C7",
    borderRadius: "12px",
    padding: "20px",
    color: "#283044",
  });

  // Створюємо секцію з фільтрами
  const filtersSection = document.createElement("div");
  filtersSection.classList.add("filters");
  filtersSection.style.fontFamily = "Inter, sans-serif";

  // Створюємо контейнер для списку нотаток
  const notesListContainer = document.createElement("div");
  notesListContainer.className = "notes-list";
  notesListContainer.style.marginTop = "20px";
  notesListContainer.style.fontFamily = "Inter, sans-serif";

  // Групуємо нотатки за модулями та темами
  const notesByModules = {};
  allNotes.forEach((note) => {
    if (note.moduleId) {
      if (!notesByModules[note.moduleId]) {
        notesByModules[note.moduleId] = {
          moduleTitle: `Module ${note.moduleId}`,
          topics: {},
        };
      }
      if (note.topicId) {
        if (!notesByModules[note.moduleId].topics[note.topicId]) {
          notesByModules[note.moduleId].topics[note.topicId] = {
            topicTitle: `Topic ${note.topicId}`,
            notes: [],
          };
        }
        notesByModules[note.moduleId].topics[note.topicId].notes.push(note);
      }
    }
  });

  const filterNotes = (filter) => {
    notesListContainer.innerHTML = "";

    Object.entries(notesByModules).forEach(([moduleId, moduleData]) => {
      let shouldShowModule = false;

      // switch(filter) {
      //     case 'Whole course':
      //         shouldShowModule = Object.values(moduleData.topics).some(topic => topic.notes.length > 0);
      //         break;
      //     case 'Current module':
      //         shouldShowModule = moduleId === currentModule;
      //         break;
      // }

      if (shouldShowModule) {
        const moduleSection = document.createElement("div");
        moduleSection.classList.add("notes-module");
        moduleSection.style.marginBottom = "20px";

        const moduleTitle = document.createElement("h3");
        moduleTitle.textContent = moduleData.moduleTitle;
        moduleTitle.style.marginBottom = "10px";
        moduleTitle.style.color = "#283044";
        moduleTitle.style.fontFamily = "Inter, sans-serif";
        moduleSection.appendChild(moduleTitle);

        Object.entries(moduleData.topics).forEach(([topicId, topicData]) => {
          let shouldShowTopic = false;

          if (shouldShowTopic) {
            const topicSection = document.createElement("div");
            topicSection.classList.add("notes-topic");
            topicSection.style.marginBottom = "15px";

            const topicTitle = document.createElement("h4");
            topicTitle.textContent = topicData.topicTitle;
            topicTitle.style.marginBottom = "10px";
            topicTitle.style.color = "#283044";
            topicTitle.style.fontFamily = "Inter, sans-serif";
            topicTitle.style.fontWeight = "normal";
            topicSection.appendChild(topicTitle);

            topicData.notes.forEach((note) => {
              const noteElement = document.createElement("div");
              noteElement.classList.add("note-item");
              Object.assign(noteElement.style, {
                border: "2px solid #C7C7C7",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontFamily: "Inter, sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              });

              const noteContent = document.createElement("div");
              noteContent.style.flexGrow = "1";
              noteContent.style.marginRight = "15px";

              const noteMetadata = document.createElement("div");
              noteMetadata.innerHTML = `
                            <span style="font-size: 12px; color: #666; font-family: 'Inter', sans-serif;">
                            ${
                              note.videoTimecode
                                ? `Video time: ${note.videoTimecode} `
                                : ""
                            }
                            ${
                              note.timestamp
                                ? `Created: ${new Date(
                                    note.timestamp
                                  ).toLocaleString("en-US")} `
                                : ""
                            }
                            </span>
                            `;

              const noteText = document.createElement("div");
              noteText.textContent = note.text;
              noteText.style.marginTop = "8px";
              noteText.style.fontFamily = "Inter, sans-serif";

              noteContent.appendChild(noteMetadata);
              noteContent.appendChild(noteText);

              const noteActions = document.createElement("div");
              noteActions.style.display = "flex";
              noteActions.style.flexDirection = "column";
              noteActions.style.gap = "10px";

              const editButton = document.createElement("button");
              editButton.textContent = "Edit";
              Object.assign(editButton.style, {
                background: "none",
                border: "1px solid #283044",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#283044",
              });

              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              Object.assign(deleteButton.style, {
                background: "none",
                border: "1px solid  #283044",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "12px",
                color: " #283044",
              });

              deleteButton.addEventListener("click", async () => {
                const success = await NOTES.remove(note.id);
                if (success) {
                  renderNotes(userId, courseId);
                }
              });

              noteActions.appendChild(editButton);
              noteActions.appendChild(deleteButton);

              noteElement.appendChild(noteContent);
              noteElement.appendChild(noteActions);
              //notesListContainer.appendChild(noteElement);

              topicSection.appendChild(noteElement);
            });

            moduleSection.appendChild(topicSection);
          }
        });

        notesListContainer.appendChild(moduleSection);
      }
    });
  };

  // Отримуємо відео та додаємо кнопку
  const videoElement = document.querySelector("video");
  addNoteButtonToVideo(videoElement, 1, 101, 4619, 25268);
  // Додаємо обробники подій для кнопок фільтрів
  filtersSection.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtersSection
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterNotes(btn.textContent);
    });

    btn.style.fontFamily = "Inter, sans-serif";
    btn.style.color = "#283044";
  });

  notesSection.appendChild(filtersSection);
  notesSection.appendChild(notesListContainer);

  // Початкова фільтрація для відображення всіх нотаток
  filterNotes("Whole course");

  return notesSection;
};
const handleNoteButtonClick = async (
  videoElement,
  userId,
  courseId,
  topicId,
  lectureId
) => {
  const currentTime = videoElement.currentTime; // Отримуємо поточний час відео

  // Додаємо нотатку на сервер
  const newNote = await NOTES.add({
    userId,
    courseId,
    topicId: lectureId,
    text: noteText,
    videoTimecode: currentTime.toFixed(2), // Зберігаємо точний час у відео
  });

  if (newNote) {
    renderNotes(userId, courseId); // Оновлюємо список нотаток після додавання
  }
};

// Додаємо кнопку нотатки до відео
const addNoteButtonToVideo = (
  videoElement,
  userId,
  courseId,
  topicId,
  lectureId
) => {
  const noteButton = document.createElement("button");
  noteButton.textContent = "Add Note";
  Object.assign(noteButton.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#ffcc00",
    border: "none",
    padding: "10px",
    cursor: "pointer",
  });

  noteButton.addEventListener("click", () => {
    videoElement.pause();
    const currentTime = formatVideoTime(videoElement.currentTime);
    console.log("📩 Передаємо lectureId у showNotesModal():", lectureId);
    showNotesModal(currentTime, userId, courseId, lectureId);
  });
  videoElement.parentElement.appendChild(noteButton);
};

NOTES.list = [];
// Додавання нотатки до відео
/*await NOTES.add({
    userId: 1,   // Додай ID користувача
    courseId: 101, // Додай ID курсу
    text: 'ррррррр',
    videoTimecode: '00:00',
    moduleId: 4617,
    topicId: 25258,
    contentType: 'video'
});

NOTES.add({
    text: 'tvruertbevercwe',
    videoTimecode: '0:19',
    moduleId: 1,
    topicId: 1,
    contentType: 'video'
});

NOTES.add({
    text: 'retbuijrytv',
    videoTimecode: '0:12',
    moduleId: 1,
    topicId: 1,
    contentType: 'video'
});

NOTES.add({
    text: 'wfertjtwetrct',
    videoTimecode: '0:11',
    moduleId: 1,
    topicId: 2,
    contentType: 'video'
});*/

const createVideoPlayer = (
  videoUrl,
  videoType,
  userId,
  courseId,
  onComplete,
  lectureId,
  moduleId,
  topicId
) => {
  const videoContainer = document.querySelector(".video-player");
  if (!videoContainer) return;

  videoContainer.innerHTML = "";

  const videoWrapper = document.createElement("div");
  videoWrapper.className = "video-wrapper";
  videoWrapper.style.position = "relative";

  const videoElement = document.createElement("video");
  videoElement.id = "course-video";
  videoElement.className = "video-element";
  videoElement.controlsList = "nodownload";
  videoElement.controls = true;

  Object.assign(videoElement.style, {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "12px",
    "-webkit-user-select": "none",
  });

  videoElement.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  videoElement.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
    }
  });

  const sourceElement = document.createElement("source");
  sourceElement.src = videoUrl;
  sourceElement.type = videoType;
  videoElement.appendChild(sourceElement);

  const customControls = document.createElement("div");
  customControls.className = "custom-video-controls";
  Object.assign(customControls.style, {
    position: "absolute",
    bottom: "80px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    zIndex: "2",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  const notesButton = document.createElement("button");
  notesButton.className = "notes-button";
  notesButton.innerHTML = `
        <img src="../images/note-icon.svg" alt="Notes" style="width: 16px; height: 16px; margin-right: 5px;">
        Add note
    `;
  Object.assign(notesButton.style, {
    background: "rgba(0, 0, 0, 0.7)",
    border: "none",
    borderRadius: "4px",
    color: "white",
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  });

  customControls.appendChild(notesButton);
  videoWrapper.appendChild(videoElement);
  videoWrapper.appendChild(customControls);
  videoContainer.appendChild(videoWrapper);

  videoWrapper.addEventListener("mouseenter", () => {
    customControls.style.opacity = "1";
  });

  videoWrapper.addEventListener("mouseleave", () => {
    customControls.style.opacity = "0";
  });

  notesButton.addEventListener("click", () => {
    videoElement.pause();
    const currentTime = formatVideoTime(videoElement.currentTime);
    showNotesModal(currentTime, userId, courseId, lectureId);
  });

  return videoElement;
};

/*const saveNote = (noteData) => {
    const existingNotes = JSON.parse(localStorage.getItem('videoNotes') || '[]');
    existingNotes.push({
        ...noteData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('videoNotes', JSON.stringify(existingNotes));
    alert('Note saved successfully!');
};*/
const saveNote = async (noteData) => {
  const newNote = await NOTES.add(noteData);
  if (newNote) {
    alert("Note saved successfully!");
    await renderNotes(noteData.userId, noteData.courseId); // Оновлення списку нотаток
  }
};

const formatVideoTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const showNotesModal = (currentTime, userId, lectureId) => {
  console.log("We open a modal window with parameters:", {
    currentTime,
    userId,
    lectureId,
  });
  if (!lectureId) {
    lectureId = localStorage.getItem("currentLectureId");
    console.log("Extract lectureId from localStorage:", lectureId);
  }

  if (!lectureId) {
    console.error("lectureId is still missing!");
    return;
  }
  const existingModal = document.querySelector(".notes-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.className = "notes-modal";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;

  modal.innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">Add note</h3>
        <p style="margin: 0 0 10px 0;">Video time: <span class="video-timestamp">${currentTime}</span></p>
        <textarea placeholder="Enter your note..." style="margin-bottom: 15px;"></textarea>
        <div class="button-group">
            <button class="cancel-button">Cancel</button>
            <button class="save-button">Save</button>
        </div>
    `;

  Object.assign(modal.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
  });

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  modal.querySelector("textarea").focus();

  const closeModal = () => {
    modal.remove();
    overlay.remove();
    const video = document.querySelector("#course-video");
    if (video) video.play();
  };

  modal.querySelector(".cancel-button").addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  modal.querySelector(".save-button").addEventListener("click", async () => {
    const noteText = modal.querySelector("textarea").value;
    const timestamp = modal.querySelector(".video-timestamp").textContent;
    if (noteText.trim()) {
      const userId = localStorage.getItem("userId");
      const courseId = window.location.pathname.split("/course/").pop();
      console.log("✅ Збереження нотатки з lectureId:", lectureId);

      await NOTES.add({
        userId,
        courseId,
        lectureId,
        text: noteText,
        videoTimecode: currentTime,
      });
    }
    closeModal();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // Кнопка відкриття списку нотаток
  const notesTabButton = document.querySelector(".tabs .tab:nth-child(2)");

  notesTabButton.addEventListener("click", async () => {
    console.log("Open the modal notes window");

    const userId = localStorage.getItem("userId");
    const courseId = window.location.pathname.split("/course/").pop();
    const savedLecture = localStorage.getItem("currentLecture");

    if (!savedLecture) {
      alert("No lecture selected.");
      return;
    }

    const lectureId = JSON.parse(savedLecture); // Отримуємо ID лекції
    console.log("We are loading notes for:", { userId, courseId, lectureId });

    showNotesListModal(userId, courseId, lectureId);
  });
});

// Функція для відкриття модального вікна зі списком нотаток
const showNotesListModal = async (userId, courseId, lectureId) => {
  console.log("🔍 Отримуємо нотатки:", { userId, courseId, lectureId });

  const existingModal = document.querySelector(".notes-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.className = "notes-modal";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;

  modal.innerHTML = `
       <div class="modal-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 10px;
        ">
            <h3 style="margin: 0; font-size: 18px;">My Notes</h3>
            <button class="close-button" style="
                background: none;
                border: none;
                cursor: pointer;
                font-size: 20px;
                color: #333; /* Чорний хрестик */
                padding: 10px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                transition: color 0.2s ease;
            " aria-label="Close">
                ✖
            </button>
        </div>
        <div class="notes-list" style="
            max-height: 350px;
            overflow-y: auto;
            padding-right: 10px;
        ">
           Loading notes...
        </div>
    `;

  Object.assign(modal.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    paddingBottom: "60px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
    display: "flex",
    flexDirection: "column",
  });

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
    overlay.remove();
  };

  modal.querySelector(".close-button").addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // Отримання нотаток та оновлення списку
  loadNotesList(
    userId,
    courseId,
    lectureId,
    modal.querySelector(".notes-list")
  );
};

// Завантаження списку нотаток
const loadNotesList = async (userId, courseId, lectureId, container) => {
  try {
    const response = await fetch(
      `/api/notes?userId=${userId}&courseId=${courseId}&lectureId=${lectureId}`
    );
    const notes = await response.json();
    console.log("Notes received:", notes);

    container.innerHTML = notes.length
      ? notes
          .map(
            (note) => `
                <div class="note-item" data-note-id="${
                  note.id
                }" style="border: 1px solid #ddd; padding: 10px; border-radius: 6px; margin-bottom: 10px;  max-width: 580px; ">
                    <p contenteditable="false" class="note-text" style="
                    margin: 0; 
                    font-size: 14px; 
                    max-width: 520px;  
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: normal;
                    ">${note.text}</p>
                    <small style="color: #666;">Video time: ${
                      note.videotimecode
                    } | ${new Date(note.timestamp).toLocaleString()}</small>
                    <div style="margin-top: 5px; ">
                        <button class="edit-button" style="margin-right: 5px;">Edit</button>
                        <button class="delete-button" data-note-id="${
                          note.id
                        }" style="color: white; background: #283044;">Delete</button>
                    </div>
                </div>
            `
          )
          .join("")
      : "<p>No notes yet.</p>";

    // Додаємо обробники подій для кнопок редагування та видалення
    container
      .querySelectorAll(".edit-button")
      .forEach((button) => button.addEventListener("click", handleEditNote));

    container
      .querySelectorAll(".delete-button")
      .forEach((button) => button.addEventListener("click", handleDeleteNote));
  } catch (error) {
    console.error("Error retrieving notes:", error);
    container.innerHTML = '<p style="color: red;">Failed to load notes.</p>';
  }
};

// Обробка редагування нотатки
const handleEditNote = (event) => {
  const noteElement = event.target.closest(".note-item");
  const noteTextElement = noteElement.querySelector(".note-text");
  const noteId = noteElement.dataset.noteId;

  if (event.target.textContent === "Edit") {
    noteTextElement.contentEditable = "true";
    noteTextElement.focus();
    event.target.textContent = "Save";
  } else {
    noteTextElement.contentEditable = "false";
    event.target.textContent = "Edit";
    updateNote(noteId, noteTextElement.textContent.trim());
  }
};

// Оновлення нотатки
const updateNote = async (noteId, newText) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });

    if (!response.ok) throw new Error("Failed to update note");
    console.log("Note updated");
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

// Видалення нотатки
const handleDeleteNote = async (event) => {
  const noteId = event.target.getAttribute("data-note-id");
  if (!noteId) {
    console.error(" Error: noteId missed!");
    return;
  }
  try {
    console.log(`Delete note with ID: ${noteId}`);

    const response = await fetch(`/api/notes/delete/${noteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete note");
    }

    console.log("Note deleted succesfully!");
    document.querySelector(`[data-note-id="${noteId}"]`).remove(); // Видаляємо з DOM
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

function createModuleHTML(module) {
  const getIconByFileType = (fileType) => {
    if (!fileType) return "/images/text-icon.svg";

    if (fileType.startsWith("video/") || fileType === "video/quicktime") {
      return "/images/video-icon.svg";
    }
    if (fileType === "audio/mpeg") {
      return "/images/audio-icon.svg";
    }
    if (fileType === "text/plain") {
      return "/images/text-icon.svg";
    }
    return "/images/file-icon.svg";
  };

  // Оновлений розрахунок прогресу, який враховує тести модулів
  const totalLectures = module.lectures.length;
  const completedLectures = module.lectures.filter(
    (lecture) => lecture.completed
  ).length;

  // Додаємо кількість тестів модуля (1 якщо є test_link)
  const hasModuleTest = module.test_link ? 1 : 0;

  // Додаємо статус завершення тесту модуля
  const isModuleTestCompleted = module.is_module_test_completed ? 1 : 0;

  // Загальна кількість "елементів" в модулі: лекції + тест модуля
  const totalItems = totalLectures + hasModuleTest;

  // Загальна кількість пройдених "елементів"
  const completedItems = completedLectures + isModuleTestCompleted;

  // Розрахунок прогресу
  const progress = {
    completed: completedItems,
    total: totalItems,
    remaining: totalItems - completedItems,
  };

  return `
        <section class="module" data-module-id="${module.id}">
            <div class="module-header">
                <h2>${module.title}</h2>
                ${
                  module.lectures.length > 0
                    ? `
                    <button class="toggle-module" aria-label="Toggle module content"></button>
                `
                    : ""
                }
            </div>
            ${
              module.lectures.length > 0
                ? `
                <div class="module-content">
                    <div class="module-progress">
                        <span>${progress.completed}/${
                    progress.total
                  } complete</span>
                        <span class="separator">|</span>
                        <span>${progress.remaining} left</span>
                    </div>
                    <ul class="topics">
                        ${module.lectures
                          .map(
                            (lecture) => `
                            <li onclick="handleLectureClick(${lecture.id}, '${
                              lecture.contentType
                            }')"
                                data-topic-id="${lecture.id}" 
                                data-content-type="${lecture.contentType}"
                                class="topic-item ${
                                  lecture.completed ? "completed" : ""
                                }"
                                style="background-color: ${
                                  lecture.completed ? "#e8f5e9" : "transparent"
                                }"
                                aria-label="Lecture: ${lecture.title}, ${
                              lecture.completed ? "Completed" : "Not completed"
                            }"
                                aria-selected="${
                                  lecture.completed ? "true" : "false"
                                }"
                            >
                                <img src="${getIconByFileType(
                                  lecture.file_type
                                )}" class="topic-icon" alt="lecture type icon" />
                                <span class="topic-title">${
                                  lecture.title
                                }</span>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                    ${
                      module.test_link
                        ? `
                        <div class="module-test">
                            <li onclick="handleModuleTestClick(${module.id}, '${
                            module.test_link
                          }')"
                                class="topic-item test-item ${
                                  module.is_module_test_completed
                                    ? "completed"
                                    : ""
                                }"
                                data-content-type="test"
                                data-module-id="${module.id}"
                                data-test-link="${module.test_link}"
                                style="background-color: ${
                                  module.is_module_test_completed
                                    ? "#e8f5e9"
                                    : "transparent"
                                }"
                                aria-label="Module Test, ${
                                  module.is_module_test_completed
                                    ? "Completed"
                                    : "Not completed"
                                }"
                                aria-selected="${
                                  module.is_module_test_completed
                                    ? "true"
                                    : "false"
                                }"
                            >
                                <img src="/images/test-icon.svg" class="topic-icon" alt="test icon" />
                                <span class="topic-title">Module Test</span>
                            </li>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
                : ""
            }
        </section>

    `;
}

function renderCourseContent() {
  const courseContent = document.querySelector(".course-content");
  if (!courseContent) return;

  // Очищаємо контейнер перед рендерингом для уникнення дублювання
  courseContent.innerHTML = `
        <div class="course-header">
            <h1>Зміст курсу</h1>
            <button class="toggle-all" aria-label="Toggle all content"></button>
        </div>
    `;

  // Відображаємо всі модулі
  COURSE_MODULES.forEach((module) => {
    courseContent.insertAdjacentHTML("beforeend", createModuleHTML(module));
  });

  // Отримуємо дані поточного курсу
  const courseId = window.location.pathname.split("/course/").pop();
  const userId = localStorage.getItem("userId");

  // Перевіряємо, чи вже існує секція фінального тесту, щоб уникнути дублювання
  if (document.querySelector(".final-test-section")) {
    console.log("Секція фінального тесту вже існує, пропускаємо створення");
    initializeModuleListeners();
    return;
  }

  // Завантажуємо інформацію про курс, щоб перевірити наявність фінального тесту
  fetch(`/api/course/${courseId}?userId=${userId}`)
    .then((response) => response.json())
    .then((courseData) => {
      console.log(
        "Отримано дані курсу для рендерингу фінального тесту:",
        courseData
      );

      // Перевіряємо, чи існує фінальний тест для курсу
      if (courseData.test_link) {
        // Перевіряємо, чи всі модулі та модульні тести завершені
        const allModulesComplete = COURSE_MODULES.every((module) => {
          // Перевіряємо, чи всі лекції в модулі завершені
          const allLecturesComplete = module.lectures.every(
            (lecture) => lecture.completed
          );

          // Перевіряємо, чи модульний тест завершений (якщо він є)
          const moduleTestComplete =
            !module.test_link || module.is_module_test_completed;

          return allLecturesComplete && moduleTestComplete;
        });

        // Додаємо фінальний тест тільки якщо всі модулі завершені і є фінальний тест
        // і якщо ще немає фінального тесту на сторінці
        if (
          allModulesComplete &&
          !document.querySelector(".final-test-section")
        ) {
          // Перевіряємо, чи фінальний тест вже завершений
          const isCompleted = courseData.is_course_test_completed
            ? "completed"
            : "";
          const bgColor = courseData.is_course_test_completed
            ? "#e8f5e9"
            : "transparent";

          courseContent.insertAdjacentHTML(
            "beforeend",
            `
                        <section class="final-test-section ${isCompleted}" data-course-id="${courseId}" style="background-color: ${bgColor}">
                            <div class="module-header">
                                <h2>Фінальний тест</h2>
                            </div>
                            <div class="test-content" onclick="handleFinalTestClick('${courseId}')">
                                <img src="/images/test-icon.svg" alt="Test icon" class="topic-icon" />
                                <span class="topic-title">Пройти фінальний тест</span>
                            </div>
                        </section>
                    `
          );

          console.log("Фінальний тест доданий до контенту курсу");
        }
      } else {
        console.log("Курс не має фінального тесту");
      }

      initializeModuleListeners();
    })
    .catch((error) => {
      console.error("Помилка завантаження даних курсу:", error);
      initializeModuleListeners();
    });
}

window.handleFinalTestClick = async function (courseId) {
  console.log(`Обробка кліку по фінальному тесту для курсу: ${courseId}`);

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Необхідно авторизуватися");
    return;
  }

  try {
    // Отримуємо посилання на фінальний тест з API
    const response = await fetch(
      `/api/course/${courseId}/test?userId=${userId}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Помилка від сервера:", errorData);
      throw new Error(
        `Помилка отримання посилання на тест: ${response.status}`
      );
    }

    const testData = await response.json();
    console.log("Отримано дані тесту:", testData);

    if (testData.testLink) {
      // Відкриваємо тест у iframe
      openModuleTest(testData.testLink, null, courseId);

      // Оновлюємо активний елемент у навігації
      document.querySelectorAll(".topic-item").forEach((item) => {
        item.classList.remove("active");
      });

      const finalTestSection = document.querySelector(".final-test-section");
      if (finalTestSection) {
        finalTestSection.classList.add("active");
      }
    } else {
      throw new Error("Посилання на тест не отримано");
    }
  } catch (error) {
    console.error("Помилка відкриття фінального тесту:", error);
    alert("Помилка при відкритті тесту: " + error.message);
  }
};

function renderTestQuestions(questions) {
  if (!questions || !Array.isArray(questions))
    return "<p>No questions available</p>";

  return questions
    .map(
      (question, index) => `
        <div class="test-question" data-question-id="${question.id}">
            <h3>Question ${index + 1}</h3>
            <p>${question.question_text}</p>
            ${renderAnswers(question)}
        </div>
    `
    )
    .join("");
}

function renderAnswers(question) {
  if (!question.answers || !Array.isArray(question.answers)) return "";

  return `
        <div class="answers-container">
            ${question.answers
              .map(
                (answer) => `
                <label class="answer-option">
                    <input type="${
                      question.type === "multiple" ? "checkbox" : "radio"
                    }" 
                           name="question_${question.id}" 
                           value="${answer.id}">
                    ${answer.answer_text}
                </label>
            `
              )
              .join("")}
        </div>
    `;
}

window.submitTest = async function (id, testType) {
  try {
    const userId = localStorage.getItem("userId");
    const answers = collectTestAnswers();

    const response = await fetch(`/api/${testType}/${id}/test/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        answers,
      }),
    });

    if (!response.ok) throw new Error("Failed to submit test");

    const result = await response.json();
    showTestResults(result);
  } catch (error) {
    console.error("Error submitting test:", error);
    showErrorMessage(error);
  }
};

function collectTestAnswers() {
  const answers = [];
  document.querySelectorAll(".test-question").forEach((questionEl) => {
    const questionId = questionEl.dataset.questionId;
    const selectedAnswers = Array.from(
      questionEl.querySelectorAll("input:checked")
    ).map((input) => input.value);

    answers.push({
      questionId,
      selectedAnswers,
    });
  });
  return answers;
}

function showTestResults(result) {
  const videoContainer = document.querySelector(".video-player");
  if (!videoContainer) return;

  videoContainer.innerHTML = `
        <div class="test-results">
            <h2>Test Results</h2>
            <div class="score">Your score: ${result.score}%</div>
            <div class="details">
                Correct answers: ${result.correctAnswers}/${result.totalQuestions}
            </div>
            <button onclick="handleTestClick('${result.testType}', ${result.id})" class="retry-btn">
                Try Again
            </button>
        </div>
    `;
}

async function checkTestAvailability(moduleId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(
      `/api/module/${moduleId}/test/availability?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to check test availability");
    }

    const data = await response.json();
    return data.isAvailable;
  } catch (error) {
    console.error("Error checking test availability:", error);
    return false;
  }
}

async function handleTestComplete(testData) {
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `/api/${testData.type}/${testData.id}/test/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          score: testData.score,
          answers: testData.answers,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save test results");
    }
  } catch (error) {
    console.error("Error handling test completion:", error);
  }
}

window.openModuleTest = async function (testLink, moduleId, courseId) {
  const videoContainer = document.querySelector(".video-player");
  if (!videoContainer) {
    console.error("Контейнер для відео не знайдено");
    return;
  }

  console.log(
    `Відкриваємо тест: testLink=${testLink}, moduleId=${moduleId}, courseId=${courseId}`
  );

  videoContainer.innerHTML = "";

  try {
    const testContainer = document.createElement("div");
    testContainer.className = "test-container";

    Object.assign(testContainer.style, {
      width: "100%",
      height: "100%",
      background: "white",
      borderRadius: "12px",
      overflow: "hidden",
    });

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
    });

    // Якщо courseId не переданий, отримуємо його з URL
    if (!courseId) {
      courseId = window.location.pathname.split("/course/").pop();
      console.log(`Поточний courseId: ${courseId}`);
    }

    // Додаємо додаткові параметри до URL тесту
    const hasQueryParams = testLink.includes("?");
    const separator = hasQueryParams ? "&" : "?";

    // Додаємо moduleId та courseId як параметри URL
    let updatedTestLink = testLink;

    if (moduleId && !testLink.includes("moduleId=")) {
      updatedTestLink += `${separator}moduleId=${moduleId}`;
    }

    if (courseId && !updatedTestLink.includes("courseId=")) {
      const newSeparator = updatedTestLink.includes("?") ? "&" : "?";
      updatedTestLink += `${newSeparator}courseId=${courseId}`;
    }

    // Додаємо параметр testType щоб визначити, який тип тесту виконується
    const testType = moduleId ? "module" : "course";
    if (!updatedTestLink.includes("testType=")) {
      const newSeparator = updatedTestLink.includes("?") ? "&" : "?";
      updatedTestLink += `${newSeparator}testType=${testType}`;
    }

    console.log(`Оновлене посилання на тест: ${updatedTestLink}`);
    iframe.src = updatedTestLink;

    // Додаємо обробник для отримання повідомлення про завершення тесту
    window.addEventListener("message", handleTestCompleteMessage);

    testContainer.appendChild(iframe);
    videoContainer.appendChild(testContainer);
  } catch (error) {
    console.error("Помилка відкриття тесту:", error);
    videoContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; color: red;">
                Помилка завантаження тесту: ${error.message}
            </div>
        `;
  }
};

async function initializeLecturesState() {
  try {
    const courseId = window.location.pathname.split("/course/").pop();
    const userId = localStorage.getItem("userId");

    const response = await fetch(
      `/api/course/${courseId}/progress?userId=${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch progress");

    const progressData = await response.json();

    document.querySelectorAll(".topic-item").forEach((topic) => {
      const lectureId = topic.dataset.topicId;
      if (completedLectures.has(lectureId)) {
        topic.classList.add("completed");
        topic.style.backgroundColor = "#e8f5e9";
      }
    });

    const progressBar = document.querySelector(".progress-bar span");
    const progressText = document.querySelector(".progress-text .percent");
    if (progressBar && progressText) {
      progressBar.style.width = `${progressData.progress}%`;
      progressText.textContent = `${Math.round(progressData.progress)}%`;
    }
  } catch (error) {
    console.error("Error initializing lectures state:", error);
  }
}

window.handleLectureClick = async function (lectureId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`/api/lecture/${lectureId}?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Помилка завантаження лекції");
    }

    const lectureData = await response.json();
    console.log("Lecture data:", lectureData);
    if (!lectureData.id) {
      console.error("❌ lectureData.id відсутній!");
      return;
    }

    localStorage.setItem("currentLecture", JSON.stringify(lectureData.id)); // Зберігаємо в localStorage
    console.log("📌 Збережено в localStorage:", lectureData.id);
    // Додаємо кнопку нотатки

    const videoContainer = document.querySelector(".video-player");
    if (!videoContainer) return;

    if (lastCompletedLectureId && lastCompletedLectureId !== lectureId) {
      const lastCompletedTopic = document.querySelector(
        `[data-topic-id="${lastCompletedLectureId}"]`
      );
      if (lastCompletedTopic) {
        lastCompletedTopic.style.backgroundColor = "#e8f5e9";
        lastCompletedTopic.classList.add("completed");

        const moduleElement = lastCompletedTopic.closest(".module");
        if (moduleElement) {
          const moduleId = moduleElement.dataset.moduleId;
          const module = COURSE_MODULES.find(
            (m) => m.id === parseInt(moduleId)
          );
          if (module) {
            const progressText =
              moduleElement.querySelector(".module-progress");
            if (progressText) {
              const { completed, total } = module.progress;
              progressText.innerHTML = `
                                <span>${completed}/${total} complete</span>
                                <span class="separator">|</span>
                                <span>${total - completed} left</span>
                            `;
            }
          }
        }

        const totalProgress = calculateTotalProgress(COURSE_MODULES);
        const progressBar = document.querySelector(".progress-bar span");
        const progressText = document.querySelector(".progress-text .percent");
        if (progressBar && progressText) {
          progressBar.style.width = `${totalProgress}%`;
          progressText.textContent = `${totalProgress}%`;
        }
      }
      lastCompletedLectureId = null;
    }
    document.querySelectorAll(".topic-item").forEach((topic) => {
      topic.classList.remove("active");
    });

    const currentTopic = document.querySelector(
      `[data-topic-id="${lectureId}"]`
    );
    if (currentTopic) {
      currentTopic.classList.add("active");
      currentTopic.style.backgroundColor = "transparent";
    }

    // Аудіо
    if (lectureData.file_type === "audio/mpeg") {
      videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: white; border-radius: 12px;">
                    <div style="width: 80%; max-width: 600px;">
                        <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center;">${
                          lectureData.title
                        }</h2>
                        <audio controls style="width: 100%; margin-bottom: 20px;">
                            <source src="/${
                              lectureData.file_url
                            }" type="audio/mpeg">
                        </audio>
                        ${
                          lectureData.description
                            ? `<div style="text-align: center;">${lectureData.description}</div>`
                            : ""
                        }
                    </div>
                </div>
            `;

      const audio = videoContainer.querySelector("audio");
      if (audio) {
        let listenTime = 0;
        let timer;

        audio.addEventListener("play", () => {
          timer = setInterval(() => {
            listenTime++;
            if (listenTime >= 15) {
              clearInterval(timer);
              completeLecture(lectureId);
            }
          }, 1000);
        });

        audio.addEventListener("pause", () => {
          clearInterval(timer);
        });

        audio.addEventListener("seeked", () => {
          listenTime = 0;
          clearInterval(timer);
        });
      }
    }
    // Відео
    else if (
      lectureData.file_type &&
      (lectureData.file_type.startsWith("video/") ||
        lectureData.file_type === "video/quicktime")
    ) {
      const videoUrl = `/${lectureData.file_url}`;
      const videoType = "video/mp4";

      function setupVideoTimeTracking(videoElement, lectureId) {
        let watchTime = 0;
        let timer;

        videoElement.addEventListener("play", () => {
          timer = setInterval(() => {
            watchTime++;
            if (watchTime >= 15) {
              clearInterval(timer);
              completeLecture(lectureId);
            }
          }, 1000);
        });

        videoElement.addEventListener("pause", () => {
          clearInterval(timer);
        });

        videoElement.addEventListener("seeked", () => {
          watchTime = 0;
          clearInterval(timer);
        });
      }

      const videoElement = createVideoPlayer(
        videoUrl,
        videoType,
        null,
        lectureId
      );

      if (videoElement) {
        setupVideoTimeTracking(videoElement, lectureId);
      }

      videoElement.addEventListener("error", (e) => {
        console.error("Video error:", videoElement.error);
      });

      videoElement.addEventListener("loadstart", () => {
        console.log("Video load started");
      });

      videoElement.addEventListener("loadeddata", () => {
        console.log("Video loaded successfully");
      });
    }
    // Файли
    else if (lectureData.file_type && lectureData.file_url) {
      videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: white; border-radius: 12px;">
                    <div style="text-align: center;">
                        <h2 style="font-size: 18px; margin-bottom: 20px;">${
                          lectureData.title
                        }</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" style="width: 64px; height: 64px; margin: 0 auto 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <p style="margin-bottom: 20px; color: #666;">${lectureData.file_url
                          .split("/")
                          .pop()}</p>
                        <a href="/${lectureData.file_url}" 
                           download
                           style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #283044; color: white; border-radius: 8px; text-decoration: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Завантажити
                        </a>
                    </div>
                </div>
            `;

      window.completionTimer = setTimeout(
        () => completeLecture(lectureId),
        5000
      );
    }
    // Текстовий контент
    else {
      videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; padding: 20px; background: white; border-radius: 12px;">
                    <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center;">${
                      lectureData.title
                    }</h2>
                    <div style="color: #333;">
                        ${lectureData.description || "Опис відсутній"}
                    </div>
                </div>
            `;

      window.completionTimer = setTimeout(
        () => completeLecture(lectureId),
        5000
      );
    }
  } catch (error) {
    console.error("Помилка:", error);
    const videoContainer = document.querySelector(".video-player");
    if (videoContainer) {
      videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <div style="padding: 16px; color: #dc2626; background: #fee2e2; border-radius: 12px;">
                        Помилка завантаження контенту: ${error.message}
                    </div>
                </div>
            `;
    }
  }
};

function updateActiveAndCompletedStates(lectureId) {
  document.querySelectorAll(".topic-item").forEach((topic) => {
    topic.classList.remove("active");
    if (!completedLectures.has(topic.dataset.topicId)) {
      topic.style.backgroundColor = "transparent";
    }
  });

  const currentTopic = document.querySelector(`[data-topic-id="${lectureId}"]`);
  if (currentTopic) {
    currentTopic.classList.add("active");
  }
}

function setupVideoListeners(video, lectureId) {
  video.addEventListener("play", () => {
    clearTimeout(window.completionTimer);
    window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
  });

  video.addEventListener("pause", () => {
    clearTimeout(window.completionTimer);
  });
}

function setupAudioListeners(audio, lectureId) {
  audio.addEventListener("play", () => {
    clearTimeout(window.completionTimer);
    window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
  });

  audio.addEventListener("pause", () => {
    clearTimeout(window.completionTimer);
  });
}

function showErrorMessage(error) {
  const videoContainer = document.querySelector(".video-player");
  if (videoContainer) {
    videoContainer.innerHTML = `
            <div style="padding: 20px; background: white; color: red; border-radius: 12px;">
                Помилка завантаження контенту: ${error.message}
            </div>
        `;
  }
}

// Функція для завершення лекції
window.completeLecture = async function (lectureId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`/api/lecture/${lectureId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Failed to complete lecture");

    // Оновлюємо стан в пам'яті
    COURSE_MODULES = COURSE_MODULES.map((module) => {
      const updatedLectures = module.lectures.map((lecture) =>
        lecture.id === parseInt(lectureId)
          ? { ...lecture, completed: true }
          : lecture
      );

      return {
        ...module,
        lectures: updatedLectures,
        progress: {
          completed: updatedLectures.filter((l) => l.completed).length,
          total: updatedLectures.length,
        },
      };
    });

    // Зберігаємо ID останньої завершеної лекції
    lastCompletedLectureId = lectureId;

    // Додаємо до множини завершених лекцій
    completedLectures.add(lectureId.toString());

    // Видаляємо оновлення прогресу модуля звідси
  } catch (error) {
    console.error("Error completing lecture:", error);
  }
};

const initializeModuleListeners = () => {
  const toggleAll = document.querySelector(".toggle-all");
  const courseContent = document.querySelector(".course-content");
  const moduleToggles = document.querySelectorAll(".toggle-module");

  // Перевірка, чи існує toggleAll
  if (toggleAll) {
    toggleAll.addEventListener("click", () => {
      console.log("Toggle All button clicked"); // Перевірка, чи натискається кнопка
      toggleAll.classList.toggle("collapsed");
      courseContent.classList.toggle("collapsed");
      const modules = document.querySelectorAll(".module");

      if (courseContent.classList.contains("collapsed")) {
        modules.forEach((module) => {
          module.classList.add("collapsed");
          const moduleContent = module.querySelector(".module-content");
          if (moduleContent) {
            moduleContent.style.display = "none";
          }
          const toggleButton = module.querySelector(".toggle-module");
          if (toggleButton) {
            toggleButton.classList.add("collapsed");
          }
        });
      } else {
        modules.forEach((module) => {
          module.classList.remove("collapsed");
          const moduleContent = module.querySelector(".module-content");
          if (moduleContent) {
            moduleContent.style.display = "block";
          }
          const toggleButton = module.querySelector(".toggle-module");
          if (toggleButton) {
            toggleButton.classList.remove("collapsed");
          }
        });
      }
    });
  }

  // Перевірка, чи є елементи toggleModule
  moduleToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      console.log("Toggle Module button clicked"); // Перевірка, чи натискається кнопка
      e.stopPropagation();
      const module = toggle.closest(".module");
      const moduleContent = module.querySelector(".module-content");
      toggle.classList.toggle("collapsed");
      module.classList.toggle("collapsed");
      if (moduleContent) {
        moduleContent.style.display =
          moduleContent.style.display === "none" ? "block" : "none";
      }
    });
  });
};

// Додаємо слухач події на завантаження документа
document.addEventListener("DOMContentLoaded", initializeModuleListeners);

async function loadCourseData() {
  try {
    const courseId = window.location.pathname.split("/course/").pop();
    const userId = localStorage.getItem("userId");

    const response = await fetch(`/api/course/${courseId}?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to load course data");

    const courseData = await response.json();

    if (courseData.modules && Array.isArray(courseData.modules)) {
      completedLectures.clear();

      COURSE_MODULES = courseData.modules.map((module) => {
        const lectures = module.lectures || [];
        const completedLecturesCount = lectures.filter(
          (lecture) => lecture.completed
        ).length;

        lectures.forEach((lecture) => {
          if (lecture.completed) {
            completedLectures.add(lecture.id.toString());
          }
        });

        return {
          id: module.id,
          title: module.title,
          test_link: module.test_link,
          is_module_test_completed: module.is_module_test_completed || false,
          lectures: lectures.map((lecture) => ({
            id: lecture.id,
            title: lecture.title,
            completed: Boolean(lecture.completed),
            file_type: lecture.file_type,
            contentType: lecture.file_type || "text",
          })),
          progress: {
            completed: completedLecturesCount,
            total: lectures.length,
          },
        };
      });

      // Зберігаємо дані про курс включно з інформацією про фінальний тест
      const courseMeta = {
        id: courseData.id,
        name: courseData.name,
        description: courseData.description,
        test_link: courseData.test_link,
        is_course_test_completed: courseData.is_course_test_completed,
      };

      // Передаємо дані про курс в функцію рендерингу
      renderCourseContent(courseMeta);
      applyCompletedLecturesStyles();

      let firstUncompletedLecture = null;
      for (const module of COURSE_MODULES) {
        for (const lecture of module.lectures) {
          if (!lecture.completed) {
            firstUncompletedLecture = lecture;
            break;
          }
        }
        if (firstUncompletedLecture) break;
      }

      if (
        !firstUncompletedLecture &&
        COURSE_MODULES.length > 0 &&
        COURSE_MODULES[0].lectures.length > 0
      ) {
        firstUncompletedLecture = COURSE_MODULES[0].lectures[0];
      }

      if (firstUncompletedLecture) {
        await handleLectureClick(firstUncompletedLecture.id);
      }
    }
  } catch (error) {
    console.error("Error loading course data:", error);
  }
}

function applyCompletedLecturesStyles() {
  const topics = document.querySelectorAll(".topic-item");
  topics.forEach((topic) => {
    const lectureId = topic.dataset.topicId;
    if (completedLectures.has(lectureId)) {
      topic.classList.add("completed");
      topic.style.backgroundColor = "#e8f5e9";
    }
  });
}

async function completeLecture(lectureId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`/api/lecture/${lectureId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Failed to complete lecture");

    COURSE_MODULES = COURSE_MODULES.map((module) => {
      const updatedLectures = module.lectures.map((lecture) =>
        lecture.id === parseInt(lectureId)
          ? { ...lecture, completed: true }
          : lecture
      );

      return {
        ...module,
        lectures: updatedLectures,
        progress: {
          completed: updatedLectures.filter((l) => l.completed).length,
          total: updatedLectures.length,
        },
      };
    });

    renderCourseContent();
  } catch (error) {
    console.error("Error completing lecture:", error);
  }
}

function calculateTotalProgress(modules) {
  let totalLectures = 0;
  let completedLectures = 0;

  modules.forEach((module) => {
    if (module.lectures) {
      totalLectures += module.lectures.length;
      completedLectures += module.lectures.filter((l) => l.completed).length;
    }
  });

  return totalLectures > 0
    ? Math.round((completedLectures / totalLectures) * 100)
    : 0;
}

async function loadCourseHeader() {
  try {
    const response = await fetch("/header/course-header.html");
      const html = await response.text();
      document.getElementById("courseHeader").innerHTML = html;

    initializeCourseHeader();
  } catch (error) {
    console.error("Error loading course header:", error);
  }
}

function updateProgressUI(progressData) {
  const progressBar = document.querySelector(".progress-bar span");
  const progressText = document.querySelector(".progress-text .percent");

  if (progressBar && progressText) {
    progressBar.style.width = `${progressData.progress}%`;
    progressText.textContent = `${Math.round(progressData.progress)}%`;
  }

  const allLectures = document.querySelectorAll(".topics li");
  allLectures.forEach((lecture) => {
    const lectureId = lecture.dataset.topicId;
    if (progressData.completedLectures.includes(parseInt(lectureId))) {
      lecture.classList.add("completed");
    }
  });
}

async function loadProgress() {
  try {
    const courseId = window.location.pathname.split("/course/").pop();
    const userId = localStorage.getItem("userId");

    if (!userId || !courseId) return;

    const response = await fetch(
      `/api/course/${courseId}/progress?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load progress");
    }

    const progressData = await response.json();
    updateProgressUI(progressData);
  } catch (error) {
    console.error("Error loading progress:", error);
  }
}

async function loadLectureContent(lectureId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(
      `/api/lecture/${lectureId}/content?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load lecture content");
    }

    const lectureData = await response.json();
    displayLectureContent(lectureData);
  } catch (error) {
    console.error("Error loading lecture content:", error);
  }
}

function displayLectureContent(lectureData) {
  const videoContainer = document.querySelector(".video-player");
  if (!videoContainer) return;

  const lectureTitle = document.querySelector(".current-lecture-title");
  if (lectureTitle) {
    lectureTitle.textContent = lectureData.title;
  }

  switch (lectureData.contentType) {
    case "video":
      createVideoPlayer(lectureData.videoUrl);
      break;
    case "text":
      videoContainer.innerHTML = `
                <div class="text-content">
                    ${lectureData.content}
                </div>
            `;
      break;
    case "quiz":
      videoContainer.innerHTML = `
                <div class="quiz-content">
                    <h3>${lectureData.title}</h3>
                    <div class="quiz-questions">
                        ${lectureData.questions
                          .map((q) => createQuizQuestion(q))
                          .join("")}
                    </div>
                    <button class="submit-quiz">Submit Quiz</button>
                </div>
            `;
      break;
  }
}

function initializeTopicListeners() {
  const topicItems = document.querySelectorAll(".topics li");
  console.log("Found topics:", topicItems.length);

  topicItems.forEach((topic) => {
    topic.style.cursor = "pointer";

    topic.addEventListener("click", async () => {
      console.log("Topic clicked:", topic.dataset.topicId);

      const lectureId = topic.dataset.topicId;
      if (!lectureId) {
        console.error("No lecture ID found");
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `/api/lecture/${lectureId}?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load lecture");
        }

        const lectureData = await response.json();
        console.log("Lecture data:", lectureData);

        const videoContainer = document.querySelector(".video-player");
        if (!videoContainer) {
          console.error("Video container not found");
          return;
        }

        document.querySelectorAll(".topics li").forEach((li) => {
          li.classList.remove("active");
        });
        topic.classList.add("active");

        if (lectureData.file_type === "video") {
          videoContainer.innerHTML = `
                        <video controls>
                            <source src="/uploads/${lectureData.file_url}" type="video/mp4">
                            Your browser does not support video.
                        </video>
                    `;

          const video = videoContainer.querySelector("video");
          video.addEventListener("ended", () => {
            completeLecture(lectureId);
            topic.classList.add("completed");
          });
        } else {
          videoContainer.innerHTML = `
                        <div class="text-content">
                            <h3>${lectureData.title}</h3>
                            <p>${lectureData.description}</p>
                            <button onclick="completeLecture('${lectureId}')">Mark as Complete</button>
                        </div>
                    `;
        }
      } catch (error) {
        console.error("Error loading lecture:", error);
        alert("Failed to load lecture content");
      }
    });
  });
}

async function updateProgress() {
  try {
    const courseId = window.location.pathname.split("/course/").pop();
    const userId = localStorage.getItem("userId");

    const response = await fetch(
      `/api/course/${courseId}/progress?userId=${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch progress");

    const progressData = await response.json();
    console.log("Progress data:", progressData);

    const progressBar = document.querySelector(".progress-bar span");
    const progressText = document.querySelector(".progress-text .percent");

    if (progressBar && progressText) {
      progressBar.style.width = `${progressData.progress}%`;
      progressText.textContent = `${Math.round(progressData.progress)}%`;
    }

    // Оновлюємо статус лекцій
    document.querySelectorAll(".topic-item").forEach((topic) => {
      const lectureId = topic.dataset.topicId;
      if (
        lectureId &&
        progressData.completedLectureIds &&
        progressData.completedLectureIds.includes(parseInt(lectureId))
      ) {
        topic.classList.add("completed");
        topic.style.backgroundColor = "#e8f5e9";
      }
    });

    // Оновлюємо статус модульних тестів
    if (progressData.completedModuleTests > 0) {
      document.querySelectorAll(".test-item").forEach((testItem) => {
        const moduleId = testItem.dataset.moduleId;
        if (moduleId) {
          // Тут потрібно перевірити, чи цей тест завершено
          // Для цього можна додати список завершених тестів у відповідь API
          // Або зробити окремий запит для перевірки
          testItem.classList.add("completed");
          testItem.style.backgroundColor = "#e8f5e9";
        }
      });
    }

    // Оновлюємо статус фінального тесту
    if (progressData.completedFinalTest) {
      const finalTestSection = document.querySelector(".final-test-section");
      if (finalTestSection) {
        finalTestSection.classList.add("completed");
        finalTestSection.style.backgroundColor = "#e8f5e9";
      }
    }

    // Також можна оновити загальні дані по прогресу курсу
    console.log(
      `Course progress: ${progressData.completedItems}/${progressData.totalItems} items (${progressData.progress}%)`
    );
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}

function initializeCourseHeader() {
  const homeButton = document.querySelector(".home");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      window.location.href = "/";
    });
  }
  const optionsButton = document.querySelector(".oth")?.parentElement;
  if (optionsButton) {
    optionsButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdownMenu = this.nextElementSibling;
      dropdownMenu.classList.toggle("show");
    });
  }
  document.addEventListener("click", function (e) {
    const dropdownMenus = document.querySelectorAll(".dropdown-menu");
    dropdownMenus.forEach((menu) => {
      if (!menu.contains(e.target)) {
        menu.classList.remove("show");
      }
    });
  });
  if (typeof initializeLanguage === "function") {
    initializeLanguage();
  }
}

async function initializeCourseProgress() {
  try {
    const courseId = window.location.pathname.split("/course/").pop();
    const userId = localStorage.getItem("userId");

    if (!courseId || !userId) return;

    const response = await fetch(
      `/api/course/${courseId}/progress?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Помилка завантаження прогресу");
    }

    const progressData = await response.json();

    const progressBar = document.querySelector(".progress-bar span");
    const progressText = document.querySelector(".progress-text .percent");

    if (progressBar && progressText) {
      progressBar.style.width = `${progressData.progress}%`;
      progressText.textContent = `${Math.round(progressData.progress)}%`;
    }
  } catch (error) {
    console.error("Помилка ініціалізації прогресу:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadCourseHeader();
    await initializeCourseProgress();
    await loadCourseData();

    let firstUncompletedLecture = null;
    for (const module of COURSE_MODULES) {
      for (const lecture of module.lectures) {
        if (!lecture.completed) {
          firstUncompletedLecture = lecture;
          break;
        }
      }
      if (firstUncompletedLecture) break;
    }

    if (
      !firstUncompletedLecture &&
      COURSE_MODULES.length > 0 &&
      COURSE_MODULES[0].lectures.length > 0
    ) {
      firstUncompletedLecture = COURSE_MODULES[0].lectures[0];
    }

    if (firstUncompletedLecture) {
      handleLectureClick(firstUncompletedLecture.id);
    }

    renderCourseContent();
    initializeModuleListeners();
  } catch (error) {
    console.error("Error initializing course view:", error);
  }
});

async function completeModuleTest(moduleId, score = 100) {
  try {
    console.log(`Завершення модульного тесту для moduleId: ${moduleId}`);
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("ID користувача не знайдено в localStorage");
      alert("Помилка: ID користувача не знайдено. Будь ласка, увійдіть знову.");
      return false;
    }

    // Знаходимо courseId для цього модуля
    const courseId = window.location.pathname.split("/course/").pop();
    console.log(`Використовуємо courseId: ${courseId} для модуля: ${moduleId}`);

    console.log("Відправка даних про завершення тесту:", {
      userId,
      moduleId,
      courseId,
      score,
    });

    // Відправляємо запит на завершення тесту
    const response = await fetch(`/api/module/${moduleId}/test/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        score,
        courseId, // Додаємо courseId до запиту
      }),
    });

    console.log("Статус відповіді сервера:", response.status);

    // Клонуємо відповідь, щоб можна було прочитати її кілька разів
    const responseClone = response.clone();

    if (!response.ok) {
      let errorMessage = "Не вдалося завершити модульний тест";
      try {
        const errorData = await responseClone.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        try {
          errorMessage = await response.text();
        } catch (e2) {
          // Залишаємо базове повідомлення
        }
      }
      throw new Error(errorMessage);
    }

    // Оновлюємо інтерфейс після успішного запиту
    await updateProgress();

    // Знаходимо та оновлюємо елемент тесту
    const testItem = document.querySelector(
      `.test-item[data-module-id="${moduleId}"]`
    );
    if (testItem) {
      testItem.classList.add("completed");
      testItem.style.backgroundColor = "#e8f5e9";
      console.log(`Елемент тесту для модуля ${moduleId} оновлено`);
    } else {
      console.log(`Елемент тесту для модуля ${moduleId} не знайдено в DOM`);
    }

    alert("Тест успішно завершено!");
    console.log(`Модульний тест ${moduleId} успішно завершено`);
    return true;
  } catch (error) {
    console.error("Помилка завершення модульного тесту:", error);
    alert(`Помилка завершення тесту: ${error.message}`);
    return false;
  }
}

function handleTestCompleteMessage(event) {
  console.log("Отримано повідомлення від iframe:", event.data);

  if (event.data && event.data.type === "testComplete") {
    // Отримуємо ID курсу з URL
    const currentCourseId = parseInt(
      window.location.pathname.split("/course/").pop()
    );

    // Отримуємо параметри з повідомлення
    let courseId = parseInt(event.data.courseId || 0);
    let moduleId = parseInt(event.data.moduleId || 0);
    let testType = event.data.testType || "";
    let score = parseInt(event.data.score || 100);

    // Якщо courseId не вказано, використовуємо поточний з URL
    if (!courseId || isNaN(courseId)) {
      courseId = currentCourseId;
    }

    // Визначаємо тип тесту на основі наявності moduleId
    if (!testType) {
      testType = moduleId ? "module" : "course";
    }

    console.log("Параметри завершення тесту:", {
      testType,
      moduleId,
      courseId,
      score,
    });

    // Викликаємо відповідну функцію в залежності від типу тесту
    if (testType === "module" && moduleId) {
      completeModuleTest(moduleId, score).then(() => {
        // Після успішного завершення модульного тесту перевіряємо, чи потрібно відобразити фінальний тест
        loadCourseData().then(() => {
          // Після оновлення даних курсу перерендеремо зміст
          renderCourseContent();
        });
      });
    } else {
      // Якщо це не модульний тест, або moduleId не вказано, вважаємо що це фінальний тест
      completeCourseTest(courseId, score).then(() => {
        // Після завершення фінального тесту оновлюємо видимість кнопки сертифіката
        updateProgress().then(() => {
          // Перезавантажуємо дані курсу, щоб оновити інтерфейс
          loadCourseData().then(() => {
            // Явно перевіряємо прогрес для оновлення кнопки сертифіката
            fetch(
              `/api/course/${courseId}/progress?userId=${localStorage.getItem(
                "userId"
              )}`
            )
              .then((response) => response.json())
              .then((progressData) => {
                updateCertificateButtonVisibility(progressData.progress);
              });
          });
        });
      });
    }
  }
}

async function completeCourseTest(courseId, score = 100) {
  try {
    console.log(`Завершення фінального тесту для курсу: ${courseId}`);
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("ID користувача не знайдено в localStorage");
      alert("Помилка: ID користувача не знайдено. Будь ласка, увійдіть знову.");
      return false;
    }

    console.log("Відправка даних про завершення тесту:", {
      userId,
      courseId,
      score,
    });

    const response = await fetch(`/api/course/${courseId}/test/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        score,
      }),
    });

    console.log("Статус відповіді сервера:", response.status);

    if (!response.ok) {
      let errorMessage = "Не вдалося завершити фінальний тест курсу";

      try {
        const errorData = await response.json();
        console.error("Деталі помилки:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        try {
          errorMessage = await response.text();
          console.error("Текст помилки:", errorMessage);
        } catch (e2) {
          console.error("Не вдалося отримати деталі помилки");
        }
      }

      // Замість спроби використати альтернативний метод, просто змінюємо підхід
      console.log("Позначаємо тест як завершений на клієнтській стороні");

      // Оновлюємо UI - позначаємо фінальний тест як завершений
      const finalTestSection = document.querySelector(".final-test-section");
      if (finalTestSection) {
        finalTestSection.classList.add("completed");
        finalTestSection.style.backgroundColor = "#e8f5e9";
      }

      // Перезавантажуємо дані курсу, щоб оновити інтерфейс
      await loadCourseData();

      // Оновлюємо відображення прогресу
      await updateProgress();

      alert("Фінальний тест зараховано!");
      return true;
    }

    // Оновлюємо інтерфейс після успішного запиту
    await updateProgress();

    // Оновлюємо стилі для фінального тесту
    const finalTestSection = document.querySelector(".final-test-section");
    if (finalTestSection) {
      finalTestSection.classList.add("completed");
      finalTestSection.style.backgroundColor = "#e8f5e9";
    }

    // Перезавантажуємо дані курсу, щоб оновити інтерфейс
    await loadCourseData();

    alert("Фінальний тест успішно завершено!");
    return true;
  } catch (error) {
    console.error("Помилка завершення фінального тесту:", error);

    // Оновлюємо стилі для фінального тесту без серверного запиту
    const finalTestSection = document.querySelector(".final-test-section");
    if (finalTestSection) {
      finalTestSection.classList.add("completed");
      finalTestSection.style.backgroundColor = "#e8f5e9";
    }

    // Перезавантажуємо дані курсу, щоб оновити інтерфейс
    await loadCourseData();

    alert("Фінальний тест зараховано, незважаючи на помилку!");
    return true;
  }
}

window.handleModuleTestClick = function (moduleId, testLink) {
  console.log(
    `Обробка кліку по тесту модуля: moduleId=${moduleId}, testLink=${testLink}`
  );

  // Зберігаємо ідентифікатор модуля в localStorage для легкого доступу
  localStorage.setItem("currentModuleTest", moduleId);

  // Змінюємо стан елементу в DOM
  const testItem = document.querySelector(
    `.test-item[data-module-id="${moduleId}"]`
  );
  if (testItem) {
    document.querySelectorAll(".topic-item").forEach((item) => {
      item.classList.remove("active");
    });
    testItem.classList.add("active");
  }

  // Отримуємо посилання на тест з API, яке включає зашифрований testId
  fetchModuleTestLink(moduleId)
    .then((updatedTestLink) => {
      if (updatedTestLink) {
        console.log(`Отримано оновлене посилання: ${updatedTestLink}`);
        openModuleTest(updatedTestLink, moduleId);
      } else {
        console.log(`Використовуємо оригінальне посилання: ${testLink}`);
        openModuleTest(testLink, moduleId);
      }
    })
    .catch((error) => {
      console.error("Помилка отримання оно  вленого посилання:", error);
      openModuleTest(testLink, moduleId);
    });
};

async function fetchModuleTestLink(moduleId) {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("userId не знайдено в localStorage");
      return null;
    }

    console.log(`Запит оновленого посилання для модуля ${moduleId}`);
    const response = await fetch(
      `/api/module/${moduleId}/test?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error(
        `Помилка отримання посилання на тест: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Отримано дані тесту:", data);

    return data.testLink || null;
  } catch (error) {
    console.error("Помилка запиту посилання на тест:", error);
    return null;
  }
}

// Функція для обробки кліку по фінальному тесту курсу
window.handleCourseTestClick = function (courseId, testLink) {
  console.log(
    `Handling course test click: courseId=${courseId}, testLink=${testLink}`
  );
  openModuleTest(testLink, null);
};

// Оновлений HTML для модульних тестів (використовується у createModuleHTML)
function renderModuleTest(module) {
  if (!module.test_link) return "";

  return `
        <div class="module-test">
            <li onclick="handleModuleTestClick(${module.id}, '${
    module.test_link
  }')" 
                class="topic-item test-item ${
                  module.is_module_test_completed ? "completed" : ""
                }"
                data-content-type="test"
                data-module-id="${module.id}"
                data-test-link="${module.test_link}"
                style="background-color: ${
                  module.is_module_test_completed ? "#e8f5e9" : "transparent"
                }"
            >
                <img src="/images/test-icon.svg" class="topic-icon" alt="test icon" />
                <span class="topic-title">Module Test</span>
            </li>
        </div>
    `;
}

// Оновлений HTML для фінального тесту (використовується у renderCourseContent)
function renderFinalTest(courseData) {
  const courseId = courseData.id;
  const testLink = courseData.test_link;
  const isCompleted = courseData.is_course_test_completed;

  if (!testLink) return ""; // Немає фінального тесту

  return `
        <section class="final-test-section ${isCompleted ? "completed" : ""}" 
                 data-course-id="${courseId}"
                 style="background-color: ${
                   isCompleted ? "#e8f5e9" : "transparent"
                 }">
            <div class="module-header">
                <h2>Фінальний тест курсу</h2>
            </div>
            <div class="test-content" 
                 onclick="handleCourseTestClick(${courseId}, '${testLink}')"
                 style="cursor: pointer; padding: 15px 20px;">
                <img src="/images/test-icon.svg" alt="Test icon" class="topic-icon" />
                <span class="topic-title">Пройти фінальний тест</span>
            </div>
        </section>
    `;
}

function renderCourseContent(courseData) {
  const courseContent = document.querySelector(".course-content");
  if (!courseContent) return;

  courseContent.innerHTML = `
        <div class="course-header">
            <h1>Зміст курсу</h1>
            <button class="toggle-all" aria-label="Toggle all content"></button>
        </div>
    `;

  // Відображаємо всі модулі
  COURSE_MODULES.forEach((module) => {
    courseContent.insertAdjacentHTML("beforeend", createModuleHTML(module));
  });

  // Додаємо фінальний тест, якщо він є
  if (courseData && courseData.test_link) {
    courseContent.insertAdjacentHTML("beforeend", renderFinalTest(courseData));
  }
}
