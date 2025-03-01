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
            const oldButton = document.querySelector('button[onclick="showReviewPopup()"]');
            if (oldButton && oldButton !== reviewButton) {
                oldButton.remove();
            }
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
        const closeLine1 = document.createElement('div');
        closeLine1.className = 'close-line';
        const closeLine2 = document.createElement('div');
        closeLine2.className = 'close-line';
        closeButton.appendChild(closeLine1);
        closeButton.appendChild(closeLine2);
        const content = document.createElement('div');
        content.className = 'review-content';
        const title = document.createElement('h2');
        title.innerHTML = 'Tell others about<br>your experience with the course!';
 
        const ratingSection = document.createElement('div');
        ratingSection.className = 'rating-section';
        const ratingLabel = document.createElement('p');
        ratingLabel.className = 'rating-label';
        ratingLabel.textContent = 'Your rate:';
        const ratingButtons = document.createElement('div');
        ratingButtons.className = 'rating-buttons';
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'rating-btn';
            btn.setAttribute('data-rating', i);
            btn.textContent = i + '/5';
            ratingButtons.appendChild(btn);
        }
        ratingSection.appendChild(ratingLabel);
        ratingSection.appendChild(ratingButtons);
        const textContainer = document.createElement('div');
        textContainer.className = 'review-text-container';
        const textarea = document.createElement('textarea');
        textarea.id = 'reviewText';
        textarea.placeholder = 'Write a review...';
        textContainer.appendChild(textarea);
        const submitContainer = document.createElement('div');
        submitContainer.className = 'submit-container';
        
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitReviewBtn';
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Submit review';
        submitContainer.appendChild(submitBtn);
        content.appendChild(title);
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
        const overlay = document.getElementById('reviewPopupOverlay');
        const closeBtn = document.getElementById('closeReviewBtn');
        const ratingBtns = document.querySelectorAll('.rating-btn');
        const submitBtn = document.getElementById('submitReviewBtn');
        closeBtn.addEventListener('click', closeReviewPopup);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeReviewPopup();
            }
        });
        ratingBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                ratingBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        submitBtn.addEventListener('click', function() {
            const selectedRating = document.querySelector('.rating-btn.selected');
            const ratingValue = selectedRating ? selectedRating.dataset.rating : null;
            const reviewText = document.getElementById('reviewText').value;
            if (!ratingValue) {
                alert('Please select a rating');
                return;
            }
            console.log('Rating:', ratingValue);
            console.log('Review:', reviewText);
            closeReviewPopup();
            alert('Thank you for your review!');
        });
    }

    function openReviewPopup() {
        const overlay = document.getElementById('reviewPopupOverlay');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeReviewPopup() {
        const overlay = document.getElementById('reviewPopupOverlay');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    setupTabsContainer();
    createReviewPopup();
    window.openReviewPopup = openReviewPopup;
    window.closeReviewPopup = closeReviewPopup;
    window.showReviewPopup = openReviewPopup;
});