import { getRouter } from '../../js/router.js';
import { createModal } from '../../assets/components/modal/modal.js';

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
        nicknameButton.addEventListener('click', (event) => this.handleNicknameBtn(event));
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
            const response = await fetch('http://localhost:8000/api/user/account/nickname/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('temp_token')}`,
                },
                body: JSON.stringify(formData)
            });

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                console.log('회원가입 성공:', data);

                localStorage.removeItem('temp_token');

                const router = getRouter();
                router.navigate('/login');
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
            case "닉네임을 입력해주세요." :
                if (!document.querySelector('#nickname_set_input').value) {
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