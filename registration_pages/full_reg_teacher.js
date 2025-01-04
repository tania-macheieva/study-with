document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const progressIndicator = document.querySelector(".progress-bar__indicator");
    const stepIndicators = document.querySelectorAll(".progress-bar__steps span");

    // Завантажуємо стан із sessionStorage або починаємо з 2-го кроку
    let currentStep = parseInt(sessionStorage.getItem("currentStep")) || 2;

    // Приводимо крок до індексу масиву (крок 2 = індекс 0)
    let stepIndex = currentStep - 2; 
     // Об'єкт для зберігання даних форми
     let formData = JSON.parse(sessionStorage.getItem("teacherData")) || {};

    function updateStep(index) {
        console.log("Switching to step index:", index);

        // Активуємо відповідний крок форми
        steps.forEach((stepDiv, idx) => {
            stepDiv.classList.toggle("active", idx === index);
        });

        // Оновлюємо активний крок у прогресивній лінійці
        stepIndicators.forEach((stepCircle, idx) => {
            stepCircle.classList.toggle("active", idx <= index + 1); // +1 для коректного кроку
        });

        // Оновлюємо ширину прогресу
        const progressWidth = ((index + 1) / (steps.length + 1)) * 100; // +1 враховує крок 1
        progressIndicator.style.width = `${progressWidth}%`;
    }

    // Завантаження файлів
    const uploadInput = document.getElementById("certificates");
    const uploadButton = document.getElementById("upload-btn");
    const fileNamesContainer = document.getElementById("file-names");
    let selectedFiles = [];

    uploadButton?.addEventListener("click", function () {
        if (uploadInput) {
            console.log("Upload input found, opening file dialog.");
            uploadInput.click();
        } else {
            console.error("Upload input not found.");
        }
    });

    uploadInput?.addEventListener("change", function () {
        console.log("Files selected:", this.files);
        Array.from(this.files).forEach((file) => {
            if (!selectedFiles.some((existingFile) => existingFile.name === file.name)) {
                selectedFiles.push(file);
            }
        });
        updateFileList();
    });

    function updateFileList() {
        console.log("Updating file list:", selectedFiles);
        fileNamesContainer.innerHTML = "";

        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement("div");
                fileItem.className = "file-item";

                const fileName = document.createElement("span");
                fileName.textContent = file.name;

                const removeButton = document.createElement("button");
                removeButton.className = "remove-btn";
                removeButton.innerHTML =
                    '<img src="/images/delete.png" alt="Remove" class="remove-icon">';

                removeButton.addEventListener("click", function () {
                    removeFile(index);
                });

                fileItem.appendChild(fileName);
                fileItem.appendChild(removeButton);
                fileNamesContainer.appendChild(fileItem);
            });
        } else {
            fileNamesContainer.innerHTML = "<span>No files chosen</span>";
        }
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        updateFileList();
    }
 // Функція для перевірки заповнення обов’язкових полів
function validateStep(stepIndex) {
    const currentStepForm = steps[stepIndex];
    const inputs = currentStepForm.querySelectorAll("input[required], textarea[required]");
    let isValid = true;
    const lang = localStorage.getItem('language') || 'en'; // Отримуємо поточну мову

    inputs.forEach((input) => {
        const errorMessage = input.nextElementSibling?.classList.contains("error-message") 
            ? input.nextElementSibling 
            : null;

        if (!input.value.trim()) {
            isValid = false;

            input.classList.add("error");

            if (!errorMessage) {
                const errorText = document.createElement("span");
                errorText.classList.add("error-message");
                // Використовуємо переклад для помилки
                errorText.textContent = translations[lang].requiredFieldError;
                input.parentNode.appendChild(errorText);
            }
        } else {
            input.classList.remove("error");

            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
    return isValid;
}
    
    // Слухачі для кнопок "Next"
    document.querySelectorAll(".next-btn, .next-btn-1, .next-btn-2, .next-btn-3").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!validateStep(stepIndex)) {
                return; // Зупиняємо перехід до наступного кроку
            }
    
            if (stepIndex < steps.length - 1) {
                saveCurrentStepData(); // Зберігаємо дані
                stepIndex++;
                sessionStorage.setItem("currentStep", (stepIndex + 2).toString()); // Перетворюємо індекс у крок
                updateStep(stepIndex);
            }
        });
    });

    // Слухачі для кнопок "Previous"
    document.querySelectorAll(".prev-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (stepIndex > 0) {
                stepIndex--;
                sessionStorage.setItem("currentStep", (stepIndex + 2).toString()); // Перетворюємо індекс у крок
                updateStep(stepIndex);
            }
        });
    });
    // Функція для збереження даних поточного кроку
    function saveCurrentStepData() {
        if (stepIndex === 0) {
            formData.dob = document.getElementById("dob").value;
            formData.gender = document.querySelector('input[name="gender"]:checked')?.value;
            formData.country = document.getElementById("country").value;
            formData.city = document.getElementById("city").value;
            formData.phone_number = document.getElementById("phone_number").value;
            formData.zip = document.getElementById("zip").value;
        } else if (stepIndex === 1) {
            formData.specialty = document.getElementById("specialty").value;
            formData.experience = document.getElementById("experience").value;
        } else if (stepIndex === 2) {
            formData.about = document.getElementById("about").value;
        }

        sessionStorage.setItem("teacherData", JSON.stringify(formData));
    }


   
    const finishButton = document.querySelector(".finish-btn");

