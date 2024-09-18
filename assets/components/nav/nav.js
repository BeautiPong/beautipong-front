import { createModal } from '../modal/modal.js';
import { getRouter } from '../../../js/router.js';
import { refreshAccessToken } from '../../../js/token.js';
import WaitGamePage from "../../../pages/waitgame/waitgame.js";
const profileImg = document.getElementById('nav-profile__img');
const profileTier = document.getElementById('nav-profile__info__tier');
const profileNickname = document.getElementById('nav-profile__info__nickname');

let notificationWebSocket = null;
let hasNotification = false;

// 프로필 정보 가져오기 함수
export async function loadProfile() {
    try {
        let response = await fetch('http://localhost:8000/api/user/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });

        // 액세스 토큰이 만료되어 401 오류가 발생했을 때
        if (response.status === 401) {
            const newAccessToken = await refreshAccessToken();

            // 새 액세스 토큰으로 다시 요청
            response = await fetch('http://localhost:8000/api/user/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                },
            });
        }

        // 응답 처리
        if (response.ok) {
            const profileData = await response.json();
            // console.log(profileData);
            // DOM 요소에 프로필 정보 설정
            if (profileData.img) {
                profileImg.src = profileData.img;
            } else {
                profileImg.src = "assets/images/profile.svg";
            }

            if (profileData.score <= 1000) {
                profileTier.src = `assets/icons/bronz.svg`;
            }
            else if (profileData.score <= 1200) {
                profileTier.src = `assets/icons/silver.svg`;
            }
            else if (profileData.score <= 1500) {
                profileTier.src = `assets/icons/gold.svg`;
            }
            else if (profileData.score <= 2000) {
                profileTier.src = `assets/icons/platinum.svg`;
            }
            else {
                profileTier.src = `assets/icons/dia.svg`;
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
}

export function disconnectNotificationWebSocket() {
    if (notificationWebSocket) {
        if (notificationWebSocket.readyState === WebSocket.OPEN) {
            notificationWebSocket.close();
        }
        notificationWebSocket = null;  // 웹소켓 객체 초기화
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

    logoutBtn.addEventListener('click', () => showModal('정말 로그아웃하시겠습니까?', '확인'));
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
function showModal(message, buttonMsg) {
    // 모달 컴포넌트 불러오기
    const modalHTML = createModal(message, buttonMsg);

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

            const response = await fetch('http://localhost:8000/api/user/account/logout/', {
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
                response = await fetch('http://localhost:8000/api/user/account/logout/', {
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
    notificationWebSocket = new WebSocket(`ws://localhost:8000/ws/user/?token=${accessToken}`);

    notificationWebSocket.onopen = () => {
        console.log('알림 WebSocket 연결 성공');
    };

    notificationWebSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('nav에서 서버로부터 받은 메시지:', message);
        const data = JSON.parse(event.data);
        if (data.type === 'invite_game') {
            const sender = data.sender;
            // showModal(sender+'님으로 부터 게임 초대가 왔어요!', '수락');
            const modalHTML = createModal(`${sender}님으로 부터 게임 초대가 왔어요!`, '수락');

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
                const waitGamePage = new WaitGamePage();
                waitGamePage.startMatch(sender);
                modalDiv.remove();
            }

        }
        else if (data.type === 'start_game_with_friend') {
            // alert(`${data.sender}님과 게임을 시작합니다!`);
        }
        hasNotification = true;
        updateNotificationDisplay();
    };

    notificationWebSocket.onclose = () => {
        notificationWebSocket = null;
        console.log('알림 WebSocket 연결 종료');
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
