import { createModal } from '../../assets/components/modal/modal.js';
import { getRouter } from '../../js/router.js';
import { loadProfile } from '../../assets/components/nav/nav.js';
import { connectNotificationWebSocket } from '../../assets/components/nav/nav.js';
import { SERVER_IP } from "../../js/index.js";
export default class OauthRedirectPage {
    render() {
        return `
            <h1 style="display: flex; justify-content: center; align-items: center; height: 100vh;">Loading...</h1>
        `;
    }

    async handleRedirectCode() {
        // URL에서 'code' 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // 'code'가 존재하는 경우, 서버로 POST 요청을 보내어 액세스 토큰을 요청합니다.
            try {
                const response = await fetch(`https://${SERVER_IP}/api/user/get-token/?code=${code}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const data = await response.json();
                    const router = getRouter();
                    console.log(data);

                    if (data.message === "42user 회원가입 성공!") {
                        localStorage.setItem('temp_token', data.temp_token);
                        this.showModal('환영합니다! 닉네임을 설정해주세요.', '확인');
                        router.navigate('/nickname');
                    } else if (data.message === "로그인 성공.") {
                        localStorage.setItem('access_token', data.access_token);
                        localStorage.setItem('refresh_token', data.refresh_token);

                        connectNotificationWebSocket(data.access_token);

                        if (data.nickname) {
                            document.querySelector('.nav-container').style.display = 'block';
                            router.navigate('/');
                            loadProfile();
                        } else {
                            document.querySelector('.nav-container').style.display = 'none';
                            this.showModal('닉네임을 설정해주세요.', '확인');
                            history.replaceState(null, '', '/nickname');
                        }
                    }
                } else {
                    console.error('42 토큰 요청 실패:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('42 토큰 요청 중 오류 발생:', error);
            }
        }
    }


    // 모달 창 생성 및 표시 함수
    showModal(message, buttonMsg) {
        // 모달 컴포넌트 불러오기
        const modalHTML = createModal(message, buttonMsg);

        // 새 div 요소를 생성하여 모달을 페이지에 추가
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);

        // 모달을 닫고 경로 이동하는 함수
        const closeModalAndNavigate = () => {
            modalDiv.remove();
            document.removeEventListener('keydown', handleEnterKeyInModal); // 이벤트 리스너 제거
            const router = getRouter();
            router.navigate('/nickname');
        };

        // 닫기 버튼에 이벤트 리스너 추가
        const closeBtn = modalDiv.querySelector('.close');
        closeBtn.onclick = closeModalAndNavigate;

        // 확인 버튼에 이벤트 리스너 추가
        const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
        confirmBtn.onclick = closeModalAndNavigate;

        // 모달에서 Enter 키 입력 시 모달을 닫는 이벤트 리스너 추가
        const handleEnterKeyInModal = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                closeModalAndNavigate();
            }
        };

        // 이벤트 리스너 추가
        document.addEventListener('keydown', handleEnterKeyInModal);
    }
}
