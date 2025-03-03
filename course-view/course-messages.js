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

function updateRepliesButton(commentId) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    const showRepliesButton = document.getElementById(`show-replies-button-${commentId}`);

    if (repliesContainer && showRepliesButton) {
        if (repliesContainer.children.length === 0) {
            showRepliesButton.style.display = "none";
        }
    }
}

function addShowRepliesButton(parentElement, messageId, replies) {
    // If there are no replies, don't create the button
    if (replies.length === 0) {
        return;
    }

    const showRepliesButton = document.createElement('button');
    showRepliesButton.className = 'show-replies-button';
    showRepliesButton.id = `show-replies-button-${messageId}`;

    const expandedFromStorage = localStorage.getItem(`replies-expanded-${messageId}`);
    const timestamp = localStorage.getItem(`replies-timestamp-${messageId}`);
    const currentTime = Date.now();

    // If saved that replies should be shown and less than 1 minute has passed since saving
    const isRecentlyStored = timestamp && currentTime - parseInt(timestamp) < 60 * 1000;
    const expanded = expandedFromStorage === 'true' && isRecentlyStored;

    if (expanded) {
        showRepliesButton.dataset.expanded = 'true';
        showRepliesButton.textContent = 'Hide replies';
    } else {
        showRepliesButton.dataset.expanded = 'false';
        showRepliesButton.textContent = `Show replies (${replies.length})`;
    }

    // Add click listener
    showRepliesButton.addEventListener('click', () => {
        const isExpanded = showRepliesButton.dataset.expanded === 'true';
        if (isExpanded) {
            // If expanded - hide
            hideReplies(parentElement, messageId, replies);
            showRepliesButton.dataset.expanded = 'false';
            showRepliesButton.textContent = `Show replies (${replies.length})`;
            localStorage.setItem(`replies-expanded-${messageId}`, 'false');
            localStorage.setItem(`replies-timestamp-${messageId}`, currentTime.toString());
        } else {
            // If hidden - show
            showReplies(parentElement, messageId, replies);
            showRepliesButton.dataset.expanded = 'true';
            showRepliesButton.textContent = 'Hide replies';
            localStorage.setItem(`replies-expanded-${messageId}`, 'true');
            localStorage.setItem(`replies-timestamp-${messageId}`, currentTime.toString());
        }
    });

    parentElement.after(showRepliesButton);

    // Immediately after creating the button, sync DOM with localStorage state:
    if (expanded) {
        // If saved that replies should be shown, display them
        showReplies(parentElement, messageId, replies);
    } else {
        // If saved that replies should be hidden, hide them (just in case)
        hideReplies(parentElement, messageId, replies);
    }
}
 
