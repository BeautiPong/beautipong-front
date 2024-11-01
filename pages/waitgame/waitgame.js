import {getRouter} from '../../js/router.js';
import {setMatchingWebSocket} from './../../assets/components/nav/nav.js';
import {connectNotificationWebSocket} from '../../assets/components/nav/nav.js';
import {SERVER_IP} from "../../js/index.js";
import {refreshAccessToken} from "../../js/token.js";

export default class WaitGamePage {
    static socket = null;

    render() {
        return `
            <div class="waitgame-div">
                <div class="waitgame-container">
                    <div class="game-main">
                        <div class="player-info">
                            <img src="assets/images/profile.svg" alt="프로필 사진" class="profile-img" id="playerImage">
                            <div class="icon-nickname">
                                <img src="assets/icons/bronz.svg" class="player-icon"></img>
                                <p id="playerNickname">nickname</p>
                            </div>
                            <p class="score" id="playerScore">10전 10승 0패</p>
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
                            <button class="random-btn" id="randomBtn">랜덤매칭</button>
                            <div class="matchingLoader hidden" id="matchingLoader"></div> <!-- 로더는 처음엔 hidden -->
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

                    <!-- 게임 시작 버튼을 game-container 안에 추가 -->
                    <button class="start-game-btn hidden" id="startGameBtn">게임 시작</button>
                    <div class="waiting-message hidden" id="waitingMessage">
                      <p>방장이 들어올 때 까지 잠시만 기다려주세요!</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="gameStartContainer hidden" id="gameStartContainer">
            <p class="gameStartText" id="gameStartText">
                <span id="gameCountDown">5</span>
                초 후 게임이 시작됩니다!
            </p>
            <div id="gameStartLoader"></div>
        </div>
        `;
    }

    async loadUserInfo() {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/user/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`http://${SERVER_IP}/api/user/profile/`, {
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

    updatePlayerInfo(data) {
        const playerImage = document.getElementById('playerImage');
        const playerNickname = document.getElementById('playerNickname');
        const playerScore = document.getElementById('playerScore');

        if (playerImage) {
            if (!data.image) {
                playerImage.src = 'assets/images/profile.svg';
            } else {
                playerImage.src = data.image;
            }
        }

        if (playerNickname) {
            playerNickname.textContent = data.nickname;
        }

        if (playerScore) {
            playerScore.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${(data.match_cnt - data.win_cnt)}패`;
        }
    }


    showmatchLoader() {
        const matchingLoader = document.getElementById('matchingLoader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');

        matchingLoader.classList.remove('hidden');
        inviteBtn.style.display = 'none';
        randomBtn.style.display = 'none';
    }

    hidematchLoader() {
        const matchingLoader = document.getElementById('matchingLoader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');

        // 로더를 숨기고 버튼을 다시 표시
        matchingLoader.classList.add('hidden');
        inviteBtn.style.display = 'none';
        randomBtn.style.display = 'none';
    }

    showGameStartLoader() {
        const gameStartContainer = document.getElementById('gameStartContainer');
        const gameCountDown = document.getElementById('gameCountDown');

        let countdown = 5;
        gameCountDown.textContent = `${countdown}`;

        // 컨테이너를 표시 (flex로 설정하여 보이게 함)
        gameStartContainer.style.display = 'flex';

        // 1초마다 카운트다운 텍스트를 갱신
        const interval = setInterval(() => {
            countdown--;
            gameCountDown.textContent = `${countdown}`;

            if (countdown === 0) {
                clearInterval(interval); // 카운트다운이 끝나면 인터벌을 제거
            }
        }, 1000);
    }

    hideGameStartLoader() {
        const gameStartContainer = document.querySelector('.gameStartContainer');
        if (gameStartContainer) {
            gameStartContainer.classList.add('hidden');
        }
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

        function cleanUp() {
          if(localStorage.getItem('opponent') === null) return;
    
          console.log('클린업 함수 실행');
          const access_token = localStorage.getItem('access_token');
          const notificationWebSocket = connectNotificationWebSocket(access_token);
          const myNickname = localStorage.getItem('nickname');
          const opponentNickname = localStorage.getItem('opponent');
          console.log("opponentNickname: ", opponentNickname);
          notificationWebSocket.send(
            JSON.stringify({
              type: 'leaveWaitingRoom',
              leaver: myNickname, // 내 닉네임
              remainder: opponentNickname, // 친구의 닉네임
            })
          );
          localStorage.removeItem('opponent');
        }
    
        const nav__logout = document.getElementById('nav__logout');
        nav__logout.addEventListener('click', cleanUp);
        const nav__main = document.getElementById('nav__main');
        nav__main.addEventListener('click', cleanUp);
        const nav__mypage = document.getElementById('nav__mypage');
        nav__mypage.addEventListener('click', cleanUp);
        const nav__friend = document.getElementById('nav__friend');
        nav__friend.addEventListener('click', cleanUp);
        const nav__rank = document.getElementById('nav__rank');
        nav__rank.addEventListener('click', cleanUp);

        window.addEventListener('popstate', cleanUp);
        window.addEventListener('beforeunload', cleanUp);
    }

    async startRandomMatch() {
        // this.showLoader(); // 로더를 표시하고 버튼을 숨김
        this.showmatchLoader(); // 로더를 표시하고 버튼을 숨김

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

    async startMatch(friendNickname = null, host) {
        if (!friendNickname)
            this.showLoader(); // 로더를 표시하고 버튼을 숨김

        try {
            const accessToken = localStorage.getItem("access_token");

            let response;
            if (friendNickname) {
                const myNickname = localStorage.getItem('nickname');
                console.log("내 닉네임:", myNickname);
                console.log("친구 닉네임:", friendNickname);
                response = await fetch(`https://${SERVER_IP}/api/game/match/`, {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                    },
                    body: JSON.stringify({
                        "myNickname": myNickname,
                        "friendNickname": friendNickname,
                    })
                });
            } else {
                response = await fetch('http://localhost:8000/api/game/match/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                    },
                    body: JSON.stringify({
                        // 필요한 경우 추가 데이터 여기에 포함
                    })
                });
            }

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
            console.log('매칭 응답:', data);

