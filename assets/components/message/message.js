// message 컴포넌트 함수
export function createMessage(type, nickname, content) {
    return `
    <div class="chat-message-box ${type}">
        <p class="message-nickname ${type}">${nickname}</p>
        <p class="message-content ${type}">${content}</p>
    </div>
    `;
}