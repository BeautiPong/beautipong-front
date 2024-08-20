document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("two-fa-form");
    const inputs = document.querySelectorAll(".two-fa-inputs input");

    // 첫 번째 입력칸에 포커스
    inputs[0].focus();

    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            // 입력이 되었을 때 다음 칸 활성화 및 포커스 이동
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].disabled = false; // 다음 칸 활성화
                inputs[index + 1].focus(); // 다음 칸으로 포커스 이동
            }

            // 모든 입력 필드가 다 채워졌을 때 폼 자동 제출
            if (Array.from(inputs).every(input => input.value)) {
                form.submit(); // 폼 제출
            }
        });

        input.addEventListener("keydown", (e) => {
            // 백스페이스 처리: 이전 칸으로 이동
            if (e.key === "Backspace" && index > 0) {
                if (!input.value) {  // 현재 칸이 비어 있으면
                    inputs[index].disabled = true; // 현재 칸 비활성화
                    inputs[index - 1].focus(); // 이전 칸으로 포커스 이동
                } else {
                    input.value = ''; // 현재 칸에 값이 있을 경우 값 삭제
                }
            }
        });
    });
});
