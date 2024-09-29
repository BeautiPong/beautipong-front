import { getRouter } from '../../js/router.js';
import { setMatchingWebSocket } from './../../assets/components/nav/nav.js';
import { connectNotificationWebSocket } from '../../assets/components/nav/nav.js';
import {SERVER_IP} from "../../js/index.js";
import {refreshAccessToken} from "../../js/token.js";

export default class WaitGamePage {
    constructor() {
        this.socket = null; // WebSocket 인스턴스를 저장할 변수
    }

    // 페이지 렌더링
    render() {
        return `
        <div class="game-div">
            <div class="game-container">
                <div class="player-info" id="playerInfo">
                    <img src="assets/images/profile.svg" alt="프로필 사진" class="profile-img" id="playerImage">
                    <div class="icon-nickname">
                        <img src="assets/icons/bronz.svg" class="player-icon" id="playerIcon"></img>
                        <p class="nickname" id="playerNickname">nickname</p>
                    </div>
                    <p class="score" id="playerScore">0전 0승 0패</p>
                </div>
                <div class="vs-text">
                    <p>VS</p>
                </div>
                <div class="opponent-info" id="opponentInfo">
                    <div class="friend-modal" id="friendModal">
                        <button class="close-modal" id="closeModal">&times;</button>
                        <h2>친구 목록</h2>
                        <ul class="friend-list" id="friendList"></ul>
                    </div>
                    <button class="invite-btn" id="inviteBtn">친구초대</button>
                    <button class="random-btn" id="randomBtn">랜덤매칭</button>
                    <div class="loader hidden" id="loader"></div> <!-- 로더는 처음엔 hidden -->
                    <div class="opponent-details hidden" id="opponentDetails">
                        <img src="assets/images/profile.svg" alt="프로필 사진" class="profile-img" id="opponentImage">
                        <div class="icon-nickname">
                            <img src="assets/icons/bronz.svg" class="player-icon" id="opponentIcon"></img>
                            <p class="nickname" id="opponentNickname">nickname</p>
                        </div>
                        <p class="score" id="opponentScore">0전 0승 0패</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    // 사용자 정보 불러오기
    async loadUserInfo() {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/user/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                },
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/user/profile/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error('사용자 정보를 불러오지 못했습니다.');
            }

            const data = await response.json();
            this.updatePlayerInfo(data);
        } catch (error) {
            console.error('사용자 정보 로드 중 오류 발생:', error);
        }
    }

    // 사용자 정보를 UI에 업데이트
    updatePlayerInfo(data) {
        const playerImage = document.getElementById('playerImage');
        const playerNickname = document.getElementById('playerNickname');
        const playerScore = document.getElementById('playerScore');

        if (!data.image) {
            playerImage.src = 'assets/images/profile.svg';
        } else {
            playerImage.src = data.image;
        }
        playerNickname.textContent = data.nickname; // 닉네임
        playerScore.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${(data.match_cnt - data.win_cnt)}패`; // 경기 결과
    }

    showLoader() {
        const loader = document.getElementById('loader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');

        // 로더를 표시하고 버튼들을 숨김
        loader.classList.remove('hidden');
        inviteBtn.style.display = 'none';
        randomBtn.style.display = 'none';
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
    }

    // 모달 열기
    openModal() {
        document.getElementById('friendModal').classList.add('active');
    }

    // 모달 닫기
    closeModal() {
        document.getElementById('friendModal').classList.remove('active');
    }

