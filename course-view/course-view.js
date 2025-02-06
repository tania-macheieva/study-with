const COURSE_MODULES = [
    {
        id: 1,
        title: "Module 1",
        progress: {
            completed: 3,
            total: 3,
            timeLeft: 0,
            totalTime: 16
        },
        topics: [
            { id: 1, title: "topic 1 name", completed: true, contentType: "video" },
            { id: 2, title: "topic 2 name", completed: true, contentType: "text" },
            { id: 3, title: "topic 3 name", completed: true, contentType: "quiz" }
        ]
    },
    {
        id: 2,
        title: "Module 2",
        progress: {
            completed: 0,
            total: 3,
            timeLeft: 1,
            totalTime: 11
        },
        topics: [
            { id: 4, title: "topic 1 name", completed: false, contentType: "video" },
            { id: 5, title: "topic 2 name", completed: false, contentType: "video" },
            { id: 6, title: "topic 3 name", completed: false, contentType: "video" }
        ]
    },
    {
        id: 3,
        title: "Module 3",
        progress: {
            completed: 0,
            total: 0,
            timeLeft: 0,
            totalTime: 0
        },
        topics: []
    }
];

const VIDEO_SOURCE = {
    id: 'course-video',
    src: 'video_example.MP4',
    type: 'video/mp4'
};

