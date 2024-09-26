// Modal 컴포넌트 함수
export function createModal(message, buttonMsg, icon) {
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

export function createNicknameModal(message, buttonMsg) {
    return `
        <div class="modal">
            <div class="modal-box">
                <span class="close">&times;</span>
                <p class="message">${message}</p>
                <div id="new_nickname_inputbox">
                    <input type="text" id="new_nickname" name="nickname" required>
                    <button class="modal-confirm-btn" id="nickname-change-btn">${buttonMsg}</button>
                </div>
            </div>
        </div>
    `;
}