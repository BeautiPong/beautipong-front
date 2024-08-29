// message 컴포넌트 함수
export function createMessage(nickname, content) {
    return `
    <div class="chat-message-box">
        <p class="message-nickname">${nickname}</p>
        <p class="message-content">${content}</p>
    </div>
    `;
}