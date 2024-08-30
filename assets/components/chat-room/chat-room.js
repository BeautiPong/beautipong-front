// chat-room 컴포넌트 함수
export function createChatRoom(image, nickname, win) {
    return `
    <div class="chat-box-up">
        <img class="friend-image" src="../../assets/images/profile.svg" alt="친구이미지">
        <div class="friend-profile">
            <p class="friend-name-text">${nickname}</p>
            <p class="friend-win-text">${win}</p>
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