import {createFriendRequest} from '../../assets/components/friend-request/friend-request.js';
import {createFriendList} from '../../assets/components/friend-list/friend-list.js';
import {createChatRoom} from '../../assets/components/chat-room/chat-room.js';

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
                            <div class="friend-request-box">
                                //
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
    // ${createFriendRequest("../../assets/images/profile.svg", "seojchoi")}

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
                    
                    // 친구 요소를 생성
                    const friendComponent = createFriendList(image, nickname);
            
                    // 새 친구 요소를 DOM에 추가
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = friendComponent;
            
                    // 생성된 친구 요소를 DOM에 추가
                    const newFriendElement = tempElement.firstElementChild;
                    friendListBox.appendChild(newFriendElement);
            
                    // 이벤트 리스너를 직접 추가
                    newFriendElement.addEventListener('click', () => {
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
                console.log('Received data:', data);
                const chatLog = document.querySelector('#chat-log');
                if (chatLog) {
                    chatLog.innerHTML += `${data.message}<br>`;
                }
            };
    
            chatSocket.onclose = function(e) {
                console.error('Chat socket closed unexpectedly');
            };
    
            document.querySelector('#chat-message-input').focus();
    
            document.querySelector('#chat-message-input').onkeydown = function(e) {
                if (e.isComposing || e.keyCode === 229) return;
                if (e.key === 'Enter') {
                    sendMessage();
                }
            };
    
            document.querySelector('#chat-message-submit').onclick = function(e) {
                sendMessage();
            };
    
            function sendMessage() {
                console.log("sendMessage");
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
            const response = await fetch(`http://localhost:8000/api/chat/room/${roomName}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();

            const chatLog = document.querySelector('#chat-log');

            chatLog.innerHTML = '';

            data.messages.forEach(message => {
                chatLog.innerHTML += `${message.sender} [${message.created_at}]: ${message.content}<br>`;
            });

            // Scroll to the bottom of the chat log
            chatLog.scrollTop = chatLog.scrollHeight;
    
        } catch (error) {
            console.error('메시지를 불러오는 중 오류 발생:', error);
        }
    }

    afterRender() {
        this.fetchAndDisplayFriendList();
    }
}
