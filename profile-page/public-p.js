document.addEventListener('DOMContentLoaded', async () => {

    if (typeof translations === 'undefined') {
        console.error('Translation object not found, waiting for it to load...');
        // Wait a bit for translations to load
        await new Promise(resolve => setTimeout(resolve, 100));
        if (typeof translations === 'undefined') {
            console.error('Translations failed to load');
        }
    }
    
    try {
        const teacherId = window.location.pathname.split('/').pop();
        
        function getTranslation(key) {
            const userLang = localStorage.getItem('language') || 'en';

            if (!translations || !translations[userLang]) {
                console.warn(`No translations found for language: ${userLang}`);
                return key; // Fallback to the original key
            }

            return translations[userLang][key] || key;
        }
        
        function formatPrice(price) {
            if (!price) return getTranslation('free');
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        }
        
        function initializeShowMore() {
            const aboutMe = document.getElementById("about-me");
            const showMore = document.getElementById("show-more");
            
            if (!aboutMe || !showMore) {
                console.error('About me elements not found');
                return;
            }
            
            const checkAboutMeHeight = () => {
                console.log('Checking height:', {
                    scrollHeight: aboutMe.scrollHeight,
                    offsetHeight: aboutMe.offsetHeight
                });
                
                if (aboutMe.scrollHeight <= aboutMe.offsetHeight) {
                    showMore.style.display = "none";
                } else {
                    showMore.style.display = "inline-block";
                    aboutMe.classList.add("truncate");
                }
            };
            
            setTimeout(checkAboutMeHeight, 100);
            
            showMore.addEventListener("click", () => {
                aboutMe.classList.toggle("truncate");
                showMore.textContent = aboutMe.classList.contains("truncate")
                    ? getTranslation('showMore')
                    : getTranslation('showLess');
            });
            
            showMore.textContent = getTranslation('showMore');
        }
        
        function initializeViewAllButtons() {
            function limitVisibleItems(containerSelector, maxVisible, buttonSelector) {
                const container = document.querySelector(containerSelector);
                if (!container) return;
                
                const items = Array.from(container.children);
                const button = document.querySelector(buttonSelector);
                
                console.log(`Container ${containerSelector} has ${items.length} items`);
                
                if (items.length <= maxVisible) {
                    if (button) button.style.display = "none";
                    return;
                }
                
                items.forEach((item, index) => {
                    if (index >= maxVisible) {
                        item.style.display = "none";
                        item.classList.add("hidden-item");
                    }
                });
                
                if (button) {
                    button.style.display = "block";
                    button.addEventListener("click", () => {
                        const hiddenItems = items.filter(item => item.classList.contains("hidden-item"));
                        const isAnyHidden = hiddenItems.some(item => item.style.display === "none");
                        
                        hiddenItems.forEach(item => {
                            item.style.display = isAnyHidden ? "block" : "none";
                        });
                        
                        button.textContent = isAnyHidden ? getTranslation('viewLess') : getTranslation('viewAll');
                    });
                }
            }
            
            setTimeout(() => {
                limitVisibleItems(".courses-list", 3, ".btn-view-all-1");
                limitVisibleItems(".reviews-list", 3, ".btn-view-all-2");
            }, 100);
        }
        
        function displayTeacherData(teacher) {
            if (!teacher.courses) {
                teacher.courses = [];
            }
            
            const avatarImg = document.querySelector('#profile-image');
            if (avatarImg) {
                if (teacher.profile_image) {
                    if (teacher.profile_image.startsWith('/')) {
                        avatarImg.src = teacher.profile_image;
                    } else {
                        avatarImg.src = teacher.profile_image;
                    }
                } else {
                    avatarImg.src = '/images/user-avatar.png';
                }
            }
            
            // Basic information
            const userNicknameElement = document.querySelector('#user-nickname');
            if (userNicknameElement) {
                userNicknameElement.textContent = teacher.nickname || '';
            }
            
            const realNameElement = document.querySelector('#real-name');
            if (realNameElement) {
                if (teacher.real_name && teacher.real_name.trim()) {
                    realNameElement.textContent = teacher.real_name;
                    realNameElement.style.display = 'block';
                } else {
                    realNameElement.style.display = 'none';
                }
            }
             
            const aboutMeElement = document.querySelector('#about-me');
            if (aboutMeElement) {
                aboutMeElement.textContent = teacher.about || getTranslation('noInfo');
            }
            
            // Hobbies
            const hobbiesList = document.querySelector('#hobbies-list');
            if (hobbiesList) {
                if (teacher.hobbies && typeof teacher.hobbies === 'string') {
                    const hobbiesArray = teacher.hobbies
                        .split(',')
                        .map(hobby => hobby.trim())
                        .filter(hobby => hobby.length > 0);
                    
                    if (hobbiesArray.length > 0) {
                        hobbiesList.innerHTML = hobbiesArray
                            .map(hobby => `
                                <li class="hobby-item">
                                    <span class="hobby-text">${hobby}</span>
                                </li>
                            `).join('');
                    } else {
                        hobbiesList.innerHTML = '<li>' + getTranslation('noHobbies') + '</li>';
                    }
                } else {
                    hobbiesList.innerHTML = '<li>' + getTranslation('noHobbies') + '</li>';
                }
            }
            
            // Languages
            const languagesList = document.querySelector('#languages-list');
            if (languagesList) {
                if (teacher.language && typeof teacher.language === 'string') {
                    const languagesArray = teacher.language
                        .split(',')
                        .map(lang => lang.trim())
                        .filter(lang => lang.length > 0);
                    
                    if (languagesArray.length > 0) {
                        languagesList.innerHTML = languagesArray
                            .map(lang => `
                                <li class="language-item">
                                    <span class="language-text">${lang}</span>
                                </li>
                            `).join('');
                    } else {
                        languagesList.innerHTML = '<li>' + getTranslation('noLanguages') + '</li>';
                    }
                } else {
                    languagesList.innerHTML = '<li>' + getTranslation('noLanguages') + '</li>';
                }
            }
            
            // Education
            const educationList = document.querySelector('#education-list');
            if (educationList) {
                if (teacher.education && typeof teacher.education === 'string') {
                    const educationArray = teacher.education
                        .split('.')
                        .map(edu => edu.trim())
                        .filter(edu => edu.length > 0);
                    
                    if (educationArray.length > 0) {
                        educationList.innerHTML = educationArray
                            .map(edu => `
                                <li class="education-item">
                                    <span class="education-text">${edu}.</span>
                                </li>
                            `).join('');
                    } else {
                        educationList.innerHTML = '<li>' + getTranslation('noEducation') + '</li>';
                    }
                } else {
                    educationList.innerHTML = '<li>' + getTranslation('noEducation') + '</li>';
                }
            }
            
            // Experience
            const experienceList = document.querySelector('#experience-list');
            if (experienceList) {
                if (teacher.experience && typeof teacher.experience === 'string') {
                    const experienceArray = teacher.experience
                        .split('.')
                        .map(exp => exp.trim())
                        .filter(exp => exp.length > 0);
                    
                    if (experienceArray.length > 0) {
                        experienceList.innerHTML = experienceArray
                            .map(exp => `
                                <li class="experience-item">
                                    <span class="experience-text">${exp}.</span>
                                </li>
                            `).join('');
                    } else {
                        experienceList.innerHTML = '<li>' + getTranslation('noExperience') + '</li>';
                    }
                } else {
                    experienceList.innerHTML = '<li>' + getTranslation('noExperience') + '</li>';
                }
            }
            
            // Courses
            const coursesList = document.querySelector('#courses-list');
            if (coursesList) {
                if (Array.isArray(teacher.courses) && teacher.courses.length) {
                    coursesList.innerHTML = teacher.courses
                        .filter(course => course.status === 'published')
                        .map(course => {
                            let imageUrl = '/images/default-course.png';
                            if (course.image_url) {
                                imageUrl = course.image_url.includes('uploads')
                                    ? course.image_url
                                    : `/uploads/courses/${course.image_url}`;
                            }
                            
                            console.log('Final image URL:', imageUrl);
                            
                            return `
                                <div class="course" data-course-id="${course.id || ''}">
                                    <p class="p-1">${course.name || 'Untitled Course'}</p>
                                    <div class="description-container">
                                        <p class="p-2 short-description">${course.description ? (course.description.length > 200 ? course.description.substring(0, 100) + '...' : course.description) : 'No description available'}</p>
                                        <div class="full-description">
                                            <p>${course.description || 'No description available'}</p>
                                        </div>
                                    </div>
                                    <img src="/uploads/${course.image_url || '/images/250x100.png'}"
                                        alt="${course.name}"
                                        onerror="this.src='/images/250x100.png'">
                                    <!--<div class="course-details">
                                        <span class="course-price">${formatPrice(course.price)}</span>
                                    </div>-->
                                    <button class="btn-resume" onclick="window.location.href='/course/${course.id}'">
                                        ${getTranslation('btnResume')}
                                    </button>
                                </div>
                            `;
                        }).join('');
                        
                    const courseCards = document.querySelectorAll('.course');
                    courseCards.forEach(card => {
                        card.addEventListener('click', (e) => {
                            if (e.target.classList.contains('btn-resume')) return;
                            
                            const courseId = card.dataset.courseId;
                            if (courseId) {
                                window.location.href = `/course/${courseId}`;
                            }
                        });
                    });
                } else {
                    coursesList.innerHTML = `<p>${getTranslation('noCourses')}</p>`;
                }
            }

            // Reviews
            const reviewsList = document.querySelector('#reviews-list');
            if (reviewsList) {
                const reviews = teacher.reviews || [];
                reviewsList.innerHTML = reviews.length > 0
                    ? reviews.map(review => {
                        const comment = review.comment || 'No comment';
                        const isLongComment = comment.length > 100;
                        
                        return `
                            <div class="review">
                                <div class="review-header">
                                    <p class="p-1">${review.student_name || 'Anonymous'}</p>
                                    <p class="date">${new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                                <div class="comment-container">
                                    <p class="p-2 short-comment">${comment}</p>
                                    ${isLongComment ? `
                                        <div class="full-comment">
                                            <p>${comment}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="rating">${'<span class="star">★</span>'.repeat(Math.min(5, Math.max(0, review.rating)))}${'<span class="empty-star">☆</span>'.repeat(5-Math.min(5, Math.max(0, review.rating)))}</div>
                            </div>
                        `;
                    }).join('')
                    : reviewsList.innerHTML = '<p>' + getTranslation('noReviews') + '</p>';;
            }
        }
        
        const apiUrl = `/auth/api/public-profile/${teacherId}`;
        console.log(`Fetching data from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }
        
        const teacher = await response.json();
        displayTeacherData(teacher);
        initializeShowMore();
        initializeViewAllButtons();
        
    } catch (error) {
        console.error('Profile loading error:', error);
        const profileElement = document.querySelector('.profile');
        if (profileElement) {
            profileElement.innerHTML = `
                <div class="error-message">
                    <p>${getTranslation('loadError')}</p>
                    <p>${getTranslation('errorDetails')} ${error.message}</p>
                </div>
            `;
        }
    }
});