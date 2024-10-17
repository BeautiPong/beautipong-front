import { refreshAccessToken } from '../../js/token.js';
import { renderUserRankInfo } from '../../assets/components/rank-info/rank-info.js'
import {SERVER_IP} from "../../js/index.js";

const Utils = {
    CHART_COLORS: {
        custom: 'rgb(110,208,135)',
    },
    
    numbers: function(config) {
        const cfg = config || {};
        const min = cfg.min || 0;
        const max = cfg.max || 1;
        const from = cfg.from || [];
        const count = cfg.count || 8;
        const decimals = cfg.decimals || 8;
        const continuity = cfg.continuity || 1;
        const dfactor = Math.pow(10, decimals) || 0;
        const data = [];
        let i, value;

        for (i = 0; i < count; ++i) {
            value = (from[i] || 0) + min + Math.random() * (max - min);
            if (Math.random() <= continuity) {
                data.push(Math.round(dfactor * value) / dfactor);
            } else {
            data.push(null);
            }
        }

        return data;
    },

    transparentize: function(color, opacity) {
        const alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return `rgba(${color.slice(4, color.length - 1)}, ${alpha})`;
    }
};

export default class RankPage {

    // 차트 인스턴스를 저장할 변수
    stateChartInstance = null;
    myChartInstance = null;

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
                <section class="rank__right-section">
                    <div class="rank__right-section__user-info">
                        <div class="rank__right-section__user-info--img">
                            <img src="assets/images/profile.svg" alt="profile_img" id="rank__right-section__user-image"/>
                        </div>
                        <div class="rank__right-section__user-info--text">
                            <div class="rank-star-container">
                                <img src="assets/icons/rank-star.svg" alt="rank-star" />
                                <span class="rank-number"></span>
                            </div>
                            <span id="rank-data--nickname"></span>
                        </div>
                    </div>
                    <div class="rank__right-section__user-dash-board">
                        <div class="user-dash-board__rate">
                            <div class="user-dash-board__rate--text">
                                <span></span>
                                <span></span>
                            </div>
                            <canvas id="stateChart" height="20"></canvas>
                        </div>
                        <div class="user-dash-board__graph">
                            <canvas id="myChart" height="180" width="350"></canvas>
                        </div>
                    </div>
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
            const rankNumberElement = document.querySelector('.rank-number');
            const nicknameElement = document.getElementById('rank-data--nickname');

