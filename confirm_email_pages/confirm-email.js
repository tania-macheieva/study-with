document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verificationForm');
    const inputs = document.querySelectorAll('input');
    const resendLinkContainer = document.querySelector('.resend-link');
    let timerSpan = document.getElementById('timer');
    
    // Автофокус на наступний інпут
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.inputType !== 'deleteContentBackward') {
                const nextInput = inputs[index + 1];
                if (nextInput) nextInput.focus();
            }
        });

        // Обробка клавіші Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value) {
                const prevInput = inputs[index - 1];
                if (prevInput) prevInput.focus();
            }
        });
    });

    inputs.forEach((input) => {
    input.addEventListener('input', () => {
        // Завжди переміщуємо курсор у кінець
        const length = input.value.length;
        input.setSelectionRange(length, length);
    });

    input.addEventListener('focus', () => {
        // Коли фокусуємо поле, курсор також стає в кінець
        const length = input.value.length;
        input.setSelectionRange(length, length);
    });
});

    // Таймер для повторної відправки
    let timeLeft = 60;
    let timer;
    function startTimer() {
        timeLeft = 60;
        resendLinkContainer.innerHTML = `Resend email in <span id="timer">${timeLeft}</span> seconds`;
        timerSpan = document.getElementById('timer');

        timer = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                resendLinkContainer.innerHTML = `<a href="#" id="resendButton">Resend code</a>`;

                // Додаємо слухача подій для повторної відправки
                const resendButton = document.getElementById('resendButton');
                if (resendButton) {
                    resendButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await resendCode();
                    });
                }
            }
        }, 1000);
    }

    async function resendCode() {
        try {
            const email = localStorage.getItem('userEmail'); 
            if (!email) {
                alert('Email not found. Please try registering again.');
                window.location.href = '/register';
                return;
            }

            const response = await fetch('/auth/resend-code', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                alert('New verification code sent to your email.');
                startTimer(); // Запускаємо таймер знову
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error resending code');
        }
    }

    startTimer(); // Запускаємо таймер при завантаженні сторінки


    // Обробка відправки форми
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Збираємо код з інпутів
        const code = Array.from(inputs).map(input => input.value).join('');
        const email = localStorage.getItem('userEmail');
        
        if (!email) {
            alert('Email not found. Please try registering again.');
            window.location.href = '/register';
            return;
        }
        
        try {
            const response = await fetch('/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Зберігаємо токен, якщо він є
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                window.location.href = '/succes-confirm-email';
            } else {
                inputs.forEach(input => {
                    input.style.borderColor = 'red';
                });
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/fail-confirm-email';
        }
    });
});