function hideReplies(parentElement, messageId, replies) {
    // Якщо потрібно, приховуємо відповідей
    const repliesContainer = getRepliesContainer(parentElement);
    if (repliesContainer) {
        repliesContainer.style.display = 'none';
    }
}

 
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
        repliesContainer.id = `replies-container-${parentMessageId}`;
        parentMessage.after(repliesContainer);
    }    
    repliesContainer.innerHTML = '';

    const sortedReplies = [...replies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
 
    const replyMap = new Map(sortedReplies.map(reply => [reply.id, reply]));

    const createReplyElement = (reply) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('message', 'reply');
        replyElement.dataset.messageId = reply.id;
        replyElement.dataset.parentId = reply.parent_comment_id;
        replyElement.dataset.userId = reply.user_id;
        
        console.log(`Reply ${reply.id} has user_id: ${reply.user_id}`);

        const formatDate = (isoString) => {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/(\d+)\/(\d+)\/(\d{4})/, '$2/$1/$3');  
        };

        const avatar = reply.teacher_profile_image || reply.student_profile_image || reply.profile_image || '/images/user-avatar.png';

        let messageContent = reply.content || '';

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

        if (parentUsername && !messageContent.startsWith(`@${parentUsername}`)) {
            messageContent = `@${parentUsername} ${messageContent}`;
        }

        let formattedMessage = messageContent;
        if (parentUsername) {
            const mentionText = `@${parentUsername}`;
            const indexOfSpace = messageContent.indexOf(' ', mentionText.length);
            const mention = messageContent.substring(0, indexOfSpace !== -1 ? indexOfSpace : messageContent.length);
            const restOfMessage = indexOfSpace !== -1 ? messageContent.substring(indexOfSpace) : '';
            formattedMessage = `<span class="mention">${mention}</span>${restOfMessage}`;
        }

        replyElement.innerHTML = `
            <div class="user-info">
                <img src="${avatar || '/images/user-avatar.png'}" alt="User avatar" class="avatar">
                <span class="username">${reply.user_name}</span>
                <span class="date">${formatDate(reply.created_at)}</span>
            </div>
            <div class="message-content">
                <p class="message-text">${formattedMessage}</p>
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

    const processReplies = (parentId) => {
        const currentLevelReplies = sortedReplies
            .filter(reply => reply.parent_comment_id === parentId);
        
        currentLevelReplies.forEach(reply => {
            const replyElement = createReplyElement(reply);
            repliesContainer.appendChild(replyElement);
            
            processReplies(reply.id);
        });
    };

    processReplies(parentMessageId); 
    if (repliesContainer) {
        repliesContainer.style.display = 'block';
    }
    updateMessageStyles();
}


const createMessageHTML = (message, isReply = false, replyLevel = 0) => { 
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.className = `message ${isReply ? 'reply' : ''}`;
    messageElement.dataset.messageId = message.id;
    
    // Get the ACTUAL author ID from the message object, not the current user
    messageElement.dataset.userId = message.user_id;     
    if (isReply) {
        messageElement.dataset.parentId = message.parent_comment_id;
    } 

    messageElement.dataset.replyLevel = replyLevel;

    if (typeof message.id === 'string' && message.id.includes('.')) {
        messageElement.dataset.parentId = message.id.substring(0, message.id.lastIndexOf('.'));
    }

    const user = message.user || { name: message.user_name || 'Unknown User' };
    const avatar =  message.student_profile_image || message.profile_image || '/images/user-avatar.png';


    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/(\d+)\/(\d+)\/(\d{4})/, '$2/$1/$3');  
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
        }

        // Стилізуємо відповіді
        replies.forEach(reply => {
            reply.style.margin = '0';       

            // Обробка вкладених відповідей
            const nestedReplies = document.querySelectorAll(`.message.reply[data-parent-id="${reply.dataset.messageId}"]`);
            if (nestedReplies.length > 0) {
                reply.style.borderBottom = '2px solid #ddd';  // Легкий бордер для вкладених
            }

            // Додаємо бордер для останньої вкладеної відповіді
            if (nestedReplies.length > 0) {
                const lastNestedReply = nestedReplies[nestedReplies.length - 1]; 
                lastNestedReply.style.borderBottom = '2px solid #CCCCCC';  // Більш виразний бордер для останнього
            }
        });
    });

    // Оновлюємо бордери для першого та останнього коментаря
    const allMessages = document.querySelectorAll('.message');
    if (allMessages.length > 0) {
        const firstMessage = allMessages[0];
        firstMessage.style.borderTopLeftRadius = '12px';
        firstMessage.style.borderTopRightRadius = '12px';

        const lastMessage = allMessages[allMessages.length - 1];
        lastMessage.style.borderBottomLeftRadius = '0';
        lastMessage.style.borderBottomRightRadius = '0';
    }
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

const getParentUserId = async (parentId) => {
    const response = await fetch(`http://localhost:8000/api/comments/${parentId}`);
    const parentComment = await response.json();
    return parentComment.user_id;  // Повертаємо тільки ID користувача
};



const sendMessage = async (content, parentId = null) => {
    const courseId = window.location.pathname.split('/course/').pop();
    const userId = localStorage.getItem('userId');

    let parentUserId = null;

    if (parentId) {
        // Якщо є parentId, отримуємо відповідний parentUserId
        parentUserId = await getParentUserId(parentId);
    }

    console.log('Parent User ID:', parentUserId);

    const messageData = {
        content,
        parent_comment_id: parentId,
        course_id: courseId,
        user_id: userId,
        parent_user_id: parentUserId,  // Додаємо parentUserId
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
        console.log(newMessage);

        fetchComments(courseId);  // Оновлення коментарів

    } catch (error) {
        console.error('Error sending message:', error);
    }
};



