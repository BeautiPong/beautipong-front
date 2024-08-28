export default class WaitGamePage {
    constructor() {
        this.socket = null; // WebSocket 인스턴스를 저장할 변수
    }

    // 페이지 렌더링
    render() {
        return `
            <div class="game-div">
                <div class="game-container">
                    <div class="player-info">
                        <img src="assets/images/profile.svg" alt="프로필 사진" class="profile-img">
                        <div class="icon-nickname">
                            <img src="assets/icons/bronz.svg" class="player-icon"></img>
                            <p class="nickname">nickname</p>
                        </div>
                        <p class="score">10전 10승 0패</p>
                    </div>
                    <div class="vs-text">
                        <p>VS</p>
                    </div>
                    <div class="opponent-info">
                        <div class="friend-modal" id="friendModal">
                            <button class="close-modal" id="closeModal">&times;</button>
                            <h2>친구 목록</h2>
                            <ul class="friend-list" id="friendList"></ul>
                        </div>
                        <button class="invite-btn" id="inviteBtn">친구초대</button>
                        <button class="random-btn">랜덤매칭</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 모달 열기
    openModal() {
        document.getElementById('friendModal').classList.add('active');
    }

    // 모달 닫기
    closeModal() {
        document.getElementById('friendModal').classList.remove('active');
    }

    // 이벤트 바인딩 메서드
    bindEvents() {
        document.getElementById('inviteBtn').addEventListener('click', () => {
            this.loadFriends(); // 친구 목록 로드
            this.openModal(); // 모달 열기
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal(); // 모달 닫기
        });
    }

    // 친구 목록 로드
    async loadFriends() {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch('http://localhost:8000/api/friend/info/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // 필요에 따라 인증 토큰 추가
                },
            });

            if (!response.ok) {
                throw new Error('친구 목록을 불러오는 데 실패했습니다.');
            }

            const data = await response.json(); // 서버에서 받은 데이터를 파싱
            const friends = data.friends || []; // friends 배열 추출
            this.renderFriendList(friends);
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    // 친구 목록을 렌더링하는 메서드
    renderFriendList(friends) {
        const friendList = document.getElementById('friendList');
        friendList.innerHTML = ''; // 기존 목록을 초기화

        if (friends.length === 0) {
            const li = document.createElement('li');
            li.textContent = '초대할 수 있는 친구가 없습니다.';
            friendList.appendChild(li);
        } else {
            friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.nickname; // 친구의 닉네임을 표시
                li.addEventListener('click', () => {
                    this.sendInvite(friend.nickname); // 친구에게 초대 전송
                    this.closeModal(); // 초대 후 모달 닫기
                });
                friendList.appendChild(li);
            });
        }
    }

    // 친구에게 초대 메시지 전송
    async sendInvite(friendNickname) {
        const message = `${friendNickname}님이 게임에 초대했습니다.`;

        // WebSocket 연결 설정
        this.socket = new WebSocket('ws://localhost:8000/ws/notifications/'); // WebSocket URL

        this.socket.onopen = () => {
            console.log('WebSocket 연결됨');

            // 초대 메시지 전송
            this.socket.send(JSON.stringify({
                type: 'invite_game', // 초대 메시지 유형
                sender: '나의닉네임', // 실제 닉네임으로 변경
                message: message
            }));
            alert(`${friendNickname}에게 초대장을 보냈습니다.`);
            this.socket.close(); // 초대 전송 후 WebSocket 연결 종료
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'start_game_with_friend') {
                alert(`${data.sender}님과 게임을 시작합니다!`);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket 연결 종료');
        };
    }
}
