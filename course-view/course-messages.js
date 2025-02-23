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

const renderDiscussion = (messages) => {
if (!Array.isArray(messages)) {
    console.error("Invalid input: messages must be an array");
    return;
}

const discussionThread = document.querySelector('.discussion-thread');
messages.forEach(message => {
    const existingMessageElement = discussionThread.querySelector(`.message[data-message-id="${message.id}"]`);
    if (existingMessageElement) {
        existingMessageElement.innerHTML = createMessageHTML(message).innerHTML;
    } else {
        const messageElement = createMessageHTML(message);
        discussionThread.appendChild(messageElement);
    }
});
};
function addShowRepliesButton(parentElement, messageId, replies) {
    const showRepliesButton = document.createElement('button');
    showRepliesButton.className = 'show-replies-button';

    // Зчитуємо з localStorage, чи були відповіді відкриті
    const expandedFromStorage = localStorage.getItem(`replies-expanded-${messageId}`) === 'true';

    // Якщо в localStorage не було запису, вважатимемо, що відповіді приховані
    // або якщо 'false', то теж приховані
    if (expandedFromStorage) {
        showRepliesButton.dataset.expanded = 'true';
        showRepliesButton.textContent = 'Hide replies';
    } else {
        showRepliesButton.dataset.expanded = 'false';
        showRepliesButton.textContent = `Show replies (${replies.length})`;
    }

    // Додаємо слухач кліку
    showRepliesButton.addEventListener('click', () => {
        const isExpanded = showRepliesButton.dataset.expanded === 'true';
        if (isExpanded) {
            // Якщо було розгорнуто — ховаємо
            hideReplies(parentElement, messageId, replies);
            showRepliesButton.dataset.expanded = 'false';
            showRepliesButton.textContent = `Show replies (${replies.length})`;
            localStorage.setItem(`replies-expanded-${messageId}`, 'false');
        } else {
            // Якщо було сховано — показуємо
            showReplies(parentElement, messageId, replies);
            showRepliesButton.dataset.expanded = 'true';
            showRepliesButton.textContent = 'Hide replies';
            localStorage.setItem(`replies-expanded-${messageId}`, 'true');
        }
    });

    parentElement.after(showRepliesButton);

    // Відразу після створення кнопки, синхронізуємо DOM зі станом localStorage:
    if (expandedFromStorage) {
        // Якщо збережено, що відповіді мають бути показані, показуємо
        showReplies(parentElement, messageId, replies);
    } else {
        // Якщо збережено, що відповіді мають бути сховані, приховуємо (про всяк випадок)
        hideReplies(parentElement, messageId, replies);
    }
}

document.querySelector('.send-reply').addEventListener('click', function(event) {
    // Перевірка чи це кнопка для відправки відповіді
    const button = event.target;
    const parentId = button.dataset.parentId; // id коментаря, на який відповідають
    const repliesButton = button.closest('.message').querySelector('.show-replies-button');
    
    // Якщо відповіді були приховані, показуємо їх після надсилання нової відповіді
    if (repliesButton && repliesButton.dataset.expanded === 'false') {
        // Тут код для надсилання відповіді...

        // Показуємо відповіді після того, як надіслано
        showReplies(button.closest('.message'), parentId, replies); // Відображаємо відповіді
        repliesButton.textContent = 'Hide replies';  // Оновлюємо текст на кнопці
        repliesButton.dataset.expanded = 'true';  // Оновлюємо стан кнопки
    }
});


function showReplies(parentElement, parentMessageId, replies) {
    // Створення/оновлення контейнера для відповідей
    renderReplies(replies, parentMessageId);

    // Переконуємось, що контейнер існує та відображається
    const repliesContainer = getRepliesContainer(parentElement);
    if (repliesContainer) {
        repliesContainer.style.display = 'block';
    }

    // Знаходимо кнопку і оновлюємо її
    const showRepliesButton = parentElement.querySelector('.show-replies-button');
    if (showRepliesButton) {
        showRepliesButton.dataset.expanded = 'true';
        showRepliesButton.textContent = 'Hide replies'; // змінюємо текст кнопки
        localStorage.setItem(`replies-expanded-${parentMessageId}`, 'true');
    }
}


function hideReplies(parentElement, messageId, replies) {
    // Шукаємо контейнер
    const repliesContainer = getRepliesContainer(parentElement);
    // Якщо він є, приховуємо його
    if (repliesContainer) {
        repliesContainer.style.display = 'none';
    }
}

/**
 * Допоміжна функція, щоб знаходити repliesContainer
 */
