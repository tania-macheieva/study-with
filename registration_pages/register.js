// register.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Перевіряємо, що JavaScript завантажився

    const form = document.getElementById('student-register-form');
    if (!form) {
        console.error('Form with ID "student-register-form" not found');
        return;
    }

    console.log('Form found:', form); // Перевіряємо, чи форму знайдено

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submitted'); // Перевірка, чи подія submit спрацювала

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data:', data); // Перевірка зібраних даних

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log('Server response received'); // Перевірка відповіді від сервера
            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                form.reset();
            } else {
                alert(result.error || 'An error occurred during registration.');
            }
        } catch (error) {
            alert('Failed to connect to the server. Please try again later.');
            console.error('Error during fetch:', error);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Перевіряємо, що JavaScript завантажився

    const form = document.getElementById('teacher-register-form');
    if (!form) {
        console.error('Form with ID "student-register-form" not found');
        return;
    }

    console.log('Form found:', form); // Перевіряємо, чи форму знайдено

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submitted'); // Перевірка, чи подія submit спрацювала

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data:', data); // Перевірка зібраних даних

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log('Server response received'); // Перевірка відповіді від сервера
            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                form.reset();
            } else {
                alert(result.error || 'An error occurred during registration.');
            }
        } catch (error) {
            alert('Failed to connect to the server. Please try again later.');
            console.error('Error during fetch:', error);
        }
    });
});