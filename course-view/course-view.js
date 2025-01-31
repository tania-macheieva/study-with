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
    videoElement.controls = true;

    Object.assign(videoElement.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '12px'
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

    videoElement.addEventListener('loadeddata', () => {
        console.log('Відео успішно завантажено');
    });

    videoElement.addEventListener('error', (e) => {
        console.error('Помилка завантаження відео:', e);
        videoContainer.innerHTML = 'Помилка завантаження відео';
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
        width: '400px',
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
        return icons[contentType] || "";
    };
    
    return `
        <section class="module collapsed" data-module-id="${module.id}">
            <div class="module-header">
                <h2>${module.title}</h2>
                ${hasContent ? `
                    <button class="toggle-module collapsed" aria-label="Toggle module content">
                    </button>
                ` : ''}
            </div>
            ${hasContent ? `
                <div class="module-content" style="display: none;">
                    <div class="module-progress">
                        <span>${module.progress.completed}/${module.progress.total} complete</span>
                        <span class="separator">|</span>
                        <span>${module.progress.timeLeft} hour left out of ${module.progress.totalTime}</span>
                    </div>
                    <ul class="topics">
                        ${module.topics.map(topic => `
                            <li class="${topic.completed ? 'completed' : ''}" data-topic-id="${topic.id}">
                                <img 
                                    src="${getContentTypeIcon(topic.contentType)}" 
                                    alt="${topic.contentType}" 
                                    class="content-type-icon"
                                >
                                ${topic.title}
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
            <button class="toggle-all collapsed" aria-label="Toggle all content">
            </button>
        </div>
    `;
    courseContent.classList.add('collapsed');
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
        if (!courseContent.classList.contains('collapsed')) {
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
        } else {
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
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabText = tab.textContent.toLowerCase().replace(/\s+/g, '');
            
            switch(tabText) {
                case 'discussion':
                    renderSection('discussion');
                    break;
                case 'searchbykeyword':
                    renderSection('keyword');
                    break;
                case 'mycurriculum':
                    renderSection('curriculum');
                    break;
                case 'mynotesmarks':
                    renderSection('notes');
                    break;
            }
        });
    });
};

const renderSection = (sectionType) => {
    const mainContent = document.querySelector('.main-content');
    const videoContainer = document.querySelector('.video-container');
    const tabs = document.querySelector('.tabs');
    const currentFilters = saveCurrentFilters();
    mainContent.innerHTML = '';
    mainContent.appendChild(videoContainer);
    mainContent.appendChild(tabs);
    switch(sectionType) {
        case 'discussion':
            mainContent.insertAdjacentHTML('beforeend', createDiscussionTemplate());
            restoreFilters(currentFilters);
            initializeFilters();
            renderDiscussion();
            initializeDiscussionListeners();
            break;

        case 'keyword':
            const keywordSection = document.createElement('section');
            keywordSection.classList.add('keyword-section');
            Object.assign(keywordSection.style, {
                boxSizing: 'border-box',
                width: '100%',
                background: '#FFFFFF',
                border: '2px solid #C7C7C7',
                borderRadius: '12px',
                padding: '20px'
            });
            keywordSection.innerHTML = `
                <div class="search-bar">
                    <input type="text" placeholder="Type a keyword to search information in the topic">
                    <button class="icon-button search">
                    <img src="../images/icons8-search-50.png" alt="Search">
                    </button>
                </div>
                <div class="search-results">
                    <!-- Результати пошуку будуть додані динамічно -->
                </div>
            `;
            mainContent.appendChild(keywordSection);
            initializeKeywordSearch();
            break;

        case 'curriculum':
            const curriculumSection = document.createElement('section');
            curriculumSection.classList.add('curriculum-section');
            Object.assign(curriculumSection.style, {
                boxSizing: 'border-box',
                width: '100%',
                background: '#FFFFFF',
                border: '2px solid #C7C7C7',
                borderRadius: '12px',
                padding: '20px'
            });
            
            mainContent.appendChild(curriculumSection);
            break;

        case 'notes':
            const notesSection = document.createElement('section');
            notesSection.classList.add('notes-section');
            Object.assign(notesSection.style, {
                boxSizing: 'border-box',
                width: '100%',
                background: '#FFFFFF',
                border: '2px solid #C7C7C7',
                borderRadius: '12px',
                padding: '20px'
            });
            
            mainContent.appendChild(notesSection);
            break;
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

const initializeKeywordSearch = () => {
    const searchInput = document.querySelector('.keyword-section .search-bar input');
    const searchButton = document.querySelector('.keyword-section .search-bar .icon-button.search');
    const searchResults = document.querySelector('.keyword-section .search-results');
    searchButton.addEventListener('click', performKeywordSearch);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performKeywordSearch();
        }
    });

    function performKeywordSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const results = DISCUSSION_MESSAGES.filter(message => 
                // Пошук по тексту повідомлення та відповідей
                message.text.toLowerCase().includes(keyword.toLowerCase()) || 
                (message.replies && message.replies.some(reply => 
                    reply.text.toLowerCase().includes(keyword.toLowerCase())
                ))
            );

            displaySearchResults(results);
        }
    }

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No result found</p>';
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.classList.add('search-result');
                resultElement.innerHTML = `
                    <p>${result.text}</p>
                    <small>Від користувача: ${result.user.name}</small>
                `;
                searchResults.appendChild(resultElement);
                if (result.replies && result.replies.length > 0) {
                    result.replies.forEach(reply => {
                        const replyElement = document.createElement('div');
                        replyElement.classList.add('search-result', 'reply');
                        replyElement.innerHTML = `
                            <p>${reply.text}</p>
                            <small>Відповідь від: ${reply.user.name}</small>
                        `;
                        searchResults.appendChild(replyElement);
                    });
                }
            });
        }
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

document.addEventListener('DOMContentLoaded', () => {
    createVideoPlayer();
    renderCourseContent();
    renderDiscussion();
    initializeFilters();
    initializeDiscussionListeners();
    initializeTabs();
});