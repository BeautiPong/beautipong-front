import {createModal} from '../../assets/components/modal/modal.js';
import { getRouter } from '../../js/router.js';
import { SERVER_IP } from "../../js/index.js";

// MainPage 클래스를 상속하는 새로운 클래스 정의
export default class SignupPage {
    handleEnterKey = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleFormBtn(event);
        }
    };

    // render 메서드를 정의하여 HTML 콘텐츠를 반환
    render() {
        return `
                <div class="signup">
                <div class="signup-container">
                    <div class="signup-contents">
                        <h1>회원 가입</h1>
                        <form id="signup-form">
                            <label for="nickname" id="form-nickname-label">닉네임을 입력해주세요</label>
                            <input type="text" id="form-nickname-input" placeholder="닉네임" required>

                            <label for="email" id="form-email-label">이메일을 입력해주세요</label>
                            <input type="email" id="form-email-input" placeholder="이메일" required>

                            <label for="username" id="form-username-label">로그인에 사용할 아이디를 입력해주세요</label>
                            <input type="text" id="form-username-input" placeholder="아이디" required>

                            <label for="password" id="form-password-label">비밀번호는 대문자, 소문자, 숫자 및 특수 문자를 포함한 8글자 이상이어야 합니다.</label>
                            <input type="password" id="form-password-input" placeholder="비밀번호" required>

                            <button id="signup-submit-btn" type="submit">완료</button>
                        </form>
                    </div>
                </div>
                </div>
        `;
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

        // 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
        window.onclick = function(event) {
            if (event.target == modalDiv.querySelector('.modal')) {
                modalDiv.remove();
            }
        };
    }

    async handleFormBtn(event) {
        event.preventDefault(); // 기본 폼 제출 이벤트를 막습니다.

        // 폼 데이터를 수집합니다.
        const nickname = document.getElementById('form-nickname-input').value;
        const email = document.getElementById('form-email-input').value;
        const userID = document.getElementById('form-username-input').value;
        const password = document.getElementById('form-password-input').value;

        if (!nickname) {
            this.handleSignupError({ message: "닉네임 필드를 입력해주세요." });
            return;
        }
        if (!email) {
            this.handleSignupError({ message: "이메일 필드를 입력해주세요." });
            return;
        }
        if (!this.isValidEmail(email)) {
            this.handleSignupError({ message: "유효하지 않은 이메일 주소입니다." });
            return;
        }
        if (!userID) {
            this.handleSignupError({ message: "아이디 필드를 입력해주세요." });
            return;
        }
        if (!password) {
            this.handleSignupError({ message: "비밀번호 필드를 입력해주세요." });
            return;
        }

        // 한글 입력 방지
        const koreanPattern = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
        if (koreanPattern.test(nickname)) {
            this.handleSignupError({ message: "닉네임에 한글을 사용할 수 없습니다." });
            return;
        }
        if (koreanPattern.test(userID)) {
            this.handleSignupError({ message: "아이디에 한글을 사용할 수 없습니다." });
            return;
        }


        const formData = {
            userID,
            password,
            email,
            nickname
        };

        try {
            // 백엔드로 POST 요청을 보냅니다.
            const response = await fetch(`https://${SERVER_IP}/api/user/account/join/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // 응답 처리
            if (response.ok) {
                const data = await response.json();
                console.log('회원가입 성공!');

                const router = getRouter();
                router.navigate('/login');
                this.showModal('회원가입이 성공적으로 완료되었습니다!', '확인');

            } else {
                const errorData = await response.json();
                this.handleSignupError(errorData);

            }

        } catch (error) {
            console.error('회원가입 요청 중 오류 발생:', error);
        }
    }

    handleSignupError(errorData) {
        const nickname = document.getElementById('form-nickname-input');
        const email = document.getElementById('form-email-input');
        const userID = document.getElementById('form-username-input');
        const password = document.getElementById('form-password-input');
        const nickname_label = document.getElementById('form-nickname-label');
        const email_label = document.getElementById('form-email-label');
        const userID_label = document.getElementById('form-username-label');
        const password_label = document.getElementById('form-password-label');

        // 모든 필드의 에러 상태를 초기화
        nickname.classList.remove('form-error');
        email.classList.remove('form-error');
        userID.classList.remove('form-error');
        password.classList.remove('form-error');
        nickname_label.classList.remove('form-error-label');
        email_label.classList.remove('form-error-label');
        userID_label.classList.remove('form-error-label');
        password_label.classList.remove('form-error-label');

        // 기본 상태로 돌아가도록 텍스트를 초기화
        nickname_label.innerText = "닉네임을 입력해주세요";
        email_label.innerText = "이메일을 입력해주세요";
        userID_label.innerText = "로그인에 사용할 아이디를 입력해주세요";
        password_label.innerText = "비밀번호는 대문자, 소문자, 숫자 및 특수 문자를 포함한 8글자 이상이어야 합니다.";

        // 에러 메시지에 따른 필드 스타일 변경
        switch (errorData.message) {
            case "이미 존재하는 닉네임입니다.":
            case "닉네임 필드를 입력해주세요.":
            case "닉네임에 한글을 사용할 수 없습니다.":
                nickname_label.innerText = `${errorData.message}`;
                nickname_label.classList.add("form-error-label");
                nickname.classList.add("form-error");
                break;
            case "이미 존재하는 이메일입니다.":
            case "유효하지 않은 이메일 주소입니다.":
            case "이메일 필드를 입력해주세요.":
                email_label.innerText = `${errorData.message}`;
                email_label.classList.add("form-error-label");
                email.classList.add("form-error");
                break;
            case "이미 존재하는 아이디입니다.":
            case "아이디 필드를 입력해주세요.":
            case "아이디에 한글을 사용할 수 없습니다.":
                userID_label.innerText = `${errorData.message}`;
                userID_label.classList.add("form-error-label");
                userID.classList.add("form-error");
                break;
            case "비밀번호는 최소 8글자 이상이어야 합니다.":
            case "비밀번호는 대문자를 하나 이상 포함해야 합니다.":
            case "비밀번호는 소문자를 하나 이상 포함해야 합니다.":
            case "비밀번호는 숫자를 하나 이상 포함해야 합니다.":
            case "비밀번호는 특수 문자를 하나 이상 포함해야 합니다.":
            case "비밀번호 필드를 입력해주세요.":
                password_label.innerText = `${errorData.message}`;
                password_label.classList.add("form-error-label");
                password.classList.add("form-error");
                break;
            default:
                console.error('알 수 없는 오류:', errorData.message);
                alert('회원가입 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
                break;
        }
    }

    // 이메일 양식 검사 메서드
    isValidEmail(email) {
        // 간단한 이메일 양식 검사 정규식
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    addEventListeners() {
        const formButton = document.getElementById('signup-submit-btn');
        formButton.addEventListener('click', this.handleFormBtn.bind(this));

        const signupForm = document.getElementById('signup-form');
        signupForm.addEventListener('submit', this.handleFormBtn.bind(this));

        signupForm.addEventListener('keydown', (event) => this.handleEnterKey(event));
    }
}
