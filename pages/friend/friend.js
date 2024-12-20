import {createFriendRequest} from '../../assets/components/friend-request/friend-request.js';
import {createFriendList} from '../../assets/components/friend-list/friend-list.js';
import {createChatRoom} from '../../assets/components/chat-room/chat-room.js';
import {createMessage} from '../../assets/components/message/message.js';
import {createUserSearchModal} from '../../assets/components/user-search-modal/user-search-modal.js';
import {getRouter} from '../../../js/router.js';
import {createModal} from '../../assets/components/modal/modal.js';
import {SERVER_IP} from "../../js/index.js";
import { connectNotificationWebSocket } from '../../assets/components/nav/nav.js';
import WaitGamePage from '../waitgame/waitgame.js';

let notificationSocket = null;

export let chatSocket = null;
export let currentChattingFriend = null;

export function setCurrentChattingFriend(nickname) {
    currentChattingFriend = nickname;
}

export function clearCurrentChattingFriend() {
    currentChattingFriend = null;
}
export function closeChatSocket() {
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;
    }
    clearCurrentChattingFriend();
}

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
                            <div class="friend-request-box"></div>
                        </div>
                        <div class="friend-list">
                            <div class="friend-list-title">
                                <p class="friend-list-text">친구목록</p>
                                <div class="friend-actions">
                                    <p class="accept-friend-list">친구함</p>
                                    <p class="block-friend-text">차단함</p>
                                </div>
                            </div>
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

    async handlePage() {

        const token = localStorage.getItem('access_token');

        // 친구 요청 목록 보여주기
        try {
            const response = await fetch(`https://${SERVER_IP}/api/friend/pend/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            const friendReq = document.querySelector('.friend-request-box');

            friendReq.innerHTML = '';
            if (data.friends.length > 0) {
                friendReq.classList.remove('no-friend-requests');
                friendReq.classList.add('has-friend-requests');
                data.friends.forEach(friend => {
                    const image = friend.image || '../../assets/images/profile.svg';
                    const nickname = friend.nickname;

                    this.updateFriendRequest(friendReq, image, nickname);
                });
            } else {
                friendReq.classList.remove('has-friend-requests');
                friendReq.classList.add('no-friend-requests');
                friendReq.innerHTML = '<p>새로운 친구 요청이 없습니다.';
            }
        } catch (error) {
            console.error('친구 요청 목록을 불러오는 중 오류 발생:', error);
        }

        // 친구 리스트 보여주기
        const friendListBox = document.querySelector('.friend-list-box');
        this.showFriendList(friendListBox);

        const accepBtn = document.querySelector('.accept-friend-list');
        const blockBtn = document.querySelector('.block-friend-text');
        accepBtn.classList.add('click');

        // 친구함으로 이동 (버튼 클릭)
        if (accepBtn) {
            accepBtn.addEventListener('click', async () => {
                closeChatSocket();
                accepBtn.classList.add('click');
                blockBtn.classList.remove('click');
                friendListBox.innerHTML = '';
                this.showFriendList(friendListBox);
            });
        } else {
            console.error('accept-friend-list 요소를 찾을 수 없습니다.');
        }

        // 차단함으로 이동 (버튼 클릭)
        if (blockBtn) {
            blockBtn.addEventListener('click', async () => {
                closeChatSocket();
                blockBtn.classList.add('click');
                accepBtn.classList.remove('click');
                friendListBox.innerHTML = '';
                this.updateBlockedFriendList(friendListBox);
            });
        } else {
            console.error('block-icon 요소를 찾을 수 없습니다.');
        }

        // 친구 검색 버튼 (버튼 클릭)
        const searchBtn = document.querySelector('.friend-search-icon');
        if (searchBtn) {
            searchBtn.addEventListener('click', async () => {
                closeChatSocket();
                this.showUserSearchModal();
                // this.showFriendRequest();
            });
        } else {
            console.error('block-icon 요소를 찾을 수 없습니다.');
        }
    }

    // 친구 요청 확인
    async updateFriendRequest(friendReq, image, sender) {
        const token = localStorage.getItem('access_token');

        const requestContainer = document.createElement('div');
        requestContainer.innerHTML = createFriendRequest(image, sender);
        friendReq.appendChild(requestContainer);

        const reqNotMsg = document.querySelector('.friend-request-noti');
        reqNotMsg.classList.add('show');

        // 수락 버튼에 이벤트 리스너 추가
        const acceptButton = requestContainer.querySelector('.request-accept-btn');
        if (acceptButton) {
            acceptButton.addEventListener('click', async function () {
                try {
                    const response = await fetch(`https://${SERVER_IP}/api/friend/accept/${sender}/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const router = getRouter();
                    router.navigate('/friend');
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        }
        // 거절 버튼에 이벤트 리스너 추가
        const refuseButton = requestContainer.querySelector('.request-refuse-btn');
        if (refuseButton) {
            refuseButton.addEventListener('click', async function () {
                try {
                    const response = await fetch(`https://${SERVER_IP}/api/friend/delete/${sender}/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const router = getRouter();
                    router.navigate('/friend');
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        }
    }

    // 친구 목록 보여주기
    async showFriendList(friendListBox) {
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`https://${SERVER_IP}/api/chat/friend_list/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.friends.length > 0) {
                // 친구가 있으면 친구 정보 표시
                friendListBox.innerHTML = '';
                friendListBox.classList.remove('friend-list-box');

                for (const friend of data.friends) {

                    const nickname = friend.nickname;
                    const image = friend.image || '../../assets/images/profile.svg';
                    const match_cnt = friend.match_cnt;
                    const win_cnt = friend.win_cnt;
                    const is_online = friend.is_online;
                    const score = friend.score;

                    // 친구 요소를 생성
                    const friendComponent = createFriendList(image, nickname, is_online, false);

                    // 새 친구 요소를 DOM에 추가
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = friendComponent;

                    // 생성된 친구 요소를 DOM에 추가
                    const newFriendElement = tempElement.firstElementChild;
                    friendListBox.appendChild(newFriendElement);

                    // 아직 읽지 않은 메시지가 있는지 확인
                    const unreadResponse = await fetch(`https://${SERVER_IP}/api/chat/unread/${nickname}/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (unreadResponse.ok) {
                        const unreadData = await unreadResponse.json();

                        console.log("읽지 않은 메시지가 있는지:", unreadData.has_unread);

                        // 읽지 않은 메시지가 있으면 NEW 문구 표시
                        if (unreadData.has_unread) {
                            const messageStatusElement = newFriendElement.querySelector(`#${nickname}_message`);
                            if (messageStatusElement) {
                                messageStatusElement.style.display = 'inline';
                            }
                        }
                    } else {
                        console.error("Error checking unread message status:", unreadResponse.status);
                    }

                    // 이벤트 리스너를 직접 추가
                    const chatRoomElement = newFriendElement.querySelector('.list-box');
                    chatRoomElement.addEventListener('click', () => {
                        closeChatSocket();
                        this.showChatBox(image, nickname, match_cnt, win_cnt, score);
                    });
                };
            } else {
                friendListBox.classList.add('friend-list-box');
                friendListBox.innerHTML = '<p>친구가 없습니다..</p>';
            }
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류 발생:', error);
            friendListBox.classList.add('friend-list-box');
        }
    }


    // 채팅방 만들기
    async showChatBox(image, friendNickname, match_cnt, win_cnt, score) {
        try {
            setCurrentChattingFriend(friendNickname);
            const token = localStorage.getItem('access_token');
            fetch(`https://${SERVER_IP}/api/chat/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({friend_nickname: friendNickname})
            })
                .then(response => response.json())
                .then(data => {
                    this.loadChatRoom(data.room_name, data.sender, token, friendNickname, image, match_cnt, win_cnt, score);
                });
        } catch (error) {
            console.error('채팅 내용을 불러오는 중 오류 발생:', error);
            clearCurrentChattingFriend();
        }
    }

    // 채팅방 불러오기
    async loadChatRoom(roomName, myname, token, friendNickname, image, match_cnt, win_cnt, score) {

        // NEW 문구 숨김
        const messageStatusElement = document.querySelector(`#${friendNickname}_message`);
        if (messageStatusElement) {
            messageStatusElement.style.display = 'none';  // NEW 문구 숨김
        }

        // 채팅 메시지 보내기
        try {
            const chatContainer = document.querySelector('.chat-box');

            const lose_cnt = match_cnt - win_cnt;
            const win_inform = `${win_cnt}승 ${lose_cnt}패`;

            chatContainer.innerHTML = `
                ${createChatRoom(image, friendNickname, win_inform, score)}
            `;

            // 기존 대화 내용 불러오기
            await this.loadMessages(roomName, token);

            // 웹소켓 연결 설정
            if (chatSocket === null) {
                chatSocket = new WebSocket(
                    `wss://${SERVER_IP}/ws/chat/${roomName}/?token=${token}`
                );
            }

            chatSocket.onopen = function (e) {
                console.log('ChatSocket connection established.');
            };

            chatSocket.onmessage = function (e) {
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

            chatSocket.onclose = function (e) {
                chatSocket = null;
            };


            // ------------------------------------------------------------------
            // 페이지가 언로드될 때 WebSocket 닫기
            window.addEventListener('beforeunload', () => {
                if (chatSocket) {
                    chatSocket.close();
                    console.log("Chat socket closed on unload.");
                }
            });

            // 추가된 코드: 사용자 지정 이벤트 리스너로 WebSocket 닫기
            function closeChatSocket() {
                if (chatSocket) {
                    chatSocket.close();
                    console.log("Chat socket closed by user action.");
                }
            }

            // 다른 페이지로 이동 시 WebSocket 닫기
            window.addEventListener("pagehide", closeChatSocket);
            window.addEventListener("unload", closeChatSocket);
            // ------------------------------------------------------------------

            document.querySelector('#chat-message-input').focus();

            document.querySelector('#chat-message-input').onkeydown = function (e) {
                if (e.isComposing || e.keyCode === 229) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            };

            function sendMessage() {
                const messageInputDom = document.querySelector('#chat-message-input');
                const message = messageInputDom.value;

                chatSocket.send(JSON.stringify({
                    'message': message,
                    'sender': myname,
                    'roomName': roomName
                }));
                notificationSocket.send(JSON.stringify({
                    'type': 'notify_message_sent',
                    'sender': myname,
                    'receiver': friendNickname,
                    'message': '새로운 메시지가 도착했습니다!'
                }));
                messageInputDom.value = '';
            }

        } catch (error) {
            console.error('채팅 방을 불러오는 중 오류 발생:', error);
        }

        // 친구 게임 초대
        document.querySelector('#game-request-btn').addEventListener('click', async () => {

            const waitGameInstance = new WaitGamePage();
            await waitGameInstance.sendInvite(friendNickname, token);
            console.log("게임 초대 버튼 클릭")
        });

        // 친구 차단
        document.querySelector('#block-friend-btn').addEventListener('click', async () => {
            try {
                const response = await fetch(`https://${SERVER_IP}/api/friend/block/${friendNickname}/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.showModal('친구 차단이 완료되었습니다.', '확인');

                const router = getRouter();
                router.navigate('/friend');
            } catch (error) {
                console.error('친구 차단 중 오류 발생:', error);
            }
        });
    }

    // 기존 채팅 메세지 불러오기
    async loadMessages(roomName, token) {
        try {
            const response = await fetch(`https://${SERVER_IP}/api/chat/pre_message/${roomName}/`, {
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
        closeBtn.onclick = function () {
            modalDiv.remove();
        };

        // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
        window.onclick = function (event) {
            if (event.target == modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };

        // 친구 요청 보내기
        async function sendFriendRequest(token, name, userFindBox) {
            const requestBtn = userFindBox.querySelector('.request-btn');

            requestBtn.addEventListener('click', async function () {
                try {
                    const response = await fetch(`https://${SERVER_IP}/api/friend/add/${name}/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const responseData = await response.json();

                        console.log(responseData);

                        if (response.status === 400) {
                            const errorMessage = responseData[0];

                            switch (errorMessage) {
                                case "You cannot add yourself as a friend.":
                                    userFindBox.innerHTML = '<p>자기 자신을 친구로 추가할 수 없습니다.</p>';
                                    break;
                                case "You already request friend.":
                                    userFindBox.innerHTML = '<p>이미 친구 요청을 보냈습니다.</p>';
                                    break;
                                case "You cannot add already friend as a friend.":
                                    userFindBox.innerHTML = '<p>이미 친구로 추가된 사용자입니다.</p>';
                                    break;
                                default:
                                    userFindBox.innerHTML = '<p>친구 추가 중 오류가 발생했습니다.</p>';
                            }
                        } else {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    } else
                        userFindBox.innerHTML = '<p>친구 요청이 완료되었습니다.</p>';

                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        };

        // 검색 입력 필드에 이벤트 리스너 추가
        const searchInput = modalDiv.querySelector('#friend-name-search-input');
        searchInput.addEventListener('keydown', function (event) {

            if (event.key === 'Enter') {
                const friend_nickname = searchInput.value.trim();

                if (friend_nickname.length > 0) {
                    // 친구 검색
                    fetch(`https://${SERVER_IP}/api/friend/search/${friend_nickname}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    })
                        .then(response => response.json())
                        .then(data => {
                            const userFindBox = modalDiv.querySelector('.user-find-box');
                            userFindBox.innerHTML = '';

                            if (data && data.name) {
                                // 친구 정보를 보여주는 로직 추가
                                userFindBox.innerHTML = `
                                <div class="user-find-box-detail">
                                    <div class="user-find-box-image-name">
                                        <img class="find-friend-image" src="${data.image || '../../assets/images/profile.svg'}">
                                        <p class="find-friend-name">${data.name}</p>
                                    </div>

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

    // 1. 실시간 online, offline 상태 반영
    // 2. 실시간 메시지 알림
    // 3. 실시간 친구 요청 알림
    async handleSocket() {

        const token = localStorage.getItem('access_token');
        notificationSocket = connectNotificationWebSocket(token);

        const friendReq = document.querySelector('.friend-request-box');

        if (notificationSocket.readyState === WebSocket.CONNECTING) {
            notificationSocket.addEventListener('open', () => {
                sendMessages(notificationSocket);
            });
        } else if (notificationSocket.readyState === WebSocket.OPEN) {
            sendMessages(notificationSocket);
        }

        function sendMessages(socket) {
            if (friendReq) {
                const getNotificationsMessage = {
                    type: 'get_notifications'
                };

                const statusMessage = {
                    type: 'notify_status_message',
                    status: 'online'
                };
                socket.send(JSON.stringify(getNotificationsMessage));
                socket.send(JSON.stringify(statusMessage));
                console.log('알림 요청 및 상태 메시지가 전송되었습니다.');
            }
        }
    }


    // 친구 차단 해제
    async unblockFriend(friend_nickname, friendListBox) {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`https://${SERVER_IP}/api/friend/reblock/${friend_nickname}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.updateBlockedFriendList(friendListBox);
            }
        } catch (error) {
            console.error('차단 해제 중 오류 발생:', error);
        }
    }

    // 차단 친구 보여주기
    async updateBlockedFriendList(friendListBox) {

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`https://${SERVER_IP}/api/friend/block-list/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.friends.length > 0) {
                // 친구가 있으면 친구 정보 표시
                friendListBox.innerHTML = '';
                friendListBox.classList.remove('friend-list-box');

                data.friends.forEach(friend => {

                    const nickname = friend.nickname;
                    const image = friend.image || '../../assets/images/profile.svg';
                    const is_online = friend.is_online;

                    // 친구 요소를 생성
                    const friendComponent = createFriendList(image, nickname, is_online ,true);

                    // 새 친구 요소를 DOM에 추가
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = friendComponent;

                    // 생성된 친구 요소를 DOM에 추가
                    const blockFriendElement = tempElement.firstElementChild;
                    friendListBox.appendChild(blockFriendElement);

                    // 차단 해제 버튼에 클릭 이벤트 추가
                    const unblockButton = blockFriendElement.querySelector('.block-none');
                    if (unblockButton) {
                        unblockButton.addEventListener('click', () => this.unblockFriend(nickname, friendListBox));
                    }
                });

            } else {
                friendListBox.classList.add('friend-list-box');
                friendListBox.innerHTML = '<p>차단된 친구가 없습니다</p>';
            }
        } catch (error) {
            console.error('친구 목록을 불러오는 중 오류 발생:', error);
            friendListBox.classList.add('friend-list-box');
        }
    }

    // 모달 창 생성 및 표시 함수
    showModal(message, buttonMsg) {
        // 모달 컴포넌트 불러오기
        const modalHTML = createModal(message, buttonMsg);

        // 새 div 요소를 생성하여 모달을 페이지에 추가
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);

        // 닫기 버튼에 이벤트 리스너 추가
        const closeBtn = modalDiv.querySelector('.close');
        closeBtn.onclick = function () {
            modalDiv.remove();
        };

        // 확인 버튼에 이벤트 리스너 추가
        const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
        confirmBtn.onclick = function () {
            modalDiv.remove();
        };

        // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
        window.onclick = function (event) {
            if (event.target == modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };
    }

    async afterRender() {
        this.handleSocket();
        this.handlePage();}
}
