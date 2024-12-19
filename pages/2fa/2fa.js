import { createModal } from '../../assets/components/modal/modal.js';
import { getRouter } from '../../js/router.js';
import { loadProfile } from '../../assets/components/nav/nav.js';
import { connectNotificationWebSocket } from '../../assets/components/nav/nav.js';
import { SERVER_IP } from "../../js/index.js";

export default class TwoFactorPage {
    constructor() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    render() {
        return `
            <div class="two-factor">
                <div class="two-fa-container">
                    <h1>2FA 인증</h1>
                    <form id="two-fa-form">
                        <div class="input-wrapper">
                            <div class="two-fa-inputs">
                                <div class="input-group">
                                    <input type="text" maxlength="1" required>
                                    <input type="text" maxlength="1" required>
                                    <input type="text" maxlength="1" required>
                                </div>
                                <div class="input-group">
                                    <input type="text" maxlength="1" required>
                                    <input type="text" maxlength="1" required>
                                    <input type="text" maxlength="1" required>
                                </div>
                            </div>
                        </div>
                        <div class="error-message-container">
                            <div class="error-message" id="error-message">default</div>
                        </div>
                        <div class="two-fa-btn">
                            <button id="generate-btn" type="button">코드 (재)전송</button>
                            <button id="verify-btn" type="submit">인증 확인</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async afterRender() {
        const form = document.getElementById("two-fa-form");
        const inputs = document.querySelectorAll(".two-fa-inputs input");

        // 첫 번째 입력칸에 포커스
        inputs[0].focus();

        inputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                if (input.value && index < inputs.length - 1) {
                    inputs[index + 1].disabled = false;
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && index > 0) {
                    if (!input.value) {
                        inputs[index - 1].focus();
                    } else {
                        input.value = '';
                    }
                }
            });
        });

        const generateButton = document.getElementById("generate-btn");
        generateButton.addEventListener("click", (event) => this.handleGenerateButtonClick(event));

        const verifyButton = document.getElementById("verify-btn");
        verifyButton.addEventListener("click", (event) => this.handleSubmit(event));

        // 엔터 키 리스너 등록
        document.addEventListener('keydown', this.handleKeyDown);
    }

    // 엔터 키 처리 함수
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSubmit(event);
        }
    }

    async handleGenerateButtonClick(event) {
        const generateButton = event.target;

        // 버튼을 클릭한 후 비활성화
        generateButton.disabled = true;

        // 전송 요청
        await this.send2FARequest();

        // 일정 시간(예: 30초) 후에 다시 버튼을 활성화
        setTimeout(() => {
            generateButton.disabled = false;
        }, 30000); // 30초 후 다시 활성화
    }

    async send2FARequest() {
        const tempToken = localStorage.getItem('temp_token');

        if (!tempToken) {
            console.error('임시 토큰이 없습니다.');
            return;
        }

        try {
            const response = await fetch(`https://${SERVER_IP}/api/otp/generate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tempToken}`, // 헤더에 temp_token 포함
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('2FA 이메일 전송 실패:', response.status);
            } else {
                console.log('2FA 이메일 전송 성공');
                this.showModal('전송되었습니다. 30초 후 재전송 가능합니다.', '확인');
            }
        } catch (error) {
            console.error('2FA 이메일 요청 중 오류 발생:', error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        // 사용자가 입력한 2FA 코드를 수집
        const code = Array.from(document.querySelectorAll(".two-fa-inputs input"))
            .map(input => input.value)
            .join("");

        const tempToken = localStorage.getItem('temp_token');

        try {
            const response = await fetch(`https://${SERVER_IP}/api/otp/verify/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tempToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'otp': code })
            });

            if (response.ok) {
                const data = await response.json();

                // 최종 토큰을 로컬 스토리지에 저장
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);

                // 임시 토큰 삭제
                localStorage.removeItem('temp_token');

                connectNotificationWebSocket(data.access_token);

                // 대시보드 페이지로 이동
                document.querySelector('.nav-container').style.display = 'block';
                const router = getRouter();
                router.navigate('/');
                loadProfile();

                // 2FA 페이지에서 엔터 키 리스너 제거
                document.removeEventListener('keydown', this.handleKeyDown);
            } else {
                console.error('2FA 인증 실패:', response.status);
                const errorData = await response.json();
                this.handle2FAError(errorData);
            }
        } catch (error) {
            console.error('2FA 요청 중 오류 발생:', error);
        }
    }

    handle2FAError(errorData) {
        // 에러 메시지 div 선택
        const errorDiv = document.querySelector('.error-message');

        // 에러 메시지 보이게
        errorDiv.innerText = '코드가 틀렸습니다. 다시 시도해주세요.';
        // 에러 메시지 보이게 설정
        errorDiv.classList.add('show');

        // 모든 입력 박스에 에러 스타일 추가
        const inputs = document.querySelectorAll('.two-fa-inputs input');
        inputs.forEach(input => {
            input.classList.add('input-error');

            // 입력 시 에러 상태 리셋
            input.addEventListener('input', function () {
                // 에러 메시지 숨기기
                errorDiv.innerText = '';
                errorDiv.classList.remove('show');

                // 모든 입력 박스에서 에러 스타일 제거
                inputs.forEach(input => {
                    input.classList.remove('input-error');
                });
            });
        });
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
