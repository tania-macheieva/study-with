document.addEventListener("DOMContentLoaded", () => {
    const coursesContainer = document.querySelector(".courses");
  
    if (coursesContainer) {
      coursesContainer.innerHTML = "";
  
      const numCourses = 8; 
  
      for (let i = 0; i < numCourses; i++) {
        const courseHTML = `
          <div class="course_group">
            <img class="rectangle-1" src="" alt="" />
            <div class="rectangle-2"></div>
            <div class="course_name" data-lang="Name">Course name</div>
            <div class="description" data-lang="desc">
              Here should be the course description
            </div>
            <div class="group-27">
              <div class="price">$</div>
              <img class="arrow" src="right-arrow.png" alt="" />
            </div>
            <div class="rectangle-23"></div>
          </div>
        `;
        coursesContainer.insertAdjacentHTML("beforeend", courseHTML);
      }
    }
  });
  

  function addNewComments() {
    const feedbackContainer = document.querySelector('.Feedback_inner');
  
    for (let i = 0; i < 4; i++) {
      const newComment = document.createElement('div');
      newComment.classList.add('Feedback_list');
      newComment.innerHTML = `
        <img src="/images/user-avatar.png" alt="user-photo" class="Feed_photo">
        <div class="Feed_name_container">
          <h2 class="Feed_name" data-lang="commname">New Name ${i + 1}</h2>
          <h3 class="Feed_comm" data-lang="commtext">New Comment ${i + 1}</h3>
        </div>
      `;
      feedbackContainer.appendChild(newComment);
    }
  }
  
  function monitorLastComment() {
    const feedbackContainer = document.querySelector('.Feedback_inner');
    const feedbackWrapper = document.querySelector('.Feedback');
  
    function checkPosition() {
      const lastComment = feedbackContainer.lastElementChild;
  
      if (lastComment) {
        const lastCommentRect = lastComment.getBoundingClientRect();
        const wrapperRect = feedbackWrapper.getBoundingClientRect();
  
        if (lastCommentRect.left < wrapperRect.right) {
          addNewComments();
        }
      }
  
      requestAnimationFrame(checkPosition); 
    }
  
    checkPosition();
  }
  
  monitorLastComment();
  
  function setAnimationSpeed(speedInSeconds) {
    const feedbackInner = document.querySelector('.Feedback_inner');
    feedbackInner.style.animationDuration = `${speedInSeconds}s`;
  }
  
  setAnimationSpeed(1200); 
  
  document.addEventListener('DOMContentLoaded', () => {
    const feedbackInner = document.querySelector('.Feedback_inner');
  
    const parent = feedbackInner.parentElement;
    parent.removeChild(feedbackInner);
  
    setTimeout(() => {
      parent.appendChild(feedbackInner);
  
      feedbackInner.style.animation = 'slide-left 120s linear infinite';
    }, 0);
  });
  ;
  
  