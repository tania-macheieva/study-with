let COURSE_MODULES = [];
let lastCompletedLectureId = null;
let completedLectures = new Set();
let currentLectureId = null;



const VIDEO_SOURCE = {
    id: 'course-video',
    src: 'video_example.MP4',
    type: 'video/mp4'
};

const NOTES = {
    list: [],
    
    // Додавання нової нотатки
    add: function(data) {
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
    },
    
    // Отримання всіх нотаток
    getAll: function() {
        return this.list;
    },
    
    // Пошук нотаток за модулем
    getByModule: function(moduleId) {
        return this.list.filter(note => note.moduleId === moduleId);
    },
    
    // Пошук нотаток за топіком
    getByTopic: function(topicId) {
        return this.list.filter(note => note.topicId === topicId);
    },
    
    // Видалення нотатки
    remove: function(noteId) {
        this.list = this.list.filter(note => note.id !== noteId);
        this.saveToLocalStorage();
    },
    
    // Збереження нотаток у локальному сховищі
    saveToLocalStorage: function() {
        localStorage.setItem('courseNotes', JSON.stringify(this.list));
    },
    
    // Завантаження нотаток з локального сховища
    loadFromLocalStorage: function() {
        const savedNotes = localStorage.getItem('courseNotes');
        if (savedNotes) {
            this.list = JSON.parse(savedNotes);
        }
    }
};

// Завантаження збережених нотаток при ініціалізації
NOTES.loadFromLocalStorage();




// Отримання всіх нотаток
const allNotes = NOTES.getAll();

// Отримання нотаток для конкретного модуля
const moduleNotes = NOTES.getByModule(1);


