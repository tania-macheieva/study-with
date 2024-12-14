document.addEventListener("DOMContentLoaded", function() {
    const clearButton = document.querySelector(".filters-clear");  
    const checkboxes = document.querySelectorAll(".checkbox input");  

    clearButton.addEventListener("click", function() {
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;  
      });
    });
  });
  
