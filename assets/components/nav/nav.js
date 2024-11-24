import { createModal } from '../modal/modal.js';
import { getRouter } from '../../../js/router.js';
import { refreshAccessToken } from '../../../js/token.js';
import { SERVER_IP } from "../../../js/index.js";

import WaitGamePage from "../../../pages/waitgame/waitgame.js";
import FriendPage from "../../../pages/friend/friend.js";
const profileImg = document.getElementById('nav-profile__img');
const profileTier = document.getElementById('nav-profile__info__tier');
const profileNickname = document.getElementById('nav-profile__info__nickname');

let notificationWebSocket = null;
let hasNotification = false;
let waitGamePage = null;
import { chatSocket, closeChatSocket } from "../../../pages/friend/friend.js";
import {
    currentChattingFriend,
    setCurrentChattingFriend,
    clearCurrentChattingFriend
} from '../../../pages/friend/friend.js';

// chatSocket 상태 확인
if (chatSocket) {
    console.log('ChatSocket is active:', chatSocket);
}

// 프로필 정보 가져오기 함수
export async function loadProfile() {
    try {
        let response = await fetch(`https://${SERVER_IP}/api/user/profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });

        // 액세스 토큰이 만료되어 401 오류가 발생했을 때
        if (response.status === 401) {
            const newAccessToken = await refreshAccessToken();

            // 새 액세스 토큰으로 다시 요청
            response = await fetch(`https://${SERVER_IP}/api/user/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                },
            });
        }

        // 응답 처리
        if (response.ok) {
            const profileData = await response.json();
            if (profileData.image) {
                profileImg.src = profileData.image;  // 백엔드에서 받은 이미지 URL 사용
            } else {
                profileImg.src = "assets/images/profile.svg";  // 기본 이미지
            }
            console.log('nav : ', profileData);
            // DOM 요소에 프로필 정보 설정

            if (profileData.score > 2000) {
                profileTier.src = `assets/icons/dia.svg`;
            }
            else if (profileData.score > 1500) {
                profileTier.src = `assets/icons/platinum.svg`;
            }
            else if (profileData.score > 1200) {
                profileTier.src = `assets/icons/gold.svg`;
            }
            else if (profileData.score > 1000) {
                profileTier.src = `assets/icons/silver.svg`;
            }
            else {
                profileTier.src = `assets/icons/bronz.svg`;
            }

            profileNickname.textContent = profileData.nickname;

            localStorage.setItem('nickname', profileData.nickname);
            localStorage.setItem('score', profileData.score);
            localStorage.setItem('match_cnt', profileData.match_cnt);
            localStorage.setItem('win_cnt', profileData.win_cnt);
            localStorage.setItem('win_rate', profileData.win_rate);
            localStorage.setItem('img', profileData.image);
        } else {
            console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
        }
    } catch (error) {
        console.error('프로필 정보 로딩 중 오류 발생:', error);
    }
}

let matchingWebSocket = null;
let gameWebSocket = null;

export function setMatchingWebSocket(socket) {
    matchingWebSocket = socket;
}

export function setGameWebSocket(socket) {
    gameWebSocket = socket;
}

export function getMatchingWebSocket() {
    return matchingWebSocket;
}

export function getGameWebSocket() {
    return gameWebSocket;
}

export function disconnectSpecificWebSocket() {
    if (gameWebSocket && gameWebSocket.readyState === WebSocket.OPEN) {
        gameWebSocket.close();
    }

    if (matchingWebSocket && matchingWebSocket.readyState === WebSocket.OPEN) {
        matchingWebSocket.close();
    }

    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        closeChatSocket();
    }
}

export function disconnectNotificationWebSocket(StorageClearFlag = true) {
    if (notificationWebSocket) {
        if (notificationWebSocket.readyState === WebSocket.OPEN) {
            notificationWebSocket.onclose = () => {
                notificationWebSocket = null;
                console.log('알림 WebSocket 연결 종료');
                if (StorageClearFlag) {
                    localStorage.clear();
                }
            };
            notificationWebSocket.close();
        } else {
            notificationWebSocket = null;
        }
    }
}

