export function renderGameRecord(game) {
    return `
        <div class="recent-game-record">
            <div class="recent-game-record__user1-info">
                <img src="${game.user1.profile_img}" alt="${game.user1.nickname} 프로필 이미지"/>
                <p>${game.user1.nickname}</p>
            </div>
            <div class="recent-game-record__score-info">
                <p>점수: ${game.score}</p>
            </div>
            <div class="recent-game-record__user2-info">
                <img src="${game.user2.profile_img}" alt="${game.user2.nickname} 프로필 이미지"/>
                <p>${game.user2.nickname}</p>
            </div>
			<div class="recent-game-record__win-info">
                <button>${game.win}</button>
            </div>
        </div>
    `;
}