export function renderUserRankInfo(data, nickname) {
    return `
        <div class="user-rank-info" id=${data.nickname === nickname ? "profile-user-rank-info-inAll" : ""}>
			<span>${data.rank ? data.rank : '-'}</span>
			<img src="assets/images/profile.svg" alt="progile_img"/>
			<span class="user-rank-info__nickname">${data.nickname}</span>
			<img src="assets/icons/silver.svg" alt="tier"/>
        </div>
    `;
}
