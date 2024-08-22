// Modal 컴포넌트 함수
export function createModal(message, buttonMsg) {
    return `
        <div class="modal">
            <div class="modal-box">
                <span class="close">&times;</span>
                <img src="../../assets/icons/invite.svg" alt="회원가입완료" class="signup-image">
                <p class="message">${message}</p>
                <button class="modal-confirm-btn">${buttonMsg}</button>
            </div>
        </div>
    `;
}