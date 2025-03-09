document.addEventListener("DOMContentLoaded", () => {
    const styles = `
      .text-container {
        display: none;
      }
  
      .background {
        display: none;
      }
  
      @media screen and (max-width: 480px) {
        body * {
          display: none; 
        }
  
        .text-container {
          display: block;
          font-size: 16px;
          color: #111111;
          font-weight: 600;
          padding: 10px;
          text-align: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
  
        .background {
          font-family: "Inter", serif;
          background-color: #DCECFC;
          height: 100vh; 
          margin: 0; 
          display: block;
        }
  
        body {
          font-family: "Inter", serif;
          background-color: #012035;
          height: 100vh; 
          margin: 0;
          padding: 0; 
          display: block;
        }
      }
    `;
  
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  
    const backgroundDiv = document.createElement("div");
    backgroundDiv.className = "background";
  
    const textContainerDiv = document.createElement("div");
    textContainerDiv.className = "text-container";
    textContainerDiv.textContent = "Мобільна версія сайту наразі не підтримується!";
  
    backgroundDiv.appendChild(textContainerDiv);
    document.body.appendChild(backgroundDiv);
  });
  