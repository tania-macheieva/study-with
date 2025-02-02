document.addEventListener('DOMContentLoaded', async () => {
    try {
        function getUserIdFromToken() {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found');
                return null;
            }
            
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                return decoded.id || null;
            } catch (error) {
                console.error('Token decoding error:', error);
                return null;
            }
        }

        function formatPrice(price) {
        if (!price) return getTranslation('free');
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
        }

        function navigateToCourse(courseId) {
            if (!courseId) return;
            window.location.href = `/course/${courseId}`;
        }

        function addCourseCardListeners() {
            const courseCards = document.querySelectorAll('.course');
            courseCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-resume')) return;
                    
                    const courseId = card.dataset.courseId;
                    if (courseId) {
                        navigateToCourse(courseId);
                    }
                });
            });
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
            if (teacher.profile_image) {
                if (teacher.profile_image.startsWith('/')) {
                    avatarImg.src = teacher.profile_image;
                } else {
                    avatarImg.src = teacher.profile_image;
                }
            } else if (teacher.certificates) {
                avatarImg.src = `data:image/jpeg;base64,${teacher.certificates}`;
            } else {
                avatarImg.src = '/images/profile-picture.png';
            }

            // Basic information
            document.querySelector('#user-nickname').textContent = teacher.nickname || 'Username';
            const realNameElement = document.querySelector('#real-name');
            if (teacher.real_name && teacher.real_name.trim()) {
                realNameElement.textContent = teacher.real_name;
                realNameElement.style.display = 'block';
            } else {
                realNameElement.style.display = 'none';
            }
            document.querySelector('#about-me').textContent = teacher.about || 'No information available';

            // Hobbies
            const hobbiesList = document.querySelector('#hobbies-list');
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
                    hobbiesList.innerHTML = '<li>No hobbies listed</li>';
                }
            } else {
                hobbiesList.innerHTML = '<li>No hobbies listed</li>';
            }

            // Languages
            const languagesList = document.querySelector('#languages-list');
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
                    languagesList.innerHTML = '<li>Languages not specified</li>';
                }
            } else {
                languagesList.innerHTML = '<li>Languages not specified</li>';
            }

            // освітиa
            const educationList = document.querySelector('#education-list');
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
                    educationList.innerHTML = '<li>Education not specified</li>';
                }
            } else {
                educationList.innerHTML = '<li>Education not specified</li>';
            }

            // досвід
            const experienceList = document.querySelector('#experience-list');
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
                    experienceList.innerHTML = '<li>No experience specified</li>';
                }
            } else {
                experienceList.innerHTML = '<li>No experience specified</li>';
            }

        
            const coursesList = document.querySelector('#courses-list');
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
                                <p class="p-2">${course.description || 'No description available'}</p>
                                <img 
                                    src="${imageUrl}" 
                                    alt="${course.name}"
                                    onerror="this.onerror=null; this.src='/images/250x100.png';"
                                    class="course-image"
                                >
                                <div class="course-details">
                                    <span class="course-price">${formatPrice(course.price)}</span>
                                </div>
                                <button class="btn-resume" onclick="navigateToCourse('${course.id}')">
                                    ${getTranslation('learnMore')}
                                </button>
                            </div>
                        `;
                    }).join('');
                addCourseCardListeners();
            } else {
                coursesList.innerHTML = `<p>${getTranslation('noCourses')}</p>`;
                }
            
        // Reviews
        const reviewsList = document.querySelector('#reviews-list');
        const reviews = teacher.reviews || [];
        reviewsList.innerHTML = reviews.length > 0
            ? reviews.map(review => `
                <div class="review">
                    <p class="p-1">${review.student_name || 'Anonymous'}</p>
                    <p class="p-2">${review.comment || 'No comment'}</p>
                    <div class="rating">Rating: ${'★'.repeat(Math.min(5, Math.max(0, review.rating)))}${'☆'.repeat(5-Math.min(5, Math.max(0, review.rating)))}</div>
                    <p class="date">${new Date(review.created_at).toLocaleDateString()}</p>
                </div>
            `).join('')
                : '<p>No reviews available</p>';  
            
            console.log('Reviews HTML:', reviewsList.innerHTML);
        }
        

 
        const userId = getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found');
        }

        const response = await fetch(`/auth/profile/teacher/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        const teacher = await response.json();
        displayTeacherData(teacher);
        initializeShowMore();
        initializeViewAllButtons();

    } catch (error) {
        console.error('Profile loading error:', error);
        document.querySelector('.profile').innerHTML = `
            <div class="error-message">
                <p>Unable to load profile. Please try again later.</p>
            </div>`;
    }
});