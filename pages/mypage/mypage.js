import { refreshAccessToken } from '../../js/token.js';

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
                                <img id="mypage__top__profile-info__edit" src="../../assets/images/cam.svg" alt="profile_img_editBtn"/>
                            </div>
                            <div class="mypage__top__profile-info__nicknameEdit">
                                <span id="mypage__top__profile-info__nickname"></span>
                                <img id="mypage__top__profile-info__nickname__edit" src="../../assets/images/edit.svg" alt="nickname_editBtn"/>
                            </div>
                        </div>
                        <div class="mypage__top__game-info">game info</div>
                    </section>
                    <section class="mypage__bottom">
                        bottom
                    </section>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        this.loadProfile();
    }

    async loadProfile() {
        try {
            const profileImg = document.getElementById('mypage__top__profile-info__img');
            const profileNickname = document.getElementById('mypage__top__profile-info__nickname');

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
            } else {
                console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
            }
        } catch (error) {
            console.error('프로필 정보 로딩 중 오류 발생:', error);
        }
    }
}
