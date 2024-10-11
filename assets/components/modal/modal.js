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
                    <div id="newnickname-error-message"></div>
                    <button class="modal-confirm-btn" id="nickname-change-btn">${buttonMsg}</button>
                </div>
            </div>
        </div>
    `;
}

export function createTournamentModal(winner, second, third1, third2) {
    return `
        <div class="modal">
            <div class="modal-box" id="tournament-box">
                <span class="close">&times;</span>
                <div id="tournamentResult__title">-  경기 결과  -</div>
                <div id="tournamentResult">
                    <div id="tournamentResult--2" class="tournamentResult__box">
                        <img src="../../assets/icons/tournament2.svg" alt="2등" />
                        <div>${second}</div>
                    </div>
                    <div id="tournamentResult--1" class="tournamentResult__box">
                        <img src="../../assets/icons/tournament1.svg" alt="1등" />
                        <div>${winner}</div>
                    </div>
                    <div id="tournamentResult--3" class="tournamentResult__box">
                        <img src="../../assets/icons/tournament3.svg" alt="3등" />
                        <div id="tournamentResult--3--first">${third1}</div>
                        <div>${third2}</div>
                    </div>
                </div>
                <button class="modal-confirm-btn" id="tournamentResult-confirm-btn">확인</button>
            </div>
        </div>
    `;
}