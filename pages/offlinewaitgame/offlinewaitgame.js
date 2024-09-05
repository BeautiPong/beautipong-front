import OfflinePlayerInfo from '../../assets/components/offline-player-info/offline-play-info.js'; // PlayerInfo 클래스 임포트
export default class OfflineWaitGame {
    constructor() {
        this.playersNicknames = {};
    }

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
            { nickname: 'Player 1', img: 'assets/images/profile1.png'},
            { nickname: 'Player 2', img: 'assets/images/profile2.png'},
            { nickname: 'Player 3', img: 'assets/images/profile3.png'},
            { nickname: 'Player 4', img: 'assets/images/profile4.png'}
        ];

        const container = document.querySelector('.offline-game-player-cards'); // 카드들이 들어갈 컨테이너 div

        playersData.forEach((playerData, index) => {
            const playerInfo = new OfflinePlayerInfo(index + 1, playerData);
            container.insertAdjacentHTML('beforeend', playerInfo.render());

            // 닉네임 저장을 위한 기본 값 설정
            this.playersNicknames[`player${index + 1}`] = playerData.nickname;

            // 각 플레이어의 인풋 필드에 이벤트 리스너 추가
            const inputField = document.getElementById(`plyaer${index + 1}-nickname`);
            inputField.addEventListener('input', (event) => {
                this.updatePlayerNickname(index + 1, event.target.value);
            });
        });

        const gameStartBtn = document.getElementById('gameStartBtn');
        gameStartBtn.addEventListener('click', () => {
            this.startGame();
        });
    }

    updatePlayerNickname(playerNumber, newNickname) {
        this.playersNicknames[`player${playerNumber}`] = newNickname;
        console.log(`Player ${playerNumber} 닉네임 업데이트:`, this.playersNicknames);
    }

    startGame() {
        // game.html 페이지로 리디렉션 (게임 페이지 경로를 실제 경로로 교체)
        // 게임 페이지로 리다이렉트
    }
}