const DISCUSSION_MESSAGES = [
    {
        id: "1",
        user: {
            name: "question user 1",
            avatar: "/images/user-avatar.png"
        },
        date: "29.01.2024",
        text: "question question question question question 1",
        replies: [
            {
                id: "1.1",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.2",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.3",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.4",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.5",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            }
        ]
    },
    {
        id: "2",
        user: {
            name: "question user 2",
            avatar: "/images/user-avatar.png"
        },
        date: "28.01.2024",
        text: "question question question question 2",
        replies: []
    },
    {
        id: "3",
        user: {
            name: "question user 3",
            avatar: "/images/user-avatar.png"
        },
        date: "28.01.2024",
        text: "question question question question 3",
        replies: [
            {
                id: "3.1",
                user: {
                    name: "Answer user 2",
                    avatar: "/images/user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            }
        ]
    }
];

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

const createModuleHTML = (module) => {
    const hasContent = module.topics && module.topics.length > 0;
    const getContentTypeIcon = (contentType) => {
        const icons = {
            video: "/images/video-icon.svg",
            text: "/images/text-icon.svg",
            quiz: "/images/test-icon.svg",
            audio: "/images/audio-icon.svg"
        };
        return icons[contentType] || "/images/text-icon.svg";
    };
    
    return `
        <section class="module" data-module-id="${module.id}">
            <div class="module-header">
                <h2>${module.title}</h2>
                ${hasContent ? `
                    <button class="toggle-module" aria-label="Toggle module content">
                    </button>
                ` : ''}
            </div>
            ${hasContent ? `
                <div class="module-content">
                    <div class="module-progress">
                        <span>${module.progress.completed}/${module.progress.total} complete</span>
                        <span class="separator">|</span>
                        <span>${module.progress.timeLeft} left</span>
                    </div>
                    <ul class="topics">
                        ${module.topics.map(topic => `
                            <li class="${topic.completed ? 'completed' : ''}" 
                                data-topic-id="${topic.id}" 
                                data-content-type="${topic.contentType}"
                                data-title="${topic.title}">
                                <div class="topic-info">
                                    <img src="${getContentTypeIcon(topic.contentType)}" 
                                         alt="${topic.contentType}" 
                                         class="content-type-icon">
                                    <span class="topic-title">${topic.title}</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </section>
    `;
};

const renderCourseContent = () => {
    const courseContent = document.querySelector('.course-content');
    if (!courseContent) return;
    courseContent.innerHTML = '';
    courseContent.innerHTML = `
        <div class="course-header">
            <h1>Course content</h1>
            <button class="toggle-all" aria-label="Toggle all content">
            </button>
        </div>
    `;
    courseContent.classList.remove('collapsed'); // Видаляємо клас collapsed
    COURSE_MODULES.forEach(module => {
        courseContent.insertAdjacentHTML('beforeend', createModuleHTML(module));
    });
    initializeModuleListeners();
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

const createDiscussionTemplate = () => `
    <section class="discussion-section">
        <div class="search-bar">
            <input type="text" placeholder="ask or search a question">
            <button class="icon-button send">
            <img src="../images/send.svg" alt="Send">
            </button>
            <button class="icon-button search">
            <img src="../images/icons8-search-50.png" alt="Search">
            </button>
        </div>
        <div class="filters">
            <div class="filters-left">
                <div class="checkbox-filter">
                    <input type="checkbox" id="questions-asked">
                    <label for="questions-asked">Questions I asked</label>
                </div>
                <div class="checkbox-filter">
                    <input type="checkbox" id="questions-following">
                    <label for="questions-following">Questions I'm following</label>
                </div>
                <div class="checkbox-filter">
                    <input type="checkbox" id="questions-responses">
                    <label for="questions-responses">Questions with responses</label>
                </div>
            </div>
            <div class="filters-right">
                <div class="filter-group">
                    <button class="filter-btn active">Whole course</button>
                    <button class="filter-btn">Current topic</button>
                </div>
                <div class="filter-group">
                    <button class="filter-btn active">Recent</button>
                    <button class="filter-btn">Oldest</button>
                </div>
            </div>
        </div>
        <section class="discussion-thread">
        </section>
    </section>
`;

const createMessageHTML = (message, isReply = false) => {
    const messageElement = document.createElement('article');
    messageElement.className = 'message';
    if (isReply) messageElement.classList.add('reply');
    messageElement.dataset.messageId = message.id;
    if (message.id.includes('.')) {
        messageElement.dataset.parentId = message.id.substring(0, message.id.lastIndexOf('.'));
    }
    messageElement.innerHTML = `
        <div class="user-info">
            <img src="${message.user.avatar}" alt="User avatar" class="avatar">
            <span class="username">${message.user.name}</span>
            <span class="date">${message.date}</span>
        </div>
        <p class="message-text">${message.text}</p>
        <button class="more-options">...</button>
        <div class="reply-input" style="display: none;">
            <input type="text" placeholder="write a reply to ${message.user.name}">
            <button class="send-reply" data-parent-id="${message.id}"></button>
        </div>
    `;
    return messageElement;
};

const updateMessageStyles = () => {
    const mainMessages = document.querySelectorAll('.message:not(.reply)');
    mainMessages.forEach(mainMessage => {
        const messageId = mainMessage.dataset.messageId;
        const replies = document.querySelectorAll(`.message.reply[data-parent-id="${messageId}"]`);
        if (replies.length > 0) {
            mainMessage.classList.add('has-visible-replies');
            replies.forEach((reply, index) => {
                reply.classList.remove('last-reply');
                if (index === replies.length - 1) {
                    reply.classList.add('last-reply');
                    reply.style.borderBottomLeftRadius = '12px';
                    reply.style.borderBottomRightRadius = '12px';
                    reply.style.marginBottom = '16px'; // додано
                } else {
                    reply.style.borderBottomLeftRadius = '0';
                    reply.style.borderBottomRightRadius = '0';
                    reply.style.marginBottom = '0'; // додано
                }
            });
        } else {
            mainMessage.classList.remove('has-visible-replies');
        }
    });
};

const showRepliesButtons = document.querySelectorAll('.Показати відповіді');
showRepliesButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    this.textContent = (this.textContent === 'Показати відповіді') ? 'Приховати відповіді' : 'Показати відповіді';
  });
});
const showMoreReplies = (messageId, startIndex) => {
    const allReplies = getAllReplies(messageId);
    const remainingReplies = allReplies.slice(startIndex);
    const lastVisibleReply = document.querySelector(`.message.reply[data-parent-id="${messageId}"]:last-of-type`);
    remainingReplies.forEach(reply => {
        const replyElement = createMessageHTML(reply, true);
        lastVisibleReply.after(replyElement);
    });
    updateMessageStyles();
    const showMoreButton = document.querySelector(`#show-more-${messageId}`);
    if (showMoreButton) {
        showMoreButton.remove();
    }
};

const getAllReplies = (messageId, messages = DISCUSSION_MESSAGES) => {
    let allReplies = [];
    function findMessageAndReplies(messages, targetId) {
        for (const message of messages) {
            if (message.id === targetId) {
                return message.replies || [];
            }
            if (message.replies && message.replies.length > 0) {
                const found = findMessageAndReplies(message.replies, targetId);
                if (found.length > 0) return found;
            }
        }
        return [];
    }
    allReplies = findMessageAndReplies(messages, messageId);
    return allReplies;
};

const toggleReplies = (messageId, show) => {
    const existingReplies = document.querySelectorAll(`.message.reply[data-parent-id^="${messageId}"]`);
    existingReplies.forEach(reply => reply.remove());
    const existingShowMore = document.querySelector(`#show-more-${messageId}`);
    if (existingShowMore) {
        existingShowMore.remove();
    }
    const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (show) {
        const allReplies = getAllReplies(messageId);
        if (allReplies.length > 0) {
            parentMessage.classList.add('has-visible-replies');
            const visibleReplies = allReplies.slice(0, 4);
            let lastReplyElement;
            visibleReplies.forEach((reply, index) => {
                const replyElement = createMessageHTML(reply, true);
                if (lastReplyElement) {
                    lastReplyElement.after(replyElement);
                } else {
                    parentMessage.after(replyElement);
                }
                lastReplyElement = replyElement;
            });
            if (allReplies.length > 4) {
                const showMoreButton = document.createElement('button');
                showMoreButton.id = `show-more-${messageId}`;
                showMoreButton.className = 'show-more-button';
                showMoreButton.textContent = 'Show more replies';
                Object.assign(showMoreButton.style, {
                    margin: '10px 0',
                    padding: '8px 16px',
                    background: '#FFFFFF',
                    border: '2px solid #283044',
                    borderRadius: '12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'block'
                });
                lastReplyElement.after(showMoreButton);
                showMoreButton.addEventListener('click', () => {
                    const remainingReplies = allReplies.slice(4);
                    let lastElement = lastReplyElement;
                    
                    remainingReplies.forEach(reply => {
                        const replyElement = createMessageHTML(reply, true);
                        lastElement.after(replyElement);
                        lastElement = replyElement;
                    });
                    showMoreButton.remove();
                    updateMessageStyles();
                });
            }
        }
    } else {
        parentMessage.classList.remove('has-visible-replies');
    }
    
    updateMessageStyles();
};

const addNewReply = (parentId, replyText) => {
    const newReplyId = generateReplyId(parentId);
    const newReply = {
        id: newReplyId,
        user: {
            name: "Current User",
            avatar: "/images/user-avatar.png"
        },
        date: new Date().toLocaleDateString(),
        text: replyText,
        replies: []
    };

    const parent = findMessageById(parentId);
    if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newReply);
        renderDiscussion();
        toggleReplies(parentId, true);
    }
};

