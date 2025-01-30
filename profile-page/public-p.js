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

        function initializeShowMore() {
            const aboutMe = document.getElementById("about-me");
            const showMore = document.getElementById("show-more");

            const checkAboutMeHeight = () => {
                const fullHeight = aboutMe.scrollHeight;
                const visibleHeight = aboutMe.offsetHeight;
                if (fullHeight <= visibleHeight) {
                    showMore.style.display = "none";
                } else {
                    showMore.style.display = "inline-block";
                }
            };

            checkAboutMeHeight();
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
                const items = Array.from(container.children);
                const button = document.querySelector(buttonSelector);

                if (items.length <= maxVisible) {
                    button.style.display = "none";
                    return;
                }

                items.forEach((item, index) => {
                    if (index >= maxVisible) {
                        item.style.display = "none";
                        item.classList.add("hidden-item");
                    }
                });

                button.addEventListener("click", () => {
                    const hiddenItems = items.filter(item => item.classList.contains("hidden-item"));
                    hiddenItems.forEach(item => {
                        item.style.display = item.style.display === "none" ? "block" : "none";
                    });

                    const isAnyHidden = hiddenItems.some(item => item.style.display === "none");
                    button.textContent = isAnyHidden ? getTranslation('viewAll') : getTranslation('viewLess');
                });
            }

            limitVisibleItems(".courses-list", 3, ".btn-view-all-1");
            limitVisibleItems(".reviews-list", 3, ".btn-view-all-2");
        }

        function displayTeacherData(teacher) {
            // Handle profile image
            const avatarImg = document.querySelector('#profile-image');
            if (teacher.profile_image) {
                // If profile_image starts with '/', it's a local path
                if (teacher.profile_image.startsWith('/')) {
                    avatarImg.src = teacher.profile_image;
                } else {
                    // If it's a full URL
                    avatarImg.src = teacher.profile_image;
                }
            } else if (teacher.certificates) {
                // Use certificates as fallback if it's a base64 image
                avatarImg.src = `data:image/jpeg;base64,${teacher.certificates}`;
            } else {
                // Default image as last resort
                avatarImg.src = '/images/profile-picture.png';
            }

            // Basic information
            document.querySelector('#user-nickname').textContent = teacher.nickname || 'Username';
            document.querySelector('#real-name').textContent = teacher.real_name || 'Full Name';
            document.querySelector('#about-me').textContent = teacher.about || 'No information available';

            // Hobbies
            const hobbiesList = document.querySelector('#hobbies-list');
            hobbiesList.innerHTML = teacher.hobbies && typeof teacher.hobbies === 'string'
                ? teacher.hobbies.split(',').map(hobby => `<li>${hobby.trim()}</li>`).join('')
                : '<li>No hobbies listed</li>';

            // Languages
            const languagesList = document.querySelector('#languages-list');
            languagesList.innerHTML = teacher.language && typeof teacher.language === 'string'
                ? teacher.language.split(',').map(language => `<li>${language.trim()}</li>`).join('')
                : '<li>No languages listed</li>';

            // Education
            const educationList = document.querySelector('#education-list');
            educationList.innerHTML = teacher.education && typeof teacher.education === 'string'
                ? teacher.education.split('\n').map(e => `<li>${e.trim()}</li>`).join('')
                : '<li>No education listed</li>';

            // Experience
            const experienceList = document.querySelector('#experience-list');
            experienceList.innerHTML = teacher.experience && typeof teacher.experience === 'string'
                ? teacher.experience.split('\n').map(e => `<li>${e.trim()}</li>`).join('')
                : '<li>No experience listed</li>';

            // Reviews
            const reviewsList = document.querySelector('#reviews-list');
            reviewsList.innerHTML = Array.isArray(teacher.reviews) && teacher.reviews.length
                ? teacher.reviews.map(review => `
                    <div class="review">
                        <p class="p-1">${review.student_name || 'Anonymous'}</p>
                        <p class="p-2">${review.comment || 'No comment'}</p>
                        <div class="rating">Rating: ${'★'.repeat(Math.min(5, Math.max(0, review.rating)))}${'☆'.repeat(5-Math.min(5, Math.max(0, review.rating)))}</div>
                        <p class="date">${new Date(review.created_at).toLocaleDateString('en-US')}</p>
                    </div>
                `).join('')
                : '<p>No reviews available</p>';

            // Courses
            const coursesList = document.querySelector('#courses-list');
            coursesList.innerHTML = Array.isArray(teacher.courses) && teacher.courses.length
                ? teacher.courses.map(course => `
                    <div class="course">
                        <p class="p-1">${course.title || 'Untitled Course'}</p>
                        <p class="p-2">${course.description || 'No description available'}</p>
                        <img src="/images/250x100.png" alt="Course image">
                        <button class="btn-resume">Learn More</button>
                    </div>
                `).join('')
                : '<p>No courses available</p>';
        }

        // Main execution
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