// Відправка основного коментаря
document.querySelector('.send').addEventListener('click', () => {
    const messageContent = document.querySelector('input[type="text"]').value.trim();
    
    if (messageContent) {
        sendMessage(messageContent);
        document.querySelector('input[type="text"]').value = ''; // Очистити поле вводу

        // Знайти всі приховані блоки відповідей та розгорнути їх
        document.querySelectorAll('.replies-container').forEach(container => {
            if (container.style.display === 'none') {
                container.style.display = 'block';
            }
        });

        // Оновити кнопки "Show replies" → "Hide replies"
        document.querySelectorAll('.show-replies-button').forEach(button => {
            if (button.dataset.expanded === 'false') {
                button.dataset.expanded = 'true';
                button.textContent = 'Hide replies';
                localStorage.setItem(`replies-expanded-${button.dataset.messageId}`, 'true');
            }
        });
    }
});


// Відправка відповіді
document.querySelector('.discussion-thread').addEventListener('click', (event) => {
    if (event.target.classList.contains('send-reply')) {
        const parentId = event.target.dataset.parentId;
        const replyContent = event.target.previousElementSibling.value.trim();
        
        // Знаходимо повідомлення, на яке відповідаємо
        const messageElement = event.target.closest('.message');
        
        // Перевіряємо наявність контейнера відповідей
        let repliesContainer = document.getElementById(`replies-container-${parentId}`);
        
        // Знаходимо кнопку "Show replies"
        const showRepliesButton = document.getElementById(`show-replies-button-${parentId}`);
        
        // Якщо є кнопка показу відповідей, змінюємо її стан на "розгорнуто"
        if (showRepliesButton) {
            // Зберігаємо стан у localStorage
            localStorage.setItem(`replies-expanded-${parentId}`, 'true');
            localStorage.setItem(`replies-timestamp-${parentId}`, Date.now().toString());
            
            // Оновлюємо стан і текст кнопки
            showRepliesButton.dataset.expanded = 'true';
            showRepliesButton.textContent = 'Hide replies';
            
            // Якщо є контейнер відповідей, показуємо його
            if (repliesContainer) {
                repliesContainer.style.display = 'block';
            }
        }
        
        // Відправляємо повідомлення, тільки якщо є вміст
        if (replyContent) {
            // Функція для відправки повідомлення з автооновленням
            sendMessage(replyContent, parentId);
            event.target.previousElementSibling.value = '';  // Очистити поле вводу
            
            // При відправці нової відповіді, оновлюємо та показуємо всі відповіді
            const courseId = window.location.pathname.split('/course/').pop();
            
            // Додаємо затримку, щоб дочекатися оновлення даних на сервері
            setTimeout(() => {
                fetchComments(courseId);  // Оновлюємо всі коментарі
            }, 300);
        }
    }
});

// Модифікована функція handleReply для автоматичного розгортання відповідей
const handleReply = async (messageId, replyText) => {
    const parentMessage = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!parentMessage) return;

    const parentUsername = parentMessage.querySelector('.username').textContent;
    const formattedReplyText = replyText.startsWith(`@${parentUsername}`) 
        ? replyText 
        : `@${parentUsername} ${replyText}`;

    const replyMessage = {
        user_id: localStorage.getItem('userId'),
        parent_comment_id: messageId,
        course_id: window.location.pathname.split('/course/').pop(),
        content: formattedReplyText,
    };

    try {
        const response = await fetch('http://localhost:8000/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(replyMessage),
        });

        if (response.ok) {
            const replyData = await response.json();
            
            // Автоматично розгортаємо відповіді
            const showRepliesButton = document.getElementById(`show-replies-button-${messageId}`);
            if (showRepliesButton) {
                showRepliesButton.dataset.expanded = 'true';
                showRepliesButton.textContent = 'Hide replies';
                localStorage.setItem(`replies-expanded-${messageId}`, 'true');
                localStorage.setItem(`replies-timestamp-${messageId}`, Date.now().toString());
            }
            
            // Оновлюємо коментарі щоб побачити нову відповідь
            fetchComments(replyMessage.course_id);
        } else {
            throw new Error('Failed to send reply');
        }
    } catch (error) {
        console.error('Error while sending reply:', error);
    }
};

