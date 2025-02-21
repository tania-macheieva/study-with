const userRole = localStorage.getItem('role');

const teacherContent = document.querySelectorAll('.teacher-content');
const studentContent = document.querySelectorAll('.student-content');

function showContentBasedOnRole() {
  if (userRole === 'teacher') {
    teacherContent.forEach(item => item.removeAttribute('hidden')); 
  } else if (userRole === 'student') {
    studentContent.forEach(item => item.removeAttribute('hidden'));
}
}

document.addEventListener('DOMContentLoaded', showContentBasedOnRole);