const generateReplyId = (parentId) => {
    const parent = findMessageById(parentId);
    if (!parent.replies?.length) return `${parentId}.1`;
    
    const lastReplyNumber = Math.max(...parent.replies.map(reply => 
        parseInt(reply.id.split('.').pop())
    ));
    return `${parentId}.${lastReplyNumber + 1}`;
};

const findMessageById = (id, messages = DISCUSSION_MESSAGES) => {
    for (const message of messages) {
        if (message.id === id) return message;
        if (message.replies?.length) {
            const found = findMessageById(id, message.replies);
            if (found) return found;
        }
    }
    return null;
};

const renderDiscussion = () => {
    const discussionThread = document.querySelector('.discussion-thread');
    if (discussionThread) {
        discussionThread.innerHTML = '';
        DISCUSSION_MESSAGES.forEach(message => {
            const messageElement = createMessageHTML(message);
            discussionThread.appendChild(messageElement);
        });
        updateMessageStyles();
    }
};

const initializeFilters = () => {
    const checkboxes = document.querySelectorAll('.checkbox-filter input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterMessages);
    });
    const filterGroups = document.querySelectorAll('.filters-right .filter-group');
    filterGroups.forEach(group => {
        const buttons = group.querySelectorAll('.filter-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Знімаємо active з усіх кнопок в групі
                buttons.forEach(btn => btn.classList.remove('active'));
                // Додаємо active натиснутій кнопці
                button.classList.add('active');
                filterMessages();
            });
        });
    });
};

