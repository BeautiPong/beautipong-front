export function renderGameRecord(game) {
    return `
        <div class="recent-game-record">
            <div class="recent-game-record__user-info">
                <img class="recent-game-record__img" src="${!game.user1.profile_img ? game.user1.profile_img : 'assets/images/profile.svg'}" alt="${game.user1.nickname} 프로필 이미지"/>
                <span>${game.user1.nickname}</span>
            </div>
            <div class="recent-game-record__score-info">
                <p>${game.score}</p>
            </div>
            <div class="recent-game-record__user-info">
                <img class="recent-game-record__img" src="${!game.user2.profile_img ? game.user2.profile_img : 'assets/images/profile.svg'}" alt="${game.user2.nickname} 프로필 이미지"/>
                <span>${game.user2.nickname}</span>
            </div>
            <div class="recent-game-record__win-info">
                <button class="${game.win === "승리" ? 'recent-game-record__btn' : 'recent-game-record__btn--lose'}">${game.win}</button>
            </div>
        </div>
    `;
}
