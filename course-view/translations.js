document.addEventListener('DOMContentLoaded', function() {
    const pageTranslations = {
      en: {
        "discussion": "Discussion",
        "myNotes": "My notes & marks",
        "recent": "Recent",
        "oldest": "Oldest",
        "progress": "Progress",
        "home": "Home",
        "courseContent": "Course Content",
        "complete": "complete",
        "left": "left",
        "getCertificate": "Get Certificate",
        "searchQuestion": "ask or search a question",
        "writeReply": "Write a reply",
        "editMessage": "Edit message",
        "deleteMessage": "Delete message",
        "replyTo": "Reply to",
        "footerReserved": "© 2025 All Rights Reserved StudyWith",
        "footerAbout": "About",
        "footerContact": "Contact",
        "footerFAQ": "FAQ",
        "footerTnC": "Terms & conditions",
        "footerPrivacy": "Privacy policy",
        "footerDonate": "Donations",
        "courseName": "Course name",
        "shareCourse": "Share this course",
        "unenrollCourse": "Unenroll from this course"
      },
      ua: {
        "discussion": "Обговорення",
        "myNotes": "Мої нотатки та оцінки",
        "recent": "Нові",
        "oldest": "Старі",
        "progress": "Прогрес",
        "home": "Головна",
        "courseContent": "Зміст курсу",
        "complete": "завершено",
        "left": "залишилось",
        "getCertificate": "Отримати сертифікат",
        "searchQuestion": "запитайте або шукайте питання",
        "writeReply": "Написати відповідь",
        "editMessage": "Редагувати повідомлення",
        "deleteMessage": "Видалити повідомлення",
        "replyTo": "Відповісти",
        "footerReserved": "© 2025 Всі права захищені StudyWith",
        "footerAbout": "Про нас",
        "footerContact": "Контакти",
        "footerFAQ": "FAQ",
        "footerTnC": "Умови та положення",
        "footerPrivacy": "Політика конфіденційності",
        "footerDonate": "Донати",
        "courseName": "Назва курсу",
        "shareCourse": "Поділитися цим курсом",
        "unenrollCourse": "Відписатися від цього курсу"
      }
    };
  
    const messagesTranslations = {
      en: {
        "ask or search a question": "ask or search a question",
        "Whole course": "Whole course",
        "Current topic": "Current topic",
        "Recent": "Recent",
        "Oldest": "Oldest",
        "Show replies": "Show replies",
        "Hide replies": "Hide replies",
        "Write a reply": "Write a reply",
        "Reply to": "Reply to",
        "write a reply to": "write a reply to",
        "Edit your comment": "Edit your comment",
        "Are you sure you want to delete this message?": "Are you sure you want to delete this message?",
        "This action cannot be undone.": "This action cannot be undone.",
        "Cancel": "Cancel",
        "Save": "Save",
        "Delete": "Delete",
        "Edit message": "Edit message",
        "Delete message": "Delete message",
        "Report message": "Report message",
        "Report Content": "Report Content",
        "We take reports seriously. Our team will review the content and take appropriate action if necessary.": "We take reports seriously. Our team will review the content and take appropriate action if necessary.",
        "Submit": "Submit"
      },
      ua: {
        "ask or search a question": "запитайте або шукайте питання",
        "Whole course": "Весь курс",
        "Current topic": "Поточна тема",
        "Recent": "Нові",
        "Oldest": "Старі",
        "Show replies": "Показати відповіді",
        "Hide replies": "Сховати відповіді",
        "Write a reply": "Написати відповідь",
        "Reply to": "Відповісти",
        "write a reply to": "відповісти",
        "Edit your comment": "Редагування коментаря",
        "Are you sure you want to delete this message?": "Ви дійсно хочете видалити це повідомлення?",
        "This action cannot be undone.": "Цю дію неможливо скасувати.",
        "Cancel": "Скасувати",
        "Save": "Зберегти",
        "Delete": "Видалити",
        "Edit message": "Редагувати повідомлення",
        "Delete message": "Видалити повідомлення",
        "Report message": "Поскаржитись на повідомлення",
        "Report Content": "Скарга на вміст",
        "We take reports seriously. Our team will review the content and take appropriate action if necessary.": "Ми серйозно ставимося до скарг. Наша команда перегляне вміст і вживе відповідних заходів у разі необхідності.",
        "Submit": "Надіслати"
      }
    };
  
    let currentLanguage = localStorage.getItem('language') || 'en';
    
    function translatePage(lang) {
      if (!pageTranslations[lang]) {
        return;
      }
    
      currentLanguage = lang;
      document.documentElement.lang = lang;
      localStorage.setItem('language', lang);
    
      translateMainContent(lang);
      translateDiscussionElements(lang);
      translateFooterElements(lang);
      setActiveLanguage(lang);
      fixFooterFaqStyle();
      translateModuleProgress(lang);
    }
  
    function translateReplyButton(button) {
      if (!button) return;
      
      const translations = messagesTranslations[currentLanguage];
      
      const isExpanded = button.dataset.expanded === 'true';
      if (isExpanded) {
        button.textContent = translations['Hide replies'];
      } else {
        const count = button.textContent.match(/\((\d+)\)/);
        const repliesCount = count ? count[1] : '';
        button.textContent = `${translations['Show replies']}${repliesCount ? ' (' + repliesCount + ')' : ''}`;
      }
    }
  
    function translateMainContent(lang) {
      translateHeader(lang);
      
      const tabs = document.querySelectorAll('.tabs .tab');
      if (tabs.length >= 2) {
        tabs[0].textContent = pageTranslations[lang].discussion;
        tabs[1].textContent = pageTranslations[lang].myNotes;
      }
    
      const searchInput = document.querySelector('.search-bar input');
      if (searchInput) {
        searchInput.setAttribute('placeholder', pageTranslations[lang].searchQuestion);
      }
    
      const filterBtns = document.querySelectorAll('.filter-btn');
      if (filterBtns.length >= 2) {
        filterBtns[0].textContent = pageTranslations[lang].recent;
        filterBtns[1].textContent = pageTranslations[lang].oldest;
      }
    
      const progressText = document.querySelector('.progress-text span');
      if (progressText) {
        progressText.textContent = pageTranslations[lang].progress;
      }
    
      const homeLink = document.querySelector('.home');
      if (homeLink) {
        homeLink.textContent = pageTranslations[lang].home;
      }
    
      const courseHeader = document.querySelector('.course-header h1');
      if (courseHeader) {
        courseHeader.textContent = pageTranslations[lang].courseContent;
      }
    
      const certificateBtn = document.querySelector('.certificate-btn');
      if (certificateBtn) {
        certificateBtn.textContent = pageTranslations[lang].getCertificate;
      }
    }
  
    function translateHeader(lang) {
      const translations = pageTranslations[lang];
      
      const homeElement = document.querySelector('.home');
      if (homeElement) {
        homeElement.textContent = translations.home;
      }
      
      const progressText = document.querySelector('.progress-text span:first-child');
      if (progressText) {
        progressText.textContent = translations.progress;
      }
      
      const shareCourseButton = document.querySelector('.share-btn');
      if (shareCourseButton) {
        const shareImg = shareCourseButton.querySelector('img');
        const shareText = translations.shareCourse;
        if (shareImg) {
          shareCourseButton.innerHTML = '';
          shareCourseButton.appendChild(shareImg);
          shareCourseButton.appendChild(document.createTextNode(' ' + shareText));
        } else {
          shareCourseButton.textContent = shareText;
        }
      }
      
      const unenrollButton = document.querySelector('.unenroll-btn');
      if (unenrollButton) {
        const unenrollImg = unenrollButton.querySelector('img');
        const unenrollText = translations.unenrollCourse;
        if (unenrollImg) {
          unenrollButton.innerHTML = '';
          unenrollButton.appendChild(unenrollImg);
          unenrollButton.appendChild(document.createTextNode(' ' + unenrollText));
        } else {
          unenrollButton.textContent = unenrollText;
        }
      }
      
      const certificateButton = document.querySelector('.certificate-btn');
      if (certificateButton) {
        certificateButton.textContent = translations.getCertificate;
      }
    }
  
    function translateModuleProgress(lang) {
      document.querySelectorAll('.module').forEach(moduleElement => {
        const progressElement = moduleElement.querySelector('.module-progress');
        if (!progressElement) return;
        
        if (!progressElement.hasAttribute('data-original-text')) {
          progressElement.setAttribute('data-original-text', progressElement.innerHTML);
        }
        
        let originalText = progressElement.getAttribute('data-original-text');
        
        const numbers = originalText.match(/(\d+)\/(\d+)/);
        const remainingMatch = originalText.match(/(\d+)\s+left/);
        
        if (numbers && remainingMatch) {
          const completedCount = numbers[1];
          const totalCount = numbers[2];
          const remainingCount = remainingMatch[1];
          
          const translatedHTML = `
            <span>${completedCount}/${totalCount} ${pageTranslations[lang].complete}</span>
            <span class="separator">|</span>
            <span>${remainingCount} ${pageTranslations[lang].left}</span>
          `;
          
          progressElement.innerHTML = translatedHTML;
        }
      });
      
      if (window.moduleObserver) {
        window.moduleObserver.disconnect();
      }
      
      window.moduleObserver = new MutationObserver(mutations => {
        const newModuleProgressElements = document.querySelectorAll('.module-progress:not([data-original-text])');
        
        if (newModuleProgressElements.length > 0) {
          translateModuleProgress(currentLanguage);
        }
      });
      
      const courseContainer = document.querySelector('.course-content');
      if (courseContainer) {
        window.moduleObserver.observe(courseContainer, {
          childList: true,
          subtree: true
        });
      }
    }
  
    function translateDiscussionElements(lang) {
      const translations = messagesTranslations[lang];
  
      document.querySelectorAll('.message-menu, .dropdown-menu, .options-menu').forEach(menu => {
        const menuItems = menu.querySelectorAll('button, a, li, .option');
        menuItems.forEach(item => {
          const text = item.textContent.trim();
          
          if (text === "Write a reply" || text === "Написати відповідь") {
            item.textContent = pageTranslations[lang].writeReply;
          }
          else if (text === "Edit message" || text === "Редагувати повідомлення") {
            item.textContent = pageTranslations[lang].editMessage;
          }
          else if (text === "Delete message" || text === "Видалити повідомлення") {
            item.textContent = pageTranslations[lang].deleteMessage;
          }
        });
      });
    
      document.querySelectorAll('input[placeholder^="Reply to"], textarea[placeholder^="Reply to"], input[placeholder^="Відповісти"], input[placeholder^="write a reply to"], input[placeholder^="відповісти"]').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        let userName = '';
        
        if (placeholder.startsWith('Reply to')) {
          userName = placeholder.replace('Reply to', '').trim();
        } else if (placeholder.startsWith('Відповісти')) {
          userName = placeholder.replace('Відповісти', '').trim();
        } else if (placeholder.startsWith('write a reply to')) {
          userName = placeholder.replace('write a reply to', '').trim();
        } else if (placeholder.startsWith('відповісти')) {
          userName = placeholder.replace('відповісти', '').trim();
        }
        
        if (userName) {
          input.setAttribute('placeholder', `${pageTranslations[lang].replyTo} ${userName}`);
        }
      });
      
      document.querySelectorAll('button, span, div').forEach(element => {
        const text = element.textContent.trim();
        if (text && (text.startsWith('Reply to') || text.startsWith('Відповісти'))) {
          let userName = '';
          if (text.startsWith('Reply to')) {
            userName = text.replace('Reply to', '').trim();
          } else {
            userName = text.replace('Відповісти', '').trim();
          }
          
          element.textContent = `${pageTranslations[lang].replyTo} ${userName}`;
          element.setAttribute('data-original-name', userName);
        }
      });
  
      document.querySelectorAll('.show-replies-button').forEach(button => {
        translateReplyButton(button);
      });
      
      document.querySelectorAll('.options-menu .option').forEach(option => {
        const action = option.dataset.action;
        
        const iconElement = option.querySelector('img');
        const iconHTML = iconElement ? iconElement.outerHTML + ' ' : '';
        
        if (action === 'add-reply') {
          option.innerHTML = iconHTML + translations['Write a reply'];
        } else if (action === 'edit') {
          option.innerHTML = iconHTML + translations['Edit message'];
        } else if (action === 'delete') {
          option.innerHTML = iconHTML + translations['Delete message'];
        } else if (action === 'report') {
          option.innerHTML = iconHTML + translations['Report message'];
        }
      });
      
      document.querySelectorAll('.search-bar input').forEach(input => {
        input.placeholder = translations['ask or search a question'];
      });
      
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(button => {
        const text = button.textContent.trim();
        
        if (text === 'Whole course' || text === 'Весь курс') {
          button.textContent = translations['Whole course'];
        } else if (text === 'Current topic' || text === 'Поточна тема') {
          button.textContent = translations['Current topic'];
        } else if (text === 'Recent' || text === 'Нові') {
          button.textContent = translations['Recent'];
        } else if (text === 'Oldest' || text === 'Старі') {
          button.textContent = translations['Oldest'];
        }
      });
      
      document.querySelectorAll('.reply-input input').forEach(input => {
        const placeholder = input.placeholder;
        let username = '';
        
        if (placeholder) {
          if (placeholder.startsWith('write a reply to')) {
            username = placeholder.replace('write a reply to', '').trim();
          } else if (placeholder.startsWith('відповісти')) {
            username = placeholder.replace('відповісти', '').trim();
          } else if (placeholder.includes('Reply to')) {
            username = placeholder.replace('Reply to', '').trim();
          } else if (placeholder.includes('Відповісти')) {
            username = placeholder.replace('Відповісти', '').trim();
          }
          
          if (username) {
            input.placeholder = `${translations['write a reply to']} ${username}`;
          }
        }
      });
    }
    
    function translateFooterElements(lang) {
      document.querySelectorAll('footer [data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (pageTranslations[lang][key]) {
          if (element.tagName === 'INPUT') {
            element.setAttribute('placeholder', pageTranslations[lang][key]);
          } else {
            element.textContent = pageTranslations[lang][key];
          }
        }
      });
    }
    
    function setActiveLanguage(lang) {
      const langButtons = document.querySelectorAll('.lang-btn');
      langButtons.forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
          btn.style.fontWeight = 'bold';
          btn.style.color = '#283044';
        } else {
          btn.style.fontWeight = 'normal';
          btn.style.color = '#666';
        }
      });
    }
    
    function fixFooterFaqStyle() {
      const faqLink = document.querySelector('footer [data-lang="footerFAQ"]');
      
      if (faqLink) {
        faqLink.style.whiteSpace = 'nowrap';
        
        const footerLinksContainer = document.querySelector('.footer-links-a');
        if (footerLinksContainer) {
          footerLinksContainer.style.flexWrap = 'nowrap';
          footerLinksContainer.style.gap = '20px';
          footerLinksContainer.style.display = 'flex';
          footerLinksContainer.style.justifyContent = 'space-between';
          footerLinksContainer.style.width = 'auto';
          
          const links = footerLinksContainer.querySelectorAll('a');
          links.forEach(link => {
            link.style.marginRight = '10px';
            link.style.whiteSpace = 'nowrap';
          });
        }
      }
    }
  
    function setupTranslationObserver() {
      const observer = new MutationObserver(mutations => {
        let needTranslation = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const hasTranslatableElements = Array.from(mutation.addedNodes).some(node => {
              return node.nodeType === 1 && (
                node.classList?.contains('discussion-section') ||
                node.classList?.contains('message') ||
                node.classList?.contains('options-menu') ||
                node.classList?.contains('show-replies-button') ||
                node.classList?.contains('modal') ||
                node.querySelector?.('.discussion-section') ||
                node.querySelector?.('.message') ||
                node.querySelector?.('.options-menu') ||
                node.querySelector?.('.show-replies-button') ||
                node.querySelector?.('.modal')
              );
            });
            
            if (hasTranslatableElements) {
              needTranslation = true;
            }
          }
        });
        
        if (needTranslation) {
          setTimeout(() => {
            translateDiscussionElements(currentLanguage);
          }, 10);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
    if (typeof window.createDiscussionTemplate === 'function') {
      const originalCreateDiscussionTemplate = window.createDiscussionTemplate;
      window.createDiscussionTemplate = function() {
        const template = originalCreateDiscussionTemplate();
        
        return template
          .replace('placeholder="ask or search a question"', `placeholder="${messagesTranslations[currentLanguage]['ask or search a question']}"`)
          .replace('>Whole course<', `>${messagesTranslations[currentLanguage]['Whole course']}<`)
          .replace('>Current topic<', `>${messagesTranslations[currentLanguage]['Current topic']}<`)
          .replace('>Recent<', `>${messagesTranslations[currentLanguage]['Recent']}<`)
          .replace('>Oldest<', `>${messagesTranslations[currentLanguage]['Oldest']}<`);
      };
    }
  
    if (typeof window.addShowRepliesButton === 'function') {
      const originalAddShowRepliesButton = window.addShowRepliesButton;
      window.addShowRepliesButton = function(parentElement, messageId, replies) {
        originalAddShowRepliesButton(parentElement, messageId, replies);
        
        const button = document.getElementById(`show-replies-button-${messageId}`);
        translateReplyButton(button);
        
        if (button) {
          const originalClickHandler = button.onclick;
          button.onclick = function(event) {
            if (originalClickHandler) {
              originalClickHandler.call(this, event);
            }
            
            setTimeout(() => {
              translateReplyButton(this);
            }, 10);
          };
        }
      };
    }
  
    if (typeof window.createMessageHTML === 'function') {
      const originalCreateMessageHTML = window.createMessageHTML;
      window.createMessageHTML = function(message, isReply = false, replyLevel = 0) {
        const messageElement = originalCreateMessageHTML(message, isReply, replyLevel);
        
        const input = messageElement.querySelector('.reply-input input');
        if (input) {
          const username = messageElement.querySelector('.username')?.textContent || '';
          input.placeholder = `${messagesTranslations[currentLanguage]['write a reply to']} ${username}`;
        }
        
        return messageElement;
      };
    }
  
    if (typeof window.createDeleteModal === 'function') {
      const originalCreateDeleteModal = window.createDeleteModal;
      window.createDeleteModal = function() {
        const result = originalCreateDeleteModal();
        
        if (result && result.modal) {
          const title = result.modal.querySelector('.modal-title');
          if (title) {
            title.textContent = messagesTranslations[currentLanguage]['Are you sure you want to delete this message?'];
          }
          
          const description = result.modal.querySelector('.modal-description');
          if (description) {
            description.textContent = messagesTranslations[currentLanguage]['This action cannot be undone.'];
          }
          
          if (result.cancelButton) {
            result.cancelButton.textContent = messagesTranslations[currentLanguage]['Cancel'];
          }
          
          if (result.confirmButton) {
            result.confirmButton.textContent = messagesTranslations[currentLanguage]['Delete'];
          }
        }
        
        return result;
      };
    }
  
    if (typeof window.createEditModal === 'function') {
      const originalCreateEditModal = window.createEditModal;
      window.createEditModal = function(currentText) {
        const result = originalCreateEditModal(currentText);
        
        if (result && result.modal) {
          const title = result.modal.querySelector('h2');
          if (title) {
            title.textContent = messagesTranslations[currentLanguage]['Edit your comment'];
          }
          
          if (result.cancelButton) {
            result.cancelButton.textContent = messagesTranslations[currentLanguage]['Cancel'];
          }
          
          if (result.saveButton) {
            result.saveButton.textContent = messagesTranslations[currentLanguage]['Save'];
          }
        }
        
        return result;
      };
    }
  
    if (typeof window.openReportModal === 'function') {
      const originalOpenReportModal = window.openReportModal;
      window.openReportModal = function(messageId, username) {
        originalOpenReportModal(messageId, username);
        
        setTimeout(() => {
          const modal = document.querySelector('.modal:last-child');
          if (modal) {
            const title = modal.querySelector('.modal-title');
            if (title) {
              title.textContent = messagesTranslations[currentLanguage]['Report Content'];
            }
            
            const description = modal.querySelector('.modal-description');
            if (description) {
              description.textContent = messagesTranslations[currentLanguage]['We take reports seriously. Our team will review the content and take appropriate action if necessary.'];
            }
            
            const cancelButton = modal.querySelector('#close-modal');
            if (cancelButton) {
              cancelButton.textContent = messagesTranslations[currentLanguage]['Cancel'];
            }
            
            const submitButton = modal.querySelector('#submit-report');
            if (submitButton) {
              submitButton.textContent = messagesTranslations[currentLanguage]['Submit'];
            }
          }
        }, 10);
      };
    }
  
    if (typeof window.showReplies === 'function') {
      const originalShowReplies = window.showReplies;
      window.showReplies = function(parentElement, parentMessageId, replies) {
        originalShowReplies(parentElement, parentMessageId, replies);
        
        const button = document.getElementById(`show-replies-button-${parentMessageId}`);
        translateReplyButton(button);
      };
    }
  
    if (typeof window.hideReplies === 'function') {
      const originalHideReplies = window.hideReplies;
      window.hideReplies = function(parentElement, parentMessageId, replies) {
        originalHideReplies(parentElement, parentMessageId, replies);
        
        const button = document.getElementById(`show-replies-button-${parentMessageId}`);
        translateReplyButton(button);
      };
    }
  
    document.addEventListener('click', function(e) {
      const moreOptions = e.target.closest('.more-options');
      
      if (moreOptions) {
        setTimeout(() => {
          const translations = messagesTranslations[currentLanguage];
          
          const optionsMenu = document.querySelector('.options-menu');
          if (optionsMenu) {
            optionsMenu.querySelectorAll('.option').forEach(option => {
              const action = option.dataset.action;
              
              const iconElement = option.querySelector('img');
              const iconHTML = iconElement ? iconElement.outerHTML + ' ' : '';
              
              if (action === 'add-reply') {
                option.innerHTML = iconHTML + translations['Write a reply'];
              } else if (action === 'edit') {
                option.innerHTML = iconHTML + translations['Edit message'];
              } else if (action === 'delete') {
                option.innerHTML = iconHTML + translations['Delete message'];
              } else if (action === 'report') {
                option.innerHTML = iconHTML + translations['Report message'];
              }
            });
          }
        }, 0);
      }
    }, true);
  
    function initialize() {
      currentLanguage = localStorage.getItem('language') || 'en';
      document.documentElement.lang = currentLanguage;
      
      const langButtons = document.querySelectorAll('.lang-btn');
      langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const lang = this.getAttribute('data-lang');
          translatePage(lang);
        });
      });
      
      setActiveLanguage(currentLanguage);
      setupTranslationObserver();
      
      setTimeout(() => {
        translatePage(currentLanguage);
      }, 300);
    }
    
    initialize();
    
    window.translatePage = translatePage;
    window.translateMainContent = translateMainContent;
    window.translateDiscussionElements = translateDiscussionElements;
    window.translateFooterElements = translateFooterElements;
    window.translateModuleProgress = translateModuleProgress;
    window.setActiveLanguage = setActiveLanguage;
    window.fixFooterFaqStyle = fixFooterFaqStyle;
    window.currentLanguage = currentLanguage;
  });