// Оновлена функція showReplies, яка також оновлює текст кнопки
function showReplies(parentElement, parentMessageId, replies) {
    // Рендеримо всі відповіді
    renderReplies(replies, parentMessageId);

    // Показуємо контейнер для відповідей
    const repliesContainer = getRepliesContainer(parentElement) || 
                            document.getElementById(`replies-container-${parentMessageId}`);
    if (repliesContainer) {
        repliesContainer.style.display = 'block';
    }

    // Оновлюємо стан і текст кнопки
    const showRepliesButton = document.getElementById(`show-replies-button-${parentMessageId}`);
    if (showRepliesButton) {
        showRepliesButton.dataset.expanded = 'true';
        showRepliesButton.textContent = 'Hide replies';
        
        // Оновлюємо localStorage
        localStorage.setItem(`replies-expanded-${parentMessageId}`, 'true');
        localStorage.setItem(`replies-timestamp-${parentMessageId}`, Date.now().toString());
    }
} 

const initializeDiscussionListeners = () => {
    const sendButton = document.querySelector('.send');
    const messageInput = document.querySelector('.search-bar input');
    const discussionThread = document.querySelector('.discussion-thread');

    if (!sendButton || !messageInput || !discussionThread) {
        console.error('Required elements not found on the page.');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('User is not logged in.');
        return;
    }

    const courseId = window.location.pathname.split('/course/').pop();

    const handleSendMessage = () => {
        const messageText = messageInput.value.trim();
        if (!messageText) return;

        sendMessage(messageText);
        messageInput.value = ''; // Очистити поле вводу
    };

    // Надсилання повідомлення при кліку на кнопку
    sendButton.addEventListener('click', handleSendMessage);

    // Надсилання повідомлення при натисканні Enter
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

 


// Відображаємо існуючі повідомлення
fetchComments(courseId);

function createDeleteModal() {
    // Перевірка, чи модалка вже існує
    let modal = document.getElementById('deleteModal');
    if (modal) {
        return {
            modal,
            confirmButton: modal.querySelector('#confirmDeleteBtn'),
            cancelButton: modal.querySelector('#cancelDeleteBtn')
        };
    }

    // Створення елементів модалки
    modal = document.createElement('div');
    modal.id = 'deleteModal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = 'Are you sure you want to delete this message?';

    const description = document.createElement('p');
    description.className = 'modal-description';
    description.textContent = 'This action cannot be undone.';

    const modalActions = document.createElement('div');
    modalActions.className = 'modal-buttons';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelDeleteBtn';
    cancelButton.className = 'modal-button';
    cancelButton.textContent = 'Cancel';

    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirmDeleteBtn';
    confirmButton.className = 'modal-button red';
    confirmButton.textContent = 'Delete';

    // Додаємо елементи до модалки
    modalActions.appendChild(cancelButton);
    modalActions.appendChild(confirmButton); 
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(modalActions);
    modal.appendChild(modalContent);

    // Додаємо модалку в body
    document.body.appendChild(modal);

    // Додаємо подію для закриття модалки при кліку поза її межами
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Перевіряємо, чи клік був саме на фон
            modal.style.display = 'none';
            modal.remove();  // Видаляємо модалку з DOM
        }
    });

    // Повертаємо елементи для подальшого використання
    return {
        modal,
        confirmButton,
        cancelButton,
    };
}

function createEditModal(currentText) {
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = 'Edit your comment';

    const textContainer = document.createElement('div');
    textContainer.className = 'modal-text-container';
 
    const editTextArea = document.createElement('textarea');
    editTextArea.className = 'modal-textarea';
    editTextArea.value = currentText; // Встановлюємо текст як є

    textContainer.appendChild(editTextArea);

    const modalActions = document.createElement('div');
    modalActions.className = 'modal-actions';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'modal-button red';
    cancelButton.textContent = 'Cancel';

    const saveButton = document.createElement('button');
    saveButton.className = 'modal-button';
    saveButton.textContent = 'Save';

    modalActions.appendChild(cancelButton);
    modalActions.appendChild(saveButton);
    modalContent.appendChild(title);
    modalContent.appendChild(textContainer);
    modalContent.appendChild(modalActions);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Додати анімацію появи
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Перевірка чи клік на фон
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();  // Видаляємо модальне вікно
            }, 300); // Час, щоб співпало з анімацією
        }
    });

    cancelButton.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });

    saveButton.addEventListener('click', () => {
        let updatedText = editTextArea.value;
    
        // Заміна @mention на форматований <span class="mention">
        updatedText = updatedText.replace(/(@\w+)/g, '<span class="mention">$1</span>');
    
        // Створення елемента <p> з відформатованим текстом
        const p = document.createElement('p');
        p.className = 'message-text';
        p.innerHTML = updatedText; // Тепер текст буде містити HTML
    
        // Виведення результату для перевірки
        console.log('Updated comment with mention:', p.outerHTML);
    });
        

    return {
        modal,
        saveButton,
        cancelButton,
        editTextArea, 
    };
}


