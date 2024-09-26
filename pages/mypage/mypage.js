import { refreshAccessToken } from '../../js/token.js';
import { renderGameRecord } from '../../assets/components/recent-game/recent-game.js'
import { getRouter } from '../../js/router.js';
import {SERVER_IP} from "../../js/index.js";
import { loadProfile } from '../../assets/components/nav/nav.js';

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
    
            // 로컬스토리지에서 프로필 정보 가져오기
            const nickname = localStorage.getItem('nickname');
            const score = localStorage.getItem('score');
            const matchCnt = localStorage.getItem('match_cnt');
            const winRate = localStorage.getItem('win_rate');
            const img = localStorage.getItem('img');
    
            // DOM 요소에 프로필 정보 설정
            if (img === "null") {
                profileImg.src = "assets/images/profile.svg";
            } else {
                profileImg.src = img;
            }
    
            profileNickname.textContent = nickname;
    
            if (score <= 1000) {
                profileTier.src = `assets/icons/bronz.svg`;
            } else if (score <= 1200) {
                profileTier.src = `assets/icons/silver.svg`;
            } else if (score <= 1500) {
                profileTier.src = `assets/icons/gold.svg`;
            } else if (score <= 2000) {
                profileTier.src = `assets/icons/platinum.svg`;
            } else {
                profileTier.src = `assets/icons/dia.svg`;
            }
    
            profileGameCnt.textContent = matchCnt ? matchCnt : '-';
            profileWinRate.textContent = winRate ? winRate : '-';
            profileScore.textContent = score;
    
        } catch (error) {
            console.error('프로필 정보 로딩 중 오류 발생:', error);
        }
    }    

    async loadRecentGame() {
        try {
            const profileNickname = localStorage.getItem('nickname');
            const recentGameDataContainer = document.getElementById('mypage__bottom__content');
    
            let response = await fetch(`https://${SERVER_IP}/api/game/info/${profileNickname}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
    
            // 액세스 토큰이 만료되어 401 오류가 발생했을 때
            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                response = await fetch(`https://${SERVER_IP}/api/game/info/${profileNickname}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                    },
                });
            }
    
            // 응답 처리
            if (response.ok) {
                const recentGameData = await response.json();
    
                // 최근 경기 기록이 없을 경우
                if (recentGameData.length === 0) {
                    recentGameDataContainer.innerHTML = `<p id="mypage__bottom__nogame">출전한 경기가 없습니다.</p>`;
                    return;
                }
    
                recentGameDataContainer.innerHTML = recentGameData.map(game => renderGameRecord(game)).join('');
    
            } else {
                console.error('최근 경기 기록을 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('최근 경기 기록 로딩 중 오류 발생:', error);
        }
    }

    // async handleImgEditBtn(e) {
    //     console.log(e.target.files);
    //     const router = getRouter();
    
    //     const newProfileImg = e.target.files[0]; // 선택된 파일
    //     if (!newProfileImg) {
    //         alert('이미지를 선택해주세요.');
    //         return;
    //     }
    
    //     const formData = new FormData();
    //     formData.append('img', newProfileImg);
    
    //     try {
    //         const response = await fetch(`https://${SERVER_IP}/api/user/profile/update/`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    //                 // 'Content-Type' 헤더는 설정하지 않음, 자동으로 multipart/form-data로 설정됨
    //             },
    //             body: formData
    //         });
    
    //         if (response.ok) {
    //             const updatedData = await response.json();
    //             console.log(updatedData);
    //             // document.getElementById('mypage__top__profile-info__img').src = updatedData.img;
    //             router.navigate('/mypage');
    //             alert('프로필 이미지가 성공적으로 변경되었습니다.');
    //         } else {
    //             const errorData = await response.json();
    //             console.error('프로필 이미지 변경 실패:', errorData);
    //             alert('프로필 이미지 변경에 실패했습니다.');
    //         }
    //     } catch (error) {
    //         console.error('프로필 이미지 변경 중 오류 발생:', error);
    //         alert('프로필 이미지 변경 중 오류가 발생했습니다.');
    //     }
    // }

    async handleImgEditBtn(e) {
        console.log(e.target.files);
        const router = getRouter();
    
        var newProfileImg = e.target.files[0]; // 선택된 파일
        var formData = new FormData();
        formData.append('image', newProfileImg);
    
        try {
            const response = await fetch(`https://${SERVER_IP}/api/user/profile/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    // 'Content-Type' 헤더는 FormData 사용 시 자동으로 설정됩니다.
                },
                body: formData
            });
    
            if (response.ok) {
                const updatedData = await response.json();
                console.log(updatedData);
                document.getElementById('mypage__top__profile-info__img').src = updatedData.img;
                router.navigate('/mypage');
                alert('프로필 이미지가 성공적으로 변경되었습니다.');
                loadProfile();
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
                const response = await fetch(`https://${SERVER_IP}/api/user/profile/update/`, {
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