function getRepliesContainer(parentElement) {
    const nextEl = parentElement.nextElementSibling;
    if (nextEl && nextEl.classList.contains('replies-container')) {
        return nextEl;
    }
    return null;
}

function renderReplies(replies, parentMessageId) {
    const parentMessage = document.querySelector(`.message[data-message-id="${parentMessageId}"]`);
    if (!parentMessage) return;

    let repliesContainer = parentMessage.nextElementSibling;
    if (!repliesContainer || !repliesContainer.classList.contains('replies-container')) {
        repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies-container');
        parentMessage.after(repliesContainer);
    }    
    repliesContainer.innerHTML = '';


    // Карта для швидкого доступу до коментарів за їх id
    const replyMap = new Map();
    replies.forEach(reply => replyMap.set(reply.id, reply));

    // Функція для створення окремої відповіді
    const createReplyElement = (reply) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('message', 'reply');
        replyElement.dataset.messageId = reply.id;
        replyElement.dataset.parentId = reply.parent_comment_id;

        const formatDate = (isoString) => {
            const date = new Date(isoString);
            return date.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        let messageContent = reply.content || '';

        // Знаходимо ім'я користувача, якому відповідають
        let parentUsername = '';
        if (reply.parent_comment_id) {
            const parentReply = replyMap.get(reply.parent_comment_id);
            if (parentReply) {
                parentUsername = parentReply.user_name;
            } else {
                const parentElement = document.querySelector(`.message[data-message-id="${reply.parent_comment_id}"]`);
                if (parentElement) {
                    parentUsername = parentElement.querySelector('.username').textContent;
                }
            }
        }

        // Додаємо @mention, якщо його ще немає
        if (parentUsername && !messageContent.startsWith(`@${parentUsername}`)) {
            messageContent = `@${parentUsername} ${messageContent}`;
        }

        // Форматуємо @mention
        if (parentUsername) {
            const mentionText = `@${parentUsername}`;
            const indexOfSpace = messageContent.indexOf(' ', mentionText.length);
            const mention = messageContent.substring(0, indexOfSpace !== -1 ? indexOfSpace : messageContent.length);
            const restOfMessage = indexOfSpace !== -1 ? messageContent.substring(indexOfSpace) : '';
            messageContent = `<span class="mention">${mention}</span>${restOfMessage}`;
        }

        replyElement.innerHTML = ` 
            <div class="user-info">
                <img src="${reply.avatar || '/images/user-avatar.png'}" alt="User avatar" class="avatar">
                <span class="username">${reply.user_name}</span>
                <span class="date">${formatDate(reply.created_at)}</span>
            </div>
            <div class="message-content">
                <p class="message-text">${messageContent}</p>
            </div>
            <button class="more-options">...</button>
            <div class="reply-input" style="display: none;">
                <input type="text" placeholder="write a reply to ${reply.user_name}">
                <button class="send-reply" data-parent-id="${reply.id}">
                    <img src="../images/send.svg" alt="Send">
                </button>
            </div>
        `;

        return replyElement;
    };

    // Рекурсивна функція для обробки відповідей
    const processReplies = (parentId) => {
        const currentLevelReplies = replies.filter(reply => reply.parent_comment_id === parentId);
        
        currentLevelReplies.forEach(reply => {
            const replyElement = createReplyElement(reply);
            repliesContainer.appendChild(replyElement);
            
            // Рекурсивно обробляємо відповіді на цю відповідь
            processReplies(reply.id);
        });
    };

    // Починаємо обробку з відповідей на початковий коментар
    processReplies(parentMessageId);

    // Якщо контейнер вже існує, ми не створюємо його знову
    repliesContainer.style.display = 'block'; // Показуємо відповіді
    updateMessageStyles(); // Оновлення стилів
};



