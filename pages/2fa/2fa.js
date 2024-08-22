export default class TwoFactorPage {
    render() {
        return `
            <div class="two-factor">
                <div class="two-fa-container">
                    <h1>2FA 인증</h1>
                    <form id="two-fa-form">
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
                        <button id="generate-btn" type="button">코드 (재)전송</button>
                        <button id="verify-btn" type="submit">인증 확인</button>
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
            const response = await fetch('http://localhost:8000/api/otp/generate/', {
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
				alert("전송되었습니다. 30초 후 재전송 가능합니다.")
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
            const response = await fetch('http://localhost:8000/api/otp/verify/', {
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

                // 대시보드 페이지로 이동
				document.querySelector('.nav-container').style.display = 'block';
                window.location.hash = '#/';
            } else {
                console.error('2FA 인증 실패:', response.status);
            }
        } catch (error) {
            console.error('2FA 요청 중 오류 발생:', error);
        }
    }
}
