
let DISCUSSION_MESSAGES = [
    {
        id: "1",
        user: {
            name: "question user 1",
            avatar: "/images/user-avatar.png"
        },
        date: "29.01.2024",
        text: "question question question question question 1",
    },
]

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

const createMessageHTML = (message, isReply = false, replyLevel = 0) => {
    const messageElement = document.createElement('article');
    messageElement.className = 'message';
    if (isReply) messageElement.classList.add('reply');
    messageElement.dataset.messageId = message.id;
    messageElement.dataset.replyLevel = replyLevel; 

    if (message.id.includes('.')) {
        messageElement.dataset.parentId = message.id.substring(0, message.id.lastIndexOf('.'));
    }

    const replyToUsername = message.replyTo ? `@${message.replyTo}` : '';

    messageElement.innerHTML = `
        <div class="user-info">
            <img src="${message.user.avatar}" alt="User avatar" class="avatar">
            <span class="username">${message.user.name}</span>
            <span class="date">${message.date}</span>
        </div>
        <p class="message-text">${replyToUsername} ${message.text}</p>  
        <button class="more-options">...</button>
        <div class="reply-input" style="display: none;">
            <input type="text" placeholder="write a reply to ${message.user.name}">
            <button class="send-reply" data-parent-id="${message.id}">
                <img src="../images/send.svg" alt="Send">
            </button>
        </div>
    `;
    return messageElement;
};


const handleReply = (messageId, replyText) => {
    const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
    const parentUserName = parentMessage.querySelector('.username').textContent;
    
    const replyMessage = {
        id: generateUniqueId(), 
        user: currentUser, 
        replyTo: parentUserName, 
        text: replyText,
        date: new Date().toLocaleString()
    };

    addMessageToThread(replyMessage); 
};

