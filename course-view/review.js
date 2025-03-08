document.addEventListener('DOMContentLoaded', function() {
    function setupTabsContainer() {
        const tabs = document.querySelector('.tabs');
        if (!tabs) return;
        if (!document.querySelector('.tabs-container')) {
            const tabsContainer = document.createElement('div');
            tabsContainer.className = 'tabs-container';
            
            // Add tabs to container immediately
            const tabsParent = tabs.parentNode;
            tabsParent.insertBefore(tabsContainer, tabs);
            tabsContainer.appendChild(tabs);
            
            // Check if we're on a course page
            const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
            if (!courseId) return;
            
            // Get the current user ID
            const currentUserId = localStorage.getItem('userId');
            if (!currentUserId) return;
            
            // Fetch the course author directly from the database
            fetch(`/api/course-author/${courseId}`)
            .then(response => {
                if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json(); // Parse JSON only if status is OK
            })
            .then(data => {
                // Only create the review button if the user is not the author
                if (data.author_id.toString() !== currentUserId.toString()) {
                    const reviewButton = document.createElement('button');
                    reviewButton.className = 'nav-review-button';
                    reviewButton.textContent = 'Submit review';
                    reviewButton.onclick = showReviewPopup;
                    tabsContainer.appendChild(reviewButton);
                }
            })
            .catch(error => {
                console.error('Error checking course author:', error);
                // You could show a user-friendly message on the UI here
            });
 
        }
    }
    // Function to check if the current user is the author of the course
    async function checkIfCurrentUserIsAuthor(userId, courseId) {
        if (!userId || !courseId) return false;
        
        try {
            // First check in localStorage cache if available
            const authorIdKey = `course_${courseId}_author_id`;
            const cachedAuthorId = localStorage.getItem(authorIdKey);
            
            if (cachedAuthorId) {
                return cachedAuthorId === userId;
            }
            
            // If not in cache, fetch course author information from a dedicated endpoint
            const response = await fetch(`/api/course/${courseId}/author`);
            if (!response.ok) return false;
            
            const authorData = await response.json();
            const authorId = authorData.author_id;
            
            // Cache the author ID for future use
            localStorage.setItem(authorIdKey, authorId);
            
            return authorId.toString() === userId.toString();
        } catch (error) {
            console.error('Error checking if user is author:', error);
            return false;
        }
    }
    async function showReviewButtonIfNotAuthor() {
        const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
        const currentUserId = localStorage.getItem('userId');
        
        if (!courseId || !currentUserId) return;
        
        try {
            const response = await fetch(`/api/course-author/${courseId}`);
            const data = await response.json();
            
            // Only add the review button if the user is not the author
            if (data.author_id.toString() !== currentUserId.toString()) {
                const tabsContainer = document.querySelector('.tabs-container');
                if (tabsContainer && !tabsContainer.querySelector('.nav-review-button')) {
                    const reviewButton = document.createElement('button');
                    reviewButton.className = 'nav-review-button';
                    reviewButton.textContent = 'Submit review';
                    reviewButton.onclick = showReviewPopup;
                    tabsContainer.appendChild(reviewButton);
                }
            }
        } catch (error) {
            console.error('Error checking course author:', error);
        }
    }
    
    // Call this function on page load
    showReviewButtonIfNotAuthor();
    function createReviewPopup() {
        const overlay = document.createElement('div');
        overlay.className = 'review-popup-overlay';
        overlay.id = 'reviewPopupOverlay';
        const popup = document.createElement('div');
        popup.className = 'review-popup';
        const closeButton = document.createElement('div');
        closeButton.className = 'close-button';
        closeButton.id = 'closeReviewBtn';
        closeButton.innerHTML = '<div class="close-line"></div><div class="close-line"></div>';
        
        const content = document.createElement('div');
        content.className = 'review-content';
        content.innerHTML = '<h2>Tell others about<br>your experience with the course!</h2>';
        
        const ratingSection = document.createElement('div');
        ratingSection.className = 'rating-section';
        ratingSection.innerHTML = '<p class="rating-label">Your rate:</p>';
        
        const ratingButtons = document.createElement('div');
        ratingButtons.className = 'rating-buttons';
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'rating-btn';
            btn.setAttribute('data-rating', i);
            btn.textContent = i + '/5';
            ratingButtons.appendChild(btn);
        }
        ratingSection.appendChild(ratingButtons);

        const textContainer = document.createElement('div');
        textContainer.className = 'review-text-container';
        textContainer.innerHTML = '<textarea id="reviewText" placeholder="Write a review..."></textarea>';
        
        const submitContainer = document.createElement('div');
        submitContainer.className = 'submit-container';
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitReviewBtn';
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Submit review';
        submitContainer.appendChild(submitBtn);
        
        content.appendChild(ratingSection);
        content.appendChild(textContainer);
        content.appendChild(submitContainer);
        popup.appendChild(closeButton);
        popup.appendChild(content);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        overlay.style.display = 'none';
        setupEventListeners();
    }

    function setupEventListeners() {
        document.getElementById('closeReviewBtn').addEventListener('click', closeReviewPopup);
        document.getElementById('reviewPopupOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeReviewPopup();
        });
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    }

    async function submitReview() {
        const selectedRating = document.querySelector('.rating-btn.selected');
        const ratingValue = selectedRating ? selectedRating.dataset.rating : null;
        const reviewText = document.getElementById('reviewText').value;
        const userId = localStorage.getItem('userId');
        const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
    
        if (!ratingValue) {
            alert('Please select a rating');
            return;
        }
        if (!userId) {
            alert('User not logged in');
            return;
        }
        if (!courseId) {
            alert('Course ID not found');
            return;
        }
        if (!reviewText.trim()) {
            alert('Please write a review');
            return;
        }
    
        console.log('Submitting review with:', { courseId, userId, ratingValue, reviewText });
    
        try {
            // First save/update in localStorage
            saveReviewToLocalStorage(userId, courseId, ratingValue, reviewText);
            
            // Then send to backend
            await saveReviewToDatabase(userId, courseId, ratingValue, reviewText);
            
            closeReviewPopup();
            
            // Refresh reviews display if applicable
            if (typeof displayReviews === 'function') {
                displayReviews();
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again later.');
        }
    }
    
    // Function to save review to localStorage
    function saveReviewToLocalStorage(userId, courseId, rating, reviewText) {
        // Get existing reviews from localStorage
        let reviews = JSON.parse(localStorage.getItem('courseReviews')) || [];
        
        // Check if user already has a review for this course
        const existingReviewIndex = reviews.findIndex(r => 
            r.userId === userId && r.courseId === courseId
        );
        
        const now = new Date().toISOString();
        
        if (existingReviewIndex >= 0) {
            // Update existing review
            reviews[existingReviewIndex] = {
                ...reviews[existingReviewIndex],
                rating: rating,
                reviewText: reviewText,
                updatedAt: now
            };
        } else {
            // Add new review
            reviews.push({
                id: Date.now().toString(),
                userId: userId,
                courseId: courseId,
                rating: rating,
                reviewText: reviewText,
                createdAt: now,
                updatedAt: now
            });
        }
        
        // Save updated reviews to localStorage
        localStorage.setItem('courseReviews', JSON.stringify(reviews));
        console.log('Review saved to localStorage');
    }
    
    // Function to save review to database via API
    async function saveReviewToDatabase(userId, courseId, rating, reviewText) {
        try {
            const response = await fetch(`/api/course/${courseId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: userId, 
                    rating: rating, 
                    review: reviewText 
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Review saved to database:', data);
            alert(data.message || 'Review submitted successfully!');
            return data;
        } catch (error) {
            console.error('Error saving to database:', error);
            throw error;
        }
    }

    function checkExistingReview() {
        const userId = localStorage.getItem('userId');
        const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
        
        if (!userId || !courseId) return;
        
        try {
            // Get reviews from localStorage
            const reviews = JSON.parse(localStorage.getItem('courseReviews')) || [];
            
            // Find user's review for this course
            const userReview = reviews.find(r => 
                r.userId === userId && r.courseId === courseId
            );
            
            if (userReview) {
                // Pre-fill the form with existing review data
                document.getElementById('reviewText').value = userReview.reviewText;
                
                // Select the appropriate rating button
                const ratingBtn = document.querySelector(`.rating-btn[data-rating="${userReview.rating}"]`);
                if (ratingBtn) {
                    document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
                    ratingBtn.classList.add('selected');
                }
                
                // Update submit button text to indicate editing
                document.getElementById('submitReviewBtn').textContent = 'Update review';
            }
        } catch (error) {
            console.error('Error checking existing review:', error);
        }
    }
    
    function openReviewPopup() {
        document.getElementById('reviewPopupOverlay').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        checkExistingReview(); // Check for existing review when opening popup
    }
    
    function closeReviewPopup() {
        document.getElementById('reviewPopupOverlay').style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset form for next use
        document.getElementById('reviewText').value = '';
        document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('submitReviewBtn').textContent = 'Submit review';
    }

    // Function to display all reviews from localStorage
    window.displayReviews = function() {
        const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
        const reviewsContainer = document.querySelector('.course-reviews');
        if (!reviewsContainer || !courseId) return;
        
        const reviews = JSON.parse(localStorage.getItem('courseReviews')) || [];
        const courseReviews = reviews.filter(r => r.courseId === courseId);
        
        if (courseReviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review this course!</p>';
            return;
        }
        
        // Sort reviews by date (newest first)
        courseReviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        let reviewsHTML = '';
        courseReviews.forEach(review => {
            // You could fetch user details from another localStorage item if needed
            const userName = `User ${review.userId}`; // Placeholder
            
            reviewsHTML += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user">${userName}</span>
                        <span class="review-rating">${review.rating}/5</span>
                        <span class="review-date">${new Date(review.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="review-text">${review.reviewText}</div>
                </div>
            `;
        });
        
        reviewsContainer.innerHTML = reviewsHTML;
    };

    // Function to fetch initial reviews from server and save to localStorage (optional)
    async function fetchInitialReviews() {
        const courseId = document.body.dataset.courseId || window.location.pathname.split('/')[2];
        if (!courseId) return;
        
        try {
            const response = await fetch(`/api/course/${courseId}/reviews`);
            if (!response.ok) return;
            
            const data = await response.json();
            if (!data.reviews || !data.reviews.length) return;
            
            // Convert server reviews to localStorage format and merge with existing
            let localReviews = JSON.parse(localStorage.getItem('courseReviews')) || [];
            
            data.reviews.forEach(serverReview => {
                // Check if review already exists in localStorage
                const existingIndex = localReviews.findIndex(r => 
                    r.userId === serverReview.user_id.toString() && 
                    r.courseId === courseId
                );
                
                if (existingIndex >= 0) {
                    // If server review is newer, update local
                    const serverDate = new Date(serverReview.updated_at || serverReview.created_at);
                    const localDate = new Date(localReviews[existingIndex].updatedAt);
                    
                    if (serverDate > localDate) {
                        localReviews[existingIndex] = {
                            id: serverReview.id.toString(),
                            userId: serverReview.user_id.toString(),
                            courseId: courseId,
                            rating: serverReview.rating.toString(),
                            reviewText: serverReview.review_text,
                            createdAt: serverReview.created_at,
                            updatedAt: serverReview.updated_at || serverReview.created_at
                        };
                    }
                } else {
                    // Add server review to localStorage
                    localReviews.push({
                        id: serverReview.id.toString(),
                        userId: serverReview.user_id.toString(),
                        courseId: courseId,
                        rating: serverReview.rating.toString(),
                        reviewText: serverReview.review_text,
                        createdAt: serverReview.created_at,
                        updatedAt: serverReview.updated_at || serverReview.created_at
                    });
                }
            });
            
            localStorage.setItem('courseReviews', JSON.stringify(localReviews));
            displayReviews();
        } catch (error) {
            console.error('Error fetching initial reviews:', error);
        }
    }

    setupTabsContainer();
    createReviewPopup();
    window.showReviewPopup = openReviewPopup;
    
    // Initial setup
    fetchInitialReviews();
    
    // Display reviews on page load if container exists
    if (document.querySelector('.course-reviews')) {
        displayReviews();
    }
});