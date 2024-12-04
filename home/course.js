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
            <div class="course_name">Course name</div>
            <div class="description">
              Here should be the course description here should be the course description
            </div>
            <div class="group-27">
              <div class="price">$</div>
              <img class="arrow" src="right-arrow.png" alt="Arrow Icon" />
            </div>
            <div class="rectangle-23"></div>
          </div>
        `;
        coursesContainer.insertAdjacentHTML("beforeend", courseHTML);
      }
    }
  });
  