const filterMessages = () => {
    let filteredMessages = [...DISCUSSION_MESSAGES];
    const filters = {
        questionsAsked: document.querySelector('#questions-asked').checked,
        questionsFollowing: document.querySelector('#questions-following').checked,
        questionsWithResponses: document.querySelector('#questions-responses').checked
    };
    const courseFilter = document.querySelector('.filters-right .filter-group:first-child .filter-btn.active').textContent;
    const timeFilter = document.querySelector('.filters-right .filter-group:last-child .filter-btn.active').textContent;
    if (filters.questionsAsked || filters.questionsFollowing || filters.questionsWithResponses) {
        filteredMessages = filteredMessages.filter(message => {
            return (filters.questionsAsked && message.user.name === "Current User") ||
                   (filters.questionsFollowing && message.isFollowing) ||
                   (filters.questionsWithResponses && message.replies && message.replies.length > 0);
        });
    }
    if (courseFilter === 'Current topic') {
        // Тут додайте логіку фільтрації за поточною темою
        // Наприклад:
        filteredMessages = filteredMessages.filter(message => message.currentTopic === true);
    }
    filteredMessages.sort((a, b) => {
        const dateA = new Date(a.date.split('.').reverse().join('-'));
        const dateB = new Date(b.date.split('.').reverse().join('-'));
        return timeFilter === 'Recent' ? dateB - dateA : dateA - dateB;
    });
    const discussionThread = document.querySelector('.discussion-thread');
    discussionThread.innerHTML = '';
    filteredMessages.forEach(message => {
        const messageElement = createMessageHTML(message);
        discussionThread.appendChild(messageElement);
    });
    
    updateMessageStyles();
};
Element.prototype.querySelector = function(selector) {
    return Array.from(this.querySelectorAll(selector)).find(el => 
        selector.startsWith(':contains') ? 
        el.textContent.includes(selector.match(/"([^"]+)"/)[1]) : 
        true
    );
};

const initializeTabs = () => {
    const tabs = document.querySelectorAll('.tab');
    
    // Видаляємо старі обробники подій перед додаванням нових
    tabs.forEach(tab => {
        const clonedTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(clonedTab, tab);
        
        clonedTab.addEventListener('click', handleTabClick);
    });
};

const handleTabClick = (event) => {
    const tabs = document.querySelectorAll('.tab');
    const clickedTab = event.target;
    
    // Знімаємо активний клас з усіх табів
    tabs.forEach(t => t.classList.remove('active'));
    
    // Додаємо активний клас обраному табу
    clickedTab.classList.add('active');
    
    // Отримуємо текст табу і визначаємо, яку секцію показати
    const tabText = clickedTab.textContent.trim().toLowerCase();
    
    // Визначаємо, яку секцію потрібно показати
    if (tabText.includes('notes')) {
        renderSection('notes');
    } else if (tabText.includes('discussion')) {
        renderSection('discussion');
    }
};

const renderSection = (sectionType) => {
    const mainContent = document.querySelector('.main-content');
    const videoContainer = document.querySelector('.video-container');
    const tabs = document.querySelector('.tabs');
    
    // Зберігаємо поточні фільтри якщо це секція обговорень
    const currentFilters = sectionType === 'discussion' ? saveCurrentFilters() : null;
    
    // Створюємо новий контейнер для контенту
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    
    // Додаємо відео контейнер
    if (videoContainer) {
        contentContainer.appendChild(videoContainer.cloneNode(true));
    }
    
    // Додаємо таби
    if (tabs) {
        const clonedTabs = tabs.cloneNode(true);
        contentContainer.appendChild(clonedTabs);
        
        // Оновлюємо активний таб
        const allTabs = clonedTabs.querySelectorAll('.tab');
        allTabs.forEach(tab => {
            const tabText = tab.textContent.trim().toLowerCase().replace(/\s+/g, '');
            tab.classList.toggle('active', 
                (sectionType === 'discussion' && tabText === 'discussion') || 
                (sectionType === 'notes' && tabText === 'mynotesmarks')
            );
        });
    }
    
    // Рендеримо відповідну секцію
    switch(sectionType) {
        case 'discussion':
            contentContainer.insertAdjacentHTML('beforeend', createDiscussionTemplate());
            if (currentFilters) {
                restoreFilters(currentFilters);
            }
            break;
        case 'notes':
            const notesSection = renderNotes();
            if (notesSection) {
                contentContainer.appendChild(notesSection);
            }
            break;
    }
    
    // Очищуємо та оновлюємо основний контент
    mainContent.innerHTML = '';
    mainContent.appendChild(contentContainer);
    
    // Ініціалізуємо всі необхідні компоненти
    createVideoPlayer();
    initializeTabs();
    
    if (sectionType === 'discussion') {
        initializeFilters();
        renderDiscussion();
        initializeDiscussionListeners();
    }
};