const createMessageHTML = (message, isReply = false, replyLevel = 0) => {
const messageElement = document.createElement('article');
messageElement.className = 'message';
if (isReply) messageElement.classList.add('reply');

messageElement.dataset.messageId = message.id;
messageElement.dataset.replyLevel = replyLevel;

if (typeof message.id === 'string' && message.id.includes('.')) {
    messageElement.dataset.parentId = message.id.substring(0, message.id.lastIndexOf('.'));
}

const user = message.user || { name: message.user_name || 'Unknown User' };
const avatar = message.teacher_profile_image || message.student_profile_image || user.profile_image || '/images/user-avatar.png';
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

let messageContent = message.content || '';

// Handle reply mentions
if (message.parent_comment_id) {
    const parentUser = document.querySelector(`.message[data-message-id="${message.parent_comment_id}"] .username`);
    if (parentUser) {
        const parentUsername = parentUser.textContent;

        // Only add mention if it's not already present
        if (!messageContent.startsWith(`@${parentUsername}`)) {
            messageContent = `@${parentUsername} ${messageContent}`;
        }

        // Extract the full username mention and the rest of the message
        const mentionText = `@${parentUsername}`;
        const indexOfSpace = messageContent.indexOf(' ', mentionText.length);
        const mention = messageContent.substring(0, indexOfSpace !== -1 ? indexOfSpace : messageContent.length);
        const restOfMessage = indexOfSpace !== -1 ? messageContent.substring(indexOfSpace) : '';

        // Format the entire username mention
        messageContent = `<span class="mention">${mention}</span>${restOfMessage}`;
    }
}

messageElement.innerHTML = ` 
    <div class="user-info">
        <img src="${avatar}" alt="User avatar" class="avatar">
        <span class="username">${user.name}</span>
        <span class="date">${formatDate(message.created_at)}</span>
    </div>
    <div class="message-content" style="padding-left: ${message.parent_comment_id ? '20px' : '0'};">
        <p class="message-text">${messageContent}</p>
    </div>
    <button class="more-options">...</button>
    <div class="reply-input" style="display: none;">
        <input type="text" placeholder="write a reply to ${user.name}">
        <button class="send-reply" data-parent-id="${message.id}">
            <img src="../images/send.svg" alt="Send">
        </button>
    </div> 
`;


return messageElement;
};

const handleReply = async (messageId, replyText) => {
const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
const parentUsername = parentMessage.querySelector('.username').textContent;

// Add complete @mention if it's not already there
const formattedReplyText = replyText.startsWith(`@${parentUsername}`) 
    ? replyText 
    : `@${parentUsername} ${replyText}`;

const replyMessage = {
    user_id: localStorage.getItem('userId'),
    parent_comment_id: messageId,
    course_id: window.location.pathname.split('/course/').pop(),
    content: formattedReplyText
};

try {
    const response = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyMessage)
    });

    if (response.ok) {
        await response.json();
        fetchComments(replyMessage.course_id);
    } else {
        throw new Error('Failed to send reply');
    }
} catch (error) {
    console.error('Error while sending reply:', error);
}
};



const updateMessageStyles = () => {
// Перебираємо всі основні повідомлення
const mainMessages = document.querySelectorAll('.message:not(.reply)');

mainMessages.forEach(mainMessage => {
    const messageId = mainMessage.dataset.messageId;
    const replies = document.querySelectorAll(`.message.reply[data-parent-id="${messageId}"]`);

    // Очищаємо клас останньої відповіді у всіх вкладених відповідях
    replies.forEach(reply => {
        reply.classList.remove('last-reply');
    });

    if (replies.length > 0) {
        // Визначаємо останню відповідь
        const lastReply = replies[replies.length - 1];
        lastReply.classList.add('last-reply');

        mainMessage.classList.add('has-visible-replies');
        mainMessage.style.borderBottomLeftRadius = '0';
        mainMessage.style.borderBottomRightRadius = '0'; 
    } else {
        mainMessage.classList.remove('has-visible-replies');
        mainMessage.style.borderBottom = '2px solid #CCCCCC';
    }

    // Стилізуємо відповіді
    replies.forEach((reply, index) => {
        reply.style.margin = '0';
        reply.style.borderTop = '0';
        reply.style.borderBottom = '2px solid #CCCCCC';
        reply.style.borderBottomLeftRadius = '0';
        reply.style.borderBottomRightRadius = '0';
        
        // Обробка вкладених відповідей
        const nestedReplies = document.querySelectorAll(`.message.reply[data-parent-id="${reply.dataset.messageId}"]`);
        if (nestedReplies.length > 0) {
            reply.style.borderBottom = '0';
        }
    });
});
};
// Оновлюємо стилі для першого та останнього коментаря
const allMessages = document.querySelectorAll('.message');
if (allMessages.length > 0) {
    const firstMessage = allMessages[0];
    firstMessage.style.borderTopLeftRadius = '12px';
    firstMessage.style.borderTopRightRadius = '12px';

    const lastMessage = allMessages[allMessages.length - 1];
    lastMessage.style.borderBottomLeftRadius = '0';
    lastMessage.style.borderBottomRightRadius = '0';
}
 
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
// const toggleReplies = (messageId, show) => {
//     const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
//     if (!parentMessage) return;

//     if (show) {
//         if (!parentMessage.classList.contains('has-visible-replies')) {
//             const allReplies = getAllReplies(messageId);
//             if (allReplies.length > 0) {
//                 parentMessage.classList.add('has-visible-replies');
//                 let lastReplyElement;
//                 let replyLevel = 1;

