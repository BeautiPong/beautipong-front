// friend-list 컴포넌트 함수
export function createFriendList(image, nickname, isBlocked) {
    const blockedClass = isBlocked ? 'blocked' : '';
    return `
        <div class="list-container ${blockedClass}">
            <div class="list-box">
                <img class="list-profile-image" src=${image} alt="프로필사진">
                <div class="name-status">
                    <p class="list-nickname">${nickname}</p>
                    <p class="list-online-status"></p>
                </div>
                <p class="block-none">차단해제</p>
            </div>
        </div>
    `;
}

{/* <img class="menu-icon" src="../../assets/icons/Menu.svg" alt="메뉴"></img> */}