// Функція для збереження даних автентифікації
function saveAuthData(authData) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userId', authData.userId);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('name', authData.name || '');
}

// Функція для отримання даних автентифікації
function getAuthData() {
    return {
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
        role: localStorage.getItem('role'),
        name: localStorage.getItem('name')
    };
}

// Основна функція для обробки логіну
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');

    // Базова валідація
    if (!email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Зберігаємо дані користувача
            const userData = {
                token: data.token,
                userId: data.user.id,
                role: data.user.role,
                name: data.user.name
            };
            saveAuthData(userData);
            
            // Перенаправляємо на головну сторінку
            window.location.href = '/';
        } else {
            errorElement.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'Server error occurred';
    }
}

// Обробка Google Auth callback
function handleGoogleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const role = urlParams.get('role');
    const name = urlParams.get('name');

    if (token && userId && role) {
        const userData = { token, userId, role, name };
        saveAuthData(userData);
        window.location.href = '/';
    }
}

// Перевіряємо наявність параметрів Google Auth при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    handleGoogleAuthCallback();
});