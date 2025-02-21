const userRole = localStorage.getItem('role');

// Отримуємо всі елементи з відповідними класами
const teacherContent = document.querySelectorAll('.teacher-content');
const studentContent = document.querySelectorAll('.student-content');

function showContentBasedOnRole() {
  if (userRole === 'teacher') {
    teacherContent.forEach(item => item.removeAttribute('hidden')); 
  }
  if (userRole === 'student') {
    studentContent.forEach(item => item.removeAttribute('hidden'));
  }
}

document.addEventListener('DOMContentLoaded', showContentBasedOnRole);
