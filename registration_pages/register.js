document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('student-register-form');
    if (studentForm) {
        studentForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(studentForm);
            const data = Object.fromEntries(formData.entries());
            console.log('Form data:', data);

            try {
                const response = await fetch('http://localhost:8000/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    // Зберігаємо email в localStorage перед переходом
                    localStorage.setItem('userEmail', data.email);
                    window.location.href = '/confirm-email';
                    studentForm.reset();
                } else {
                    alert(result.error || 'An error occurred during registration.');
                }
            } catch (error) {
                alert('Failed to connect to the server. Please try again later.');
                console.error('Error during fetch:', error);
            }
        });
    }

    const teacherForm = document.getElementById('teacher-register-form');
    if (teacherForm) {
        teacherForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(teacherForm);
            const data = Object.fromEntries(formData.entries());
            console.log('Form data:', data);

            try {
                const response = await fetch('http://localhost:8000/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    // Зберігаємо email в localStorage перед переходом
                    localStorage.setItem('userEmail', data.email);
                    window.location.href = '/confirm-email';
                    teacherForm.reset();
                } else {
                    alert(result.error || 'An error occurred during registration.');
                }
            } catch (error) {
                alert('Failed to connect to the server. Please try again later.');
                console.error('Error during fetch:', error);
            }
        });
    }
});