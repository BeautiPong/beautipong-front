// chat-room 컴포넌트 함수
export function createChatRoom(image, nickname, win, score) {
    return `
    <div class="chat-box-up">
        <div class="up-left">
            <div class="friend-image">
                <img class="friend-image__img" src=${image} alt="친구이미지">
            </div>
            <div class="friend-profile">
                <p class="friend-name-text">${nickname}</p>
                <div class="info">
                    <p class="friend-score-text">P.${score}</p>
                    <p class="friend-win-text">${win}</p>
                </div>
            </div>
        </div>
        <div class="friend-button-list">
            <button id="game-request-btn">게임초대</button>
            <button id="block-friend-btn">차단</button>
        </div>
    </div>
    <div class="chat-box-down">
        <div id="chat-log"></div>
        <div class="chat-input-bar">
            <input id="chat-message-input" type="text" placeholder="메시지를 입력해주세요"><br>
        </div>
    </div>
    `;
}