// 페이지 로드 시 프로필 정보 가져오기
document.addEventListener('DOMContentLoaded', loadProfile);
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('nav__logout');
    const navMain = document.getElementById('nav__main');
    const navMypage = document.getElementById('nav__mypage');
    const navFriend = document.getElementById('nav__friend');
    const navRank = document.getElementById('nav__rank');

    const router = getRouter();

    // 네비게이션 버튼 클릭 시 active 클래스 적용 및 다른 버튼에서 제거하는 함수
    function setActiveNavButton(activeButton) {
        const buttons = [navMain, navMypage, navFriend, navRank];
        buttons.forEach(button => {
            button.classList.remove('nav__select');
        });
        activeButton.classList.add('nav__select');
    }

    // 현재 경로에 따라 active 상태 적용
    function setActiveButtonByPathname() {
        const currentPath = window.location.pathname;

        if (currentPath === '/') {
            setActiveNavButton(navMain);
        } else if (currentPath === '/mypage') {
            setActiveNavButton(navMypage);
        } else if (currentPath === '/friend') {
            setActiveNavButton(navFriend);
        } else if (currentPath === '/rank') {
            setActiveNavButton(navRank);
        }
    }

    // 페이지가 로드되면 현재 pathname에 맞는 버튼에 active 상태 설정
    setActiveButtonByPathname();

    logoutBtn.addEventListener('click', () => showModal('정말 로그아웃하시겠습니까?', '확인', 'exit'));

    navMain.addEventListener('click', () => {
        disconnectSpecificWebSocket();
        router.navigate('/');
        setActiveNavButton(navMain);
    });

    navMypage.addEventListener('click', () => {
        disconnectSpecificWebSocket();
        router.navigate('/mypage');
        setActiveNavButton(navMypage);
    });

    navFriend.addEventListener('click', () => {
        disconnectSpecificWebSocket();
        hasNotification = false;
        updateNotificationDisplay();
        router.navigate('/friend');
        setActiveNavButton(navFriend);
    });

    navRank.addEventListener('click', () => {
        disconnectSpecificWebSocket();
        router.navigate('/rank');
        setActiveNavButton(navRank);
    });
});

// 모달 창 생성 및 표시 함수
function showModal(message, buttonMsg, icon) {
    // 모달 컴포넌트 불러오기
    const modalHTML = createModal(message, buttonMsg, icon);

    // 새 div 요소를 생성하여 모달을 페이지에 추가
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);

    // 닫기 버튼에 이벤트 리스너 추가
    const closeBtn = modalDiv.querySelector('.close');
    closeBtn.onclick = function() {
        modalDiv.remove();
    };

    // 확인 버튼에 이벤트 리스너 추가 (로그아웃 api 호출)
    const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
    confirmBtn.onclick = async function() {
        try {
            const formData = {
                refresh_token: localStorage.getItem('refresh_token'),
            };

            const response = await fetch(`https://${SERVER_IP}/api/user/account/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // 인증 헤더 추가
                },
                body: JSON.stringify(formData),
            });

            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                formData.refresh_token = newAccessToken;

                // 새 액세스 토큰으로 다시 요청
                response = await fetch(`https://${SERVER_IP}/api/user/account/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                    body: JSON.stringify(formData),
                });
            }

            // 응답 처리
            if (response.ok) {
                const data = await response.json();  // 응답 데이터를 JSON으로 변환 (await 추가)
                console.log('로그아웃 성공:', data.message);
                modalDiv.remove();


                disconnectNotificationWebSocket();
                localStorage.clear();

                // 로그인 페이지로 리다이렉트
                const router = getRouter();
                router.navigate('/login');
            } else {
                const errorData = await response.json();  // 에러 응답도 await 추가
                console.error('로그아웃 실패:', errorData);
            }

        } catch (error) {
            console.error('로그아웃 요청 중 오류 발생:', error);
        }
    };
}



function updateNotificationDisplay() {
    const notificationWrapper = document.querySelector('.notification-wrapper');
    const notificationBell = document.getElementById('notification-bell');
    const friendNav = document.getElementById('nav__friend');

    if (hasNotification) {
        friendNav.classList.add('has-notification');
        notificationWrapper.style.visibility = 'visible';
        notificationBell.style.display = 'block';
    } else {
        friendNav.classList.remove('has-notification');
        notificationWrapper.style.visibility = 'hidden';
        notificationBell.style.display = 'none';
    }
}

