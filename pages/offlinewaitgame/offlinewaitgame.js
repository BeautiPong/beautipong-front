import OfflinePlayerInfo from '../../assets/components/offline-player-info/offline-play-info.js'; // PlayerInfo 클래스 임포트

export default class OfflineWaitGame {
    constructor() {}

    render() {
        return `
            <div class="offline-game-div">
                <div id="offline-game-container" class="offline-game-container">
                    <div class="offline-game-player-cards">
                        <!-- 플레이어 카드들이 여기에 추가될 것입니다. -->
                    </div>
                    <div class="offline-game-start-btn">
                        <button class="game-start-btn">게임 시작</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 플레이어 정보를 추가하는 메서드
    addPlayers() {
        const playersData = [
            { nickname: 'Player 1', img: 'assets/images/profile1.svg', match_cnt: 10, win_cnt: 5 },
            { nickname: 'Player 2', img: 'assets/images/profile2.svg', match_cnt: 12, win_cnt: 7 },
            { nickname: 'Player 3', img: 'assets/images/profile3.svg', match_cnt: 8, win_cnt: 4 },
            { nickname: 'Player 4', img: 'assets/images/profile4.svg', match_cnt: 15, win_cnt: 10 }
        ];

        const container = document.querySelector('.offline-game-player-cards'); // 카드들이 들어갈 컨테이너 div

        playersData.forEach((playerData, index) => {
            const playerInfo = new OfflinePlayerInfo(index + 1, playerData);
            container.innerHTML += playerInfo.render();
        });
    }
}
