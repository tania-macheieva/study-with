// Приклад для додавання нових коментарів в кінець списку
function addNewComment() {
    const feedbackContainer = document.querySelector('.Feedback_inner');
    
    // Створення нового коментаря
    const newComment = document.createElement('div');
    newComment.classList.add('Feedback_list');
    newComment.innerHTML = `
      <img src="user-avatar.png" alt="user-photo" class="Feed_photo">
      <div class="Feed_name_container">
        <h2 class="Feed_name">New Name</h2>
        <h3 class="Feed_comm">New Comment</h3>
      </div>
    `;
    
    // Додавання нового коментаря в кінець
    feedbackContainer.appendChild(newComment);
  }
  
  // Викликати функцію кожні 5 секунд, щоб додавати нові коментарі
  setInterval(addNewComment, 5000);
  