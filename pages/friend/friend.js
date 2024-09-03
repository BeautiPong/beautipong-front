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

                    console.log(friend);

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
    
            document.querySelector('#chat-message-input').onkeydown = function(e) {
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
    }

    async clickUserSearchButton() {

        const token = localStorage.getItem('access_token');

        document.addEventListener('DOMContentLoaded', () => {
            const searchIconElement = document.querySelector('.friend-search-icon');
        
            if (searchIconElement) {
                searchIconElement.addEventListener('click', async () => {
                    this.showUserSearchModal();
                    // try {
                    //     const response = await fetch(`http://localhost:8000/api/friend/add/seoji/`, {
                    //         method: 'POST',
                    //         headers: {
                    //             'Authorization': `Bearer ${token}`
                    //         }
                    //     });
        
                    //     if (!response.ok) {
                    //         throw new Error(`HTTP error! status: ${response.status}`);
                    //     }
        
                    // } catch (error) {
                    //     console.error('Fetch error:', error);
                    // }
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

            console.log("친구 알림 옴");
            
            const friendReq = document.querySelector('.friend-request-box');
            friendReq.innerHTML = '';

            if (friendReq) {

                const requestHTML = createFriendRequest("../../assets/images/profile.svg", data.sender);
                friendReq.innerHTML += requestHTML;

                // 수락 버튼에 이벤트 리스너 추가
                const acceptButton = friendReq.querySelector('.request-accept-btn');
                if (acceptButton) {
                    acceptButton.addEventListener('click', function() {
                        console.log(`${data.sender}의 친구 요청을 수락합니다.`);
                        const response = fetch(`http://localhost:8000/api/friend/accept/${data.sender}/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        // 친구 요청 컴포넌트 제거
                        friendReq.innerHTML = '';
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