            // 매칭 성공: 웹소켓 연결을 시작
            this.connectWebSocket(data.jwt_token, data.waiting_room, data.room_name, host);
            console.log("매칭 성공: 웹소켓 연결을 시작");

        } catch (error) {
            console.error('매칭 중 오류가 발생했습니다:', error);
        }
    }


    // handleButtonClick 함수를 클래스의 메서드로 선언
    handleButtonClick = (event, data) => {
        console.log("게임 시작 버튼 클릭");
        const access_token = localStorage.getItem("access_token");
        const notificationWebSocket = connectNotificationWebSocket(access_token);
        notificationWebSocket.send(JSON.stringify({
            type: 'navigateToGamePage',
            guest: data.guest, // 친구의 닉네임
            room_name: data.room_name, // 방 이름
        }));

        this.showGameStartLoader();

        setTimeout(() => {
            if (data.room_name) {
                this.navigateToGamePage(data.room_name, data.jwtToken);
            } else {
                console.error('room_name is undefined');
            }
        }, 5000);
    }

    async fetchOpponentInfo(opponentNickname) {
        try {
            const accessToken = localStorage.getItem("access_token");
            const response = await fetch(`http://${SERVER_IP}:8000/api/user/info/${opponentNickname}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('상대방 정보를 불러오지 못했습니다.');
            }

            const data = await response.json();
            console.log('상대방 정보:', data);
            this.updateOpponentInfo(data);
        } catch (error) {
            console.error('상대방 정보 로드 중 오류 발생:', error);
        }
    }

    updateOpponentInfo(data) {
        const opponentImage = document.getElementById('opponentImage');
        const opponentNickname = document.getElementById('opponentNickname');
        const opponentScore = document.getElementById('opponentScore');

        opponentImage.src = data.image || 'assets/images/profile.svg';
        opponentNickname.textContent = data.nickname;
        opponentScore.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${(data.match_cnt - data.win_cnt)}패`;
    }

    // 게임 페이지로 이동하기 전에 API 요청
    async navigateToGamePage(roomName) {
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
            document.querySelector('.nav-container').style.display = 'none';
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

            const data = await response.json();
            const friends = data.friends || [];
            this.renderFriendList(friends, accessToken);
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    renderFriendList(friends, access_token) {
        const friendList = document.getElementById('friendList');
        friendList.innerHTML = '';

        if (friends.length === 0) {
            const li = document.createElement('li');
            li.textContent = '초대할 수 있는 친구가 없습니다.';
            friendList.appendChild(li);
        } else {
            friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.nickname;
                li.addEventListener('click', () => {
                    console.log("친구 클릭");
                    this.sendInvite(friend.nickname, access_token);
                    this.closeModal();
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

    async sendInvite(friendNickname, access_token) {
        const message = `${friendNickname}님이 게임에 초대했습니다.`;
        const notificationWebSocket = connectNotificationWebSocket(access_token);
        const myNickname = localStorage.getItem('nickname');

        await this.waitForSocketConnection(notificationWebSocket);
        notificationWebSocket.send(JSON.stringify({

            type: 'invite_game',
            sender: myNickname,
            receiver: friendNickname,
            message: message
        }));
    }

    handleWebSocketMessage(e) {
        const data = JSON.parse(e.data);
        console.log("Received data:", data);

        if (data.type === 'game_start' && data.host && data.room_name) {
            const roomName = data.room_name;
            const myNickname = localStorage.getItem('nickname');
            const nicknames = roomName.split('_');
            const startGameBtn = document.getElementById('startGameBtn');

            if (data.host == myNickname) {
                startGameBtn.classList.remove('hidden');
                startGameBtn.classList.add('show');

            }
            else
            {
              console.log("방장이 아닙니다.");
            //   document.getElementById("waitingMessage").classList.remove("hidden");
            const messageParagraph = document.querySelector('#waitingMessage p');

            messageParagraph.textContent = "방장이 게임 시작을 누를 때까지 잠시만 기다려주세요!";
            }

            startGameBtn.addEventListener("click", (event) => {
                this.handleButtonClick(event, data);
            });

            WaitGamePage.socket.close();
            setMatchingWebSocket(null);
            const opponentNickname = nicknames[1] === myNickname ? nicknames[2] : nicknames[1];

            this.fetchOpponentInfo(opponentNickname);

            this.hidematchLoader();

            document.getElementById('opponentDetails').classList.remove('hidden');
            document.getElementById('opponentDetails').classList.add('active');
        } else if (data.type === 'game_start' && data.room_name) {
            const roomName = data.room_name;
            const myNickname = localStorage.getItem('nickname');
            const nicknames = roomName.split('_');
            WaitGamePage.socket.close();
            setMatchingWebSocket(null);
            const opponentNickname = nicknames[1] === myNickname ? nicknames[2] : nicknames[1];

            this.fetchOpponentInfo(opponentNickname);

            this.hidematchLoader();

            document.getElementById('opponentDetails').classList.remove('hidden');
            document.getElementById('opponentDetails').classList.add('active');

            this.showGameStartLoader();

            setTimeout(() => {
                if (data.room_name) {
                    this.navigateToGamePage(data.room_name, data.jwtToken);
                } else {
                    console.error('room_name is undefined');
                }
            }, 5000);
        } else
            console.error('room_name is undefined');
    }

    async fetchOpponentInfo(opponentNickname) {
        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`https://${SERVER_IP}/api/user/info/${opponentNickname}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('상대방 정보를 불러오지 못했습니다.');
            }

            const data = await response.json();
            this.updateOpponentInfo(data);
        } catch (error) {
            console.error('상대방 정보 로드 중 오류 발생:', error);
        }
    }

    updateOpponentInfo(data) {
        const opponentImage = document.getElementById('opponentImage');
        const opponentNickname = document.getElementById('opponentNickname');
        const opponentScore = document.getElementById('opponentScore');

        opponentImage.src = data.image || 'assets/images/profile.svg';
        opponentNickname.textContent = data.nickname;
        opponentScore.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${(data.match_cnt - data.win_cnt)}패`;
    }

    connectWebSocket(jwtToken, waitingRoom = null, roomName = null, host = null) {
        let socketUrl;

        if (waitingRoom && roomName) {
            socketUrl = `wss://${SERVER_IP}/ws/match/${waitingRoom}/${roomName}/${host}/?token=${jwtToken}`;
        } else {
            socketUrl = `wss://${SERVER_IP}/ws/match/?token=${jwtToken}`;
        }

        WaitGamePage.socket = new WebSocket(socketUrl);
        setMatchingWebSocket(WaitGamePage.socket);

        WaitGamePage.socket.onopen = () => {
            console.log("매칭 웹소켓 연결 성공");
        };

        WaitGamePage.socket.onmessage = (e) => {
            this.handleWebSocketMessage(e);
        };

        WaitGamePage.socket.onclose = (e) => {
            console.log('매칭 웹소켓 연결 종료');
            setMatchingWebSocket(null);
        };
    }
}