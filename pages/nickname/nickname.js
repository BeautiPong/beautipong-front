// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class NicknamePage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
            <div class="nickname-div">
                <div class="nickname-container">
                    <h1>닉네임 설정</h1>
                    <form>
                        <input type="text" placeholder="사용할 닉네임을 입력해주세요" required>
                        <div class="buttons">
                            <button type="button">NEXT</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}