// Handle "more options" button click 
document.addEventListener('click', function (e) {
    const moreOptions = e.target.closest('.more-options');

    if (moreOptions) {
        const message = moreOptions.closest('.message');
        const messageId = message.dataset.messageId;
        const commentUserId = message.dataset.userId;
        const usernameElement = message.querySelector('.username');
        const username = usernameElement ? usernameElement.textContent : 'Unknown User';
        const currentTextElement = message.querySelector('.message-text');
        const currentText = currentTextElement ? currentTextElement.textContent : '';

        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
            console.error('Current User ID is missing!');
            return;
        }

        const existingMenu = document.querySelector('.options-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const optionsMenu = document.createElement('div');
        optionsMenu.className = 'options-menu';

        const menuOptions = [
            { action: 'add-reply', text: 'Write a reply', icon: '<img src="../images/reply.ico" style="margin-right:5px" alt="Reply">'  },
        ];
 
        if (commentUserId && currentUserId && commentUserId.toString() === currentUserId.toString()) {
            menuOptions.push({ action: 'edit', text: 'Edit message', icon: '<img src="../images/edit.ico" style="margin-right:7px; width: 18px; height: 18x;" alt="Edit">' });
            menuOptions.push({ action: 'delete', text: 'Delete message', icon: '<img src="../images/delete.ico" style="margin-right:8px; width: 18px; height: 18x;" alt="Delete">' });
        } else {
            menuOptions.push({ action: 'report', text: 'Report message', icon: '<img src="../images/report.ico" style="margin-right:3px; width: 25px; height: 25px;" alt="Report">' });
        }

        optionsMenu.innerHTML = menuOptions
            .map(option => `<div class="option" data-action="${option.action}">${option.icon} ${option.text}</div>`)
            .join('');

        Object.assign(optionsMenu.style, {
            position: 'absolute',
            right: '40px',
            top: '40px',
            background: '#fff',
            border: '2px solid #D1D1D1',
            borderRadius: '8px',
            padding: '8px 12px',
            zIndex: '1000',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            width: '200px',
        });

        optionsMenu.querySelectorAll('.option').forEach(option => {
            Object.assign(option.style, {
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#283044',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s ease',
            });

            const icon = option.querySelector('i');
            if (icon) {
                Object.assign(icon.style, {
                    marginRight: '8px',
                    fontSize: '16px',
                });
            }

            option.addEventListener('mouseenter', () => {
                option.style.backgroundColor = '#f0f0f0';
            });
            option.addEventListener('mouseleave', () => {
                option.style.backgroundColor = 'transparent';
            });
        });

        message.appendChild(optionsMenu);

        optionsMenu.addEventListener('click', function (e) {
            const action = e.target.dataset.action;

            if (action === 'add-reply') {
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
                    input.placeholder = `Reply to ${username}`;
                }
            }

            if (action === 'report') {
                if (!commentUserId || commentUserId.toString() !== currentUserId.toString()) {
                    console.log('Report clicked');
                    openReportModal(messageId, username);
                } else {
                    alert('Ви не можете поскаржитись на власний коментар');
                }
            }
        
            if (action === 'delete') {
                if (commentUserId && currentUserId && commentUserId.toString() === currentUserId.toString()) {
                    console.log('Delete clicked');
                    deleteMessage(messageId);
                } else {
                    alert('Ви можете видаляти тільки власні коментарі');
                }
            }
        
            if (action === 'edit') {
                if (commentUserId && currentUserId && commentUserId.toString() === currentUserId.toString()) {
                    console.log('Edit clicked');
                    
                    // Отримуємо текст коментаря перед редагуванням
                    const originalText = currentText.trim();
                    
                    // Визначаємо, чи є mention (текст з @) в коментарі
                    const mentionElement = message.querySelector('.mention');
                    const mention = mentionElement ? mentionElement.textContent : '';
                    const contentWithoutMention = originalText.replace(mention, '').trim();
            
                    // Створюємо модальне вікно редагування
                    const { modal, saveButton, cancelButton, editTextArea } = createEditModal(contentWithoutMention);
            
                    cancelButton.onclick = () => {
                        modal.remove();
                    };
            
                    saveButton.onclick = async () => {
                        let updatedText = editTextArea.value.trim();
                        
                        if (!updatedText) {
                            alert('Коментар не може бути порожнім');
                            return;
                        }
            
                        // Якщо mention був, додаємо його назад до тексту
                        updatedText = mention ? `${mention} ${updatedText}` : updatedText;
            
                        try {
                            const response = await fetch(`/api/comments/${messageId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ user_id: currentUserId, content: updatedText })
                            });
            
                            if (response.ok) {
                                // Оновлюємо текст в DOM
                                const textElement = message.querySelector('.message-text');
                                if (textElement) {
                                    // Якщо є mention, додаємо його знову в HTML
                                    textElement.innerHTML = `${mention ? `<span class="mention">${mention}</span> ` : ''}${updatedText.replace(mention, '').trim()}`;
                                }
                                modal.remove();  // Закриваємо модальне вікно
                            } else {
                                alert('Не вдалося оновити коментар');
                            }
                        } catch (err) {
                            console.error('Error updating comment:', err);
                            alert('Помилка при оновленні коментаря');
                        }
                    };
                } else {
                    alert('Ви можете редагувати тільки власні коментарі');
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
function getCurrentUserId() {
    const currentUserId = localStorage.getItem('userId');
    console.log('Current user ID:', currentUserId);

    return currentUserId;
}

const deleteMessage = async (messageId) => {
    const { modal, confirmButton, cancelButton } = createDeleteModal();
    const currentUserId = getCurrentUserId();

    return new Promise((resolve) => {
        if (modal) modal.style.display = 'flex';

        cancelButton.onclick = () => {
            if (modal) modal.style.display = 'none';
            resolve(false);
            modal.remove();
        };

        confirmButton.onclick = async () => {
            if (modal) modal.style.display = 'none';

            try {
                // Get the message element to check user ID directly from DOM
                const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
                const commentUserId = messageElement ? messageElement.dataset.userId : null;
                
                // Compare user IDs directly before making the API call
                if (commentUserId !== currentUserId) {
                    alert('You can only delete your own comments');
                    resolve(false);
                    modal.remove();
                    return;
                }
                
                // If user is the author, proceed with deletion
                const deleteResponse = await fetch(`/api/comments/${messageId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: currentUserId })
                });

                if (deleteResponse.ok) {
                    fetchComments(window.location.pathname.split('/course/').pop()); // Refresh comments
                    resolve(true);
                } else {
                    const errorData = await deleteResponse.json();
                    if (errorData && errorData.error === 'unauthorized') {
                        alert('You can only delete your own comments');
                    } else {
                        alert('Failed to delete comment');
                    }
                    resolve(false);
                }
            } catch (err) {
                console.error('Error deleting comment:', err);
                alert('Error deleting comment');
                resolve(false);
            }

            modal.remove();
        };
    });
};
 

function openReportModal(messageId, username) {

    const currentUsername = localStorage.getItem('name') || 'Unknown User'; 
    const messageContent = document.querySelector(`.message[data-message-id="${messageId}"] .message-text`)?.textContent || 'No content available';

    // Create the modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">🚨 Report Content</h2>
            <p class="modal-description">We take reports seriously. Our team will review the content and take appropriate action if necessary.</p>
            <div class="modal-buttons">
                <button id="close-modal" class="modal-button red">Cancel</button>
                <button id="submit-report" class="modal-button">Submit</button>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.appendChild(modal);

    // Close the modal when cancel is clicked
    modal.querySelector('#close-modal').addEventListener('click', function() {
        modal.remove();
    });

    // Handle report submission
    modal.querySelector('#submit-report').addEventListener('click', async function() {
        try {
            console.log(`Report by: ${currentUsername}`); 
            console.log(`Report submitted for message ID: ${messageId}`);
            console.log(`Reported on: ${username}`);
            console.log(`Reported content: ${messageContent}`);
        
            // Send the report to the server
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    currentUsername,
                    messageId, 
                    username,
                    messageContent
                })
            });

            if (!response.ok) {
                const result = await response.json();
                alert(`Error: ${result.error}`);
            } 
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Помилка при надсиланні скарги');
        }
        
        // Close the modal after submission
        modal.remove();
    });

    // Close the modal if clicked outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {  // Check if the click is outside the modal content
            modal.remove();
        }
    });
}
discussionThread.addEventListener('click', function (e) {
    const sendReplyButton = e.target.closest('.send-reply');

    if (sendReplyButton) {
        const replyInput = sendReplyButton.previousElementSibling;
        const replyContent = replyInput.value.trim();
        const parentId = sendReplyButton.dataset.parentId;

        if (replyContent && parentId) {
            sendMessage(replyContent, parentId);
            replyInput.value = ''; // Очищаємо поле вводу
        }
    }
});
// Надсилання відповіді по Enter
// Надсилання відповіді по Enter
discussionThread.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeInput = e.target;
        if (activeInput.tagName === 'INPUT' && activeInput.closest('.reply-input')) {
            e.preventDefault(); // Запобігаємо додаванню нового рядка
            
            // Знаходимо кнопку send-reply, щоб отримати parentId
            const sendReplyButton = activeInput.closest('.reply-input').querySelector('.send-reply');
            const parentId = sendReplyButton.dataset.parentId;
            const replyContent = activeInput.value.trim();
            
            // Знаходимо повідомлення, на яке відповідаємо
            const messageElement = activeInput.closest('.message');
            
            // Перевіряємо наявність контейнера відповідей
            let repliesContainer = document.getElementById(`replies-container-${parentId}`);
            
            // Знаходимо кнопку "Show replies"
            const showRepliesButton = document.getElementById(`show-replies-button-${parentId}`);
            
            // Якщо є кнопка показу відповідей, змінюємо її стан на "розгорнуто"
            if (showRepliesButton) {
                // Зберігаємо стан у localStorage
                localStorage.setItem(`replies-expanded-${parentId}`, 'true');
                localStorage.setItem(`replies-timestamp-${parentId}`, Date.now().toString());
                
                // Оновлюємо стан і текст кнопки
                showRepliesButton.dataset.expanded = 'true';
                showRepliesButton.textContent = 'Hide replies';
                
                // Якщо є контейнер відповідей, показуємо його
                if (repliesContainer) {
                    repliesContainer.style.display = 'block';
                }
            }
            
            // Відправляємо повідомлення, тільки якщо є вміст
            if (replyContent) {
                // Функція для відправки повідомлення з автооновленням
                sendMessage(replyContent, parentId);
                activeInput.value = '';  // Очистити поле вводу
                
                // При відправці нової відповіді, оновлюємо та показуємо всі відповіді
                const courseId = window.location.pathname.split('/course/').pop();
                
                // Додаємо затримку, щоб дочекатися оновлення даних на сервері
                setTimeout(() => {
                    fetchComments(courseId);  // Оновлюємо всі коментарі
                }, 300);
            }
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

        // Save expanded states before updating
        const expandedStates = new Map();
        document.querySelectorAll('.show-replies-button').forEach(button => {
            const messageId = button.previousElementSibling.dataset.messageId;
            expandedStates.set(messageId, button.dataset.expanded === 'true');
        });

        discussionThread.innerHTML = '';

        // Sort main comments by date in descending order (newest first)
        const mainComments = comments
            .filter(comment => !comment.parent_comment_id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        mainComments.forEach(comment => {
            const messageElement = createMessageHTML(comment);
            discussionThread.appendChild(messageElement);

            // Find and sort replies for this comment
            const replies = comments
                .filter(reply => 
                    reply.parent_comment_id === comment.id || 
                    getParentChain(reply, comments).includes(comment.id)
                )
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Replies stay chronological

            if (replies.length > 0) {
                addShowRepliesButton(messageElement, comment.id, replies);

                // Restore expanded state
                const wasExpanded = expandedStates.get(comment.id);
                if (wasExpanded) {
                    const button = messageElement.nextElementSibling;
                    if (button && button.classList.contains('show-replies-button')) {
                        button.click();
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

document.addEventListener('DOMContentLoaded', () => {
// renderDiscussion();
// initializeFilters();
initializeDiscussionListeners();
// initializeTabs();
});