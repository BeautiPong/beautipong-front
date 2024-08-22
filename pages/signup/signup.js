import {createModal} from '../../components/modal/modal.js';

// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class SignupPage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
                <div class="signup">
                <div class="signup-container">
                    <div class="signup-contents">
                        <h1>회원 가입</h1>
                        <form>
                            <label for="nickname">닉네임을 입력해주세요</label>
                            <input type="text" id="nickname" placeholder="닉네임" required>

                            <label for="email">이메일을 입력해주세요</label>
                            <input type="email" id="email" placeholder="이메일" required>

                            <label for="username">로그인에 사용할 아이디를 입력해주세요</label>
                            <input type="text" id="username" placeholder="아이디" required>

                            <label for="password">비밀번호는 대문자, 소문자, 숫자 및 특수 문자를 포함해야 합니다.</label>
                            <input type="password" id="password" placeholder="비밀번호" required>

                            <button id="signup-submit-btn" type="submit">완료</button>
                        </form>
                    </div>
                </div>
                </div>
        `;
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

    async handleFormBtn(event) {
        event.preventDefault(); // 기본 폼 제출 이벤트를 막습니다.

        // 폼 데이터를 수집합니다.
        const formData = {
            userID: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            nickname: document.getElementById('nickname').value
        };

        try {
            // 백엔드로 POST 요청을 보냅니다.
            const response = await fetch('http://localhost:8000/api/user/account/join/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                console.log('회원가입 성공!');

                window.location.hash = '#/login';
                this.showModal('회원가입이 성공적으로 완료되었습니다!', '확인');

            } else {
                const errorData = await response.json();
                console.error('회원가입 실패:', errorData);
            }

        } catch (error) {
            console.error('회원가입 요청 중 오류 발생:', error);
        }

    }

    addEventListeners() {
        const formButton = document.getElementById('signup-submit-btn');
        // formButton.addEventListener('click', this.handleFormBtn);
        formButton.addEventListener('click', this.handleFormBtn.bind(this));
    }
}
