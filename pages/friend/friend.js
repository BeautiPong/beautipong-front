import {createFriendRequest} from '../../assets/components/friend-request/friend-request.js';
import {createFriendList} from '../../assets/components/friend-list/friend-list.js';
import {createChatRoom} from '../../assets/components/chat-room/chat-room.js';
import {createMessage} from '../../assets/components/message/message.js';
import {createUserSearchModal} from '../../assets/components/user-search-modal/user-search-modal.js';

// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class FriendPage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
            <div class="friend">
                <div class="friend-container">
                    <div class="friend-list-container">
                        <div class="friend-request">
                            <div class="friend-request-search">
                                <p class="friend-request-text">친구요청</p>
                                <img class="friend-search-icon" src="../../assets/icons/userSearch.svg" alt="친구찾기">
                            </div>
                            <p class="friend-request-noti">새로운 친구 요청이 도착했어요!</p>
                            <div class="friend-request-box">
                                <p>새로운 친구 요청이 없습니다..</p>
                            </div>
                        </div>
                        <div class="friend-list">
                            <p class="friend-list-text">친구목록</p>
                            <div class="friend-list-box"></div>
                        </div>
                    </div>
                    <div class="chat-container">
                        <div class="chat-box">
                            <p class="chat-box-text">친구에게 메시지를 보내보세요!!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async fetchAndDisplayFriendList() {

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/chat/friend_list/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            // query selector로 friend-list-box 찾아오기
            const friendListBox = document.querySelector('.friend-list-box');

            if (data.friends.length > 0) {
                // 친구가 있으면 친구 정보 표시
                friendListBox.innerHTML = '';
                friendListBox.classList.remove('friend-list-box');
            
                data.friends.forEach(friend => {

                    const nickname = friend.nickname;
                    const image = friend.image || '../../assets/images/profile.svg';
                    const match_cnt = friend.match_cnt;
                    const win_cnt = friend.win_cnt;
                    const is_active = friend.is_active;
                    const score = friend.score;

                    
                    // 친구 요소를 생성
                    const friendComponent = createFriendList(image, nickname);
            
                    // 새 친구 요소를 DOM에 추가
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = friendComponent;
            
                    // 생성된 친구 요소를 DOM에 추가
                    const newFriendElement = tempElement.firstElementChild;
                    friendListBox.appendChild(newFriendElement);

                    // 이벤트 리스너를 직접 추가
                    const nicknameElement = newFriendElement.querySelector('.list-nickname');
                    nicknameElement.addEventListener('click', () => {
                        this.updateChatBox(nickname);
                    });
                });
            } else {
                // 친구가 없으면 다음 문구 표시
                friendListBox.innerHTML = '<p>친구가 없습니다..</p>';
            }
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류 발생:', error);
            friendListBox.classList.add('friend-list-box');
        }
    }

    async updateChatBox(friendNickname) {
        try {
            const token = localStorage.getItem('access_token');
            fetch('http://localhost:8000/api/chat/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_nickname: friendNickname })
            })
            .then(response => response.json())
            .then(data => {
                // window.location.href = `/api/chat/room/${data.room_name}/?token=${token}`;
                this.loadChatRoom(data.room_name, data.sender, token, friendNickname);
            });
        } catch (error) {
            console.error('채팅 내용을 불러오는 중 오류 발생:', error);
        }
    }

    async loadChatRoom(roomName, myname, token, friendNickname) {
        try {
            const chatContainer = document.querySelector('.chat-box');
    
            // 기존 내용을 지우고 새로운 내용으로 교체
            chatContainer.innerHTML = `
                ${createChatRoom("", friendNickname, "n승n패")}
            `;
    
            // 기존 대화 내용 불러오기
            await this.loadMessages(roomName, token);
    
            // 웹소켓 연결 설정
            const chatSocket = new WebSocket(
                `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`
            );
            

            chatSocket.onopen = function(e) {
                console.log('WebSocket connection established.');
            };
    
            chatSocket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                const myName = data.user;
                const chatLog = document.querySelector('#chat-log');
                if (chatLog) {
                    const type = myName === data.sender ? 'my-message' : 'other-user';
                    const messageHTML = createMessage(type, data.sender, data.message);
                    chatLog.innerHTML += messageHTML;
                    chatLog.scrollTop = chatLog.scrollHeight;
                }
            };
    
            chatSocket.onclose = function(e) {
                console.error('Chat socket closed unexpectedly');
            };
    
            document.querySelector('#chat-message-input').focus();
    
            document.querySelector('#chat-message-input').onkeyup = function(e) {
                if (e.isComposing || e.keyCode === 229) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            };
    
            function sendMessage() {
                const messageInputDom = document.querySelector('#chat-message-input');
                const message = messageInputDom.value;
    
                // 소켓으로 메시지 보내기
                chatSocket.send(JSON.stringify({
                    'message': message,
                    'sender' : myname,
                    'roomName': roomName
                }));
                messageInputDom.value = '';
            }
    
        } catch (error) {
            console.error('채팅 방을 불러오는 중 오류 발생:', error);
        }
    }
    
    async loadMessages(roomName, token) {
        try {
            const response = await fetch(`http://localhost:8000/api/chat/pre_message/${roomName}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            const myName = data.user;

            const chatLog = document.querySelector('#chat-log');
            chatLog.innerHTML = '';
            data.messages.forEach(message => {
                const type = myName === message.sender ? 'my-message' : 'other-user';
                chatLog.innerHTML += createMessage(type, message.sender, message.content);
            });

            // 하단으로 스크롤
            chatLog.scrollTop = chatLog.scrollHeight;
    
        } catch (error) {
            console.error('메시지를 불러오는 중 오류 발생:', error);
        }
    }

    // 친구 검색 모달창
    showUserSearchModal() {
        const token = localStorage.getItem('access_token');

        // 모달 컴포넌트 불러오기
        const modalHTML = createUserSearchModal();

        // 새 div 요소를 생성하여 모달을 페이지에 추가
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);

        // 닫기 버튼에 이벤트 리스너 추가
        const closeBtn = modalDiv.querySelector('.close');
        closeBtn.onclick = function() {
            modalDiv.remove();
        };

        // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
        window.onclick = function(event) {
            if (event.target == modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };

        // 친구 요청 보내기
        async function sendFriendRequest(token, name, userFindBox) {
            const requestBtn = userFindBox.querySelector('.request-btn');

            requestBtn.addEventListener('click', async function() {
                try {
                    const response = await fetch(`http://localhost:8000/api/friend/add/${name}/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    userFindBox.innerHTML = '';

                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        };

        // 검색 입력 필드에 이벤트 리스너 추가
        const searchInput = modalDiv.querySelector('#friend-name-search-input');
        searchInput.addEventListener('keydown', function(event) {

            if (event.key === 'Enter') {
                const friend_nickname = searchInput.value.trim();

                if (friend_nickname.length > 0) {
                    // 친구 검색
                    fetch(`http://localhost:8000/api/friend/search/${friend_nickname}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("회원 찾음");
                        const userFindBox = modalDiv.querySelector('.user-find-box');
                        userFindBox.innerHTML = '';
                        
                        if (data) {
                            // 친구 정보를 보여주는 로직 추가
                            userFindBox.innerHTML = `
                                <div class="user-find-box-detail">
                                    <img class="find-friend-image" src="${data.image}">
                                    <p class="find-friend-name">${data.name}</p>
                                    <button class="request-btn">
                                        <p class="request-btn-text">친구요청</p>
                                    </button>
                                </div>
                            `;

                            sendFriendRequest(token, data.name, userFindBox);
                        } else {
                            userFindBox.innerHTML = '<p>해당 닉네임의 친구를 찾을 수 없습니다.</p>';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching friend:', error);
                    });
                } else {
                    const userFindBox = modalDiv.querySelector('.user-find-box');
                    userFindBox.innerHTML = '<p>검색어를 입력해주세요.</p>';
                }
            }
        });
    }

    async clickUserSearchButton() {

        const token = localStorage.getItem('access_token');

        document.addEventListener('DOMContentLoaded', () => {
            const searchIconElement = document.querySelector('.friend-search-icon');
        
            if (searchIconElement) {
                searchIconElement.addEventListener('click', async () => {
                    this.showUserSearchModal();
                });
            } else {
                console.error('friend-search-icon 요소를 찾을 수 없습니다.');
            }
        });

        // 웹소켓 연결 설정 
        const notificationSocket = new WebSocket(
            `ws://localhost:8000/ws/user/?token=${token}`
        );


        notificationSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            
            const friendReq = document.querySelector('.friend-request-box');

            if (data.tag === 'request' && friendReq) {
                friendReq.innerHTML = '';
                const requestHTML = createFriendRequest("../../assets/images/profile.svg", data.sender);
                friendReq.innerHTML += requestHTML;

                const reqNotMsg = document.querySelector('.friend-request-noti');
                reqNotMsg.classList.add('show');

                // 수락 버튼에 이벤트 리스너 추가
                const acceptButton = friendReq.querySelector('.request-accept-btn');
                if (acceptButton) {
                    acceptButton.addEventListener('click', async function() {
                        try {
                            const response = await fetch(`http://localhost:8000/api/friend/accept/${data.sender}/`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            friendReq.innerHTML = '<p>새로운 친구 요청이 없습니다..</p>';
                            reqNotMsg.classList.remove('show');
                        } catch (error) {
                            console.error('Fetch error:', error);
                        }
                    });
                }
                // 거절 버튼에 이벤트 리스너 추가
                const refuseButton = friendReq.querySelector('.request-refuse-btn');
                if (refuseButton) {
                    refuseButton.addEventListener('click', async function() {
                        // 거절하면 친구 관계 삭제하는 api 호출
                        try {
                            const response = await fetch(`http://localhost:8000/api/friend/delete/${data.sender}/`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            friendReq.innerHTML = '<p>새로운 친구 요청이 없습니다..</p>';
                            reqNotMsg.classList.remove('show');
                        } catch (error) {
                            console.error('Fetch error:', error);
                        }
                    });
                }
            }
        };
    }
    

    afterRender() {
        this.fetchAndDisplayFriendList();
        this.clickUserSearchButton();
    }
}
