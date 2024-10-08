import MainPage from '../pages/main/main.js'
import LoginPage from '../pages/login/login.js'
import MyPage from '../pages/mypage/mypage.js'
import RankPage from '../pages/rank/rank.js'
import FriendPage from '../pages/friend/friend.js'
import SignupPage from '../pages/signup/signup.js'
import NicknamePage from '../pages/nickname/nickname.js'
import TwoFactorPage from '../pages/2fa/2fa.js'
import OauthRedirectPage from '../pages/42oauth/42oauth.js'
import WaitGamePage from '../pages/waitgame/waitgame.js'
import OfflineWaitGame from '../pages/offlinewaitgame/offlinewaitgame.js'
import OfflineGamePage from '../pages/offline_game/offline_game.js'
import MatchTypeSelectPage from '../pages/offlinewaitgame/matchTypeSelect.js'
import OnlineGamePage from '../pages/onlinegame/onlinegame.js'

export default container => {
    const home = () => {
        const page = new MainPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const login = () => {
        const page = new LoginPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const mypage = () => {
        const page = new MyPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const rank = () => {
        const page = new RankPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const friend = () => {
        const page = new FriendPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const signup = () => {
        const page = new SignupPage();
        container.innerHTML = page.render();
        page.addEventListeners();
    }

    const nickname = () => {
        const page = new NicknamePage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const twoFactor = () => {
        const page = new TwoFactorPage();
        container.innerHTML = page.render();
		page.afterRender();
    }

    const oauth = () => {
        const page = new OauthRedirectPage();
        container.innerHTML = page.render();
        page.handleRedirectCode();
    }

    const waitgame = () => {
        const page = new WaitGamePage();
        container.innerHTML = page.render();
		// page.afterRender();
        page.bindEvents();

    }


    const offlineWaitGame = () => {
        const offlineWaitGame = new OfflineWaitGame();
        container.innerHTML = offlineWaitGame.render();  // HTML 구조를 렌더링
        offlineWaitGame.addPlayers();  // 플레이어 정보 추가
    }

    const matchTypeSelect = () => {
        const page = new MatchTypeSelectPage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const offline_game = () => {
        const page = new OfflineGamePage();
        container.innerHTML = page.render();
        page.afterRender();
    }

    const onlineGame = () => {
      const { roomName, jwtToken } = window.history.state || {};

      const page = new OnlineGamePage();

      if (roomName && jwtToken) {
        container.innerHTML = page.render();
        page.afterRender(roomName, jwtToken);
      } else {
        console.error('roomName 또는 jwtToken이 없습니다:', { roomName, jwtToken });
      }
    }



    return {
        home,
        login,
        mypage,
        rank,
        friend,
        signup,
        nickname,
	    twoFactor,
        oauth,
        waitgame,
        offlineWaitGame,
        offline_game,
    	onlineGame,
        matchTypeSelect
    }
}