const saveCurrentFilters = () => {
    const filters = {
        checkboxes: {},
        courseFilter: '',
        timeFilter: ''
    };
    document.querySelectorAll('.checkbox-filter input[type="checkbox"]').forEach(checkbox => {
        filters.checkboxes[checkbox.id] = checkbox.checked;
    });
    const activeCourseFilter = document.querySelector('.filters-right .filter-group:first-child .filter-btn.active');
    const activeTimeFilter = document.querySelector('.filters-right .filter-group:last-child .filter-btn.active');
    if (activeCourseFilter) filters.courseFilter = activeCourseFilter.textContent;
    if (activeTimeFilter) filters.timeFilter = activeTimeFilter.textContent;
    return filters;
};
const restoreFilters = (filters) => {
    Object.entries(filters.checkboxes).forEach(([id, checked]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = checked;
    });
    if (filters.courseFilter) {
        document.querySelectorAll('.filters-right .filter-group:first-child .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === filters.courseFilter);
        });
    }

    if (filters.timeFilter) {
        document.querySelectorAll('.filters-right .filter-group:last-child .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === filters.timeFilter);
        });
    }
};

const discussionThread = document.querySelector('.discussion-thread');

function renderDiscussionMessages() {
  discussionThread.innerHTML = '';
  DISCUSSION_MESSAGES.forEach(message => {
    const messageElement = createMessageHTML(message);
    discussionThread.appendChild(messageElement);
  });
  updateMessageStyles();
}

