const DISCUSSION_MESSAGES = [
    {
        id: "1",
        user: {
            name: "question user 1",
            avatar: "user-avatar.png"
        },
        date: "29.01.2024",
        text: "question question question question question 1",
        replies: [
            {
                id: "1.1",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.2",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.3",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.4",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            },
            {
                id: "1.5",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
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
            avatar: "user-avatar.png"
        },
        date: "28.01.2024",
        text: "question question question question 2",
        replies: []
    },
    {
        id: "3",
        user: {
            name: "question user 3",
            avatar: "user-avatar.png"
        },
        date: "28.01.2024",
        text: "question question question question 3",
        replies: [
            {
                id: "3.1",
                user: {
                    name: "Answer user 2",
                    avatar: "user-avatar.png"
                },
                date: "28.01.2024",
                text: "Answer Answer Answer 2",
                replies: []
            }
        ]
    }
];

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
                showMoreButton.textContent = 'Показати більше відповідей';
                
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
            avatar: "user-avatar.png"
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

const initializeTabs = () => {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Видаляємо клас active з усіх вкладок
            tabs.forEach(t => t.classList.remove('active'));
            
            // Додаємо клас active до поточної вкладки
            tab.classList.add('active');
            
            // Визначаємо, яку секцію треба відобразити
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
    // Знаходимо батьківський контейнер головного контенту
    const mainContent = document.querySelector('.main-content');
    const courseView = document.querySelector('.course-view');
    
    // Очищаємо попередній вміст основного контенту, але залишаємо відео та навігаційні кнопки
    const videoContainer = document.querySelector('.video-container');
    const tabs = document.querySelector('.tabs');
    
    mainContent.innerHTML = '';
    mainContent.appendChild(videoContainer);
    mainContent.appendChild(tabs);

    switch(sectionType) {
        case 'discussion':
            const discussionSection = document.createElement('section');
            discussionSection.classList.add('discussion-section');
            discussionSection.innerHTML = `
                <div class="search-bar">
                    <input type="text" placeholder="ask or search a question">
                    <button class="icon-button send"></button>
                    <button class="icon-button search"></button>
                </div>

                <div class="filters">
                    <div class="filter-group">
                        <button class="filter-btn">Questions I asked</button>
                        <button class="filter-btn">Questions I'm following</button>
                        <button class="filter-btn">Questions with responses</button>
                    </div>
                    
                    <div class="filter-group">
                        <button class="filter-btn active">Whole course</button>
                        <button class="filter-btn">Current topic</button>
                    </div>
                    
                    <div class="filter-group">
                        <button class="filter-btn active">Recent</button>
                        <button class="filter-btn">Oldest</button>
                    </div>
                </div>

                <section class="discussion-thread">
                    <!-- Messages will be dynamically inserted here -->
                </section>
            `;
            mainContent.appendChild(discussionSection);
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
                    <input type="text" placeholder="Введіть ключове слово">
                    <button class="icon-button search"></button>
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

const initializeKeywordSearch = () => {
    const searchInput = document.querySelector('.keyword-section .search-bar input');
    const searchButton = document.querySelector('.keyword-section .search-bar .icon-button.search');
    const searchResults = document.querySelector('.keyword-section .search-results');

    // Обробник події натискання кнопки пошуку
    searchButton.addEventListener('click', performKeywordSearch);

    // Обробник події натискання Enter в полі вводу
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
            searchResults.innerHTML = '<p>Жодного результату не знайдено</p>';
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.classList.add('search-result');
                resultElement.innerHTML = `
                    <p>${result.text}</p>
                    <small>Від користувача: ${result.user.name}</small>
                `;
                searchResults.appendChild(resultElement);

                // Додаємо відповіді, якщо вони є
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
    // Видаляємо попередні обробники подій
    const discussionThread = document.querySelector('.discussion-thread');
    
    if (discussionThread) {
        // Очищаємо попередній вміст
        discussionThread.innerHTML = '';
        
        // Рендеримо повідомлення
        DISCUSSION_MESSAGES.forEach(message => {
            const messageElement = createMessageHTML(message);
            discussionThread.appendChild(messageElement);
        });
        
        // Додаємо обробники подій
        document.addEventListener('click', function(e) {
            const moreOptions = e.target.closest('.more-options');
            if (moreOptions) {
                // Існуючий код для меню опцій
                const message = moreOptions.closest('.message');
                const messageId = message.dataset.messageId;
                const username = message.querySelector('.username').textContent;

                const existingMenu = document.querySelector('.options-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }

                const optionsMenu = document.createElement('div');
                optionsMenu.className = 'options-menu';
                optionsMenu.innerHTML = `
                    <div class="option" data-action="show-replies">Показати відповіді</div>
                    <div class="option" data-action="add-reply">Написати відповідь</div>
                    <div class="option" data-action="follow">Слідкувати за відповідями</div>
                    <div class="option" data-action="report">Поскаржитися</div>
                `;
                
                // Стилізація меню
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

        // Додаємо обробники для надсилання відповідей
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

        // Оновлюємо стилі повідомлень
        updateMessageStyles();
    }
};

// Додаємо виклик функції після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    renderDiscussion();
    initializeDiscussionListeners();
    initializeTabs();
});