    bindEvents() {
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.startRandomMatch(); // 랜덤 매칭 시작
        });

        document.getElementById('inviteBtn').addEventListener('click', () => {
            this.loadFriends(); // 친구 목록 로드
            this.openModal(); // 모달 열기
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal(); // 모달 닫기
        });

        this.loadUserInfo();
    }

    async startRandomMatch() {
        this.showLoader(); // 로더를 표시하고 버튼을 숨김

        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/game/match/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                },
                body: JSON.stringify({
                    // 필요한 경우 추가 데이터 여기에 포함
                })
            });

            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();

                // 새 액세스 토큰으로 다시 요청
                response = await fetch(`https://${SERVER_IP}/api/game/match/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error('랜덤 매칭에 실패했습니다.');
            }

            const data = await response.json();

            // 매칭 성공: 웹소켓 연결을 시작
            this.connectWebSocket(data.jwt_token, data.waiting_room, data.room_name);

        } catch (error) {
            console.error('랜덤 매칭 중 오류가 발생했습니다:', error);
        }
    }



    // 게임 페이지로 이동하기 전에 API 요청
    async navigateToGamePage(roomName, jwtToken) {
        // console.log('Room Name:', roomName);  // Debugging 추가
        // console.log('JWT Token:', jwtToken);  // Debugging 추가

        try {
            const accessToken = localStorage.getItem("access_token");
            const response = await fetch(`https://${SERVER_IP}/api/game/online/${roomName}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                },
            });

            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();

                // 새 액세스 토큰으로 다시 요청
                response = await fetch(`https://${SERVER_IP}/api/game/online/${roomName}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error('게임 페이지 요청에 실패했습니다.');
            }

            const data = await response.json();
            console.log('게임 페이지 응답:', data);

            const router = getRouter();
            router.navigate('/online-game', {
                roomName: data.room_name,
                jwtToken: data.jwt_token
            });
        } catch (error) {
            console.error('게임 페이지 요청 중 오류가 발생했습니다:', error);
        }
    }


    // 친구 목록 로드
    async loadFriends() {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/friend/info/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // 필요에 따라 인증 토큰 추가
                },
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();

                // 새 액세스 토큰으로 다시 요청
                response = await fetch(`https://${SERVER_IP}/api/friend/info/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (!response.ok) {
                throw new Error('친구 목록을 불러오는 데 실패했습니다.');
            }

            const data = await response.json(); // 서버에서 받은 데이터를 파싱
            const friends = data.friends || []; // friends 배열 추출
            this.renderFriendList(friends, accessToken);
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    // 친구 목록을 렌더링하는 메서드
    renderFriendList(friends, access_token) {
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
                    console.log("친구 클릭");
                    this.sendInvite(friend.nickname, access_token); // 친구에게 초대 전송
                    this.closeModal(); // 초대 후 모달 닫기
                });
                friendList.appendChild(li);
            });
        }
    }

    waitForSocketConnection(socket) {
        return new Promise((resolve, reject) => {
            if (socket.readyState === WebSocket.OPEN) {
                resolve();
            } else {
                socket.addEventListener('open', resolve);
            }
        });
    }

    // 친구에게 초대 메시지 전송
    async sendInvite(friendNickname, access_token) {
        const message = `${friendNickname}님이 게임에 초대했습니다.`;
        const notificationWebSocket = connectNotificationWebSocket(access_token);
        const myNickname = localStorage.getItem('nickname');

        await this.waitForSocketConnection(notificationWebSocket);
        // 초대 메시지 전송
        notificationWebSocket.send(JSON.stringify({

            type: 'invite_game', // 초대 메시지 유형
            sender: myNickname, // 실제 닉네임으로 변경
            receiver: friendNickname, // 친구의 닉네임
            message: message
        }));
    }

    handleWebSocketMessage(e) {
        const data = JSON.parse(e.data);
        console.log("Received data:", data);

        if (data.type === 'game_start') {
            const roomName = data.room_name;
            const myNickname = localStorage.getItem('nickname');
            const nicknames = roomName.split('_');

            const opponentNickname = nicknames[1] === myNickname ? nicknames[2] : nicknames[1];

            // 상대방 정보를 가져와서 화면에 표시
            this.fetchOpponentInfo(opponentNickname);

            // 매칭이 완료되었으므로 로더를 숨기고 상대방 정보를 보여줌
            this.hideLoader();
            document.getElementById('opponentDetails').classList.add('active'); // 상대방 정보 표시

            if (data.room_name) {
                // this.navigateToGamePage(data.room_name, jwtToken);
                this.socket.close();  // 매칭 컨슈머 연결 종료
                setMatchingWebSocket(null);
            } else {
                console.error('room_name is undefined');
            }
        }
    }

// 상대방 정보 가져오기 함수
    async fetchOpponentInfo(opponentNickname) {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/user/info/${opponentNickname}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // JWT 토큰 추가
                },
            });

            if (!response.ok) {
                throw new Error('상대방 정보를 불러오지 못했습니다.');
            }

            const data = await response.json();
            this.updateOpponentInfo(data); // 상대방 정보를 UI에 업데이트
        } catch (error) {
            console.error('상대방 정보 로드 중 오류 발생:', error);
        }
    }

// 상대방 정보 업데이트 함수
    updateOpponentInfo(data) {
        const opponentImage = document.getElementById('opponentImage');
        const opponentNickname = document.getElementById('opponentNickname');
        const opponentScore = document.getElementById('opponentScore');

        // 상대방 정보 업데이트
        opponentImage.src = data.image || 'assets/images/profile.svg'; // 기본 프로필 이미지
        opponentNickname.textContent = data.nickname; // 상대방 닉네임
        opponentScore.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${(data.match_cnt - data.win_cnt)}패`; // 상대방 경기 전적
    }

    // WebSocket 연결
    connectWebSocket(jwtToken, waitingRoom = null, roomName = null) {
        let socketUrl;

        if (waitingRoom && roomName) {
            socketUrl = `wss://${SERVER_IP}/ws/match/${waitingRoom}/${roomName}/?token=${jwtToken}`;
        } else {
            socketUrl = `wss://${SERVER_IP}/ws/match/?token=${jwtToken}`;
        }

        this.socket = new WebSocket(socketUrl);
        setMatchingWebSocket(this.socket);

        this.socket.onopen = () => {
            console.log("매칭 웹소켓 연결 성공");
        };

        this.socket.onmessage = (e) => {
            this.handleWebSocketMessage(e); // 받은 메시지를 처리하는 함수 호출
        };

        this.socket.onclose = (e) => {
            console.log('매칭 웹소켓 연결 종료');
            setMatchingWebSocket(null);
        };
    }

}
