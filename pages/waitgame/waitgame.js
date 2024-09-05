import { getRouter } from '../../js/router.js';
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
                        <button class="random-btn" id="randomBtn">랜덤매칭</button>
						<div class="loader hidden" id="loader"></div> <!-- 로더는 처음엔 hidden -->
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const accessToken = localStorage.getItem("access_token");
        this.socket = new WebSocket(
            'ws://'
            + 'localhost:8000'
            + '/ws/user/'
            + '?token=' + accessToken
            );
            
        this.socket.onopen = () => {
            console.log('WebSocket 연결됨');
        }
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

    // 로더를 숨기고 버튼을 다시 표시하는 메서드
    hideLoader() {
        const loader = document.getElementById('loader');
        const inviteBtn = document.getElementById('inviteBtn');
        const randomBtn = document.getElementById('randomBtn');

        // 로더를 숨기고 버튼을 다시 표시
        loader.classList.add('hidden');
        inviteBtn.style.display = 'inline-block';
        randomBtn.style.display = 'inline-block';
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
    }

	async startRandomMatch() {
        this.showLoader(); // 로더를 표시하고 버튼을 숨김

        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch('http://localhost:8000/api/game/match/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
                },
                body: JSON.stringify({
                    // 필요한 경우 추가 데이터 여기에 포함
                })
            });

            if (!response.ok) {
                throw new Error('랜덤 매칭에 실패했습니다.');
            }

            const data = await response.json();
            console.log('매칭 1111', data);

            // 매칭 성공: 웹소켓 연결을 시작
            this.connectWebSocket(data.jwt_token, data.waiting_room, data.room_name);

        } catch (error) {
            console.error('랜덤 매칭 중 오류가 발생했습니다:', error);
        }
    }

    connectWebSocket(jwtToken, waitingRoom = null, roomName = null) {
		let socketUrl;
	
		// waitingRoom과 roomName이 있으면 해당 URL로 WebSocket 연결, 없으면 기본 URL로 연결
		if (waitingRoom && roomName) {
			socketUrl = `ws://localhost:8000/ws/match/${waitingRoom}/${roomName}/?token=${jwtToken}`;
		} else {
			socketUrl = `ws://localhost:8000/ws/match/?token=${jwtToken}`;
		}
	
		// WebSocket 연결 시작
		this.socket = new WebSocket(socketUrl);
	
		this.socket.onopen = () => {
			console.log("매칭 웹소켓 연결 성공");
		};
	
		this.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			console.log("Received data:", data);
	
			// 게임 시작 이벤트 처리
			if (data.type === 'game_start') {
				if (data.room_name) {
					this.navigateToGamePage(data.room_name, jwtToken);
				} else {
					console.error('room_name is undefined');
				}
			}
		};
	
		this.socket.onclose = (e) => {
			console.error('Chat socket closed unexpectedly');
		};
	}

    // 게임 페이지로 이동하기 전에 API 요청
    async navigateToGamePage(roomName, jwtToken) {
		console.log('Room Name:', roomName);  // Debugging 추가
		console.log('JWT Token:', jwtToken);  // Debugging 추가
	
		try {
			const accessToken = localStorage.getItem("access_token");
	
			const response = await fetch(`http://localhost:8000/api/game/online/${roomName}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`, // JWT 토큰을 헤더에 추가
				},
			});
	
			if (!response.ok) {
				throw new Error('게임 페이지 요청에 실패했습니다.');
			}
	
			const data = await response.json();
			// console.log('게임 페이지 응답:', data);
			console.log('testttttttttttttttttt');
			console.log(data.room_name);
			console.log(data.jwt_token);
			console.log('testttttttttttttttttt');
	
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

            if (!response.ok) {
                throw new Error('친구 목록을 불러오는 데 실패했습니다.');
            }

            console.log(accessToken);
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

    // 친구에게 초대 메시지 전송
    async sendInvite(friendNickname, access_token) {
        const message = `${friendNickname}님이 게임에 초대했습니다.`;
    
        // WebSocket 연결 설정
        // this.socket = new WebSocket('ws://localhost:8000/ws/notifications/'); 

        // this.socket = new WebSocket(
        //     'ws://'
        //     + 'localhost:8000'
        //     + '/ws/user/'
        //     + '?token=' + access_token
        //     );
            
        // this.socket.onopen = () => {
        //     console.log('WebSocket 연결됨');

            // 초대 메시지 전송
        this.socket.send(JSON.stringify({
            type: 'invite_game', // 초대 메시지 유형
            sender: '나의닉네임', // 실제 닉네임으로 변경
            message: message
        }));
        alert(`${friendNickname}에게 초대장을 보냈습니다.`);
            // this.socket.close(); // 초대 전송 후 WebSocket 연결 종료
        // };

        this.socket.onerror = (error) => {
            console.error('WebSocket 오류:', error);
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
