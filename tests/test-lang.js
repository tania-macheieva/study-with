const translations = {
    en: {
        testCreation:"Test Creation",
        testPage:"Test Page",
        testTitle:"Test Title:",
        enterTestTitle:"Enter test title",
        numQuesOneAnsw:"Number of questions with one correct answer:",
        numQuesMultAnsw:"Number of questions with multiple correct answers:",
        quesMathing:"Number of questions to match:",
        quesOpen:"Number of questions answered:",
        generQuestion:"Generate question",
        saveTest:"Save test",
        showTest:"Show test",
        startTest:"Start test",
        enterTestId:"Enter Test ID",
        question:"Question",
        enterQuesText:"Enter question text",
        answer:"Answer",
        enteropenEndedAnsw:"Enter open-ended answer",
        enterTestId:"Please provide a test ID.",
        loadTestData:"Loading test data...",
        noAnswerAvail:"No answers available for this question.",
        matchQuesMiss:"Matching question is missing subquestions or answers.",
        sendBtn:"Send Test",

    },
    ua: {
        testCreation:"Створення тесту",
        testPage:"Сторінка тесту",
        testTitle:"Назва тесту:",
        enterTestTitle:"Введіть назву тесту",
        numQuesOneAnsw:"Кількість запитань з однією правильною відповіддю:",
        numQuesMultAnsw:"Кількість запитань із кількома правильними відповідями:",
        quesMathing:"Кількість запитань для відповідності:",
        quesOpen:"Кількість запитань із відповідями:",
        generQuestion:"Створити запитання",
        saveTest:"Зберегти тест",
        showTest:"Показати тест",
        startTest:"Почати тест",
        enterTestId:"Введіть ID тесту",
        question:"Питання",
        enterQuesText:"Введіть текст запитання",
        відповідь: "Відповідь",
        enteropenEndedAnsw:"Введіть відкриту відповідь",
        enterTestId:"Надайте ідентифікатор тесту.",
        loadTestData:"Завантаження тестових даних...",
        noAnswerAvail:"На це запитання немає відповідей.",
        matchQuesMiss:"У відповідному питанні відсутні підзапитання або відповіді.",
        sendBtn:"Відправити тест",


    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;

    document.querySelectorAll("[data-lang]").forEach((element) => {
      const langKey = element.getAttribute("data-lang");
      if (langData[langKey]) {
        if (element.tagName === "INPUT") {
          element.setAttribute("placeholder", langData[langKey]);
        } else if (element.tagName === "BUTTON") {
          element.textContent = langData[langKey];
        } else if (element.tagName === "H2") {
          element.textContent = langData[langKey];
        } else if (element.tagName === "P") {
          element.textContent = langData[langKey];
        } else {
          element.innerHTML = langData[langKey];
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const userLang = localStorage.getItem("language");
    applyLanguage(userLang);
  });