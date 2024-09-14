// userSearchModal 컴포넌트 함수
export function createUserSearchModal() {
    return `
        <div class="modal">
            <div class="modal-box">
                <span class="close">&times;</span>
                <div class="user-search-box">
                    <input type="text" id="friend-name-search-input" placeholder="친구를 검색해보세요!">
                </div>
                <div class="user-find-box"></div>
            </div>
        </div>
    `;
}