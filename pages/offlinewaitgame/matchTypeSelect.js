import { getRouter } from '../../js/router.js'

export default class matchTypeSelect {
	render() {
		return `
        <div class="match-type-selection-div">
			<div id="match-type-selection-container" class="match-type-selection-container">
			<h1>게임 모드 선택</h1>
			<div class="mode-buttons">
				<button id="vs1-btn" class="mode-btn">1 vs 1</button>
				<button id="tournament-btn" class="mode-btn">Tournament</button>
			</div>
			</div>
		</div>
    `;
	}

	afterRender() {
		const router = getRouter();
		const vs1Btn = document.getElementById('vs1-btn');
		const tournamentBtn = document.getElementById('tournament-btn');

		vs1Btn.addEventListener('click', () => {
			console.log('vs1 button clicked');
			router.navigate('/offlinewaitgame?matchType=1vs1');
		});

		tournamentBtn.addEventListener('click', () => {
			router.navigate('/offlinewaitgame?matchType=tournament');
		});
	}
}