const renderNotes = () => {
    const notesSection = document.createElement('section');
    notesSection.classList.add('notes-section');
    Object.assign(notesSection.style, {
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
        width: '100%',
        background: '#FFFFFF',
        border: '2px solid #C7C7C7',
        borderRadius: '12px',
        padding: '20px',
        color: '#283044'
    });

    // Створюємо секцію з фільтрами
    const filtersSection = document.createElement('div');
    filtersSection.classList.add('filters');
    filtersSection.style.fontFamily = 'Inter, sans-serif';
    filtersSection.innerHTML = `
        <div class="filters-right">
            <div class="filter-group">
                <button class="filter-btn active">Whole course</button>
                <button class="filter-btn">Current module</button>
                <button class="filter-btn">Current topic</button>
            </div>
        </div>
    `;

    // Отримуємо всі нотатки
    const allNotes = NOTES.getAll();

    // Створюємо контейнер для списку нотаток
    const notesListContainer = document.createElement('div');
    notesListContainer.className = 'notes-list';
    notesListContainer.style.marginTop = '20px';
    notesListContainer.style.fontFamily = 'Inter, sans-serif';

    // Групуємо нотатки за модулями та темами
    const notesByModules = {};
    allNotes.forEach(note => {
        if (note.moduleId) {
            if (!notesByModules[note.moduleId]) {
                notesByModules[note.moduleId] = {
                    moduleTitle: `Module ${note.moduleId}`,
                    topics: {}
                };
            }
            if (note.topicId) {
                if (!notesByModules[note.moduleId].topics[note.topicId]) {
                    notesByModules[note.moduleId].topics[note.topicId] = {
                        topicTitle: `Topic ${note.topicId}`,
                        notes: []
                    };
                }
                notesByModules[note.moduleId].topics[note.topicId].notes.push(note);
            }
        }
    });

    const filterNotes = (filter) => {
        notesListContainer.innerHTML = '';
        const currentModule = document.querySelector('.module.active')?.dataset.moduleId;
        const currentTopic = document.querySelector('.topic.active')?.dataset.topicId;

        Object.entries(notesByModules).forEach(([moduleId, moduleData]) => {
            let shouldShowModule = false;

            switch(filter) {
                case 'Whole course':
                    shouldShowModule = Object.values(moduleData.topics).some(topic => topic.notes.length > 0);
                    break;
                case 'Current module':
                    shouldShowModule = moduleId === currentModule;
                    break;
            }

            if (shouldShowModule) {
                const moduleSection = document.createElement('div');
                moduleSection.classList.add('notes-module');
                moduleSection.style.marginBottom = '20px';

                const moduleTitle = document.createElement('h3');
                moduleTitle.textContent = moduleData.moduleTitle;
                moduleTitle.style.marginBottom = '10px';
                moduleTitle.style.color = '#283044';
                moduleTitle.style.fontFamily = 'Inter, sans-serif';
                moduleSection.appendChild(moduleTitle);

                Object.entries(moduleData.topics).forEach(([topicId, topicData]) => {
                    let shouldShowTopic = false;

                    switch(filter) {
                        case 'Whole course':
                            shouldShowTopic = topicData.notes.length > 0;
                            break;
                        case 'Current module':
                            shouldShowTopic = true;
                            break;
                        case 'Current topic':
                            shouldShowTopic = topicId === currentTopic;
                            break;
                    }

                    if (shouldShowTopic) {
                        const topicSection = document.createElement('div');
                        topicSection.classList.add('notes-topic');
                        topicSection.style.marginBottom = '15px';

                        const topicTitle = document.createElement('h4');
                        topicTitle.textContent = topicData.topicTitle;
                        topicTitle.style.marginBottom = '10px';
                        topicTitle.style.color = '#283044';
                        topicTitle.style.fontFamily = 'Inter, sans-serif';
                        topicTitle.style.fontWeight = 'normal';
                        topicSection.appendChild(topicTitle);

                        topicData.notes.forEach(note => {
                            const noteElement = document.createElement('div');
                            noteElement.classList.add('note-item');
                            Object.assign(noteElement.style, {
                                border: '2px solid #C7C7C7',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                fontFamily: 'Inter, sans-serif',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            });
                    
                            const noteContent = document.createElement('div');
                            noteContent.style.flexGrow = '1';
                            noteContent.style.marginRight = '15px';
                    
                            const noteMetadata = document.createElement('div');
                            noteMetadata.innerHTML = `
                            <span style="font-size: 12px; color: #666; font-family: 'Inter', sans-serif;">
                            ${note.videoTimecode ? `Video time: ${note.videoTimecode} ` : ''}
                            ${note.timestamp ? `Created: ${new Date(note.timestamp).toLocaleString('en-US')} ` : ''}
                            </span>
                            `;
                    
                            const noteText = document.createElement('div');
                            noteText.textContent = note.text;
                            noteText.style.marginTop = '8px';
                            noteText.style.fontFamily = 'Inter, sans-serif';
                    
                            noteContent.appendChild(noteMetadata);
                            noteContent.appendChild(noteText);
                    
                            const noteActions = document.createElement('div');
                            noteActions.style.display = 'flex';
                            noteActions.style.flexDirection = 'column';
                            noteActions.style.gap = '10px';
                    
                            const editButton = document.createElement('button');
                            editButton.textContent = 'Edit';
                            Object.assign(editButton.style, {
                                background: 'none',
                                border: '1px solid #283044',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#283044'
                            });
                    
                            const deleteButton = document.createElement('button');
                            deleteButton.textContent = 'Delete';
                            Object.assign(deleteButton.style, {
                                background: 'none', 
                                border: '1px solid  #283044',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: ' #283044'
                            });
                    
                            noteActions.appendChild(editButton);
                            noteActions.appendChild(deleteButton);
                    
                            noteElement.appendChild(noteContent);
                            noteElement.appendChild(noteActions);

                            topicSection.appendChild(noteElement);
                        });

                        moduleSection.appendChild(topicSection);
                    }
                });

                notesListContainer.appendChild(moduleSection);
            }
        });
    };

    // Додаємо обробники подій для кнопок фільтрів
    filtersSection.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtersSection.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterNotes(btn.textContent);
        });
        
        btn.style.fontFamily = 'Inter, sans-serif';
        btn.style.color = '#283044';
    });

    notesSection.appendChild(filtersSection);
    notesSection.appendChild(notesListContainer);

    // Початкова фільтрація для відображення всіх нотаток
    filterNotes('Whole course');

    return notesSection;
};

