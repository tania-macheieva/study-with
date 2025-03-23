document.addEventListener('DOMContentLoaded', async function() {
    let courseData = null;
    let speakers = [];
    let reviews = [];
    let currentReviewIndex = 0;
    let currentSpeakerIndex = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        console.error('ID курсу не вказано');
        return;
    }
 
    try {
        const response = await fetch(`/api/courses/${courseId}/full`);
        if (!response.ok) throw new Error('Помилка завантаження курсу');
        courseData = await response.json();
        
        console.log('Отримані дані курсу:', courseData);
        
        if (!courseData.name) {
            throw new Error('У відповіді відсутня назва курсу');
        }
        
        const courseNameElement = document.querySelector('.course-name');
        if (courseNameElement) {
            courseNameElement.textContent = courseData.name;
        } else {
            console.error('Не знайдено елемент для назви курсу');
        }
        
        document.querySelector('.prev-image').src = courseData.image_url 
            ? `/uploads/${courseData.image_url}` 
            : '/images/default-course.png';
        document.querySelector('.course-description').textContent = courseData.description;
        document.querySelector('.detail-category .detail-value').textContent =
            translations[getCurrentLanguage()][courseData.category] || courseData.category;
    
        const detailsMainValues = document.querySelectorAll('.details-main .detail-value');
            detailsMainValues[0].textContent = 
            translations[getCurrentLanguage()][courseData.level] || courseData.level;
        const lang = getCurrentLanguage();
        detailsMainValues[1].textContent = `6 ${translations[lang].weeks}`;
        detailsMainValues[2].textContent = courseData.price === 0 
        ? translations[lang].free 
        : `$${courseData.price}`;

        if (courseData.reviews && courseData.reviews.length > 0) {
            const totalRating = courseData.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = (totalRating / courseData.reviews.length).toFixed(1);

            const ratingSpan = document.querySelector('.rating-value');
            if (ratingSpan) {
                ratingSpan.textContent = averageRating;
            }
        }

    
        const userId = localStorage.getItem('userId');
        const saveButton = document.querySelector('.save-btn');

        if (userId && saveButton) {
            // Функція для оновлення стану кнопки закладки
            const updateBookmark = async () => {
                const isBookmarked = await checkIfBookmarked(userId, courseId);
                updateBookmarkButton(saveButton, isBookmarked);
            };
        
            // Викликаємо функцію для початкового оновлення стану
            await updateBookmark();

            // =================== 🆕 Обробник "Додати/Видалити із закладок" ===================
            saveButton.addEventListener('click', async function () {
                if (!userId) {
                    showNotification(translations[getCurrentLanguage()].pleaseLogin, 'error');                    return;
                }

                try {
                    // Отримуємо поточний стан закладки з сервера
                    let isBookmarked = await checkIfBookmarked(userId, courseId);
                    let method = 'POST'; // Використовуємо один маршрут для перемикання стану
                  
                    const response = await fetch(' http://localhost:8000/api/courses/bookmarks', {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, courseId })
                    });
                    console.log('Відповідь сервера:', response);

                    if (!response.ok) throw new Error(`Не вдалося ${isBookmarked ? 'видалити' : 'додати'} курс у закладки`);

                    isBookmarked = !isBookmarked; // Перемикаємо стан
                    updateBookmarkButton(saveButton, isBookmarked);
                    // Оновлюємо стан кнопки закладки
                    await  updateBookmark();
                    const notificationText = isBookmarked 
                        ? translations[getCurrentLanguage()].bookmarkAdded 
                        : translations[getCurrentLanguage()].bookmarkRemoved;
                    showNotification(notificationText, 'success');


                } catch (error) {
                    console.error('Помилка зміни закладки:', error);
                    showNotification('Помилка зміни закладки', 'error');
                }
            });
        }

        // Відображення модулів курсу 
        if (!courseData || !courseData.modules) {
            console.warn("Модулі курсу відсутні або не завантажилися.");
            return;
        }
    
        const modulesSection = document.querySelector('.modules-section');


        if (modulesSection) {
            const modulesContainer = modulesSection.querySelector('.white-card');
            
            if (courseData.modules && courseData.modules.length > 0) {
                modulesContainer.innerHTML = courseData.modules.map(module => `
                    <div class="module">
                        <h3>${module.title}</h3>
                        ${module.lectures && module.lectures.length > 0 
                            ? module.lectures.map(lecture => `
                                <div class="topic">${lecture.title}</div>
                            `).join('')
                            : `<div class="topic">${translations[getCurrentLanguage()].noLectures}</div>`
                        }
                    </div>
                `).join('');
            } else {
                modulesContainer.innerHTML = `
                    <div class="module">
                        <h3>${translations[getCurrentLanguage()].noModules}</h3>
                    </div>
                `;
            }
        }

        // Обробка відгуків
        // When processing reviews data
        if (courseData.reviews && courseData.reviews.length > 0) {
            
            
            reviews = courseData.reviews.map(review => {
                
                
                return {
                    id: review.id,
                    username: review.username || review.user_name || 'Користувач',
                    rate: `${review.rating}/5`,
                    numericRate: review.rating,
                    text: review.review_text || "",
                    date: new Date(review.updated_at || review.created_at),
                    profileImage: review.profile_image || '/images/user-avatar.png'

                };
            });
            
            
            updateReview();

        } else {
            const reviewsSection = document.querySelector('.reviews-section');
            const whiteCard = reviewsSection.querySelector('.white-card');
            whiteCard.innerHTML = `<p>${translations[getCurrentLanguage()].noReviews}</p>`;
        }

    }catch (error) {
    console.error('Помилка завантаження курсу:', error);
        
        const errorElements = {
            '.course-name': 'Помилка завантаження курсу',
            '.course-description': 'Не вдалося завантажити опис курсу',
            '.detail-category .detail-value': 'Не визначено',
        };
        
        Object.entries(errorElements).forEach(([selector, message]) => {
            const element = document.querySelector(selector);
            if (element) element.textContent = message;
        });
        
        showNotification('Помилка завантаження даних курсу', 'error');
    }

