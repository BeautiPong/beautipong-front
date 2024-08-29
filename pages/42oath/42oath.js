import { createModal } from '../../assets/components/modal/modal.js';

export default class OathRedirectPage {
    render() {
        return `
            <h1>42 oath redirect Page</h1>
        `;
    }

    async handleRedirectCode() {
        // URL에서 'code' 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("코드 테스트");

        if (code) {
            // 'code'가 존재하는 경우, 서버로 POST 요청을 보내어 액세스 토큰을 요청합니다.
            try {
                const response = await fetch('http://localhost:8000/api/user/get-token/', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),  // 'code'를 서버에 전달
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('42 회원가입 성공:', data);
                    window.location.href = '#/login'; // 로그인 페이지로 이동
                    this.showModal('회원가입이 성공적으로 완료되었습니다!', '확인');
                } else {
                    console.error('42 토큰 요청 실패:', response.status);
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

        // 닫기 버튼에 이벤트 리스너 추가
        const closeBtn = modalDiv.querySelector('.close');
        closeBtn.onclick = function() {
            modalDiv.remove();
        };

        // 확인 버튼에 이벤트 리스너 추가
        const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
        confirmBtn.onclick = function() {
            modalDiv.remove();
        };
    }
}
