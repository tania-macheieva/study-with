document.addEventListener('DOMContentLoaded', async function() {
    let courseData = null;
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        console.error('ID курсу не вказано');
        return;
    }

    try {
        const response = await fetch(`/api/courses/${courseId}/full`);
        if (!response.ok) throw new Error('Помилка завантаження курсу');
        courseData = await response.json(); // Зберігаємо дані в змінну
        
        // Оновлюємо елементи сторінки даними з API
        document.querySelector('.course-name').textContent = courseData.name;
        document.querySelector('.course-description').textContent = courseData.description;
        document.querySelector('.detail-category .detail-value').textContent = courseData.category;
        
        const detailsMainValues = document.querySelectorAll('.details-main .detail-value');
        detailsMainValues[0].textContent = courseData.level;
        detailsMainValues[1].textContent = '6 weeks';
        detailsMainValues[2].textContent = courseData.price === 0 ? 'Безкоштовно' : `$${courseData.price}`;

        // Додаємо перевірку статусу запису користувача
        const userId = localStorage.getItem('userId');
        if (userId) {
            const enrollmentStatus = await checkEnrollmentStatus(courseId, userId);
            updateSignUpButton(enrollmentStatus);
        }
        // Оновлюємо модулі курсу
        const modulesContainer = document.querySelector('.white-card');
        if (course.modules && course.modules.length > 0) {
            modulesContainer.innerHTML = course.modules.map(module => `
                <div class="module">
                    <h3>${module.title}</h3>
                    ${module.lectures.map(lecture => `
                        <div class="topic">${lecture.title}</div>
                    `).join('')}
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Помилка:', error);
        document.querySelector('.course-name').textContent = 'Помилка завантаження курсу';
    }



   // Додаємо стилі для сповіщень
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        border-left: 4px solid #4CAF50;
    }

    .notification.error {
        border-left: 4px solid #f44336;
    }

    .notification.info {
        border-left: 4px solid #2196F3;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Функція для показу сповіщень
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функція для збереження/видалення курсу
async function toggleSaveCourse(courseId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showNotification('Будь ласка, увійдіть в систему', 'error');
        return;
    }

    const saveBtn = document.querySelector('.save-btn');
    const isCurrentlySaved = saveBtn.classList.contains('saved');

    try {
        const endpoint = isCurrentlySaved ? 'unsave' : 'save';
        const response = await fetch(`http://localhost:8000/courses/${endpoint}`, {
            method: isCurrentlySaved ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                courseId: parseInt(courseId)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Помилка при обробці запиту');
        }

        const data = await response.json();
        
        // Оновлюємо стан кнопки
        const imgElement = saveBtn.querySelector('img');
        if (!isCurrentlySaved) {
            saveBtn.classList.add('saved');
            imgElement.src = '../images/save_active.svg';
            showNotification('Курс збережено', 'success');
        } else {
            saveBtn.classList.remove('saved');
            imgElement.src = '../images/save_normal.svg';
            showNotification('Курс видалено зі збережених', 'info');
        }

    } catch (error) {
        console.error('Помилка:', error);
        showNotification(error.message || 'Сталася помилка', 'error');
    }
}

// Ініціалізуємо кнопку збереження при завантаженні сторінки
async function initializeSaveButton() {
    const saveBtn = document.querySelector('.save-btn');
    if (!saveBtn) return;

    const userId = localStorage.getItem('userId');
    const courseId = new URLSearchParams(window.location.search).get('id');

    if (!userId || !courseId) return;

    try {
        // Перевіряємо чи курс вже збережений
        const response = await fetch(`http://localhost:8000/api/courses/is-saved?userId=${userId}&courseId=${courseId}`);
        const data = await response.json();

        if (data.isSaved) {
            saveBtn.classList.add('saved');
            const imgElement = saveBtn.querySelector('img');
            imgElement.src = '../images/save_active.svg';
        }

        // Додаємо обробник кліку
        saveBtn.addEventListener('click', () => toggleSaveCourse(courseId));

    } catch (error) {
        console.error('Помилка при ініціалізації кнопки збереження:', error);
    }
}

// Викликаємо ініціалізацію при завантаженні сторінки
document.addEventListener('DOMContentLoaded', initializeSaveButton);

    //кнопка поширення
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async function() {
            try {
                const currentUrl = window.location.href;
                await navigator.clipboard.writeText(currentUrl);
                showNotification('URL курсу скопійовано в буфер обміну', 'success');
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = window.location.href;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                
                try {
                    document.execCommand('copy');
                    showNotification('URL курсу скопійовано в буфер обміну', 'success');
                } catch (e) {
                    showNotification('Не вдалося скопіювати URL', 'error');
                } finally {
                    document.body.removeChild(textarea);
                }
            }
        });
    }

    // Функціонал для опису курсу
    const description = document.querySelector('.course-description');
    
    function initializeDescription() {
        if (description && description.scrollHeight > 100) {
            if (!description.querySelector('.see-more')) {
                const seeMore = document.createElement('span');
                seeMore.className = 'see-more';
                seeMore.textContent = 'see more';
                description.appendChild(seeMore);
                
                seeMore.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isCollapsed = description.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        description.classList.remove('collapsed');
                        description.classList.add('expanded');
                        seeMore.textContent = 'see less';
                    } else {
                        description.classList.remove('expanded');
                        description.classList.add('collapsed');
                        seeMore.textContent = 'see more';
                    }
                });
            }
            description.classList.add('collapsed');
        }
    }
    
    initializeDescription();

    // Дані відгуків
    const reviews = [
        {
            username: "username 1",
            rate: "5/5",
            numericRate: 5,
            text: "",
            date: new Date('2025-01-11T10:30:00')
        },
        {
            username: "username 2",
            rate: "4/5",
            numericRate: 4,
            text: "вдлмпркртеимщврьскгумркгаьсрчускшгцмерсозачбркусцмшгпьб...",
            date: new Date('2025-01-10T15:45:00')
        },
        {
            username: "username 3",
            rate: "4/5",
            numericRate: 4,
            text: "журмтшжщуйцшрмезщсцгмєщкптгйцшщ5мх4тгьєйцщахзкегьм...",
            date: new Date('2025-01-08T09:20:00')
        },
        {
            username: "username 4",
            rate: "1/5",
            numericRate: 1,
            text: "",
            date: new Date('2024-01-05T11:15:00')
        },
        {
            username: "username 5",
            rate: "3/5",
            numericRate: 3,
            text: "",
            date: new Date('2023-12-29T16:40:00')
        }
    ];

    // Дані спікерів
    const speakers = [
        {
            name: "Speaker name 1",
            image: "#D9D9D9",
            achievements: "here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements  here should be the speaker's achievementshere should be the speaker's achievements here should be the speaker's achievementshere should be the speaker's achievements here should be the speaker's achievementshere should be the speaker's achievements here should be the speaker's achievements"
        },
        {
            name: "Speaker name 2",
            image: "#C9C9C9",
            achievements: "Another speaker achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements "
        },
        {
            name: "Speaker name 3",
            image: "#B9B9B9",
            achievements: "Third speaker achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements here should be the speaker's achievements "
        }
    ];

    let currentReviewIndex = 0;
    let currentSpeakerIndex = 0;

    // Функція форматування дати
    function formatReviewDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date >= today) {
            return 'today';
        }
        
        if (date >= yesterday && date < today) {
            return 'yesterday';
        }
        
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Функція сортування відгуків
    function sortReviews(reviewsArray) {
        return [...reviewsArray].sort((a, b) => {
            if (a.text && !b.text) return -1;
            if (!a.text && b.text) return 1;
            return b.date - a.date;
        });
    }

    // Функція оновлення відгуку
    function updateReview() {
        const sortedReviews = sortReviews(reviews);
        const review = sortedReviews[currentReviewIndex];
        const reviewsSection = document.querySelector('.reviews-section');
        const whiteCard = reviewsSection.querySelector('.white-card');
        
        whiteCard.innerHTML = `
            <div class="user-avatar"></div>
            <div class="user-info">
                <div class="username">${review.username}</div>
                <div class="rating">rate: ${review.rate}</div>
            </div>
            <div class="review-text">${review.text}</div>
        `;
    }

    // Функція оновлення спікера
    function updateSpeaker() {
        const speaker = speakers[currentSpeakerIndex];
        const speakersSection = document.querySelector('.speakers-section');
        const whiteCard = speakersSection.querySelector('.white-card');
        
        whiteCard.innerHTML = `
            <a href="#" class="speaker-name-link">${speaker.name}</a>
            <div class="speaker-image" style="background-color: ${speaker.image}"></div>
            <p>${speaker.achievements}</p>
        `;
    }

    // Ініціалізація навігації каруселі
    const reviewsSection = document.querySelector('.reviews-section');
    const speakersSection = document.querySelector('.speakers-section');

    if (reviewsSection) {
        const reviewLeftArrow = reviewsSection.querySelector('.arrow-left');
        const reviewRightArrow = reviewsSection.querySelector('.arrow-right');

        if (reviewLeftArrow && reviewRightArrow) {
            reviewLeftArrow.addEventListener('click', () => {
                currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
                updateReview();
            });

            reviewRightArrow.addEventListener('click', () => {
                currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
                updateReview();
            });
        }
    }

    if (speakersSection) {
        const speakerLeftArrow = speakersSection.querySelector('.arrow-left');
        const speakerRightArrow = speakersSection.querySelector('.arrow-right');

        if (speakerLeftArrow && speakerRightArrow) {
            speakerLeftArrow.addEventListener('click', () => {
                currentSpeakerIndex = (currentSpeakerIndex - 1 + speakers.length) % speakers.length;
                updateSpeaker();
            });

            speakerRightArrow.addEventListener('click', () => {
                currentSpeakerIndex = (currentSpeakerIndex + 1) % speakers.length;
                updateSpeaker();
            });
        }
    }

    // Функції для модального вікна
    function calculateRatePercentages() {
        const total = reviews.length;
        const counts = {};
        
        for (let i = 1; i <= 5; i++) {
            counts[i] = 0;
        }
        
        reviews.forEach(review => {
            counts[review.numericRate]++;
        });
        
        const percentages = {};
        for (let i = 1; i <= 5; i++) {
            percentages[i] = Math.round((counts[i] / total) * 100);
        }
        
        return percentages;
    }

    function renderReviews(filteredReviews) {
        const sortedReviews = sortReviews(filteredReviews);
        
        if (sortedReviews.length === 0) {
            return '<div class="no-reviews">there are no reviews with this rating.</div>';
        }
        
        return sortedReviews.map(review => `
            <div class="review-card">
                <div class="user-avatar"></div>
                <div class="user-info">
                    <div class="username">${review.username}</div>
                    <div class="rating">Rate: ${review.rate}</div>
                </div>
                <div class="review-date">${formatReviewDate(review.date)}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    // Створення контейнера для модального вікна
    if (!document.querySelector('.modal-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }

    // Обробники для заголовків секцій
    document.querySelectorAll('.info-label').forEach(label => {
        label.addEventListener('click', function() {
            const section = this.closest('.section');
            const modalContainer = document.querySelector('.modal-container');
            
            if (section.classList.contains('reviews-section')) {
                const percentages = calculateRatePercentages();
                
                modalContainer.style.display = 'block';
                modalContainer.innerHTML = `
                    <div class="modal-overlay">
                        <div class="modal-content">
                            <button class="modal-close">×</button>
                            <div class="reviews-filter">
                                ${[1, 2, 3, 4, 5].map(rate => `
                                    <div class="rating-button-container">
                                        <button class="filter-btn" data-rate="${rate}">${rate}/5</button>
                                        <div class="rate-percentage">${percentages[rate]}%</div>
                                    </div>
                                `).join('')}
                                <button class="filter-btn active" data-rate="all">Show all</button>
                            </div>
                            <div class="white-card">
                                <div class="reviews-container">
                                    ${renderReviews(reviews)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const filterButtons = modalContainer.querySelectorAll('.filter-btn');
                const reviewsContainer = modalContainer.querySelector('.reviews-container');

                filterButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        filterButtons.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');

                        const selectedRate = this.dataset.rate;
                        const filteredReviews = selectedRate === 'all' 
                            ? reviews 
                            : reviews.filter(review => review.numericRate === parseInt(selectedRate));
                            
                        reviewsContainer.innerHTML = renderReviews(filteredReviews);
                    });
                });
            } else if (section.classList.contains('speakers-section')) {
                modalContainer.style.display = 'block';
                modalContainer.innerHTML = `
                    <div class="modal-overlay">
                        <div class="modal-content">
                            <button class="modal-close">×</button>
                            <div class="white-card">
                                <div class="speakers-container">
                                    ${speakers.map((speaker, index) => `
                                        <div class="speaker-card-modal${index !== speakers.length - 1 ? ' with-border' : ''}">
                                            <div class="speaker-content">
                                                <div class="speaker-image-small" style="background-color: ${speaker.image}"></div>
                                                <div class="speaker-info">
                                                    <a href="#" class="speaker-name-link">${speaker.name}</a>
                                                    <p class="speaker-achievements">${speaker.achievements}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                const content = section.querySelector('.white-card').cloneNode(true);
                
                modalContainer.style.display = 'block';
                modalContainer.innerHTML = `
                    <div class="modal-overlay">
                        <div class="modal-content">
                            <button class="modal-close">×</button>
                            ${content.outerHTML}
                        </div>
                    </div>
                `;
            }

            const modalOverlay = modalContainer.querySelector('.modal-overlay');
            const modalClose = modalContainer.querySelector('.modal-close');
            
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    modalContainer.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

            modalClose.addEventListener('click', function() {
                modalContainer.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            document.body.style.overflow = 'hidden';
        });
    });

    // Функція перевірки статусу запису на курс
    async function checkEnrollmentStatus(courseId, userId) {
        try {
            const response = await fetch(`/api/courses/${courseId}/enrollment-status?userId=${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Помилка перевірки статусу запису:', error);
            return { isEnrolled: false };
        }
    }

    // Функція оновлення кнопки запису
    function updateSignUpButton(enrollmentStatus) {
        const signUpButton = document.querySelector('.sign-up');
        
        if (enrollmentStatus.isEnrolled) {
            signUpButton.textContent = 'Перейти до навчання';
            signUpButton.addEventListener('click', () => {
                window.location.href = `/course/${courseId}`;
            });
        } else {
            signUpButton.textContent = 'Sign Up';
            signUpButton.addEventListener('click', handleCourseEnrollment);
        }
    }

    // Функція обробки запису на курс
    async function handleCourseEnrollment() {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            if (!userId || !token) {
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `/login?redirect=${returnUrl}`;
                return;
            }
    
            // Перевіряємо чи курс платний
            if (courseData.price > 0) {
                // Перенаправляємо на сторінку оплати
                window.location.href = `/pay-page/pay.html?id=${courseId}`;
                return;
            }
    
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Помилка при записі на курс');
            }
    
            showNotification('Ви успішно записались на курс!', 'success');
            
            setTimeout(() => {
                window.location.href = `/course/${courseId}`;
            }, 1500);
    
        } catch (error) {
            console.error('Помилка:', error);
            showNotification(error.message, 'error');
        }
    }

    // Функція показу повідомлень
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    

    // Ініціалізація елементів каруселі
    updateReview();
    updateSpeaker();
});