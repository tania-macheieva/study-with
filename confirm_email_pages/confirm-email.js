document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verificationForm');
    const inputs = document.querySelectorAll('input');
    const resendLink = document.getElementById('resendLink');
    const timerSpan = document.getElementById('timer');
    
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

    // Таймер для повторної відправки
    let timeLeft = 60;
    const timer = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendLink.innerHTML = '<a href="#" id="resendButton">Resend code</a>';
            
            // Обробник для повторної відправки
            document.getElementById('resendButton').addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const email = localStorage.getItem('userEmail');
                    const response = await fetch('/auth/resend-code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email })
                    });
                    
                    if (response.ok) {
                        timeLeft = 60;
                        resendLink.innerHTML = `Resend email in <span id="timer">${timeLeft}</span> seconds`;
                        timerSpan = document.getElementById('timer');
                        startTimer();
                    } else {
                        alert('Error resending code');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error resending code');
                }
            });
        }
    }, 1000);

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
                window.location.href = '/fail-confirm-email';
            }
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/fail-confirm-email';
        }
    });
});