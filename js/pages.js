import MainPage from '../pages/main/main.js'
import LoginPage from '../pages/login/login.js'
import MyPage from '../pages/mypage/mypage.js'
import RankPage from '../pages/rank/rank.js'
import FriendPage from '../pages/friend/friend.js'
import SignupPage from '../pages/signup/signup.js'
import NicknamePage from '../pages/nickname/nickname.js'
import TwoFactorPage from '../pages/2fa/2fa.js'
import OathRedirectPage from '../pages/42oath/42oath.js'

export default container => {
    const home = () => {
        const page = new MainPage();
        container.innerHTML = page.render();
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

    const oath = () => {
        const page = new OathRedirectPage();
        container.innerHTML = page.render();
        page.handleRedirectCode();
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
        oath,
    }
  }
