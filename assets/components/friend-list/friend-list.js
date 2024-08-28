// friend-list 컴포넌트 함수
export function createFriendList(image, nickname) {
    return `
        <div class="list-container">
            <div class="list-box">
                <img class="profile-image" src=${image} alt="프로필사진">
                <p class="nickname">${nickname}</p>
                <p class="list-online-status"></p>
                <img class="menu-icon" src="../../assets/icons/Menu.svg" alt="메뉴">
            </div>
        </div>
    `;
}