//                 allReplies.forEach(reply => {
//                     const replyElement = createMessageHTML(reply, true, replyLevel);
//                     parentMessage.after(replyElement);
//                     lastReplyElement = replyElement;

//                     const nestedReplies = getAllReplies(reply.id);
//                     if (nestedReplies.length > 0) {
//                         replyLevel++;
//                     }
//                 });
//             }
//         }
//     } else {
//         // Видаляємо всі вкладені відповіді
//         document.querySelectorAll(`.message[data-parent-id="${messageId}"]`).forEach(reply => {
//             reply.remove();
//         });

//         // Також видаляємо вкладені відповіді глибше
//         const removeNestedReplies = (parentId) => {
//             const nestedReplies = document.querySelectorAll(`.message[data-parent-id="${parentId}"]`);
//             nestedReplies.forEach(nestedReply => {
//                 removeNestedReplies(nestedReply.dataset.messageId);
//                 nestedReply.remove();
//             });
//         };

//         removeNestedReplies(messageId);
//         parentMessage.classList.remove('has-visible-replies');
//     }
// };
const toggleReplies = (messageId, show) => {
    const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!parentMessage) return;

    const replies = document.querySelectorAll(`.message.reply[data-parent-id="${messageId}"]`);

    if (show) {
        // Показуємо відповіді
        replies.forEach(reply => reply.style.display = 'block');
        parentMessage.classList.add('has-visible-replies');
    } else {
        // Приховуємо відповіді
        replies.forEach(reply => reply.style.display = 'none');
        parentMessage.classList.remove('has-visible-replies');
    }
};



// Функція для відправки коментаря
const sendMessage = async (content, parentId = null) => {
const courseId = window.location.pathname.split('/course/').pop();
const userId = localStorage.getItem('userId');
const messageData = {
    content,
    parent_comment_id: parentId,
    course_id: courseId,  // Використовуємо поточний курс
    user_id: userId       // Використовуємо поточного користувача
};

try {
    const response = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const newMessage = await response.json();
    console.log(newMessage);  // Перевірте нові дані

    // Оновлюємо лише контейнер з коментарями
    const courseId = window.location.pathname.split('/course/').pop();
    fetchComments(courseId);  // Завантажуємо нові коментарі

} catch (error) {
    console.error('Error sending message:', error);
}
};

// Відправка основного коментаря
document.querySelector('.send').addEventListener('click', () => {
const messageContent = document.querySelector('input[type="text"]').value.trim();
if (messageContent) {
    sendMessage(messageContent);
    document.querySelector('input[type="text"]').value = '';  // Очистити поле вводу
}
});

// Відправка відповіді
document.querySelector('.discussion-thread').addEventListener('click', (event) => {
if (event.target.classList.contains('send-reply')) {
    const parentId = event.target.dataset.parentId;
    const replyContent = event.target.previousElementSibling.value.trim();
    if (replyContent) {
        sendMessage(replyContent, parentId);
        event.target.previousElementSibling.value = '';  // Очистити поле вводу
    }
}
});

document.addEventListener('DOMContentLoaded', () => {
const courseId = window.location.pathname.split('/course/').pop();
fetchComments(courseId);
});

const initializeDiscussionListeners = () => {
const sendButton = document.querySelector('.send');
const messageInput = document.querySelector('.search-bar input');
const discussionThread = document.querySelector('.discussion-thread');

if (!sendButton || !messageInput || !discussionThread) {
    console.error('Required elements not found on the page.');
    return;
}

// Перевірка, чи є користувач
const userId = localStorage.getItem('userId');
if (!userId) {
    alert('User is not logged in.');
    return;
}

const courseId = window.location.pathname.split('/course/').pop();

sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();
    if (!messageText) return;  // Перевірка на порожній текст

    const newMessage = {
        courseId: courseId,
        userId: userId,
        parentCommentId: null,
        content: messageText,
    };

    try {
        const response = await fetch('http://localhost:8000/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMessage),
        });

        if (response.ok) { 
            fetchComments(courseId);  // Refresh the discussion with new comment
        } else {
            throw new Error('Failed to send the message.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again later.');
    }
});

