document.addEventListener("DOMContentLoaded", async function () {
  // Find the courses container
  const coursesElement = document.querySelector(".courses");
  if (!coursesElement) {
    console.error("Courses container not found");
    return;
  }

  // Create carousel structure
  const outerContainer = document.createElement("div");
  outerContainer.className = "carousel-outer-container";

  // Create "Popular courses" title
  const popularSection = document.createElement("div");
  popularSection.className = "popular-courses-section";

  const popularTitle = document.createElement("h2");
  popularTitle.className = "popular_text";
  popularTitle.setAttribute("data-lang", "popularText");
  popularTitle.textContent =
    translations[localStorage.getItem("language") || "en"].popularText;

  popularSection.appendChild(popularTitle);

  // Get parent element of coursesElement
  const coursesParent = coursesElement.parentNode;

  // Create wrapper for courses
  const coursesWrapper = document.createElement("div");
  coursesWrapper.className = "courses-wrapper";
  coursesWrapper.style.display = "flex";
  coursesWrapper.style.transition = "transform 0.3s ease";
  coursesWrapper.style.gap = "24px";
  // Add right margin to ensure proper alignment
  coursesWrapper.style.marginRight = "24px";

  // Move existing courses to wrapper
  while (coursesElement.firstChild) {
    coursesWrapper.appendChild(coursesElement.firstChild);
  }

  // Add wrapper to courses container
  coursesElement.appendChild(coursesWrapper);

  // Create navigation buttons
  const prevBtn = document.createElement("button");
  prevBtn.className = "carousel-btn prev-btn";
  prevBtn.innerHTML = '<img src="../images/arrow.svg">';

  const nextBtn = document.createElement("button");
  nextBtn.className = "carousel-btn next-btn";
  nextBtn.innerHTML = '<img src="../images/arrow.svg">';
  nextBtn.style.transform = "translateY(-50%) rotate(180deg)";

  // Organize structure
  coursesParent.replaceChild(outerContainer, coursesElement);
  outerContainer.appendChild(popularSection);
  outerContainer.appendChild(coursesElement);
  outerContainer.appendChild(prevBtn);
  outerContainer.appendChild(nextBtn);

  // Variables for carousel
  let position = 0;
  let visibleCourses = 0;
  let totalCourses = 0;
  let courseWidth = 0;
  let gap = 24; // Default value that will be updated

  // Function to update carousel state
  function updateCarousel() {
    const courseElements = coursesWrapper.querySelectorAll(".course_group");
    if (courseElements.length === 0) return;

    totalCourses = courseElements.length;

    // Get width of a single course
    courseWidth = courseElements[0].offsetWidth;

    // Get computed style to determine exact gap value
    const computedStyle = window.getComputedStyle(coursesWrapper);
    gap = parseInt(computedStyle.getPropertyValue("gap")) || 24;

    const containerWidth = coursesElement.clientWidth;

    // Calculate number of visible courses
    visibleCourses = Math.floor(containerWidth / (courseWidth + gap));
    if (visibleCourses <= 0) visibleCourses = 1; // Ensure at least one course is visible

    // Calculate maximum position
    const maxPosition = Math.max(0, totalCourses - visibleCourses);

    // Ensure position doesn't exceed maximum
    if (position > maxPosition) {
      position = maxPosition;
    }

    updatePosition();

    // Show/hide navigation buttons depending on number of courses
    if (totalCourses <= visibleCourses) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } else {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";

      // Update button states
      prevBtn.style.opacity = position > 0 ? "1" : "0.5";
      nextBtn.style.opacity = position < maxPosition ? "1" : "0.5";
    }
  }

  // Update carousel position
  function updatePosition() {
    const courseElements = coursesWrapper.querySelectorAll(".course_group");
    if (courseElements.length === 0) return;

    // Calculate offset
    let offsetX = position * (courseWidth + gap);
    
    // FIXED: Adjust the final position to ensure the last item appears at the edge
    const maxPosition = Math.max(0, totalCourses - visibleCourses);
    if (position === maxPosition && totalCourses > visibleCourses) {
      // Calculate the total content width
      const totalContentWidth = totalCourses * courseWidth + (totalCourses - 1) * gap;
      // Calculate the container width
      const containerWidth = coursesElement.clientWidth;
      // Set the offset to align the last item with the right edge
      offsetX = totalContentWidth - containerWidth;
      
      // Add extra offset for the right margin
      const marginRight = parseInt(window.getComputedStyle(coursesWrapper).marginRight) || 24;
      offsetX += marginRight;
    }

    // Apply transformation
    coursesWrapper.style.transform = `translateX(-${offsetX}px)`;

    // Update button states
    prevBtn.style.opacity = position > 0 ? "1" : "0.5";
    nextBtn.style.opacity = position < maxPosition ? "1" : "0.5";
  }

  // Event handlers for navigation
  prevBtn.addEventListener("click", function () {
    if (position > 0) {
      position--;
      updatePosition();
    }
  });

  nextBtn.addEventListener("click", function () {
    const maxPosition = Math.max(0, totalCourses - visibleCourses);
    if (position < maxPosition) {
      position++;
      updatePosition();
    }
  });

  // Update carousel on window resize
  window.addEventListener("resize", updateCarousel);

  // Load courses from API
  async function loadCourses() {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const courses = await response.json();

      // Clear wrapper
      coursesWrapper.innerHTML = "";

      // Add courses from API
      courses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.className = "course_group";

        courseElement.innerHTML = `
          <div class="course_name">${course.name}</div>
          <div class="description">${course.description
            .split(" ")
            .slice(0, 10)
            .join(" ")}...</div>
          <div class="course-image">
            <img src="/uploads/${course.image_url || "images/250x100.png"}" 
                alt="${course.name}" 
                onerror="this.src='/images/250x100.png'" />
          </div>
          <div class="price">${
            course.price === 0 ? "Free →" : `$${course.price} →`
          }</div>
        `;

        // Add click handler to navigate to course
        courseElement.style.cursor = "pointer";
        courseElement.addEventListener("click", () => {
          window.location.href = `/course-preview?id=${course.id}`;
        });

        coursesWrapper.appendChild(courseElement);
      });

      // Update carousel after loading
      setTimeout(updateCarousel, 200);
    } catch (error) {
      console.error("Error loading courses:", error);
      coursesWrapper.innerHTML = "<p>Помилка завантаження курсів.</p>";
    }
  }

  // Load courses
  loadCourses();
});