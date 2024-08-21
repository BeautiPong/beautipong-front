// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class SignupPage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
                <div class="signup">
                <div class="signup-container">
                    <h1>회원 가입</h1>
                    <form>
                        <label for="username">로그인에 사용할 아이디를 입력해주세요</label>
                        <input type="text" id="username" placeholder="아이디" required>
                        
                        <label for="password">로그인에 사용할 비밀번호를 입력해주세요</label>
                        <input type="password" id="password" placeholder="비밀번호" required>
                        
                        <label for="email">이메일을 입력해주세요</label>
                        <input type="email" id="email" placeholder="이메일" required>
                        
                        <label for="nickname">닉네임을 입력해주세요</label>
                        <input type="text" id="nickname" placeholder="닉네임" required>
                        
                        <button type="submit">완료</button>
                    </form>
                </div>
                </div>
        `;
    }
}
