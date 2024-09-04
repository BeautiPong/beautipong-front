export default class OfflinePlayerInfo {

    constructor(playerNumber, playerData) {
        this.playerNumber = playerNumber;  // 플레이어 번호 (1, 2, 3, 4 등)
        this.playerData = playerData;      // 플레이어 데이터 (닉네임, 이미지, 경기 수, 승리 수 등)
    }

    render() {
        return `
            <div id="offline-player-info-${this.playerNumber}" class="offline-player-info">
                <img src="${this.playerData.img || 'assets/images/profile.svg'}" alt="프로필 사진" class="profile-img">
                <div class="icon-nickname">
                    <p class="player-info-nickname">${this.playerData.nickname}</p>
                </div>
            </div>
        `;
    }
}