finishButton.addEventListener("click", async () => {
    saveCurrentStepData(); // Зберігаємо дані з поточного кроку.

    // Завантажуємо дані з першої сторінки
    const teacherData = JSON.parse(sessionStorage.getItem("teacherData")) || {};
    console.log("Loaded teacher data from first page:", teacherData);

    // Перевіряємо, чи є необхідні дані
    if (!teacherData || !teacherData.email) {
        console.warn("No data found in sessionStorage. Redirecting to registration page.");
        alert("No data found. Redirecting to registration page.");
        window.location.href = "/registration_pages/reg_teacher.html";
        return;
    }

    // Завантажуємо дані з другої сторінки
    const formDataObject = {
        ...teacherData, // Додаємо дані з першої сторінки
        dob: document.getElementById("dob").value.trim(),
        gender: document.querySelector('input[name="gender"]:checked')?.value || "",
        country: document.getElementById("country").value.trim(),
        city: document.getElementById("city").value.trim(),
        phone_number: document.getElementById("phone_number").value.trim(),
        zip_code: document.getElementById("zip").value.trim(),
        specialty: document.getElementById("specialty").value.trim(),
        professional_experience: document.getElementById("experience").value.trim(),
        about: document.getElementById("about").value.trim(),
    };
    console.log("Combined form data:", formDataObject);
    // Перевіряємо, чи всі обов'язкові поля заповнені
    const requiredFields = ["name", "email", "password", "phone_number", "dob", "gender", "country", "city", "specialty"];
    const missingFields = requiredFields.filter((field) => !formDataObject[field]);

    if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
    }
    // Створюємо FormData для відправки даних на сервер
    const formData = new FormData();

    // Додаємо всі текстові дані в FormData
    for (const [key, value] of Object.entries(formDataObject)) {
        formData.append(key, value || "");
    }

    // Додаємо сертифікати
    selectedFiles.forEach((file) => formData.append("certificates", file));

    try {
        console.log("Sending request to server...");
        const response = await fetch("http://localhost:8000/auth/register/teacher/full-registration", {
            method: "POST",
            body: formData, // Відправляємо всі дані разом із сертифікатами
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            const error = await response.json(); // Очікуємо, що сервер повертає JSON з повідомленням про помилку.
            throw new Error(error.error || "Failed to complete registration.");
        }
        const result = await response.json(); // Зчитуємо відповідь сервера
        console.log("Server response:", result);
        alert("Your registration has been submitted successfully!");
       /* sessionStorage.clear();*/ // Очищуємо дані після завершення
        window.location.href = "/"; // Перенаправлення на головну сторінку
    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            console.error("Network error: Unable to reach the server. Check CORS settings or server availability.");
        } else {
            console.error("Unexpected error:", error);
        }
        // Виводимо повідомлення про помилку для користувача
        alert(`Error: ${error.message}`);
    }
});
    // Ініціалізація: відображаємо крок 2 (індекс 0)
    updateStep(stepIndex);
});