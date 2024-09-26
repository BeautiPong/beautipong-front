// Modal 컴포넌트 함수
export function createModal(message, buttonMsg, icon) {
    console.log(icon);
    return `
        <div class="modal">
            <div class="modal-box">
                <span class="close">&times;</span>
                <img src="${icon ? `../../assets/icons/${icon}.svg` : '../../assets/icons/invite.svg'}" alt="아이콘" class="signup-image">
                <p class="message">${message}</p>
                <button class="modal-confirm-btn">${buttonMsg}</button>
            </div>
        </div>
    `;
}