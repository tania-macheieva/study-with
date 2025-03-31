document.addEventListener('DOMContentLoaded', function() {
    const certificateInput = document.getElementById('certificateNumber');
    const checkButton = document.getElementById('checkCertBtn');
    const validMessage = document.getElementById('validMessage');
    const notValidMessage = document.getElementById('notValidMessage');
    const loading = document.getElementById('loading');
    const certDetails = document.getElementById('certDetails');
    const certUserName = document.getElementById('certUserName');
    const certCourseName = document.getElementById('certCourseName');
    const certIssuedDate = document.getElementById('certIssuedDate');
    const certNumber = document.getElementById('certNumber');

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    async function verifyCertificate(certificateNumber) {
        try {
            resetResults();
            
            loading.style.display = 'block';
            
            const response = await fetch(`/api/certificate/verify/${certificateNumber}`);
            const data = await response.json();
            
            loading.style.display = 'none';
            
            if (data.isValid) {
                validMessage.style.display = 'block';
                certDetails.style.display = 'block';
                
                certUserName.textContent = data.certificate.userName;
                certCourseName.textContent = data.certificate.courseName;
                certIssuedDate.textContent = formatDate(data.certificate.issuedAt);
                certNumber.textContent = data.certificate.number;
            } else {
                notValidMessage.style.display = 'block';
                notValidMessage.textContent = data.message || 'Ваш сертифікат недійсний';
            }
        } catch (error) {
            console.error('Помилка перевірки сертифікату:', error);
            loading.style.display = 'none';
            notValidMessage.style.display = 'block';
            notValidMessage.textContent = 'Помилка при перевірці сертифікату. Спробуйте пізніше.';
        }
    }
    
    function resetResults() {
        validMessage.style.display = 'none';
        notValidMessage.style.display = 'none';
        certDetails.style.display = 'none';
    }

    checkButton.addEventListener('click', function() {
        const certificateNumber = certificateInput.value.trim();
        
        if (!certificateNumber) {
            resetResults();
            notValidMessage.style.display = 'block';
            notValidMessage.textContent = 'Будь ласка, введіть номер сертифікату';
            return;
        }
        
        verifyCertificate(certificateNumber);
    });

    certificateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const certificateNumber = certificateInput.value.trim();
            
            if (!certificateNumber) {
                resetResults();
                notValidMessage.style.display = 'block';
                notValidMessage.textContent = 'Будь ласка, введіть номер сертифікату';
                return;
            }
            
            verifyCertificate(certificateNumber);
        }
    });
});