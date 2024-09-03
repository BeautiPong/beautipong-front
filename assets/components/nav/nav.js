import {createModal} from '../modal/modal.js';
import { getRouter } from '../../../js/router.js';
import { refreshAccessToken } from '../../../js/token.js';

const profileImg = document.getElementById('nav-profile__img');
const profileTier = document.getElementById('nav-profile__info__tier');
const profileNickname = document.getElementById('nav-profile__info__nickname');

// 프로필 정보 가져오기 함수
export async function loadProfile() {
    try {
        let response = await fetch('http://localhost:8000/api/user/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });

        // 액세스 토큰이 만료되어 401 오류가 발생했을 때
        if (response.status === 401) {
            const newAccessToken = await refreshAccessToken();

            // 새 액세스 토큰으로 다시 요청
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
	
            profileNickname.textContent = profileData.nickname;
			localStorage.setItem('nickname', profileData.nickname);
        } else {
            console.error('프로필 정보를 가져오지 못했습니다:', response.statusText);
        }
    } catch (error) {
        console.error('프로필 정보 로딩 중 오류 발생:', error);
    }
}

// 페이지 로드 시 프로필 정보 가져오기
document.addEventListener('DOMContentLoaded', loadProfile);
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('nav__logout');
    const navMain = document.getElementById('nav__main');
    const navMypage = document.getElementById('nav__mypage');
    const navFriend = document.getElementById('nav__friend');
    const navRank = document.getElementById('nav__rank');

    const router = getRouter();

    logoutBtn.addEventListener('click', () => showModal('정말 로그아웃하시겠습니까?', '확인'));
    navMain.addEventListener('click', () => {
        router.navigate('/');
        setActiveNavButton(navMain);
    });
    navMypage.addEventListener('click', () => {
        router.navigate('/mypage');
        setActiveNavButton(navMypage);
    });
    navFriend.addEventListener('click', () => {
        router.navigate('/friend');
        setActiveNavButton(navFriend);
    });
    navRank.addEventListener('click', () => {
        router.navigate('/rank');
        setActiveNavButton(navRank);
    });
});


// 모달 창 생성 및 표시 함수
function showModal(message, buttonMsg) {
	// 모달 컴포넌트 불러오기
	const modalHTML = createModal(message, buttonMsg);

	// 새 div 요소를 생성하여 모달을 페이지에 추가
	const modalDiv = document.createElement('div');
	modalDiv.innerHTML = modalHTML;
	document.body.appendChild(modalDiv);

	// 닫기 버튼에 이벤트 리스너 추가
	const closeBtn = modalDiv.querySelector('.close');
	closeBtn.onclick = function() {
		modalDiv.remove();
	};

	// 확인 버튼에 이벤트 리스너 추가 (로그아웃 api 호출)
	const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
	confirmBtn.onclick = async function() {
		try {
			const formData = {
				refresh_token: localStorage.getItem('refresh_token'),
			};
	
			const response = await fetch('http://localhost:8000/api/user/account/logout/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // 인증 헤더 추가
				},
				body: JSON.stringify(formData),
			});

			// 액세스 토큰이 만료되어 401 오류가 발생했을 때
			if (response.status === 401) {
				const newAccessToken = await refreshAccessToken();
				formData.refresh_token = newAccessToken;
	
				// 새 액세스 토큰으로 다시 요청
				response = await fetch('http://localhost:8000/api/user/account/logout/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${newAccessToken}`,
					},
					body: JSON.stringify(formData),
				});
			}
	
			// 응답 처리
			if (response.ok) {
				const data = await response.json();  // 응답 데이터를 JSON으로 변환 (await 추가)
				console.log('로그아웃 성공:', data.message);
				modalDiv.remove();
	
				// 토큰 제거
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
	
				// 로그인 페이지로 리다이렉트
				const router = getRouter();
				router.navigate('/login');
			} else {
				const errorData = await response.json();  // 에러 응답도 await 추가
				console.error('로그아웃 실패:', errorData);
			}
	
		} catch (error) {
			console.error('로그아웃 요청 중 오류 발생:', error);
		}
	};
}