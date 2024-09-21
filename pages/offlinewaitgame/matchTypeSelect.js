import { getRouter } from '../../js/router.js'


export default class matchTypeSelect {
	render() {
		return `
        <div class="match-type-selection-div">
			<div id="match-type-selection-container" class="match-type-selection-container">
			<h1>PLAY</h1>
			<div class="mode-buttons">
				<div id="vs1-btn" class="mode-btn">
					<img class="mode-btn-img" src='../assets/images/two.png'/>
					<button>2인</button>
				</div>
				<div id="tournament-btn" class="mode-btn">
					<img class="mode-btn-img" src='../assets/images/four.png'/>
					<button>4인</button>
				</div>
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
