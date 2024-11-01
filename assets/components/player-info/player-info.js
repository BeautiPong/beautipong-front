import {SERVER_IP} from '../../../js/index.js';
import {refreshAccessToken} from "../../../js/token.js";

export default class PlayerInfo {
    constructor() {
        this.playerData = null; // 초기에는 null로 설정
    }

    // 플레이어 정보를 서버에서 가져오는 메서드
    async fetchPlayerData(username) {
        try {
            const accessToken = localStorage.getItem("access_token");

            let response = await fetch(`https://${SERVER_IP}/api/user/info/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();

                // 새 액세스 토큰으로 다시 요청
                response = await fetch(`https://${SERVER_IP}/api/user/info/${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (response.ok) {
                this.playerData = await response.json(); // 서버에서 받은 데이터를 저장
                console.log(this.playerData);
                this.updatePlayerInfo(); // 데이터를 받은 후 컴포넌트를 업데이트
            } else {
                console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
            }

        } catch (error) {
            console.error('플레이어 정보를 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    // player-info 컴포넌트를 렌더링하는 메서드
    render() {
        return `
            <div id="playerInfo" class="player-info">
                <p>Loading...</p> <!-- 데이터 로딩 전 임시 표시 -->
            </div>
        `;
    }

    // player-info 컴포넌트를 업데이트하는 메서드
    updatePlayerInfo() {
        const playerInfoDiv = document.getElementById('playerInfo');
        if (this.playerData) {
            playerInfoDiv.innerHTML = `
                <img src="${this.playerData.img || 'assets/images/profile.svg'}" alt="프로필 사진" class="profile-img">
                <div class="icon-nickname">
                    <img src="${this.getPlayerTierIcon(this.playerData.score)}" class="player-icon"></img>
                    <p class="player-info-nickname">${this.playerData.nickname}</p>
                </div>
                <p class="player-info-score">${this.playerData.match_cnt}전 ${this.playerData.win_cnt}승 ${this.playerData.match_cnt - this.playerData.win_cnt}패</p>
            `;
        } else {
            playerInfoDiv.innerHTML = `<p>플레이어 정보를 가져오지 못했습니다.</p>`;
        }
    }

    // 플레이어 티어 아이콘 경로를 반환하는 메서드
    getPlayerTierIcon(score) {

        if (score > 2000) {
            return 'assets/icons/dia.svg';
        } else if (score > 1500) {
            return 'assets/icons/platinum.svg';
        } else if (score > 1200) {
            return 'assets/icons/gold.svg';
        } else if (score > 1000) {
            return 'assets/icons/silver.svg';
        } else {
            return 'assets/icons/bronz.svg';
        }
    }
}
