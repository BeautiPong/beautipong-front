import { getRouter } from '../../js/router.js';
import { setMatchingWebSocket } from './../../assets/components/nav/nav.js';
import { connectNotificationWebSocket } from '../../assets/components/nav/nav.js';
import {SERVER_IP} from "../../js/index.js";

export default class WaitGamePage {
    constructor() {
        this.socket = null; // WebSocket 인스턴스를 저장할 변수
    }
    static socket = null;

    // 페이지 렌더링
    render() {
        return `
            <div class="game-div">
                <div class="game-container">
                    <!-- 세 요소를 감싸는 .game-main 컨테이너 추가 -->
                    <div class="game-main">
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
                    
                    <!-- 게임 시작 버튼을 game-container 안에 추가 -->
                    <button class="start-game-btn hidden" id="startGameBtn">게임 시작</button>
                </div>
            </div>
        `;
    }

    // afterRender() {
    //     const accessToken = localStorage.getItem("access_token");
    // }


	showLoader() {
        const loader = document.getElementById('loader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');
        // console.log("loader", loader, "inviteBtn", inviteBtn, "randomBtn", randomBtn);
        // 로더를 표시하고 버튼들을 숨김
        loader.classList.remove('hidden');
        inviteBtn.style.display = 'none';
        randomBtn.style.display = 'none';
    }

    // 로더를 숨기고 버튼을 다시 표시하는 메서드
    hideLoader() {
        const loader = document.getElementById('loader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');

        // 로더를 숨기고 버튼을 다시 표시
        loader.classList.add('hidden');
        inviteBtn.style.display = 'none';
        randomBtn.style.display = 'none';
    }

    // hidematchLoader() {
    //     const matchingLoader = document.getElementById('matchingLoader');
    //     matchingLoader.classList.add('hidden');
    // }

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
            this.startMatch(); // 랜덤 매칭 시작
        });

        document.getElementById('inviteBtn').addEventListener('click', () => {
            this.loadFriends(); // 친구 목록 로드
            this.openModal(); // 모달 열기
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal(); // 모달 닫기
        });
    }

	async startMatch(friendNickname = null,host) {
        if(!friendNickname)
            this.showLoader(); // 로더를 표시하고 버튼을 숨김

        try {
            const accessToken = localStorage.getItem("access_token");

            let response;
            if(friendNickname)
            {
                const myNickname = localStorage.getItem('nickname');
                console.log("내 닉네임:", myNickname);
                console.log("친구 닉네임:", friendNickname);
                response = await fetch('http://localhost:8000/api/game/match/', {
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
            }
            else
            {
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
				response = await fetch('http://localhost:8000/api/game/match/', {
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
            this.connectWebSocket(data.jwt_token, data.waiting_room, data.room_name,host);
            console.log("매칭 성공: 웹소켓 연결을 시작");

        } catch (error) {
            console.error('매칭 중 오류가 발생했습니다:', error);
        }
    }

    connectWebSocket(jwtToken, waitingRoom = null, roomName = null,host = null) {
		let socketUrl;

		// waitingRoom과 roomName이 있으면 해당 URL로 WebSocket 연결, 없으면 기본 URL로 연결
		if (waitingRoom && roomName) {
			socketUrl = `ws://localhost:8000/ws/match/${waitingRoom}/${roomName}/${host}/?token=${jwtToken}`;
		} else {
			socketUrl = `ws://localhost:8000/ws/match/?token=${jwtToken}`;
		}

		// WebSocket 연결 시작
		WaitGamePage.socket = new WebSocket(socketUrl);
		setMatchingWebSocket(WaitGamePage.socket);

		WaitGamePage.socket.onopen = () => {
			console.log("매칭 웹소켓 연결 성공");
		};

		WaitGamePage.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			console.log("Received data:", data);

			// 게임 시작 이벤트 처리
			if (data.type === 'game_start') {
				if (data.room_name) {
                    const startGameBtn = document.getElementById('startGameBtn');
                    const myNickname = localStorage.getItem('nickname');
                    console.log("data.host:",data.host);
                    if(data.host == myNickname)
                    {
                        startGameBtn.classList.remove('hidden');
                        startGameBtn.classList.add('show');
                    }

                    const guest = data.guest; // 친구의 닉네임 출력
                    const room_name = data.room_name;

                    const opponentNickname = data.host === myNickname ? guest : data.host;

                    this.fetchOpponentInfo(opponentNickname); 
                    this.hideLoader();

                    document.getElementById('opponentDetails').classList.remove('hidden');
                    document.getElementById('opponentDetails').classList.add('active');
                    
                    startGameBtn.addEventListener("click", (event) => {
                        this.handleButtonClick(event, guest, room_name);
                    });
                    
                    
					WaitGamePage.socket.close();  // 매칭 컨슈머 연결 종료
					setMatchingWebSocket(null);
				} else {
					console.error('room_name is undefined');
				}
			}
		};

		WaitGamePage.socket.onclose = (e) => {
			console.log('매칭 웹소켓 연결 종료');
			setMatchingWebSocket(null);
		};
	}


    // handleButtonClick 함수를 클래스의 메서드로 선언
    handleButtonClick = (event, guest, room_name) => {
        console.log("게임 시작 버튼 클릭");
        const access_token = localStorage.getItem("access_token");
        const notificationWebSocket = connectNotificationWebSocket(access_token);
        notificationWebSocket.send(JSON.stringify({
            type: 'navigateToGamePage',
            guest: guest, // 친구의 닉네임
            room_name: room_name, // 방 이름
        }));
        this.navigateToGamePage(room_name); // 여기서 this는 올바르게 바인딩됨
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

			const response = await fetch(`http://localhost:8000/api/game/online/${roomName}/`, {
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
				response = await fetch(`http://localhost:8000/api/game/online/${roomName}/`, {
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

            const response = await fetch('http://localhost:8000/api/friend/info/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // 필요에 따라 인증 토큰 추가
                },
            });

			if (response.status === 401) {
				const newAccessToken = await refreshAccessToken();

				// 새 액세스 토큰으로 다시 요청
				response = await fetch('http://localhost:8000/api/friend/info/', {
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
                    // this.startMatch(friend.nickname); // 초대 후 매칭 시작
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
}
