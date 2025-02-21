
let DISCUSSION_MESSAGES = []

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

    const user = message.user || {name: message.user_name || 'Unknown User' }; 
    const avatar = message.teacher_profile_image || message.student_profile_image || user.profile_image || '/images/user-avatar.png';

    messageElement.innerHTML = `
        <div class="user-info">
            <img src="${avatar}" alt="User avatar" class="avatar">
            <span class="username">${message.teacher_nickname || message.student_nickname || user.name}</span>
            <span class="date">${message.created_at}</span>
        </div>
        <p class="message-text">${message.content}</p>
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
const getAllReplies = (messageId) => {
    // Припускаємо, що ви вже маєте список усіх коментарів
    return DISCUSSION_MESSAGES.filter(msg => msg.parent_comment_id === messageId);
};

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

const fetchComments = async (courseId) => {
    try {
        const response = await fetch(`http://localhost:8000/api/comments?course_id=${courseId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        const comments = await response.json();
        
        // Додати кожен коментар на сторінку
        const discussionThread = document.querySelector('.discussion-thread');
        discussionThread.innerHTML = '';  // Очистити існуючі коментарі перед додаванням нових

        comments.forEach(comment => {
            const messageElement = createMessageHTML(comment);
            discussionThread.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
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

document.addEventListener('DOMContentLoaded', () => {
    // renderDiscussion();
    // initializeFilters();
    // initializeDiscussionListeners();
    // initializeTabs();
});