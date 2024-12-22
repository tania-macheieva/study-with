document.addEventListener("DOMContentLoaded", function() {
  const coursesData = [
    { name: "Programming 101", description: "Intro to programming", price: 99, themes: ["Programming"], level: "level-basic", popularity: 120 },
    { name: "Advanced Design", description: "Learn advanced design techniques", price: 199, themes: ["Design"], level: "level-intermediate", popularity: 85 },
    { name: "Marketing Mastery", description: "Master marketing skills", price: 149, themes: ["Marketing"], level: "level-advanced", popularity: 95 },
    { name: "Data Science", description: "Learn the basics of data science", price: 129, themes: ["Data Science"], level: "level-basic", popularity: 100 },
    { name: "UX/UI Design", description: "Learn UX/UI design principles", price: 179, themes: ["Design"], level: "level-intermediate", popularity: 150 },
    { name: "Business Analytics", description: "Understand business analytics", price: 149, themes: ["Business"], level: "level-intermediate", popularity: 110 },
    { name: "Machine Learning", description: "Introduction to machine learning", price: 249, themes: ["Machine Learning"], level: "level-advanced", popularity: 200 },
    { name: "Creative Writing", description: "Learn the art of creative writing", price: 89, themes: ["Writing"], level: "level-basic", popularity: 80 },
    { name: "Web Development", description: "Become a web developer", price: 199, themes: ["Web Development"], level: "level-basic", popularity: 220 },
    { name: "Python Programming", description: "Learn Python programming language", price: 129, themes: ["Programming"], level: "level-basic", popularity: 300 },
    { name: "Advanced SEO", description: "Master SEO strategies", price: 159, themes: ["Marketing"], level: "level-intermediate", popularity: 130 },
    { name: "Digital Marketing", description: "Master digital marketing strategies", price: 199, themes: ["Marketing"], level: "level-basic", popularity: 160 }
  ];

  let displayedCourses = 6; 

  const sortCourses = () => {
    const selectedSort = document.querySelector(".dropdown").value;
    let sortedCourses = [...coursesData];
    
    if (selectedSort === "option1") {
      sortedCourses = sortedCourses.sort((a, b) => a.price - b.price); 
    } else if (selectedSort === "option2") {
      sortedCourses = sortedCourses.sort((a, b) => b.popularity - a.popularity); 
    }

    renderCourses(sortedCourses.slice(0, displayedCourses)); 
  };

  const renderCourses = (courses) => {
    const coursesContainer = document.querySelector(".courses");
    coursesContainer.innerHTML = ""; 
    
    if (courses.length === 0) {
      coursesContainer.innerHTML = "<p>No courses found</p>"; 
      return;
    }
    
    courses.forEach(course => {
      const courseHTML = `
        <div class="course_group">
          <img class="rectangle-1" />
          <div class="rectangle-2"></div>
          <div class="course_name">${course.name}</div>
          <div class="description">${course.description}</div>
          <div class="group-27">
            <div class="price">$${course.price}</div>
            <img class="arrow" src="/images/right-arrow.png" alt="Arrow Icon" />
          </div>
        </div>
      `;
      coursesContainer.insertAdjacentHTML("beforeend", courseHTML);
    });
  };

  document.querySelector(".dropdown").addEventListener("change", sortCourses);

  document.querySelector(".more-btn").addEventListener("click", function() {
    displayedCourses += 6; 
    sortCourses(); 
  });

  renderCourses(coursesData.slice(0, displayedCourses));

  displayedCourses = 6; 
  sortCourses(); 
});