NOTES.list = [];
// Додавання нотатки до відео
NOTES.add({
    text: 'tvruertbevercwe',
    videoTimecode: '0:19',
    moduleId: 1,
    topicId: 1,
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
});

const createVideoPlayer = () => {
    const videoContainer = document.querySelector('.video-player');
    if (!videoContainer) return;

    videoContainer.innerHTML = '';

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-wrapper';
    videoWrapper.style.position = 'relative';

    const videoElement = document.createElement('video');
    videoElement.id = VIDEO_SOURCE.id;
    videoElement.className = 'video-element';
    videoElement.controlsList = "nodownload";
    videoElement.controls = true;

    Object.assign(videoElement.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '12px',
        '-webkit-user-select': 'none',
    });
    
    // Блокуємо контекстне меню, яке містить опцію "Зберегти відео як..."
    videoElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Блокуємо комбінації клавіш для збереження
    videoElement.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
        }
    });

    const sourceElement = document.createElement('source');
    sourceElement.src = VIDEO_SOURCE.src;
    sourceElement.type = VIDEO_SOURCE.type;
    videoElement.appendChild(sourceElement);

    const customControls = document.createElement('div');
    customControls.className = 'custom-video-controls';
    Object.assign(customControls.style, {
        position: 'absolute',
        bottom: '80px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '2',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });

    const notesButton = document.createElement('button');
    notesButton.className = 'notes-button';
    notesButton.innerHTML = `
        <img src="../images/note-icon.svg" alt="Notes" style="width: 16px; height: 16px; margin-right: 5px;">
        Add note
    `;
    Object.assign(notesButton.style, {
        background: 'rgba(0, 0, 0, 0.7)',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
    });

    customControls.appendChild(notesButton);

    videoWrapper.appendChild(videoElement);
    videoWrapper.appendChild(customControls);
    videoContainer.appendChild(videoWrapper);

    videoWrapper.addEventListener('mouseenter', () => {
        customControls.style.opacity = '1';
    });

    videoWrapper.addEventListener('mouseleave', () => {
        customControls.style.opacity = '0';
    });

    notesButton.addEventListener('click', () => {
        videoElement.pause();
        const currentTime = formatVideoTime(videoElement.currentTime);
        showNotesModal(currentTime);
    });
};

const saveNote = (noteData) => {
    const existingNotes = JSON.parse(localStorage.getItem('videoNotes') || '[]');
    existingNotes.push({
        ...noteData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('videoNotes', JSON.stringify(existingNotes));
    alert('Note saved successfully!');
};

const formatVideoTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const showNotesModal = (currentTime) => {
    const existingModal = document.querySelector('.notes-modal');
    if (existingModal) {
        existingModal.remove();
    }
    const modal = document.createElement('div');
    modal.className = 'notes-modal';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
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
        width: '600px',
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: '1000'
    });
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    modal.querySelector('textarea').focus();
    const closeModal = () => {
        modal.remove();
        overlay.remove();
        const video = document.querySelector('#course-video');
        if (video) video.play();
    };
    modal.querySelector('.cancel-button').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    modal.querySelector('.save-button').addEventListener('click', () => {
        const noteText = modal.querySelector('textarea').value;
        const timestamp = modal.querySelector('.video-timestamp').textContent;
        if (noteText.trim()) {
            saveNote({
                text: noteText,
                timestamp: timestamp,
                videoId: VIDEO_SOURCE.id
            });
        }
        closeModal();
    });
};

function createModuleHTML(module) {
    const getIconByFileType = (fileType) => {
        if (!fileType) return '/images/text-icon.svg';
        
        if (fileType.startsWith('video/') || fileType === 'video/quicktime') {
            return '/images/video-icon.svg';
        }
        if (fileType === 'audio/mpeg') {
            return '/images/audio-icon.svg';
        }
        if (fileType === 'text/plain') {
            return '/images/text-icon.svg';
        }
        return '/images/file-icon.svg';
    };

    const { completed, total } = module.progress;
    const remaining = total - completed;
    
    return `
        <section class="module" data-module-id="${module.id}">
            <div class="module-header">
                <h2>${module.title}</h2>
                ${module.lectures.length > 0 ? `
                    <button class="toggle-module" aria-label="Toggle module content"></button>
                ` : ''}
            </div>
            ${module.lectures.length > 0 ? `
                <div class="module-content">
                    <div class="module-progress">
                        <span>${completed}/${total} complete</span>
                        <span class="separator">|</span>
                        <span>${remaining} left</span>
                    </div>
                    <ul class="topics">
                        ${module.lectures.map(lecture => `
                            <li onclick="handleLectureClick(${lecture.id}, '${lecture.contentType}')" 
                                data-topic-id="${lecture.id}" 
                                data-content-type="${lecture.contentType}"
                                class="topic-item ${lecture.completed ? 'completed' : ''}"
                                style="background-color: ${lecture.completed ? '#e8f5e9' : 'transparent'}"
                            >
                                <img src="${getIconByFileType(lecture.file_type)}" class="topic-icon" alt="lecture type icon" />
                                <span class="topic-title">${lecture.title}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </section>
    `;
}

async function initializeLecturesState() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');
        
        const progressData = await response.json();
        
        document.querySelectorAll('.topic-item').forEach(topic => {
            const lectureId = topic.dataset.topicId;
            if (completedLectures.has(lectureId)) {
                topic.classList.add('completed');
                topic.style.backgroundColor = '#e8f5e9';
            }
        });
        
        const progressBar = document.querySelector('.progress-bar span');
        const progressText = document.querySelector('.progress-text .percent');
        if (progressBar && progressText) {
            progressBar.style.width = `${progressData.progress}%`;
            progressText.textContent = `${Math.round(progressData.progress)}%`;
        }
    } catch (error) {
        console.error('Error initializing lectures state:', error);
    }
}

window.handleLectureClick = async function(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/lecture/${lectureId}?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Помилка завантаження лекції');
        }

        const lectureData = await response.json();
        console.log('Lecture data:', lectureData);
        
        const videoContainer = document.querySelector('.video-player');
        if (!videoContainer) return;

        updateActiveAndCompletedStates(lectureId);

        if (window.completionTimer) {
            clearTimeout(window.completionTimer);
        }

        // Аудіо
        if (lectureData.file_type === 'audio/mpeg') {
            videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: white; border-radius: 12px;">
                    <div style="width: 80%; max-width: 600px;">
                        <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center;">${lectureData.title}</h2>
                        <audio controls style="width: 100%; margin-bottom: 20px;">
                            <source src="/${lectureData.file_url}" type="audio/mpeg">
                        </audio>
                        ${lectureData.description ? `<div style="text-align: center;">${lectureData.description}</div>` : ''}
                    </div>
                </div>
            `;

            const audio = videoContainer.querySelector('audio');
            if (audio) {
                audio.addEventListener('ended', () => completeLecture(lectureId));
            }
        } 
        // Відео
        else if (lectureData.file_type && (lectureData.file_type.startsWith('video/') || lectureData.file_type === 'video/quicktime')) {
            videoContainer.innerHTML = `
                <video controls style="width: 100%; height: 100%; border-radius: 12px;">
                    <source src="/${lectureData.file_url}" type="video/mp4">
                    <source src="/${lectureData.file_url}" type="video/quicktime">
                    <source src="/${lectureData.file_url}" type="video/mov">
                </video>
            `;

            const video = videoContainer.querySelector('video');
            if (video) {
                video.addEventListener('ended', () => completeLecture(lectureId));
            }
        }
        // Файли
        else if (lectureData.file_type && lectureData.file_url) {
            videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: white; border-radius: 12px;">
                    <div style="text-align: center;">
                        <h2 style="font-size: 18px; margin-bottom: 20px;">${lectureData.title}</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" style="width: 64px; height: 64px; margin: 0 auto 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <p style="margin-bottom: 20px; color: #666;">${lectureData.file_url.split('/').pop()}</p>
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

            window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
        }
        // Текстовий контент
        else {
            videoContainer.innerHTML = `
                <div style="width: 100%; height: 100%; padding: 20px; background: white; border-radius: 12px;">
                    <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center;">${lectureData.title}</h2>
                    <div style="color: #333;">
                        ${lectureData.description || 'Опис відсутній'}
                    </div>
                </div>
            `;

            window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
        }

    } catch (error) {
        console.error('Помилка:', error);
        const videoContainer = document.querySelector('.video-player');
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
    document.querySelectorAll('.topic-item').forEach(topic => {
        topic.classList.remove('active');
        if (!completedLectures.has(topic.dataset.topicId)) {
            topic.style.backgroundColor = 'transparent';
        }
    });

    const currentTopic = document.querySelector(`[data-topic-id="${lectureId}"]`);
    if (currentTopic) {
        currentTopic.classList.add('active');
    }
}

function setupVideoListeners(video, lectureId) {
    video.addEventListener('play', () => {
        clearTimeout(window.completionTimer);
        window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
    });

    video.addEventListener('pause', () => {
        clearTimeout(window.completionTimer);
    });
}

function setupAudioListeners(audio, lectureId) {
    audio.addEventListener('play', () => {
        clearTimeout(window.completionTimer);
        window.completionTimer = setTimeout(() => completeLecture(lectureId), 5000);
    });

    audio.addEventListener('pause', () => {
        clearTimeout(window.completionTimer);
    });
}

function showErrorMessage(error) {
    const videoContainer = document.querySelector('.video-player');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <div style="padding: 20px; background: white; color: red; border-radius: 12px;">
                Помилка завантаження контенту: ${error.message}
            </div>
        `;
    }
}