export function connectNotificationWebSocket(accessToken) {
    // 웹소켓이 이미 연결되어 있거나 열려있는 상태인지 확인
    if (notificationWebSocket && notificationWebSocket.readyState === WebSocket.OPEN) {
        console.log('기존 웹소켓 연결이 존재합니다.');
        return notificationWebSocket;
    }

    // 웹소켓 연결이 닫혀 있는 경우 새로 열기
    notificationWebSocket = new WebSocket(`wss://${SERVER_IP}/ws/user/?token=${accessToken}`);

    notificationWebSocket.onopen = () => {
        console.log('알림 WebSocket 연결 성공');
    };

    notificationWebSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'invite_game') {
            const sender = data.sender;
            const myNickname = data.receiver;
            console.log("myNickname: ", myNickname);

            const modalId = 'game-invite-modal'; // 모달에 고유 id를 부여
            if (document.getElementById(modalId))
                return;
            // showModal(sender+'님으로 부터 게임 초대가 왔어요!', '수락');
            const modalHTML = createModal(`${sender}님으로 부터 게임 초대가 왔어요!`, '수락');

            // 새 div 요소를 생성하여 모달을 페이지에 추가
            const modalDiv = document.createElement('div');
            modalDiv.id = modalId;
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);

            // 닫기 버튼에 이벤트 리스너 추가
            const closeBtn = modalDiv.querySelector('.close');
            closeBtn.onclick = function() {
                modalDiv.remove();
            };

            // 확인 버튼에 이벤트 리스너 추가 (게임 초대 수락)
            const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');

            confirmBtn.onclick = async function() {
                waitGamePage = new WaitGamePage();
                waitGamePage.startMatch(sender, sender);
                modalDiv.remove();

                const router = getRouter();
                router.navigate('/waitgame');
                document.getElementById("waitingMessage").classList.remove("hidden");
                localStorage.setItem('opponent', sender);

                console.log("sender: ", myNickname);
                console.log("receiver: ", sender);

                const message = `${myNickname}님이 초대를 수락했습니다.`;

                // WebSocket 재연결 확인 후 메시지 전송
                if (!notificationWebSocket || notificationWebSocket.readyState !== WebSocket.OPEN) {
                    console.warn("notificationWebSocket이 열려 있지 않음. 재연결 시도 중...");

                    // WebSocket을 재연결
                    notificationWebSocket = connectNotificationWebSocket(localStorage.getItem('access_token'));

                    // 재연결 후 onopen 이벤트가 발생할 때 메시지 전송
                    notificationWebSocket.onopen = () => {
                        notificationWebSocket.send(JSON.stringify({
                            type: 'access_invitation',
                            sender: myNickname,
                            receiver: sender,
                            message: message
                        }));
                        console.log("재연결 후 메시지 전송 완료.");
                    };
                } else {
                    notificationWebSocket.send(JSON.stringify({
                        type: 'access_invitation',
                        sender: myNickname,
                        receiver: sender,
                        message: message
                    }));
                    console.log("메시지 전송 완료.");
                }
            };

        }
        else if (data.type === 'access_invitation') {
            // alert(`${data.sender}님과 게임을 시작합니다!`);
            const router = getRouter();
            router.navigate('/waitgame');

            const sender = data.sender;
            const myNickname = data.receiver;
            const message = data.message;
            const modalHTML = createModal(`${message}`, '확인');

            // 새 div 요소를 생성하여 모달을 페이지에 추가
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);

            // 닫기 버튼에 이벤트 리스너 추가
            const closeBtn = modalDiv.querySelector('.close');
            closeBtn.onclick = function() {
                modalDiv.remove();
            };

            // 확인 버튼에 이벤트 리스너 추가 (게임 초대 수락)
            const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');

            confirmBtn.onclick = async function() {
                waitGamePage = new WaitGamePage();
                waitGamePage.startMatch(sender,myNickname);
                localStorage.setItem('opponent', sender);
                modalDiv.remove();
            }
        }
        else if(data.type === 'navigateToGamePage')
        {
            if(waitGamePage === null)
                waitGamePage = new WaitGamePage();

            waitGamePage.showGameStartLoader();

            setTimeout(() => {
                if (data.room_name) {
                    waitGamePage.navigateToGamePage(data.room_name, data.jwtToken);
                } else {
                    console.error('room_name is undefined');
                }
            }, 5000);
        }
        else if (data.type === 'leaveWaitingRoom') {
            console.log('leaveWaitingRoom');
            const myNickname = localStorage.getItem('nickname');
            const opponentNickname = localStorage.getItem('opponent');

            if(myNickname === data.remainder && opponentNickname!=null && opponentNickname === data.leaver){
                const opponentDetails = document.getElementById('opponentDetails');
                const inviteBtn = document.getElementById('inviteBtn');
                const randomBtn = document.getElementById('randomBtn');
                const startGameBtn = document.getElementById('startGameBtn');
                const waitingMessage =  document.getElementById("waitingMessage");

                if(inviteBtn !== null && randomBtn !== null){
                    // matchingLoader.classList.remove('hidden');
                    // matchingLoader.classList.add('hidden');
                    opponentDetails.style.display = 'none';
                    inviteBtn.style.display = 'inline-block';
                    randomBtn.style.display = 'inline-block';
                    startGameBtn.classList.remove('show');
                    startGameBtn.classList.add('hidden');
                    waitingMessage.classList.remove('show');
                    waitingMessage.classList.add('hidden');
                    localStorage.removeItem('opponent');
                }
            }
        }
        else if (data.type === 'status_message') {
            if (window.location.pathname === '/friend') { // 친구 페이지인지 확인
                const friendStatusElement = document.querySelector(`.list-online-status[id="${data.sender}"]`);
                if (friendStatusElement) {
                    const activeClass = data.status === 'online' ? 'true' : 'false';
                    friendStatusElement.className = `list-online-status ${activeClass}`;
                }
            }
        }
        else if (data.type === 'notify_message') {
            if (window.location.pathname === '/friend') { // 친구 페이지인지 확인
                if (currentChattingFriend === data.sender) {
                    console.log('현재 열려 있는 채팅방에서 메시지가 왔습니다. NEW 문구를 표시하지 않습니다.');
                } else {
                    const messageStatusElement = document.querySelector(`#${data.sender}_message`);
                    if (messageStatusElement) {
                        messageStatusElement.style.display = 'inline'; // NEW 문구 표시
                    }
                }
            } else {
                hasNotification = true;
                updateNotificationDisplay();
            }
        }
        else if (data.type === 'request_fr') {
            if (window.location.pathname === '/friend') { // 친구 페이지인지 확인
                const friendReqBox = document.querySelector('.friend-request-box');
                if (friendReqBox) {
                    friendReqBox.innerHTML = '';
                    const friendPageInstance = new FriendPage();
                    friendPageInstance.updateFriendRequest(friendReqBox, "../../assets/images/profile.svg", data.sender);
                }
            } else {
                hasNotification = true;
                updateNotificationDisplay();
            }

            const friendReq = document.querySelector('.friend-request-box');
            if (data.tag === 'request' && friendReq) {
                friendReq.innerHTML = '';

                const friendPageInstance = new FriendPage();
                friendPageInstance.updateFriendRequest(friendReq, "../../assets/images/profile.svg", data.sender);
            }
            else if (data.tag === 'accept') {
                const router = getRouter();
                router.navigate('/friend');
            }
        }
        else if (data.type === 'pend_messages') {
            if (window.location.pathname === '/friend') {
                const messageStatusElement = document.querySelector(`#${data.sender}_message`);
                if (messageStatusElement) {
                    messageStatusElement.style.display = 'inline';
                }
                // const friendReqBox = document.querySelector('.friend-request-box');
                // if (friendReqBox) {
                //     friendReqBox.innerHTML = '';
                //     const friendPageInstance = new FriendPage();
                //     friendPageInstance.updateFriendRequest(friendReqBox, "../../assets/images/profile.svg", data.sender);
                // }
            } else {
                hasNotification = true;
                updateNotificationDisplay();
            }
        }
    };

    notificationWebSocket.onclose = () => {
        notificationWebSocket = null;
        console.log('알림 WebSocket 연결 종료');
        localStorage.clear();
    };

    notificationWebSocket.onerror = (error) => {
        console.error('알림 WebSocket 오류 발생:', error);
    };

    return notificationWebSocket;
}


document.addEventListener('DOMContentLoaded', () => {
    const friendNav = document.getElementById('nav__friend');

    friendNav.addEventListener('click', () => {
        hasNotification = false;
        updateNotificationDisplay();
    });

    updateNotificationDisplay();
});

window.addEventListener('load', () => {
    const accessToken = localStorage.getItem('access_token'); // 세션 스토리지에서 토큰 가져오기
    if (accessToken) {
        connectNotificationWebSocket(accessToken); // WebSocket 연결 시도
    } else {
        console.error('access_token이 없습니다. 로그인 상태를 확인하세요.');
    }
});