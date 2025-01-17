class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-family: 'Inter', sans-serif;
            }

            header {
                background-color: #fff;
                padding: 4px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 1000;
                box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
            }

            .container {
                display: flex;
                width: 100%;
                align-items: center;
                justify-content: space-between;
                margin: 0;
                padding: 0;
            }

            .left-s {
                display: flex;
                align-items: center;
                gap: 80px;
            }

            .left-s h2 {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
                color: #333;
            }

            .home {
                font-size: 18px;
                font-weight: normal;
            }

            .course-n {
                font-size: 18px;
                font-weight: 600;
                margin-left: auto;
            }

            img {
                width: 20px;
                height: 20px;
            }

            .right-s {
                display: flex;
                align-items: center;
                gap: 32px;
            }

            .progress-container {
                text-align: center;
                width: 150px;
                margin-top: 12px;
            }

            .progress-bar {
                position: relative;
                width: 100%;
                height: 10px;
                background-color: #DCECFC;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 4px;
            }

            .progress-bar span {
                display: block;
                height: 100%;
                background-color: #283044;
                border-radius: 5px;
            }

            .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin: 0;
                color: #333;
            }

            .progress-text span {
                font-size: 12px;
                color: #333;
            }

            .percent {
                font-size: 12px;
                font-weight: 500;
                color: #333;
            }

            .lang-switcher {
                font-size: 16px;
                font-weight: 500;
                color: #333;
            }

            .lang-btn {
                text-decoration: none;
                cursor: pointer;
            }

            .btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
            }

            .btn img {
                width: 28px;
                height: 28px;
                border-radius: 50%;
            }

            .oth {
                width: 4px;
                height: 20px;
            }

            .dropdown-menu {
                display: none;
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                z-index: 10;
            }

            .dropdown-menu a {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                text-decoration: none;
                color: #333;
                border-bottom: 1px solid #eee;
            }

            .dropdown-menu a:last-child {
                border-bottom: none;
            }

            .dropdown-menu a img {
                width: 16px;
                height: 16px;
                margin-right: 10px;
            }

            .dropdown-menu a:hover {
                background-color: #f0f0f0;
            }

            .right-s>div button {
                background: none;
                border: none;
                cursor: pointer;
            }

            .dropdown.active .dropdown-menu,
            .dropdown-menu.show {
                display: block;
            }
        </style>
        <header>
            <div class="container">
                <div class="left-s">
                    <h2 class="home">
                        <img src="../images/arrow.svg" alt="arrow-exit-ico">Home
                    </h2>
                    <h2 class="course-n">
                        <img src="../images/save-c.svg" alt="save-course-ico">Course name course name
                    </h2>
                </div>

                <div class="right-s">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <span style="width: 50%;"></span>
                        </div>
                        <div class="progress-text">
                            <span>Progress</span>
                            <span class="percent">50%</span>
                        </div>
                    </div>

                    <div class="lang-switcher">
                        <a class="lang-btn" data-lang="en">EN</a> |
                        <a class="lang-btn" data-lang="ua">UA</a>
                    </div>
                    <button class="btn">
                        <a id="user" href="/profile-student">
                            <img src="../images/user-avatar.png" alt="user image" />
                        </a>
                    </button>
                    <div>
                        <button>
                            <img class="oth" src="../images/more.png" alt="other-options-ico">
                        </button>
                        <div class="dropdown-menu">
                            <a href="#">
                                <img src="../images/share-c.svg" alt="share-ico">
                                Share this course
                            </a>
                            <a href="#">
                                <img src="../images/unenroll.svg" alt="Unenroll">
                                Unenroll from this course
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        `;
    }
}

customElements.define('course-header', HeaderComponent);