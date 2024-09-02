import { refreshAccessToken } from '../../js/token.js';
import { renderGameRecord } from '../../assets/components/recent-game/recent-game.js'
import { getRouter } from '../../js/router.js'; 

export default class MyPage {

    constructor() {
        this.loadProfile = this.loadProfile.bind(this);
    }

    render() {
        return `
        <div class="mypage-container">
            <div class="mypage--background">
                <div class="mypage__contents">
                    <section class="mypage__top">
                        <div class="mypage__top__profile-info">
                            <div class="mypage__top__profile-info__imgEdit">
                                <img id="mypage__top__profile-info__img" src="" alt="profile_img"/>
                                <div class="mypage__top__profile-info__imgEdit__button">
                                    <input type="file" id="profileImageInput" style="display: none;" />
                                    <label for="profileImageInput">
                                        <img id="mypage__top__profile-info__edit" src="../../assets/images/camera.svg" alt="profile_img_editBtn"/>
                                    </label>
                                </div>
                            </div>
                            <div class="mypage__top__profile-info__nicknameEdit">
                                <span id="mypage__top__profile-info__nickname"></span>
                                <img id="mypage__top__profile-info__nickname__edit" src="../../assets/images/edit_.svg" alt="nickname_editBtn"/>
                            </div>
                        </div>
                        <div class="mypage__top__game-info">
                            <div class="mypage__game-info__title">
                                <p>티어</p>
                                <p>출전</p>
                                <p>승률</p>
                                <p>총점</p>
                            </div>
                            <div class="mypage__game-info__content">
                                <img id="mypage__game-info__tier" src="" alt="tier_icon"/>
                                <p id="mypage__game-info__gamecnt">1</p>
                                <p id="mypage__game-info__winrate">10</p>
                                <p id="mypage__game-info__score">100</p>
                            </div>
                        </div>
                    </section>
                    <section class="mypage__bottom">
                        <p id="mypage__bottom__title">최근 경기 기록</p>
                        <div id="mypage__bottom__content">
                        </div>
                    </section>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        this.loadProfile();
        this.loadRecentGame();

        const imgEditButton = document.getElementById('profileImageInput');
        const nicknameEditButton = document.getElementById('mypage__top__profile-info__nickname__edit');

        imgEditButton.addEventListener('change', (event) => this.handleImgEditBtn(event));
        nicknameEditButton.addEventListener('click', (event) => this.handleNicknameEditBtn(event));
    }

    async loadProfile() {
        try {
            const profileImg = document.getElementById('mypage__top__profile-info__img');
            const profileNickname = document.getElementById('mypage__top__profile-info__nickname');
            const profileTier = document.getElementById('mypage__game-info__tier');
            const profileGameCnt = document.getElementById('mypage__game-info__gamecnt');
            const profileWinRate = document.getElementById('mypage__game-info__winrate');
            const profileScore = document.getElementById('mypage__game-info__score');

            let response = await fetch('http://localhost:8000/api/user/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch('http://localhost:8000/api/user/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }

            // 응답 처리
            if (response.ok) {
                const profileData = await response.json();
                console.log(profileData);

                // DOM 요소에 프로필 정보 설정
                if (profileData.img) {
                    profileImg.src = profileData.img;
                } else {
                    profileImg.src = "assets/images/profile.svg";
                }

                profileNickname.textContent = profileData.nickname;

                if (profileData.score <= 1000) {
                    profileTier.src = `assets/icons/bronz.svg`;
                }
                else if (profileData.score <= 1200) {
                    profileTier.src = `assets/icons/silver.svg`;
                }
                else if (profileData.score <= 1500) {
                    profileTier.src = `assets/icons/gold.svg`;
                }
                else if (profileData.score <= 2000) {
                    profileTier.src = `assets/icons/platinum.svg`;
                }
                else {
                    profileTier.src = `assets/icons/dia.svg`;
                }

                profileGameCnt.textContent = profileData.match_cnt;
                profileWinRate.textContent = profileData.win_rate;
                profileScore.textContent = profileData.score;

            } else {
                console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('프로필 정보 로딩 중 오류 발생:', error);
        }
    }

    async loadRecentGame() {
        try {
            const profileNickname = localStorage.getItem('nickname');
            const recentGameDataContainer = document.getElementById('mypage__bottom__content');
            console.log('nickname: ', profileNickname);
    
            let response = await fetch(`http://localhost:8000/api/game/info/${profileNickname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`http://localhost:8000/api/game/info/${profileNickname}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            // 응답 처리
            if (response.ok) {
                const recentGameData = await response.json();
                console.log(recentGameData);
    
                // 최근 경기 기록이 없을 경우
                // if (recentGameData.length === 0) {
                //     recentGameDataContainer.innerHTML = `<p id="mypage__bottom__nogame">출전한 경기가 없습니다.</p>`;
                //     return;
                // }
    
                // DOM 요소에 최근 경기 기록 추가
                const testData = {
                    user1: {
                        profile_img: "​",
                        nickname: "User1"
                    },
                    user2: {
                        profile_img: "​",
                        nickname: "User2"
                    },
                    score: "1 : 2",
                    win: "승리"
                }
                const testData2 = {
                    user1: {
                        profile_img: "​",
                        nickname: "User1"
                    },
                    user2: {
                        profile_img: "​",
                        nickname: "User222"
                    },
                    score: "1 : 2",
                    win: "패배"
                }
                const testGameData = [testData, testData2, testData, testData2];
                recentGameDataContainer.innerHTML = testGameData.map(game => renderGameRecord(game)).join('');
                // recentGameDataContainer.innerHTML = recentGameData.map(game => renderGameRecord(game)).join('');
    
            } else {
                console.error('최근 경기 기록을 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('최근 경기 기록 로딩 중 오류 발생:', error);
        }
    }

    async handleImgEditBtn(e) {
        console.log(e.target.files);
        const router = getRouter();
    
        const newProfileImg = e.target.files[0]; // 선택된 파일
        if (!newProfileImg) {
            alert('이미지를 선택해주세요.');
            return;
        }
    
        const formData = new FormData();
        formData.append('img', newProfileImg);
    
        try {
            const response = await fetch('http://localhost:8000/api/user/profile/update/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    // 'Content-Type' 헤더는 설정하지 않음, 자동으로 multipart/form-data로 설정됨
                },
                body: formData
            });
    
            if (response.ok) {
                const updatedData = await response.json();
                console.log(updatedData);
                // document.getElementById('mypage__top__profile-info__img').src = updatedData.img;
                router.navigate('/mypage');
                alert('프로필 이미지가 성공적으로 변경되었습니다.');
            } else {
                const errorData = await response.json();
                console.error('프로필 이미지 변경 실패:', errorData);
                alert('프로필 이미지 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 이미지 변경 중 오류 발생:', error);
            alert('프로필 이미지 변경 중 오류가 발생했습니다.');
        }
    }
      
    
    async handleNicknameImgEditBtn(event) {

        const newNickname = prompt('새로운 닉네임을 입력하세요:', '새로운 닉네임');
        const router = getRouter();

        if (newNickname) {
            // 닉네임이 변경된 경우 서버에 요청
            try {
                const response = await fetch('http://localhost:8000/api/user/profile/update/', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nickname: newNickname })
                });

                if (response.ok) {
                    const updatedData = await response.json();
                    document.getElementById('mypage__top__profile-info__nickname').textContent = updatedData.nickname;
                    alert('닉네임이 성공적으로 변경되었습니다.');
                } else {
                    const errorData = await response.json();
                    console.error('닉네임 변경 실패:', errorData);
                    alert('닉네임 변경에 실패했습니다.');
                }
            } catch (error) {
                console.error('닉네임 변경 중 오류 발생:', error);
                alert('닉네임 변경 중 오류가 발생했습니다.');
            }
        }
    }
     
}
