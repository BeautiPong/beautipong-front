import { getRouter } from '../../js/router.js';
import { createModal } from '../../assets/components/modal/modal.js';
import { SERVER_IP } from "../../js/index.js";
import { loadProfile } from '../../assets/components/nav/nav.js';

export default class NicknamePage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
            <div class="nickname-div">
                <div class="nickname-container">
                    <h1>닉네임 설정</h1>
                    <form>
                        <input id="nickname_set_input" type="text" placeholder="사용할 닉네임을 입력해주세요" required>
                        <div id="nickname-error-message"></div>
                        <button id="nickname_setBtn" type="button">다음</button>
                    </form>
                </div>
            </div>
        `;
    }

    afterRender() {
        const nicknameButton = document.getElementById('nickname_setBtn');
        const nicknameInput = document.getElementById('nickname_set_input');

        nicknameButton.addEventListener('click', (event) => this.handleNicknameBtn(event));
        nicknameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleNicknameBtn(event);
            }
        });
    }

    async handleNicknameBtn(event) {
        event.preventDefault(); // 기본 폼 제출 이벤트를 막습니다.

        // 모달 창 생성 및 표시 함수
        function showModal(message, buttonMsg) {
            // 모달 컴포넌트 불러오기
            const modalHTML = createModal(message, buttonMsg);

            // 새 div 요소를 생성하여 모달을 페이지에 추가
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);

            // 모달을 닫고 경로 이동하는 함수
            const closeModalAndNavigate = () => {
                modalDiv.remove();
                document.removeEventListener('keydown', handleEnterKeyInModal); // 이벤트 리스너 제거
                const router = getRouter();
                router.navigate('/');
                loadProfile();
                document.querySelector('.nav-container').style.display = 'block';
            };

            // 닫기 버튼에 이벤트 리스너 추가
            const closeBtn = modalDiv.querySelector('.close');
            closeBtn.onclick = closeModalAndNavigate;

            // 확인 버튼에 이벤트 리스너 추가
            const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
            confirmBtn.onclick = closeModalAndNavigate;

            // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
            window.onclick = function (event) {
                if (event.target == modalDiv.querySelector('.modal')) {
                    closeModalAndNavigate();
                }
            };

            // 모달에서 Enter 키 입력 시 모달을 닫는 이벤트 리스너 추가
            const handleEnterKeyInModal = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    closeModalAndNavigate();
                }
            };

            // 이벤트 리스너 추가
            document.addEventListener('keydown', handleEnterKeyInModal);
        }

        // 폼 데이터를 수집합니다.
        const formData = {
            nickname: document.getElementById('nickname_set_input').value,
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
                console.log('회원가입 성공:', data);

                localStorage.removeItem('temp_token');
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);

                showModal('회원가입이 완료되었습니다!', '확인');
            } else {
                console.error('회원가입 실패:', response.status);
                const errorData = await response.json();
                console.log(errorData);
                this.handleNicknameError(errorData);
            }
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
        }
    }

    handleNicknameError(errorData) {
        const nicknameInput = document.querySelector('#nickname_set_input');
        const nicknameErrorDiv = document.querySelector('#nickname-error-message');

        nicknameInput.classList.remove('set-nickname__error');
        nicknameErrorDiv.innerText = '';

        // 에러 메시지에 따른 처리
        switch (errorData.message) {
            case "닉네임을 입력해주세요.":
                if (!document.querySelector('#nickname_set_input').value) {
                    nicknameErrorDiv.innerText = `${errorData.message}`;
                    nicknameErrorDiv.classList.add('show');
                    nicknameInput.classList.add('set-nickname__error');

                    // 사용자 입력 시 에러 상태 리셋
                    nicknameInput.addEventListener('input', function () {
                        nicknameErrorDiv.innerText = '';
                        nicknameErrorDiv.classList.remove('show');
                        nicknameInput.classList.remove('set-nickname__error');
                    });
                }
                break;

            case "이미 사용 중인 닉네임입니다.":
                nicknameErrorDiv.innerText = `${errorData.message}`;
                nicknameErrorDiv.classList.add('show');
                nicknameInput.classList.add('set-nickname__error');
                break;
        }
    }
}