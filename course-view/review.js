document.addEventListener('DOMContentLoaded', function() {
    function setupTabsContainer() {
        const tabs = document.querySelector('.tabs');
        if (!tabs) return;
        if (!document.querySelector('.tabs-container')) {
            const tabsContainer = document.createElement('div');
            tabsContainer.className = 'tabs-container';
            const reviewButton = document.createElement('button');
            reviewButton.className = 'nav-review-button';
            reviewButton.textContent = 'Submit review';
            reviewButton.onclick = showReviewPopup;
            const tabsParent = tabs.parentNode;
            tabsParent.insertBefore(tabsContainer, tabs);
            tabsContainer.appendChild(tabs);
            tabsContainer.appendChild(reviewButton);
        }
    }

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
    
        console.log('Submitting review with:', { courseId, userId, ratingValue, reviewText });
    
        try {
            // Updated API endpoint path with /api prefix
            const response = await fetch(`/api/course/${courseId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, rating: ratingValue, review: reviewText })
            });
    
            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const textResponse = await response.text();
                console.error('Non-JSON response:', textResponse);
                throw new Error('Server returned non-JSON response');
            }
    
            if (response.ok) {
                alert('Thank you for your review!');
                closeReviewPopup();
            } else {
                alert('Error submitting review: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again later.');
        }
    }
    function openReviewPopup() {
        document.getElementById('reviewPopupOverlay').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeReviewPopup() {
        document.getElementById('reviewPopupOverlay').style.display = 'none';
        document.body.style.overflow = '';
    }

    setupTabsContainer();
    createReviewPopup();
    window.showReviewPopup = openReviewPopup;
});
