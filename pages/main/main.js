import { getRouter } from '../../js/router.js'

export default class MainPage {
    render() {
        return `
        <div class="main-container">
            <h1>PLAY</h1>
            <div class="main-container__btn">
                <button id="main__online-btn">온라인</button>
                <button id="main__offline-btn">오프라인</button>
            </div>
        </div>
        `;
    }

    afterRender() {

        const router = getRouter(); // router 객체 가져오기
        const onlineBtn = document.getElementById('main__online-btn');
        const offlineBtn = document.getElementById('main__offline-btn');

        onlineBtn.addEventListener('click', () => {
            router.navigate('/waitgame');
        });

        offlineBtn.addEventListener('click', () => {
            router.navigate('/offline_game');
        });
    }
}
