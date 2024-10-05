export function renderUserRankInfo(data, nickname) {

    let Imgsrc;

    if (data.score > 2000) {
        Imgsrc = `assets/icons/dia.svg`;
    } else if (data.score > 1500) {
        Imgsrc = `assets/icons/platinum.svg`;
    } else if (data.score > 1200) {
        Imgsrc = `assets/icons/gold.svg`;
    } else if (data.score > 1000) {
        Imgsrc = `assets/icons/silver.svg`;
    } else {
        Imgsrc = `assets/icons/bronz.svg`;
    }

    return `
        <div class="user-rank-info" id=${data.nickname === nickname ? "profile-user-rank-info-inAll" : ""}>
			<span>${data.rank ? data.rank : '-'}</span>
			<img src="assets/images/profile.svg" alt="progile_img"/>
			<span class="user-rank-info__nickname">${data.nickname}</span>
			<img src=${Imgsrc} alt="tier"/>
        </div>
    `;
}
