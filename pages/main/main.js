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
            <div id="notification-container">
                <button id="notification-btn">
                    <span id="notification-count" class="hidden">0</span>
                    🔔 알림
                </button>
            </div>
        </div>
        `;
    }

    afterRender() {

        const router = getRouter(); // router 객체 가져오기
        const onlineBtn = document.getElementById('main__online-btn');
        const offlineBtn = document.getElementById('main__offline-btn');
        const notificationBtn = document.getElementById('notification-btn');
        const notificationCount = document.getElementById('notification-count');

        onlineBtn.addEventListener('click', () => {
            router.navigate('/waitgame');
        });

        offlineBtn.addEventListener('click', () => {
            router.navigate('/waitgame');
        });

        const token = localStorage("access_token");
        let unreadNotifications = 0; // 읽지 않은 알림의 수를 저장할 변수

        const chatSocket = new WebSocket(
            `ws://localhost:8000/ws/chat/jonhan/?token=${token}`
        );

        chatSocket.onopen = function(e) {
            console.log('WebSocket 연결이 성공적으로 열렸습니다.');
        };

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            const type = data.type;
            if (type === "invite_game" || type === "friend_request") {
                // 알림 수를 업데이트
                unreadNotifications++;
                notificationCount.textContent = unreadNotifications;
                notificationCount.classList.remove('hidden');
            }
        };

        chatSocket.onclose = function(e) {
            console.error('채팅 소켓이 예상치 않게 닫혔습니다.');
        };

        notificationBtn.addEventListener('click', () => {
            unreadNotifications = 0;
            notificationCount.textContent = unreadNotifications;
            notificationCount.classList.add('hidden');
            // 여기서 알림 페이지로 이동하거나 드롭다운을 표시할 수 있습니다.
        });
    }
}
