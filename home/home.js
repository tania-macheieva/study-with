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

  // Create wrapper for courses with all styles in one batch
  const coursesWrapper = document.createElement("div");
  coursesWrapper.className = "courses-wrapper";
  Object.assign(coursesWrapper.style, {
    display: "flex",
    transition: "transform 0.3s ease",
    gap: "24px",
    marginRight: "24px"
  });

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
  let isUpdating = false; // Flag to prevent concurrent updates

  // Function to update carousel state with optimizations
  function updateCarousel() {
    if (isUpdating) return; // Prevent concurrent updates
    isUpdating = true;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      const courseElements = coursesWrapper.querySelectorAll(".course_group");
      if (courseElements.length === 0) {
        isUpdating = false;
        return;
      }

      totalCourses = courseElements.length;

      // Get width of a single course
      courseWidth = courseElements[0].offsetWidth;

      // Get computed style once to determine exact gap value
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
      const shouldShowButtons = totalCourses > visibleCourses;
      prevBtn.style.display = shouldShowButtons ? "flex" : "none";
      nextBtn.style.display = shouldShowButtons ? "flex" : "none";

      if (shouldShowButtons) {
        // Update button states
        prevBtn.style.opacity = position > 0 ? "1" : "0.5";
        nextBtn.style.opacity = position < maxPosition ? "1" : "0.5";
      }
      
      isUpdating = false;
    });
  }

  // Update carousel position with optimizations
  function updatePosition() {
    const courseElements = coursesWrapper.querySelectorAll(".course_group");
    if (courseElements.length === 0) return;

    // Calculate maxPosition only once
    const maxPosition = Math.max(0, totalCourses - visibleCourses);
    
    // Prepare transform value
    let offsetX;
    
    if (position === maxPosition && totalCourses > visibleCourses) {
      // Calculate the total content width
      const totalContentWidth =
        totalCourses * courseWidth + (totalCourses - 1) * gap;
      // Calculate the container width
      const containerWidth = coursesElement.clientWidth;
      // Set the offset to align the last item with the right edge
      offsetX = totalContentWidth - containerWidth;

      // Add extra offset for the right margin
      const marginRight =
        parseInt(window.getComputedStyle(coursesWrapper).marginRight) || 24;
      offsetX += marginRight;
    } else {
      // Regular position calculation
      offsetX = position * (courseWidth + gap);
    }

    // Apply transformation (use transform3d for hardware acceleration)
    coursesWrapper.style.transform = `translate3d(-${offsetX}px, 0, 0)`;

    // Update button states
    prevBtn.style.opacity = position > 0 ? "1" : "0.5";
    nextBtn.style.opacity = position < maxPosition ? "1" : "0.5";
  }

  // Debounce function to limit resize event handling
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Event handlers for navigation with throttling
  let isNavigating = false;
  
  prevBtn.addEventListener("click", function () {
    if (isNavigating || position <= 0) return;
    
    isNavigating = true;
    position--;
    updatePosition();
    
    // Allow next navigation after animation completes
    setTimeout(() => { isNavigating = false; }, 350);
  });

  nextBtn.addEventListener("click", function () {
    const maxPosition = Math.max(0, totalCourses - visibleCourses);
    if (isNavigating || position >= maxPosition) return;
    
    isNavigating = true;
    position++;
    updatePosition();
    
    // Allow next navigation after animation completes
    setTimeout(() => { isNavigating = false; }, 350);
  });

  // Update carousel on window resize with debouncing
  window.addEventListener("resize", debounce(updateCarousel, 150));

  // Load courses from API with optimizations
  async function loadCourses() {
    try {
      // Get the language from localStorage or default to "en"
      const lang = localStorage.getItem("language") || "en"; 
  
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const courses = await response.json();
  
      // Clear wrapper
      coursesWrapper.innerHTML = "";
      
      // Create document fragment for batch DOM operations
      const fragment = document.createDocumentFragment();
    
      // Define character limit for the description
      const descriptionCharLimit = 250;
      
      // Prepare all tooltip elements
      const tooltipContainers = [];
    
      // Add courses from API
      courses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.className = "course_group";

        // Create truncated description for the visible text
        const shortDescription = course.description
          .split(" ")
          .slice(0, 10)
          .join(" ");
          
        // Create truncated description for the tooltip
        const tooltipDescription = course.description.length > descriptionCharLimit 
          ? course.description.substring(0, descriptionCharLimit) + "..." 
          : course.description;
  
        courseElement.innerHTML = `
          <div class="course_name">${course.name}</div>
          <div class="description-container" style="position: relative;">
            <div class="description">${shortDescription}...</div>
            <div class="tooltip" style="display: none;">${tooltipDescription}</div>
          </div>
          <div class="course-image">
            <img src="/uploads/${course.image_url || "images/250x100.png"}" 
                alt="${course.name}" 
                loading="lazy"
                onerror="this.src='/images/250x100.png'" />
          </div>
          <div class="price">${
            course.price === 0 ? translations[lang].free : `$${course.price} →`
          }</div>
        `;
  
        // Add click handler to navigate to course
        courseElement.style.cursor = "pointer";
        courseElement.addEventListener("click", () => {
          window.location.href = `/course-preview?id=${course.id}`;
        });
        
        // Store reference to tooltip container
        tooltipContainers.push(courseElement.querySelector('.description-container'));
  
        fragment.appendChild(courseElement);
      });
      
      // Append all elements at once
      coursesWrapper.appendChild(fragment);
      
      // Add tooltip event listeners to all containers in a batch
      tooltipContainers.forEach(container => {
        const description = container.querySelector('.description');
        const tooltip = container.querySelector('.tooltip');
        
        description.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';
        });
    
        description.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
      });

      // Track when images are loaded
      let loadedImages = 0;
      const totalImages = courses.length;
      
      if (totalImages === 0) {
        // If no images to load, update carousel immediately
        updateCarousel();
      } else {
        // Find all course images
        const images = coursesWrapper.querySelectorAll('.course-image img');
        
        // Event listener for image load or error
        const imageLoadHandler = () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            // All images loaded (or failed), update carousel
            updateCarousel();
          }
        };
        
        // Add load and error handlers to all images
        images.forEach(img => {
          img.addEventListener('load', imageLoadHandler);
          img.addEventListener('error', imageLoadHandler);
          
          // If image is already loaded (from cache)
          if (img.complete) {
            imageLoadHandler();
          }
        });
        
        // Set a timeout as fallback if images don't load
        setTimeout(updateCarousel, 1000);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      coursesWrapper.innerHTML = "<p>Помилка завантаження курсів.</p>";
    }
  }
  
  // Initial load of courses
  loadCourses();
});

// Separate event listener for category boxes
document.addEventListener("DOMContentLoaded", function() {
  // Find all category boxes
  const categoryBoxes = document.querySelectorAll(".category_box");
  
  // Batch category box event listeners
  if (categoryBoxes.length > 0) {
    const categoryHandler = function() {
      const category = this.getAttribute("data-category");
      window.location.href = `/courses?category=${category}`;
    };
    
    // Add click event to each category box
    categoryBoxes.forEach(box => {
      box.addEventListener("click", categoryHandler);
    });
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
