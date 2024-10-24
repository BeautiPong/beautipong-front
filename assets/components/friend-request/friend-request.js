// friend-request 컴포넌트 함수
export function createFriendRequest(image, nickname, is_online) {
    const onlineClass = is_online ? 'true' : 'false';
    return `
        <div class="request-container">
            <div class="request-box">
                <img class="profile-image" src=${image} alt="프로필사진">
                <p class="nickname">${nickname}</p>
                <p class="online-status ${onlineClass}"></p>
                <div class="friend-accept-refuse-btn">
                    <button class="request-accept-btn">
                        <p class="accept-text">수락</p>
                    </button>
                    <button class="request-refuse-btn">
                        <p class="refuse-text">거절</p>
                    </button>
                </div>
            </div>
        </div>
    `;
}
