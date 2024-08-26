export default class LoginPage {
    render() {
        return `
            <div class="login">
                <div class="login-box">
                    <h1>PING PONG</h1>
                    <form>
                        <div class="text-box">
                            <input type="text" id="userId" placeholder="아이디" name="username" required>
                            <label for="userID" id="userId_label"></label>
                        </div>
                        <div class="text-box password-box">
                            <input type="text" id="pw" placeholder="패스워드" name="password" required>
                            <label for="password" id="password_label"></label>
                        </div>
                        <div class="button-box">
                            <button id="signIn-btn" type="button" class="btn">로그인</button>
                            <button id="signup-btn" type="button" class="btn">회원가입</button>
                        </div>
                    </form>
                    <div class="start-with">
                        <p>or start with</p>
                        <img src="../../assets/images/42_logo.svg" alt="42OAuth로그인" class="start-image">
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
            window.location.hash = '#/signup'; // #/signup 페이지로 라우팅
        });

		const formButton = document.getElementById('signIn-btn');
		formButton.addEventListener('click', (event) => this.handleFormBtn(event)); // 화살표 함수 사용
    }


	async handleFormBtn(event) {
        event.preventDefault(); // 기본 폼 제출 이벤트를 막습니다.

        // 폼 데이터를 수집합니다.
        const formData = {
            userID: document.getElementById('userId').value,
            password: document.getElementById('pw').value,
        };

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
        const userID = document.getElementById('userId');
        const password = document.getElementById('pw');
        const userID_label = document.getElementById('userId_label');
        const password_label = document.getElementById('password_label');

        // 모든 필드의 에러 상태를 초기화
        userID.classList.remove('form-error');
        password.classList.remove('form-error');
        userID_label.classList.remove('from-error-label');
        password_label.classList.remove('from-error-label');

        // 빈 텍스트로 초기화
        userID_label.innerText = "";
        password_label.innerText = "";

        // 에러 메시지에 따른 처리
        switch (errorData.message) {
            case "존재하지 않는 아이디입니다." :
                userID_label.innerText = `${errorData.message}`;
                userID_label.classList.add("form-error-label");
                userID.classList.add('form-error');
                break ;
            case "비밀번호가 틀렸습니다." :
                password_label.innerText = `${errorData.message}`;
                password_label.classList.add("form-error-label");
                password.classList.add('form-error');
                break ;
        }
    }
}