const updateMessageStyles = () => {
    const mainMessages = document.querySelectorAll('.message:not(.reply)');
    mainMessages.forEach(mainMessage => {
        const messageId = mainMessage.dataset.messageId;
        const replies = document.querySelectorAll(`.message.reply[data-parent-id="${messageId}"]`);

        if (replies.length > 0) {
            mainMessage.classList.add('has-visible-replies');

            replies.forEach((reply, index) => {
                reply.style.margin = '0'; 

                const nestedReplies = document.querySelectorAll(`.message.reply[data-parent-id="${reply.dataset.messageId}"]`);
                if (nestedReplies.length === 0) {
                    reply.style.borderBottomLeftRadius = '12px';
                    reply.style.borderBottomRightRadius = '12px';
                } else {
                    reply.style.borderBottomLeftRadius = '0';
                    reply.style.borderBottomRightRadius = '0';
                }

                reply.style.borderTop = '0'; 
                reply.style.borderBottom = '2px solid #CCCCCC'; 
            });
        } else {
            mainMessage.classList.remove('has-visible-replies');
        }
    });

    const replies = document.querySelectorAll('.message.reply');
    replies.forEach(reply => {
        const nextMessage = reply.nextElementSibling;
        if (nextMessage && !nextMessage.classList.contains('reply')) {
            reply.style.marginBottom = '16px'; 
        }

        const nestedReplies = document.querySelectorAll(`.message.reply[data-parent-id="${reply.dataset.messageId}"]`);
        nestedReplies.forEach(nestedReply => {
            nestedReply.style.margin = '0'; 
            nestedReply.style.borderBottomLeftRadius = '0';  
            nestedReply.style.borderBottomRightRadius = '0';
            nestedReply.style.borderTop = 'none'; 
            nestedReply.style.borderBottom = '2px solid #CCCCCC'; 
        });
 
        const lastNestedReply = replies[replies.length - 1];
        if (lastNestedReply) {
            lastNestedReply.style.borderBottomLeftRadius = '12px';
            lastNestedReply.style.borderBottomRightRadius = '12px';
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
const escapeSelector = (id) => CSS.escape(id); 

const toggleReplies = (messageId, show) => {
    const escapedMessageId = escapeSelector(`show-more-${messageId}`);

    const existingReplies = document.querySelectorAll(`.message.reply[data-parent-id="${messageId}"]`);
    existingReplies.forEach(reply => reply.remove());

    const existingShowMore = document.querySelector(`#${escapedMessageId}`);
    if (existingShowMore) {
        existingShowMore.remove();
    }

    const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!parentMessage) return;

    if (show) {
        const allReplies = getAllReplies(messageId);
        if (allReplies.length > 0) {
            parentMessage.classList.add('has-visible-replies');
            let lastReplyElement;
            let replyLevel = 1;

            allReplies.forEach(reply => {
                const replyElement = createMessageHTML(reply, true, replyLevel);
                if (lastReplyElement) {
                    lastReplyElement.after(replyElement);
                } else {
                    parentMessage.after(replyElement);
                }
                lastReplyElement = replyElement;

                const nestedReplies = getAllReplies(reply.id);
                if (nestedReplies.length > 0) {
                    replyLevel++;
                }
            });

            if (allReplies.length > 4) {
                const showMoreButton = document.createElement('button');
                showMoreButton.id = escapedMessageId;
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
                        const replyElement = createMessageHTML(reply, true, replyLevel);
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
    const parentMessage = findMessageById(parentId);
    if (!parentMessage) return;

    const replyingToUser = parentMessage.user.name; // Отримуємо ім'я користувача, якому відповідаємо
    console.log(replyingToUser)
    const formattedReplyText = `<span class="mention">@${replyingToUser}</span> ${replyText}`;

    const newReplyId = generateReplyId(parentId);
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

    const newReply = {
        id: newReplyId,
        user: {
            name: "Current User",
            avatar: "/images/user-avatar.png"
        },
        date: formattedDate,
        text: formattedReplyText, // Використовуємо відформатований текст
        replies: []
    };

    // Додаємо відповідь до масиву відповідей батьківського повідомлення
    if (!parentMessage.replies) parentMessage.replies = [];
    parentMessage.replies.push(newReply);

    // Додаємо відповідь у DOM без перезавантаження всього списку
    const parentElement = document.querySelector(`.message[data-message-id="${parentId}"]`);
    if (parentElement) {
        const newReplyElement = createMessageHTML(newReply, true);
        parentElement.appendChild(newReplyElement);
    }

    toggleReplies(parentId, true); // Показуємо відповіді

    // Очищаємо поле вводу
    const replyInput = document.querySelector(`.message[data-message-id="${parentId}"] .reply-input input`);
    if (replyInput) {
        replyInput.value = '';
        replyInput.closest('.reply-input').style.display = 'none'; // Ховаємо поле вводу
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
        // Оновлюємо тільки нові елементи
        DISCUSSION_MESSAGES.forEach(message => {
            const existingMessageElement = discussionThread.querySelector(`.message[data-message-id="${message.id}"]`);
            if (existingMessageElement) {
                // Якщо повідомлення вже є на сторінці, оновлюємо його
                existingMessageElement.innerHTML = createMessageHTML(message).innerHTML;
            } else {
                // Якщо повідомлення нове, додаємо його
                const messageElement = createMessageHTML(message);
                discussionThread.appendChild(messageElement);
            }
        });
        updateMessageStyles();  // Оновлюємо стилі для нових/змінених повідомлень
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
    const sendButton = document.querySelector('.send');
    const messageInput = document.querySelector('.search-bar input');
    const discussionThread = document.querySelector('.discussion-thread');

    // Перевіряємо, чи є елементи на сторінці
    if (sendButton && messageInput && discussionThread) {
        // Відправка нового основного повідомлення
        sendButton.addEventListener('click', () => {
            const messageText = messageInput.value.trim(); 
            const date = new Date();
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        
            if (messageText) {
                // Створюємо нове основне повідомлення
                const newMessage = {
                    id: `msg_${Date.now()}`, // Генеруємо унікальний id для повідомлення
                    user: {
                        name: "Current User",
                        avatar: "/images/user-avatar.png"
                    },
                    date: formattedDate,
                    text: messageText,
                    replies: [] // Початково немає відповідей
                };

                // Додаємо нове повідомлення в масив DISCUSSION_MESSAGES
                DISCUSSION_MESSAGES.push(newMessage);

                // Оновлюємо відображення
                renderDiscussion();

                // Очищаємо поле вводу
                messageInput.value = '';
            }
        });
        
        // Додаємо існуючі повідомлення в обговорення
        discussionThread.innerHTML = '';
        DISCUSSION_MESSAGES.forEach(message => {
            const messageElement = createMessageHTML(message);
            discussionThread.appendChild(messageElement);
        });

        // Ініціалізуємо інші слухачі подій (для кнопок опцій та відповіді)
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

        // Слухач для кнопки відповіді
        discussionThread.addEventListener('click', function(e) {
            const sendReplyButton = e.target.closest('.send-reply');
            if (sendReplyButton) {
                const replyInput = sendReplyButton.previousElementSibling;
                const text = replyInput.value.trim();
                const parentId = sendReplyButton.dataset.parentId; 
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
