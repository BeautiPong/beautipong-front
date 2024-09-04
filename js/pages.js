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
import OfflineGamePage from '../pages/offline_game/offline_game.js'

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
		page.afterRender();
        page.bindEvents();

    }

    const offline_game = () => {
        const page = new OfflineGamePage();
        container.innerHTML = page.render();
        page.afterRender();
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
        offline_game
    }
}