// Функція перевірки, чи курс у закладках 
async function checkIfBookmarked(userId, courseId) {
    try {
        const response = await fetch(`http://localhost:8000/api/courses/bookmarks/${userId}`);
        if (!response.ok) throw new Error('Помилка отримання закладок');
        const bookmarks = await response.json();
        const bookmark = bookmarks.find(bookmark => bookmark.id === parseInt(courseId));
        return bookmark ? bookmark.is_saved : false;
    } catch (error) {
        console.error('Помилка перевірки закладок:', error);
        return false;
    }
}

//  Функція оновлення кнопки закладок 
function updateBookmarkButton(saveButton, isBookmarked) {
    saveButton.classList.toggle('saved', isBookmarked);
    saveButton.innerHTML = isBookmarked
        ? `<img src="../images/save_saved.svg" alt="saved">`
        : `<img src="../images/save_normal.svg" alt="save">`;
}




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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

async function initializeSaveButton() {
    const saveBtn = document.querySelector('.save-btn');
    if (!saveBtn) return;

    const userId = localStorage.getItem('userId');
    const courseId = new URLSearchParams(window.location.search).get('id');

    if (!userId || !courseId) return;

    try {
        const response = await fetch(`http://localhost:8000/api/courses/is-saved?userId=${userId}&courseId=${courseId}`);
        const data = await response.json();

        if (data.isSaved) {
            saveBtn.classList.add('saved');
            const imgElement = saveBtn.querySelector('img');
            imgElement.src = '../images/save_active.svg';
        }

        saveBtn.addEventListener('click', () => toggleSaveCourse(courseId));

    } catch (error) {
        console.error('Помилка при ініціалізації кнопки збереження:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeSaveButton);

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
    
    
    if (courseData && courseData.author) {
        speakers = [{
            name: courseData.author.name || 'Невідомий автор',
            nickname: courseData.author.nickname || '',
            image: courseData.author.profile_image || '/images/user-avatar.png',
            achievements: courseData.author.about || 
                        courseData.author.experience || 
                        'Інформація про автора відсутня'
        }];
    }

    
    

    function formatReviewDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date >= today) {
            return translations[getCurrentLanguage()].today;
        }
        
        if (date >= yesterday && date < today) {
            return translations[getCurrentLanguage()].yesterday;
        }
        
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function sortReviews(reviewsArray) {
        return [...reviewsArray].sort((a, b) => {
            if (a.text && !b.text) return -1;
            if (!a.text && b.text) return 1;
            return b.date - a.date;
        });
    }

    function updateReview() {
        if (reviews.length === 0) {
            const reviewsSection = document.querySelector('.reviews-section');
            const whiteCard = reviewsSection.querySelector('.white-card');
            whiteCard.innerHTML = `<p>${translations[getCurrentLanguage()].noReviews}</p>`;
            return;
        }

        const sortedReviews = sortReviews(reviews);
        const review = sortedReviews[currentReviewIndex];
        const reviewsSection = document.querySelector('.reviews-section');
        const whiteCard = reviewsSection.querySelector('.white-card');
        
        whiteCard.innerHTML = `
            <div class="user-avatar" style="background-image: url('${review.profileImage}')"></div>
            <div class="user-info">
                <div class="username">${review.username}</div>
                <div class="rating">${translations[getCurrentLanguage()].rateLabel} ${review.rate}</div>
            </div>
            <div class="review-date">${formatReviewDate(review.date)}</div>
            <div class="review-text">${review.text || translations[getCurrentLanguage()].noComment}</div>
        `;
    }
 
    function updateSpeaker() {
    if (speakers.length === 0) {
        const speakersSection = document.querySelector('.speakers-section');
        const whiteCard = speakersSection.querySelector('.white-card');
        whiteCard.innerHTML = `<p>${translations[getCurrentLanguage()].noAuthorInfo}</p>`;
        return;
    }
    
    const speaker = speakers[currentSpeakerIndex];
    const speakersSection = document.querySelector('.speakers-section');
    const whiteCard = speakersSection.querySelector('.white-card');
    
    whiteCard.innerHTML = `
    <a href="/public-profile/${speaker.id || courseData.author.id}" class="speaker-name-link" target="_blank">${speaker.name} ${speaker.nickname ? `(${speaker.nickname})` : ''}</a>
    <div class="speaker-image" style="background-image: url('${speaker.image}')"></div>
    <p>${speaker.achievements}</p>
`;
    }

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
            return `<div class="no-reviews">${translations[getCurrentLanguage()].noReviewsWithRating}</div>`;
      }
        
        return sortedReviews.map(review => `
            <div class="review-card">
                <div class="user-avatar" style="background-image: url('${review.profileImage}')"></div>
                <div class="user-info">
                    <div class="username">${review.username}</div>
                    <div class="rating">Rate: ${review.rate}</div>
                </div>
                <div class="review-date">${formatReviewDate(review.date)}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    if (!document.querySelector('.modal-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }

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
                                <button class="filter-btn active" data-rate="all">${translations[getCurrentLanguage()].showAll}</button>
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
                if (speakers.length === 0) {
                    modalContainer.style.display = 'block';
                    modalContainer.innerHTML = `
                        <div class="modal-overlay">
                            <div class="modal-content">
                                <button class="modal-close">×</button>
                                <div class="white-card">
                                    <p>Інформація про автора відсутня</p>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
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
                                                    <div class="speaker-image-small" style="background-image: url('${speaker.image}')"></div>
                                                    <div class="speaker-info">
                                                        <a href="#" class="speaker-name-link">${speaker.name} ${speaker.nickname ? `(${speaker.nickname})` : ''}</a>
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
                }
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

    // Check enrollment status and update Sign Up button
    const userId = localStorage.getItem('userId');
    const signUpButton = document.querySelector('.sign-up');

    if (signUpButton) {
        if (userId) {
            const enrollmentStatus = await checkEnrollmentStatus(courseId, userId);
            updateSignUpButton(enrollmentStatus, courseId, courseData);
        } else {
            // Set up button for non-logged in users
            signUpButton.textContent = translations[getCurrentLanguage()].signup;
            signUpButton.addEventListener('click', () => {
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `/login?redirect=${returnUrl}`;
            });
        }
    }
    function updateSignUpButton(enrollmentStatus, courseId, courseData) {
        const signUpButton = document.querySelector('.sign-up');
        
        if (!signUpButton) return;
        
        if (enrollmentStatus.isEnrolled) {
            signUpButton.textContent = translations[getCurrentLanguage()].goToCourse;
            signUpButton.addEventListener('click', () => {
                window.location.href = `/course/${courseId}`;
            });
        } else {
            signUpButton.textContent = translations[getCurrentLanguage()].signup;
            signUpButton.addEventListener('click', () => handleCourseEnrollment(courseId, courseData));
        }
    }

    async function handleCourseEnrollment(courseId, courseData) {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            if (!userId || !token) {
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `/login?redirect=${returnUrl}`;
                return;
            }

            if (courseData.price > 0) {
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

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateReview();
    updateSpeaker();
    
});