const initializeDiscussionListeners = () => {
    const discussionThread = document.querySelector('.discussion-thread');
    if (discussionThread) {
        discussionThread.innerHTML = '';
        DISCUSSION_MESSAGES.forEach(message => {
            const messageElement = createMessageHTML(message);
            discussionThread.appendChild(messageElement);
        });
        document.addEventListener('click', function(e) {
            const moreOptions = e.target.closest('.more-options');
            if (moreOptions) {
                const message = moreOptions.closest('.message');
                const messageId = message.dataset.messageId;
                const username = message.querySelector('.username').textContent;
                const isReply = message.classList.contains('reply');
                const existingMenu = document.querySelector('.options-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                const optionsMenu = document.createElement('div');
                optionsMenu.className = 'options-menu';
                
                // Визначаємо опції меню в залежності від типу повідомлення
                const menuOptions = isReply ? [
                    { action: 'add-reply', text: 'Write a reply' },
                    { action: 'follow', text: 'Follow replies' },
                    { action: 'report', text: 'Report message' }
                ] : [
                    { action: 'show-replies', text: 'Show/Hide replies' },
                    { action: 'add-reply', text: 'Write a reply' },
                    { action: 'follow', text: 'Follow replies' },
                    { action: 'report', text: 'Report message' }
                ];
                optionsMenu.innerHTML = menuOptions
                    .map(option => `<div class="option" data-action="${option.action}">${option.text}</div>`)
                    .join('');
                Object.assign(optionsMenu.style, {
                    position: 'absolute',
                    right: '40px',
                    top: '40px',
                    background: '#FFFFFF',
                    border: '2px solid #C7C7C7',
                    borderRadius: '12px',
                    padding: '10px',
                    zIndex: '1000'
                });
                optionsMenu.querySelectorAll('.option').forEach(option => {
                    Object.assign(option.style, {
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    });
                    option.addEventListener('mouseenter', () => {
                        option.style.background = '#F5F9FE';
                    });
                    option.addEventListener('mouseleave', () => {
                        option.style.background = 'transparent';
                    });
                });
                message.appendChild(optionsMenu);
                optionsMenu.addEventListener('click', function(e) {
                    const action = e.target.dataset.action;
                    if (action === 'show-replies') {
                        const areRepliesVisible = document.querySelector(`.message.reply[data-parent-id="${messageId}"]`) !== null;
                        toggleReplies(messageId, !areRepliesVisible);
                    } else if (action === 'add-reply') {
                        const replyInput = message.querySelector('.reply-input');
                        document.querySelectorAll('.reply-input').forEach(input => {
                            if (input !== replyInput) {
                                input.style.display = 'none';
                            }
                        });
                        replyInput.style.display = replyInput.style.display === 'none' ? 'flex' : 'none';
                    
                        if (replyInput.style.display === 'flex') {
                            const input = replyInput.querySelector('input');
                            input.focus();
                            input.placeholder = `написати відповідь до ${username}`;
                        }
                    }
                    optionsMenu.remove();
                });
                document.addEventListener('click', function closeMenu(e) {
                    if (!optionsMenu.contains(e.target) && !moreOptions.contains(e.target)) {
                        optionsMenu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }
        });
        discussionThread.addEventListener('click', function(e) {
            if (e.target.classList.contains('send-reply')) {
                const replyInput = e.target.previousElementSibling;
                const text = replyInput.value.trim();
                const parentId = e.target.dataset.parentId;
                
                if (text && parentId) {
                    addNewReply(parentId, text);
                    replyInput.value = '';
                    replyInput.closest('.reply-input').style.display = 'none';
                }
            }
        });
        updateMessageStyles();
    }
};

async function loadCourseData() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');
        
        if (!courseId || isNaN(courseId)) {
            console.error('Invalid course ID:', courseId);
            return;
        }

        if (!userId) {
            console.error('User ID not found');
            return;
        }

        const response = await fetch(`/api/course/${courseId}?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load course data: ${response.statusText}`);
        }
        
        const courseData = await response.json();
        console.log('Loaded course data:', courseData);
        
        const courseTitleElement = document.querySelector('.course-n');
        if (courseTitleElement && courseData.name) {
            courseTitleElement.textContent = courseData.name;
        }
        
        if (courseData.modules && Array.isArray(courseData.modules)) {
            COURSE_MODULES = courseData.modules.map(module => ({
                id: module.id,
                title: module.title || 'Untitled Module',
                progress: {
                    completed: 0,
                    total: module.lectures ? module.lectures.length : 0,
                    timeLeft: 0,
                    totalTime: 0
                },
                topics: module.lectures ? module.lectures.map(lecture => ({
                    id: lecture.id,
                    title: lecture.title || 'Untitled Lecture',
                    completed: false,
                    contentType: lecture.files && lecture.files.length > 0 ? lecture.files[0].type : 'text'
                })) : []
            }));
            
            renderCourseContent();
            loadProgress(); 
        }
        
    } catch (error) {
        console.error('Error loading course data:', error);
        const courseContent = document.querySelector('.course-content');
        if (courseContent) {
            courseContent.innerHTML = `
                <div class="error-message">
                    Failed to load course content: ${error.message}
                </div>
            `;
        }
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

async function completeLecture(lectureId) {
    try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            console.error('User ID not found');
            return;
        }

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
        
        await loadProgress(); 
        
    } catch (error) {
        console.error('Error completing lecture:', error);
    }
}

function initializeTopicListeners() {
    document.querySelectorAll('.topics li').forEach(topic => {
        topic.addEventListener('click', async () => {
            const lectureId = topic.dataset.topicId;
            if (lectureId) {
                await completeLecture(lectureId);
                topic.classList.add('completed');
            }
        });
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
    document.querySelectorAll('.topics li').forEach(topic => {
        topic.addEventListener('click', async () => {
            const lectureId = topic.dataset.topicId;
            const contentType = topic.dataset.contentType;
            
            document.querySelectorAll('.topics li').forEach(t => {
                t.classList.remove('active');
            });
            
            topic.classList.add('active');

            if (lectureId) {
                await loadLectureContent(lectureId);
                
                if (contentType === 'video') {
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                        videoElement.addEventListener('ended', async () => {
                            await completeLecture(lectureId);
                            topic.classList.add('completed');
                        });
                    }
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCourseData();
    createVideoPlayer();
    renderCourseContent();
    renderDiscussion();
    initializeFilters();
    initializeDiscussionListeners();
    initializeTabs();
    initializeModuleListeners();
    initializeTopicListeners(); 
});