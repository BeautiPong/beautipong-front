// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class LoginPage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
            <div class="login-container">
            <h1>PING PONG</h1>
            <form>
                <input type="text" placeholder="아이디" required>
                <input type="password" placeholder="비밀번호" required>
                <div class="buttons">
                    <button type="submit">로그인</button>
                    <button type="button">회원가입</button>
                </div>
            </form>
            <p>or start with
                <a href="https://42seoul.kr" target="_blank">
                    <img src="assets/images/42_logo.png" alt="42 Seoul Logo" class="logo">
                </a>
            </p>
            </div>
        `;
    }
}