            let response = await fetch(`https://${SERVER_IP}/api/score/all/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/score/all/`, {
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
                nicknameElement.textContent = profileNickname;
                this.updateUserRankInfo(userRankData);
    
                //전체 랭킹 출력
                totalRankContainer.innerHTML = rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                // totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                // totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');
                // totalRankContainer.innerHTML += rankData.map(data => renderUserRankInfo(data, profileNickname)).join('');

                // 유저 클릭 이벤트 등록
                const allUsers = totalRankContainer.querySelectorAll('.user-rank-info');
                allUsers.forEach(userElement => {
                    // 유저 클릭 시
                    userElement.addEventListener('click', () => {
                        // 모든 유저의 active 클래스 제거
                        allUsers.forEach(el => el.classList.remove('active'));
                
                        // 클릭한 유저에 active 클래스 추가
                        userElement.classList.add('active');
                
                        // 유저 닉네임에 해당하는 데이터 찾기
                        const clickedUserNickname = userElement.querySelector('.user-rank-info__nickname').textContent;
                        const clickedUserData = rankData.find(data => data.nickname === clickedUserNickname);
                        
                        // 클릭한 유저 데이터 업데이트
                        if (clickedUserData) {
                            this.updateUserRankInfo(clickedUserData);
                        }
                    });
                });
    
            } else {
                console.error('유저 랭킹 데이터를 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('유저 랭팅 데이터 로딩 중 오류 발생:', error);
        }
    }

    updateUserRankInfo(userData) {
        const rankNumberElement = document.querySelector('.rank-number');
        const nicknameElement = document.getElementById('rank-data--nickname');
        nicknameElement.textContent = userData.nickname;

        if (!userData.rank)
            rankNumberElement.textContent = '-';
        else
            rankNumberElement.textContent = userData.rank;

        requestAnimationFrame(() => {
            this.loadStateRecords(userData.nickname);
            this.loadGameRecords(userData.nickname);
        });
    }

    async loadStateRecords(nickname) {
        const ctx = document.getElementById('stateChart').getContext('2d');
    
        // 기존 차트가 있다면 제거
        if (this.stateChartInstance) {
            this.stateChartInstance.destroy();
        }
    
        try {
            // API 요청
            let response = await fetch(`https://${SERVER_IP}/api/user/info/${nickname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/user/info/${nickname}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            if (response.ok) {
                const data = await response.json();
                const winRate = data.win_rate;
                const lose_cnt = data.match_cnt - data.win_cnt;
                const user_image = data.image;

                const gameCountElement = document.querySelector('.user-dash-board__rate--text span:nth-of-type(1)');
                const gameStateElement = document.querySelector('.user-dash-board__rate--text span:nth-of-type(2)');
                const userImage = document.getElementById('rank__right-section__user-image');
                gameCountElement.textContent = `${data.match_cnt}전 ${data.win_cnt}승 ${lose_cnt}패`;
                gameStateElement.textContent = `승률 ${winRate}%`

                if (user_image) {
                    userImage.src = user_image;
                } else {
                    userImage.src = "assets/images/profile.svg";  // 기본 이미지
                }

                // 새 차트 생성
                this.stateChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['승률'],
                        datasets: [
                            {
                                label: '승률',
                                data: [winRate],
                                backgroundColor: '#6ED087', // 막대 색상
                                borderRadius: Number.MAX_VALUE, // 둥글게
                                barThickness: 25, // 막대 두께
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'y', // 수평 방향
                        scales: {
                            x: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    display: false // x축 글자 숨기기
                                },
                                grid: {
                                    display: false, // 그리드 숨기기
                                    drawBorder: false // x축 선 숨기기
                                },
                                border: {
                                    display: false // x축 경계선 숨기기
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    display: false
                                },
                                grid: {
                                    display: false,
                                    drawBorder: false
                                },
                                border: {
                                    display: false
                                }
                            }
                        },
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false // 툴팁 비활성화
                            }
                        },
                        interaction: {
                            mode: 'nearest', // 호버 모드 설정
                            intersect: true // 교차하도록 설정
                        },
                        elements: {
                            bar: {
                                hoverBackgroundColor: '#6ED087',
                                borderRadius: Number.MAX_VALUE, // 모든 모서리 둥글게
                                borderSkipped: false // 좌우 측면 둥글게 설정
                            }
                        }
                    }
                });
            } else {
                console.error('Failed to load state records:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading state records:', error);
        }
    }    

    async loadGameRecords(nickname) {
        try {
            const response = await fetch(`https://${SERVER_IP}/api/score/graph/${nickname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/score/graph/${nickname}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            if (response.ok) {
                const gameRecords = await response.json();
                // 날짜 포맷 변환 (DD-MM-YY)
                const dates = gameRecords.map(record => {
                
                const date = new Date(record.create_time);
                if (date == 'Invalid Date')
                    return '00-00-00';

                const day = String(date.getDate()).padStart(2, '0'); // 일
                const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
                const year = String(date.getFullYear()).slice(2); // 연도 마지막 두 자리
                return `${year}-${month}-${day}`; // 24-09-03 형식으로 변환
                });
                const scores = gameRecords.map(record => record.score);
    
                // 차트 렌더링
                const ctx = document.getElementById('myChart').getContext('2d');
                // 기존 차트가 있다면 제거
                if (this.myChartInstance) {
                    this.myChartInstance.destroy();
                }

                // 새 차트 생성
                this.myChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,  // X축 날짜
                        datasets: [{
                            label: 'User Scores',
                            data: scores,  // Y축 점수
                            borderColor: Utils.CHART_COLORS.custom,
                            backgroundColor: Utils.transparentize(Utils.CHART_COLORS.custom, 0.5),
                            pointStyle: 'circle',
                            pointRadius: 10,
                            pointHoverRadius: 15
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 800,  // Y축 시작점 설정
                                max: 2000, // Y축 끝점 설정
                                ticks: {
                                    stepSize: 200,  // 200포인트 간격으로 기준선 설정
                                    color: 'rgb(217, 217, 217)',  // Y축 글자 색상
                                    callback: function(value) {
                                        return value;
                                    }
                                },
                                grid: {
                                    color: 'rgba(217, 217, 217, 0.8)',  // Y축 배경 그리드 선 색상
                                }
                            },
                            x: {
                                ticks: {
                                    color: 'rgb(217, 217, 217)',  // X축 글자 색상
                                },
                                grid: {
                                    color: 'rgba(217, 217, 217, 0.8)',  // X축 배경 그리드 선 색상
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                bodyColor: 'rgb(217, 217, 217)',  // 툴팁 본문 색상
                                titleColor: 'rgb(110, 208, 135)',  // 툴팁 제목 색상
                                backgroundColor: 'rgba(85, 85, 85, 0.8)',  // 툴팁 배경 색상
                                borderColor: 'rgb(110, 208, 135)',  // 툴팁 테두리 색상
                                borderWidth: 1,  // 툴팁 테두리 두께
                                titleFont: {
                                    size: 14,
                                    weight: 'bold'  // 툴팁 제목 글꼴 굵기
                                },
                                bodyFont: {
                                    size: 16,
                                    weight: 'bold'  // 툴팁 본문 글꼴 굵기
                                },
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return `Score: ${tooltipItem.raw}`;
                                    }
                                }
                            }
                        }
                    },
                });
            } else {
                console.error('Failed to load game records:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading game records:', error);
        }
    }
}
