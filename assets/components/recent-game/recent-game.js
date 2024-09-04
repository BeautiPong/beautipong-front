export function renderGameRecord(game) {
    return `
        <div class="recent-game-record">
            <div class="recent-game-record__user-info">
                <img class="recent-game-record__img" src="${game.user1_image !== null ? game.user1_image : 'assets/images/profile.svg'}" alt="${game.user1_image} 프로필 이미지"/>
                <span>${game.user1_nickname}</span>
            </div>
            <div class="recent-game-record__score-info">
                <p>${game.user1_score} : ${game.user2_score}</p>
            </div>
            <div class="recent-game-record__user-info">
                <img class="recent-game-record__img" src="${game.user2_image !== null ? game.user2_image : 'assets/images/profile.svg'}" alt="${game.user2_image} 프로필 이미지"/>
                <span>${game.user2_nickname}</span>
            </div>
            <div class="recent-game-record__win-info">
                <button class="${game.user1_score > game.user2_score ? 'recent-game-record__btn' : 'recent-game-record__btn--lose'}">
                    ${game.user1_score > game.user2_score ? '승리' : '패배'}
                </button>
            </div>
        </div>
    `;
}
