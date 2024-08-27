// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class GamePage {
    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
            <div class="game-div">
                <div class="game-header">
                    <h1>게임 페이지_온라인</h1>
                </div>
                <div class="game-container">
                    <div class="match-area">
                        <div class="player-info">
                            <img src="profile_image_url" alt="프로필 사진" class="profile-img">
                            <p class="nickname">nickname</p>
                            <p class="score">10전 10승 0패</p>
                        </div>
                        <div class="vs-text">
                            <p>VS</p>
                        </div>
                        <div class="opponent-info">
                            <button class="invite-btn">친구초대</button>
                            <button class="random-btn">랜덤매칭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
