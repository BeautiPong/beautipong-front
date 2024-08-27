import { createModal } from '../../assets/components/modal/modal.js';

export default class LoginPage {
    render() {
        return `
            <div class="login">
                <div class="login-box">
                    <h1>PING PONG</h1>
                    <form>
                        <div class="text-box">
                            <input type="text" id="userId" placeholder="아이디" name="username" required>
                            <div class="id-error-message" id="id-error-message">default</div>
                        </div>
                        <div class="text-box password-box">
                            <input type="password" id="pw" placeholder="패스워드" name="password" required>
                            <div class="pw-error-message" id="pw-error-message">default</div>
                        </div>
                        <div class="button-box">
                            <button id="signIn-btn" type="button" class="btn">로그인</button>
                            <button id="signup-btn" type="button" class="btn">회원가입</button>
                        </div>
                    </form>
                    <div class="start-with">
                        <p>or start with</p>
                        <img src="../../assets/images/42_logo.svg" alt="42OAuth로그인" id="start-with__42logo">
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
		document.querySelector('.nav-container').style.display = 'none';

        // 회원가입 버튼에 클릭 이벤트 리스너 추가
        const signupButton = document.getElementById('signup-btn');
        signupButton.addEventListener('click', () => {
            window.location.hash = '#/signup';
        });

		const formButton = document.getElementById('signIn-btn');
		formButton.addEventListener('click', (event) => this.handleFormBtn(event));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleFormBtn(event);
            }
        });

        // 42 OAuth 로그인 버튼에 클릭 이벤트 리스너 추가
        const login42Button = document.getElementById('start-with__42logo');
        login42Button.addEventListener('click', async () => {
            console.log("42로고 클릭!");
            try {
                const response = await fetch('http://localhost:8000/api/user/login/', {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('42 로그인 요청 성공:', data);
                    window.location.href = data.redirect_url;
                } else {
                    console.error('42 로그인 요청 실패:', response.status);
                }
            } catch (error) {
                console.error('42 로그인 요청 중 오류 발생:', error);
            }
        });

        this.handleRedirectCode();
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
    }

    async handleRedirectCode() {
        // URL에서 'code' 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("코드 테스트");

        if (code) {
            // 'code'가 존재하는 경우, 서버로 POST 요청을 보내어 액세스 토큰을 요청합니다.
            try {
                const response = await fetch('http://localhost:8000/api/user/get-token/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),  // 'code'를 서버에 전달
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('42 회원가입 성공:', data);
                    window.location.href = '#/login'; // 로그인 페이지로 이동
                    this.showModal('회원가입이 성공적으로 완료되었습니다!', '확인');
                } else {
                    console.error('42 토큰 요청 실패:', response.status);
                }
            } catch (error) {
                console.error('42 토큰 요청 중 오류 발생:', error);
            }
        }
    }

	async handleFormBtn(event) {
        event.preventDefault(); // 기본 폼 제출 이벤트를 막습니다.

        // 폼 데이터를 수집합니다.
        const formData = {
            userID: document.getElementById('userId').value,
            password: document.getElementById('pw').value,
        };

        if (!formData.userID || !formData.password) {
            this.handleLoginError({ message: "모든 필드를 입력해주세요." });
            return;
        }

        try {
            // 백엔드로 POST 요청을 보냅니다.
            const response = await fetch('http://localhost:8000/api/user/account/pre-login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                console.log('로그인 성공:', data);
                localStorage.setItem('temp_token', data.temp_token);
                window.location.hash = '#/2fa';
            } else {
                console.error('로그인 실패:', response.status);
                const errorData = await response.json();
                this.handleLoginError(errorData);
            }
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
        }
    }

    handleLoginError(errorData) {

        const idInput = document.querySelector('#userId');
        const pwInput = document.querySelector('#pw');
        const idErrorDiv = document.querySelector('.id-error-message');
        const pwErrorDiv = document.querySelector('.pw-error-message');

        // 에러 메시지에 따른 처리
        switch (errorData.message) {
            case "모든 필드를 입력해주세요." :
                if (!document.getElementById('userId').value) {
                    idErrorDiv.innerText = "id를 입력해주세요.";
                    idErrorDiv.classList.add('show');
                    idInput.classList.add('input-error');

                    // 사용자 입력 시 에러 상태 리셋
                    idInput.addEventListener('input', function () {
                    idErrorDiv.innerText = 'default';
                    idErrorDiv.classList.remove('show');
                    idInput.classList.remove('input-error');});
                }
                if (!document.getElementById('pw').value) {
                    pwErrorDiv.innerText = "비밀번호를 입력해주세요.";
                    pwErrorDiv.classList.add('show');
                    pwInput.classList.add('input-error');

                    // 사용자 입력 시 에러 상태 리셋
                    pwInput.addEventListener('input', function () {
                    pwErrorDiv.innerText = 'default';
                    pwErrorDiv.classList.remove('show');
                    pwInput.classList.remove('input-error');});
                }
                break ;

            case "존재하지 않는 아이디입니다." :
                idErrorDiv.innerText = `${errorData.message}`;
                idErrorDiv.classList.add('show');
            
                idInput.classList.add('input-error');

                // 사용자 입력 시 에러 상태 리셋
                idInput.addEventListener('input', function () {
                idErrorDiv.innerText = 'default';
                idErrorDiv.classList.remove('show');
                idInput.classList.remove('input-error');});
                
                break ;
            case "비밀번호가 틀렸습니다." :
                pwErrorDiv.innerText = `${errorData.message}`;
                pwErrorDiv.classList.add('show');

                pwInput.classList.add('input-error');

                // 사용자 입력 시 에러 상태 리셋
                pwInput.addEventListener('input', function () {
                pwErrorDiv.innerText = 'default';
                pwErrorDiv.classList.remove('show');
                pwInput.classList.remove('input-error');});
                
                break ;
        }
    }
}

