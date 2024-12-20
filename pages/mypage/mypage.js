import { refreshAccessToken } from '../../js/token.js';
import { renderGameRecord } from '../../assets/components/recent-game/recent-game.js'
import { createNicknameModal } from '../../assets/components/modal/modal.js';
import { getRouter } from '../../js/router.js';
import { SERVER_IP } from "../../js/index.js";
import {
    connectNotificationWebSocket,
    disconnectNotificationWebSocket,
    loadProfile
} from '../../assets/components/nav/nav.js';
import {createModal} from '../../assets/components/modal/modal.js';

let notificationSocket = null;

export default class MyPage {

    constructor() {
        this.myPageloadProfile = this.myPageloadProfile.bind(this);
    }

    render() {
        return `
        <div class="mypage-container">
            <div class="mypage--background">
                <div class="mypage__contents">
                    <section class="mypage__top">
                        <div class="mypage__top__profile-info">
                            <div class="mypage__top__profile-info__imgEdit">
                                <img id="mypage__top__profile-info__img" src="" alt="profile_img"/>
                                <div class="mypage__top__profile-info__imgEdit__button">
                                    <input type="file" id="profileImageInput" style="display: none;" />
                                    <label for="profileImageInput">
                                        <img id="mypage__top__profile-info__edit" src="../../assets/images/camera.svg" alt="profile_img_editBtn"/>
                                    </label>
                                </div>
                            </div>
                            <div class="mypage__top__profile-info__nicknameEdit">
                                <span id="mypage__top__profile-info__nickname"></span>
                                <img id="mypage__top__profile-info__nickname__edit" src="../../assets/images/edit_.svg" alt="nickname_editBtn"/>
                            </div>
                        </div>
                        <div class="mypage__top__game-info">
                            <div class="mypage__game-info__title">
                                <p>티어</p>
                                <p>출전</p>
                                <p>승률</p>
                                <p>총점</p>
                            </div>
                            <div class="mypage__game-info__content">
                                <img id="mypage__game-info__tier" src="" alt="tier_icon"/>
                                <p id="mypage__game-info__gamecnt">1</p>
                                <p id="mypage__game-info__winrate">10</p>
                                <p id="mypage__game-info__score">100</p>
                            </div>
                        </div>
                    </section>
                    <section class="mypage__bottom">
                        <p id="mypage__bottom__title">최근 경기 기록</p>
                        <div id="mypage__bottom__content">
                        </div>
                        <button id="delete-account-btn" class="delete-account-btn">회원탈퇴</button>
                    </section>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        this.myPageloadProfile();
        this.loadRecentGame();

        const imgEditButton = document.getElementById('profileImageInput');
        const nicknameEditButton = document.getElementById('mypage__top__profile-info__nickname__edit');
        const deleteAccountButton = document.getElementById('delete-account-btn');

        imgEditButton.addEventListener('change', (event) => this.handleImgEditBtn(event));
        nicknameEditButton.addEventListener('click', () =>
            this.showNickNameModal('수정할 닉네임을 입력해주세요!', '변경하기'));
        deleteAccountButton.addEventListener('click', () =>
            this.showDeleteAccountModal('정말로 회원 탈퇴하시겠습니까?', '탈퇴하기')
        );
    }

    showDeleteAccountModal(message, buttonMsg) {
        const modalHTML = createModal(message, buttonMsg, 'caution');
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);

        const closeBtn = modalDiv.querySelector('.close');
        closeBtn.onclick = function() {
            modalDiv.remove();
        };

        const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
        confirmBtn.classList.add('delete-text');
        confirmBtn.onclick = async () => {
            await this.handleAccountDeletion();
            modalDiv.remove();
        };

        window.onclick = function(event) {
            if (event.target === modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };
    }

    async handleAccountDeletion() {
        try {
            const response = await fetch(`https://${SERVER_IP}/api/user/account/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (response.ok) {
                console.log('회원 탈퇴 성공');
                localStorage.clear();
                const router = getRouter();
                router.navigate('/login');
            } else {
                console.error('회원 탈퇴 실패:', response.statusText);
                this.showModal('회원 탈퇴에 실패했습니다. 다시 시도해주세요.', '확인', 'caution');
            }
        } catch (error) {
            console.error('회원 탈퇴 중 오류 발생:', error);
            this.showModal('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.', '확인', 'caution');
        }
    }

    async myPageloadProfile() {
        const profileImg = document.getElementById('mypage__top__profile-info__img');
        const profileNickname = document.getElementById('mypage__top__profile-info__nickname');
        const profileTier = document.getElementById('mypage__game-info__tier');
        const profileGameCnt = document.getElementById('mypage__game-info__gamecnt');
        const profileWinRate = document.getElementById('mypage__game-info__winrate');
        const profileScore = document.getElementById('mypage__game-info__score');

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
                        'Cache-Control': 'no-cache',
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
            
            // 응답 처리
            if (response.ok) {
                const profileData = await response.json();
                console.log(profileData);
                if (profileData.image) {
                    profileImg.src = profileData.image;  // 백엔드에서 받은 이미지 URL 사용
                } else {
                    profileImg.src = "assets/images/profile.svg";  // 기본 이미지
                }
    
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
                console.log(profileData.matchCnt);
                console.log(profileData.match_cnt ? "true" : "false");
                profileNickname.textContent = profileData.nickname;
                profileGameCnt.textContent = profileData.match_cnt ? profileData.match_cnt : '-';
                profileWinRate.textContent = profileData.match_cnt ? profileData.win_rate + '%' : '-';
                profileScore.textContent = profileData.score;

            } else {
                console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('프로필 정보 로딩 중 오류 발생:', error);
        }
    }    

    async loadRecentGame() {
        try {
            const profileNickname = localStorage.getItem('nickname');
            const recentGameDataContainer = document.getElementById('mypage__bottom__content');
    
            let response = await fetch(`https://${SERVER_IP}/api/game/info/${profileNickname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/game/info/${profileNickname}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            // 응답 처리
            if (response.ok) {
                const recentGameData = await response.json();
    
                // 최근 경기 기록이 없을 경우
                if (recentGameData.length === 0) {
                    recentGameDataContainer.innerHTML = `<p id="mypage__bottom__nogame">출전한 경기가 없습니다.</p>`;
                    return;
                }
    
                recentGameDataContainer.innerHTML = recentGameData.map(game => renderGameRecord(game)).join('');
    
            } else {
                console.error('최근 경기 기록을 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('최근 경기 기록 로딩 중 오류 발생:', error);
        }
    }

    async handleImgEditBtn(e) {
        console.log(e.target.files);
        const router = getRouter();
    
        var newProfileImg = e.target.files[0]; // 선택된 파일
        var formData = new FormData();
        formData.append('image', newProfileImg);
    
        try {
            const response = await fetch(`https://${SERVER_IP}/api/user/profile/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Cache-Control': 'no-cache'
                },
                body: formData
            });
    
            if (response.ok) {
                const updatedData = await response.json();
                console.log(updatedData);
                localStorage.setItem("img", updatedData.image_url);
                await loadProfile();
                await this.myPageloadProfile();
                await this.loadRecentGame();
                this.showModal('프로필 이미지가 성공적으로 변경되었습니다.', '확인');
            } else {
                const errorData = await response.json();
                this.showModal('프로필 이미지가 변경에 실패했습니다. 다시 시도해주세요', '확인', 'caution');
            }
        } catch (error) {
            console.error('프로필 이미지 변경 중 오류 발생:', error);
            this.showModal('프로필 이미지 변경 중 오류가 발생했습니다. 다시 시도해주세요', '확인', 'caution');
        }
    }

    // 모달 창 생성 및 표시 함수
    showModal(message, buttonMsg, icon) {
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

        // 확인 버튼에 이벤트 리스너 추가
        const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
        confirmBtn.onclick = function() {
            modalDiv.remove();
        };

        // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
        window.onclick = function(event) {
            if (event.target == modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };
    }
    
    async handleNicknameImgEditBtn(modalDiv) {

        // 폼 데이터를 수집합니다.
        const formData = {
            nickname: document.getElementById('new_nickname').value,
        };

        if (!formData.nickname) {
            this.handleNicknameError({ message: "닉네임을 입력해주세요." });
            return;
        }

        try {
            // 백엔드로 POST 요청을 보냅니다.
            const response = await fetch(`https://${SERVER_IP}/api/user/account/nickname/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('temp_token') ? localStorage.getItem('temp_token') : localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(formData)
            });

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                console.log('닉네임 변경 성공:', data);

                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);

                await loadProfile();
                await this.myPageloadProfile();
                await this.loadRecentGame();

                disconnectNotificationWebSocket(false);

                notificationSocket = connectNotificationWebSocket(data.access_token);


                if (notificationSocket.readyState === WebSocket.CONNECTING) {
                    notificationSocket.addEventListener('open', () => {
                        sendMessages(notificationSocket);
                    });
                } else if (notificationSocket.readyState === WebSocket.OPEN) {
                    sendMessages(notificationSocket);
                }

                function sendMessages(socket) {
                    const statusMessage = {
                        type: 'notify_status_message',
                        status: 'online'
                    };
                    socket.send(JSON.stringify(statusMessage));
                    console.log('알림 요청 및 상태 메시지가 전송되었습니다.');
                }


                modalDiv.remove();
            } else {
                console.error('닉네임 변경 실패:', response.status);
                const errorData = await response.json();
                console.log(errorData);
                this.handleNicknameError(errorData);
            }
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
        }
    }

    // 모달 창 생성 및 표시 함수
	showNickNameModal(message, buttonMsg) {
		// 모달 컴포넌트 불러오기
		const modalHTML = createNicknameModal(message, buttonMsg);

		// 새 div 요소를 생성하여 모달을 페이지에 추가
		const modalDiv = document.createElement('div');
		modalDiv.innerHTML = modalHTML;
		document.body.appendChild(modalDiv);

		// 닫기 버튼에 이벤트 리스너 추가
		const closeBtn = modalDiv.querySelector('.close');
		closeBtn.onclick = function() {
			modalDiv.remove();
		};

		// 확인 버튼에 이벤트 리스너 추가
		const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
		confirmBtn.onclick = () => {
			this.handleNicknameImgEditBtn(modalDiv);
		};

		// 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
		window.onclick = function(event) {
			if (event.target == modalDiv.querySelector('.modal')) {
				modalDiv.remove();
			}
		};
	}

    handleNicknameError(errorData) {
        const nicknameInput = document.querySelector('#new_nickname');
        const nicknameErrorDiv = document.querySelector('#newnickname-error-message');

        nicknameInput.classList.remove('set-nickname__error');
        nicknameErrorDiv.innerText = '';

        // 에러 메시지에 따른 처리
        switch (errorData.message) {
            case "닉네임을 입력해주세요." :
                if (!document.querySelector('#new_nickname').value) {
                    nicknameErrorDiv.innerText = `${errorData.message}`;
                    nicknameErrorDiv.classList.add('show');
                    nicknameInput.classList.add('set-nickname__error');

                    // 사용자 입력 시 에러 상태 리셋
                    nicknameInput.addEventListener('input', function () {
                    nicknameErrorDiv.innerText = '';
                    nicknameErrorDiv.classList.remove('show');
                    nicknameInput.classList.remove('set-nickname__error');});
                }
                break ;

            case "이미 사용 중인 닉네임입니다." :
                nicknameErrorDiv.innerText = `${errorData.message}`;
                nicknameErrorDiv.classList.add('show');
                nicknameInput.classList.add('set-nickname__error');
                break;
        }
    }
}