// Функція для завершення лекції
window.completeLecture = async function(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/lecture/${lectureId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            const topic = document.querySelector(`[data-topic-id="${lectureId}"]`);
            if (topic) {
                topic.style.backgroundColor = '#e8f5e9';
            }
        }
    } catch (error) {
        console.error('Error completing lecture:', error);
    }
};

const initializeModuleListeners = () => {
    const toggleAll = document.querySelector('.toggle-all');
    const courseContent = document.querySelector('.course-content');
    const moduleToggles = document.querySelectorAll('.toggle-module');
    
    toggleAll?.addEventListener('click', () => {
        toggleAll.classList.toggle('collapsed');
        courseContent.classList.toggle('collapsed');
        const modules = document.querySelectorAll('.module');
        
        if (courseContent.classList.contains('collapsed')) {
            modules.forEach(module => {
                module.classList.add('collapsed');
                const moduleContent = module.querySelector('.module-content');
                if (moduleContent) {
                    moduleContent.style.display = 'none';
                }
                const toggleButton = module.querySelector('.toggle-module');
                if (toggleButton) {
                    toggleButton.classList.add('collapsed');
                }
            });
        } else {
            modules.forEach(module => {
                module.classList.remove('collapsed');
                const moduleContent = module.querySelector('.module-content');
                if (moduleContent) {
                    moduleContent.style.display = 'block';
                }
                const toggleButton = module.querySelector('.toggle-module');
                if (toggleButton) {
                    toggleButton.classList.remove('collapsed');
                }
            });
        }
    });

    moduleToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const module = toggle.closest('.module');
            const moduleContent = module.querySelector('.module-content');
            toggle.classList.toggle('collapsed');
            module.classList.toggle('collapsed');
            if (moduleContent) {
                moduleContent.style.display = moduleContent.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
};


async function loadCourseData() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');

        const response = await fetch(`/api/course/${courseId}?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to load course data');
        
        const courseData = await response.json();
        
        if (courseData.modules && Array.isArray(courseData.modules)) {
            completedLectures.clear();
            
            COURSE_MODULES = courseData.modules.map(module => {
                const lectures = module.lectures || [];
                const completedLecturesCount = lectures.filter(lecture => lecture.completed).length;
                
                lectures.forEach(lecture => {
                    if (lecture.completed) {
                        completedLectures.add(lecture.id.toString());
                    }
                });
                
                return {
                    id: module.id,
                    title: module.title,
                    lectures: lectures.map(lecture => ({
                        id: lecture.id,
                        title: lecture.title,
                        completed: Boolean(lecture.completed),
                        file_type: lecture.file_type,
                        contentType: lecture.file_type || 'text'
                    })),
                    progress: {
                        completed: completedLecturesCount,
                        total: lectures.length
                    }
                };
            });
            
            renderCourseContent();
            applyCompletedLecturesStyles();
        }
    } catch (error) {
        console.error('Error loading course data:', error);
    }
}

function applyCompletedLecturesStyles() {
    const topics = document.querySelectorAll('.topic-item');
    topics.forEach(topic => {
        const lectureId = topic.dataset.topicId;
        if (completedLectures.has(lectureId)) {
            topic.classList.add('completed');
            topic.style.backgroundColor = '#e8f5e9';
        }
    });
}

function renderCourseContent() {
    const courseContent = document.querySelector('.course-content');
    if (!courseContent) return;
    
    courseContent.innerHTML = `
        <div class="course-header">
            <h1>Course content</h1>
            <button class="toggle-all" aria-label="Toggle all content"></button>
        </div>
    `;
    
    COURSE_MODULES.forEach(module => {
        courseContent.insertAdjacentHTML('beforeend', createModuleHTML(module));
    });
    
    initializeModuleListeners();
}

async function completeLecture(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/lecture/${lectureId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Failed to complete lecture');

        COURSE_MODULES = COURSE_MODULES.map(module => {
            const updatedLectures = module.lectures.map(lecture => 
                lecture.id === parseInt(lectureId) 
                    ? { ...lecture, completed: true }
                    : lecture
            );
            
            return {
                ...module,
                lectures: updatedLectures,
                progress: {
                    completed: updatedLectures.filter(l => l.completed).length,
                    total: updatedLectures.length
                }
            };
        });

        renderCourseContent();

    } catch (error) {
        console.error('Error completing lecture:', error);
    }
}

function calculateTotalProgress(modules) {
    let totalLectures = 0;
    let completedLectures = 0;

    modules.forEach(module => {
        if (module.lectures) {
            totalLectures += module.lectures.length;
            completedLectures += module.lectures.filter(l => l.completed).length;
        }
    });

    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
}

async function loadCourseHeader() {
    try {
        const response = await fetch('/header/course-header.html');
        const html = await response.text();
        document.getElementById('courseHeader').innerHTML = html;
        
        initializeCourseHeader();
    } catch (error) {
        console.error('Error loading course header:', error);
    }
}



function updateProgressUI(progressData) {
    const progressBar = document.querySelector('.progress-bar span');
    const progressText = document.querySelector('.progress-text .percent');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${progressData.progress}%`;
        progressText.textContent = `${Math.round(progressData.progress)}%`;
    }

    const allLectures = document.querySelectorAll('.topics li');
    allLectures.forEach(lecture => {
        const lectureId = lecture.dataset.topicId;
        if (progressData.completedLectures.includes(parseInt(lectureId))) {
            lecture.classList.add('completed');
        }
    });
}

