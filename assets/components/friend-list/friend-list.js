// friend-list 컴포넌트 함수
export function createFriendList(image, nickname, is_active, isBlocked) {
    const blockedClass = isBlocked ? 'blocked' : '';
    const activeClass = is_active ? 'true' : 'false';

    const blockText = isBlocked ? `<p class="block-none">차단해제</p>` : '';
    return `
        <div class="list-container ${blockedClass}">
            <div class="list-box">
                <img class="list-profile-image" src=${image} alt="프로필사진">
                <div class="name-status">
                    <p class="list-nickname">${nickname}</p>
                    <p class="list-online-status ${activeClass}" id="${nickname}" ></p>
                </div>
                ${blockText}
        </div>
    `;
}

{/* <img class="menu-icon" src="../../assets/icons/Menu.svg" alt="메뉴"></img> */}
