import {createModal} from '../modal/modal.js';

const logoutBtn = document.getElementById('nav__logout');

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
	
			// 응답 처리
			if (response.ok) {
				const data = await response.json();  // 응답 데이터를 JSON으로 변환 (await 추가)
				console.log('로그아웃 성공:', data.message);
				modalDiv.remove();
	
				// 토큰 제거
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
	
				// 로그인 페이지로 리다이렉트
				window.location.hash = '#/login';
			} else {
				const errorData = await response.json();  // 에러 응답도 await 추가
				console.error('로그아웃 실패:', errorData);
			}
	
		} catch (error) {
			console.error('로그아웃 요청 중 오류 발생:', error);
		}
	};
	
}

logoutBtn.addEventListener('click', () => showModal('정말 로그아웃하시겠습니까?', '확인'));