export function renderUserRankInfo(data) {
    return `
        <div class="user-rank-info">
			<span>${data.rank ? data.rank : '-'}</span>
			<img src="assets/images/profile.svg" alt="progile_img"/>
			<span>${data.nickname}</span>
			<img src="assets/icons/bronz.svg" alt="tier"/>
        </div>
    `;
}