// Відображаємо існуючі повідомлення
fetchComments(courseId);


 
// Handle "more options" button click
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
discussionThread.addEventListener('click', function(e){
    const sendReplyButton = e.target.closest('.send-reply');
    if (sendReplyButton) {
        const replyInput = sendReplyButton.previousElementSibling;
        const replyContent = replyInput.value.trim();
        const parentId = sendReplyButton.dataset.parentId; 
        if (replyContent && parentId) {
            sendMessage(replyContent, parentId)  // Додаємо відповідь
            replyInput.value = '';  // Очищаємо поле вводу
            replyInput.closest('.reply-input').style.display = 'none';  // Сховуємо поле вводу відповіді
        } 
    }
});
};
const fetchComments = async (courseId) => {
    try {
        const response = await fetch(`http://localhost:8000/api/comments?course_id=${courseId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        const comments = await response.json();

        const discussionThread = document.querySelector('.discussion-thread');

        // Зберігаємо стан розгорнутих відповідей перед оновленням
        const expandedStates = new Map();
        document.querySelectorAll('.show-replies-button').forEach(button => {
            const messageId = button.previousElementSibling.dataset.messageId;
            expandedStates.set(messageId, button.dataset.expanded === 'true');
        });

        discussionThread.innerHTML = '';

        // Групуємо всі коментарі за parent_comment_id
        comments.forEach(comment => {
            if (!comment.parent_comment_id) {
                // Це головний коментар
                const messageElement = createMessageHTML(comment);
                discussionThread.appendChild(messageElement);

                // Знаходимо всі відповіді для цього коментаря
                const replies = comments.filter(reply => 
                    reply.parent_comment_id === comment.id || 
                    getParentChain(reply, comments).includes(comment.id)
                );

                if (replies.length > 0) {
                    addShowRepliesButton(messageElement, comment.id, replies);

                    // Відновлюємо стан розгорнутих відповідей
                    const wasExpanded = expandedStates.get(comment.id);
                    if (wasExpanded) {
                        const button = messageElement.nextElementSibling;
                        if (button && button.classList.contains('show-replies-button')) {
                            // Імітуємо клік на кнопці, щоб показати відповіді
                            button.click();
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
    }
};
// Допоміжна функція для отримання ланцюжка батьківських коментарів
const getParentChain = (comment, allComments) => {
    const chain = [];
    let currentComment = comment;
    
    while (currentComment.parent_comment_id) {
        chain.push(currentComment.parent_comment_id);
        currentComment = allComments.find(c => c.id === currentComment.parent_comment_id);
        if (!currentComment) break;
    }
    
    return chain;
};
// const addShowRepliesButton = (parentElement, messageId, replies) => {
//     const showRepliesButton = document.createElement('button');
//     showRepliesButton.className = 'show-replies-button';
//     showRepliesButton.textContent = `Show replies (${replies.length})`;

//     // Перевірка збереженого стану
//     const savedState = localStorage.getItem(`repliesExpanded-${messageId}`);
//     showRepliesButton.dataset.expanded = savedState === 'true' ? 'true' : 'false';

//     // Якщо відповіді вже мають бути відображені, показуємо їх
//     if (showRepliesButton.dataset.expanded === 'true') {
//         showRepliesButton.textContent = 'Hide replies';
//         renderReplies(replies, messageId); // Показуємо відповіді
//     }

//     showRepliesButton.addEventListener('click', () => {
//         const expanded = showRepliesButton.dataset.expanded === 'true';

//         if (expanded) {
//             // Приховуємо відповіді
//             const repliesContainer = parentElement.nextElementSibling;
//             if (repliesContainer && repliesContainer.classList.contains('replies-container')) {
//                 repliesContainer.style.display = 'none';
//             }

//             // Оновлюємо стан кнопки
//             showRepliesButton.dataset.expanded = 'false';
//             showRepliesButton.textContent = `Show replies (${replies.length})`;

//             // Зберігаємо стан в localStorage
//             localStorage.setItem(`repliesExpanded-${messageId}`, 'false');
//         } else {
//             // Перевіряємо чи вже існує контейнер для відповідей
//             let repliesContainer = parentElement.nextElementSibling;
            
//             // Якщо контейнер не існує або був прихований, додаємо його
//             if (!repliesContainer || !repliesContainer.classList.contains('replies-container')) {
//                 renderReplies(replies, messageId); // Показуємо відповіді
//             } else {
//                 repliesContainer.style.display = 'block'; // Якщо відповіді є, просто показуємо їх
//             }

//             // Оновлюємо стан кнопки
//             showRepliesButton.dataset.expanded = 'true';
//             showRepliesButton.textContent = 'Hide replies';

//             // Зберігаємо стан в localStorage
//             localStorage.setItem(`repliesExpanded-${messageId}`, 'true');
//         }
//     });

//     parentElement.after(showRepliesButton);
// };


document.addEventListener('DOMContentLoaded', () => {
// renderDiscussion();
// initializeFilters();
initializeDiscussionListeners();
// initializeTabs();
});