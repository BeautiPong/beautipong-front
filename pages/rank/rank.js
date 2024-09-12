import { refreshAccessToken } from '../../js/token.js';
import { renderUserRankInfo } from '../../assets/components/rank-info/rank-info.js'
// import { getRouter } from '../../js/router.js';

export default class RankPage {

    render() {
        return `
        <div class="rank-container">
            <div class="rank--background">
                <section class="rank__left-section">
                    <div class="rank__left-section__user-info">
                    </div>
                    <div class="rank__left-section__total-info">
                    </div>
                </section>
                <section class="rank__right-section">right
                </section>
            </div>
        </div>
        `;
    }

    afterRender() {
        this.loadTotalRank();
    }

    async loadTotalRank() {
        try {
            const profileNickname = localStorage.getItem('nickname');
            const userRankContainer = document.querySelector('.rank__left-section__user-info');
            const totalRankContainer = document.querySelector('.rank__left-section__total-info');
    
            let response = await fetch(`http://localhost:8000/api/score/all/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`http://localhost:8000/api/score/all/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            // 응답 처리
            if (response.ok) {
                const rankData = await response.json();
                console.log(rankData);

                //유저 정보 출력
                const userRankData = rankData.find(data => data.nickname === profileNickname);
                userRankContainer.innerHTML = renderUserRankInfo(userRankData);

                //유저용 클래스 추가
                const userRankDiv = userRankContainer.querySelector('.user-rank-info'); // 생성된 div 선택
                if (userRankDiv) {
                    userRankDiv.classList.add('profile-user-rank-info');
                }
    
                //전체 랭킹 출력
                totalRankContainer.innerHTML = rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
    
            } else {
                console.error('유저 랭킹 데이터를 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('유저 랭팅 데이터 로딩 중 오류 발생:', error);
        }
    }
}
