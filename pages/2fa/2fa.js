// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("two-fa-form");
//     const inputs = document.querySelectorAll(".two-fa-inputs input");

//     // 첫 번째 입력칸에 포커스
//     inputs[0].focus();

//     inputs.forEach((input, index) => {
//         input.addEventListener("input", () => {
//             // 입력이 되었을 때 다음 칸 활성화 및 포커스 이동
//             if (input.value && index < inputs.length - 1) {
//                 inputs[index + 1].disabled = false; // 다음 칸 활성화
//                 inputs[index + 1].focus(); // 다음 칸으로 포커스 이동
//             }

//             // 모든 입력 필드가 다 채워졌을 때 폼 자동 제출
//             if (Array.from(inputs).every(input => input.value)) {
//                 form.submit(); // 폼 제출
//             }
//         });

//         input.addEventListener("keydown", (e) => {
//             // 백스페이스 처리: 이전 칸으로 이동
//             if (e.key === "Backspace" && index > 0) {
//                 if (!input.value) {  // 현재 칸이 비어 있으면
//                     inputs[index].disabled = true; // 현재 칸 비활성화
//                     inputs[index - 1].focus(); // 이전 칸으로 포커스 이동
//                 } else {
//                     input.value = ''; // 현재 칸에 값이 있을 경우 값 삭제
//                 }
//             }
//         });
//     });
// });


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
                        <button type="submit">인증 확인</button>
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

                if (Array.from(inputs).every(input => input.value)) {
                    form.submit(); 
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && index > 0) {
                    if (!input.value) {
                        inputs[index].disabled = true;
                        inputs[index - 1].focus();
                    } else {
                        input.value = '';
                    }
                }
            });
        });
        await this.send2FARequest();
        // 폼 제출 이벤트 처리
        form.addEventListener("submit", (event) => this.handleSubmit(event));
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
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                const data = await response.json();

                // 최종 토큰을 로컬 스토리지에 저장
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

                // 임시 토큰 삭제
                localStorage.removeItem('temp_token');

                // 대시보드 페이지로 이동
                window.location.hash = '#/';
            } else {
                console.error('2FA 인증 실패:', response.status);
            }
        } catch (error) {
            console.error('2FA 요청 중 오류 발생:', error);
        }
    }
}
