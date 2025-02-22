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
            <p class="message-text">${messageContent}</p>
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
                mainMessage.style.borderBottom = '0'; // Прибираємо нижній бордер, якщо є відповіді
            } else {
                mainMessage.classList.remove('has-visible-replies');
                mainMessage.style.borderBottomLeftRadius = '0';
                mainMessage.style.borderBottomRightRadius = '0';
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
            lastMessage.style.borderBottomLeftRadius = '12px';
            lastMessage.style.borderBottomRightRadius = '12px';
        }
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
    
            // Створіть карту для простішого пошуку коментарів за id
            const commentMap = new Map();
            comments.forEach(comment => commentMap.set(comment.id, comment));
    
            // Створіть контейнер для коментарів
            const discussionThread = document.querySelector('.discussion-thread');
            discussionThread.innerHTML = '';  // Очищаємо існуючі коментарі
    
            comments.forEach(comment => {
                if (comment.parent_comment_id) {
                    // Це відповідь → додаємо її до батьківського коментаря
                    const parentComment = commentMap.get(comment.parent_comment_id);
                    if (parentComment) {
                        parentComment.replies = parentComment.replies || [];
                        parentComment.replies.push(comment);
                    }
                }
            });
    
            // Виводимо лише корінні коментарі (без parent_comment_id)
            comments.forEach(comment => {
                if (!comment.parent_comment_id) {
                    const messageElement = createMessageHTML(comment);
                    discussionThread.appendChild(messageElement);
                    if (comment.replies) {
                        renderReplies(comment.replies, messageElement);
                    }
                }
            });
    
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    

    // Функція для відображення відповідей (рекурсивно)
    const renderReplies = (replies, parentElement, level = 1) => {
        replies.forEach(reply => {
            const replyElement = createMessageHTML(reply, true, level);
            parentElement.after(replyElement);
            if (reply.replies) {
                renderReplies(reply.replies, replyElement, level + 1);
            }
        });
    };

    

    document.addEventListener('DOMContentLoaded', () => {
        // renderDiscussion();
        // initializeFilters();
        initializeDiscussionListeners();
        // initializeTabs();
    });