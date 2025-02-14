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
              <img class="arrow" src="../images/right-arrow.png" alt="" />
            </div>
            <div class="rectangle-23"></div>
          </div>
        `;
        coursesContainer.insertAdjacentHTML("beforeend", courseHTML);
      }
    }
    });


document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".home_button");
  
  if (startButton) {
    startButton.addEventListener("click", async (e) => {
      e.preventDefault(); 
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/register';
          return;
        }

        const response = await fetch('/auth/auth-check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          window.location.href = '/all-courses';
        } else {
          window.location.href = '/register';
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/register';
      }
    });
  }
});