async function loadProgress() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');

        if (!userId || !courseId) return;

        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load progress');
        }
        
        const progressData = await response.json();
        updateProgressUI(progressData);
        
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

async function loadLectureContent(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/lecture/${lectureId}/content?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load lecture content');
        }
        
        const lectureData = await response.json();
        displayLectureContent(lectureData);
    } catch (error) {
        console.error('Error loading lecture content:', error);
    }
}

function displayLectureContent(lectureData) {
    const videoContainer = document.querySelector('.video-player');
    if (!videoContainer) return;

    const lectureTitle = document.querySelector('.current-lecture-title');
    if (lectureTitle) {
        lectureTitle.textContent = lectureData.title;
    }

    switch(lectureData.contentType) {
        case 'video':
            createVideoPlayer(lectureData.videoUrl);
            break;
        case 'text':
            videoContainer.innerHTML = `
                <div class="text-content">
                    ${lectureData.content}
                </div>
            `;
            break;
        case 'quiz':
            videoContainer.innerHTML = `
                <div class="quiz-content">
                    <h3>${lectureData.title}</h3>
                    <div class="quiz-questions">
                        ${lectureData.questions.map(q => createQuizQuestion(q)).join('')}
                    </div>
                    <button class="submit-quiz">Submit Quiz</button>
                </div>
            `;
            break;
    }
}

