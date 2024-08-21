export default class LoginPage {
    render() {
        return `
            <div class="login">
                <div class="login-box">
                    <h1>PING PONG</h1>
                    <form>
                        <div class="text-box">
                            <input type="text" placeholder="아이디" name="username" required>
                        </div>
                        <div class="text-box password-box">
                            <input type="text" placeholder="패스워드" name="password" required>
                        </div>
                        <div class="button-box">
                            <button type="submit" class="btn">로그인</button>
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
        // 회원가입 버튼에 클릭 이벤트 리스너 추가
        const signupButton = document.getElementById('signup-btn');
        signupButton.addEventListener('click', () => {
            window.location.hash = '#/signup'; // #/signup 페이지로 라우팅
        });
    }
}