function initializeTopicListeners() {
    const topicItems = document.querySelectorAll('.topics li');
    console.log('Found topics:', topicItems.length); 
 
    topicItems.forEach(topic => {
        topic.style.cursor = 'pointer'; 
        
        topic.addEventListener('click', async () => {
            console.log('Topic clicked:', topic.dataset.topicId); 
            
            const lectureId = topic.dataset.topicId;
            if (!lectureId) {
                console.error('No lecture ID found');
                return;
            }
 
            try {
                const userId = localStorage.getItem('userId');
                const response = await fetch(`/api/lecture/${lectureId}?userId=${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to load lecture');
                }
 
                const lectureData = await response.json();
                console.log('Lecture data:', lectureData); 
 
                const videoContainer = document.querySelector('.video-player');
                if (!videoContainer) {
                    console.error('Video container not found');
                    return;
                }
 
                document.querySelectorAll('.topics li').forEach(li => {
                    li.classList.remove('active');
                });
                topic.classList.add('active');
 
                if (lectureData.file_type === 'video') {
                    videoContainer.innerHTML = `
                        <video controls>
                            <source src="/uploads/${lectureData.file_url}" type="video/mp4">
                            Your browser does not support video.
                        </video>
                    `;
 
                    const video = videoContainer.querySelector('video');
                    video.addEventListener('ended', () => {
                        completeLecture(lectureId);
                        topic.classList.add('completed');
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
                console.error('Error loading lecture:', error);
                alert('Failed to load lecture content');
            }
        });
    });
 }

async function completeLecture(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/lecture/${lectureId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Failed to complete lecture');
        }
    } catch (error) {
        console.error('Error completing lecture:', error);
    }
}

async function updateProgress() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');
        
        const progressData = await response.json();
        
        const progressBar = document.querySelector('.progress-bar span');
        const progressText = document.querySelector('.progress-text .percent');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progressData.progress}%`;
            progressText.textContent = `${Math.round(progressData.progress)}%`;
        }
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

function initializeCourseHeader() {
    const homeButton = document.querySelector('.home');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    const optionsButton = document.querySelector('.oth')?.parentElement;
    if (optionsButton) {
        optionsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
        });
    }
    document.addEventListener('click', function(e) {
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => {
            if (!menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    });
    if (typeof initializeLanguage === 'function') {
        initializeLanguage();
    }
}

async function initializeCourseProgress() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');

        if (!courseId || !userId) return;

        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Помилка завантаження прогресу');
        }
        
        const progressData = await response.json();
        
        const progressBar = document.querySelector('.progress-bar span');
        const progressText = document.querySelector('.progress-text .percent');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progressData.progress}%`;
            progressText.textContent = `${Math.round(progressData.progress)}%`;
        }
    } catch (error) {
        console.error('Помилка ініціалізації прогресу:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCourseHeader().then(() => {
        initializeCourseProgress();
    });
    loadCourseData();
    createVideoPlayer();
    renderCourseContent();   
    initializeModuleListeners();
    initializeTopicListeners(); 
});