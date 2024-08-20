import MainPage from '../pages/main/main.js'
import LoginPage from '../pages/login/login.js'
import MyPage from '../pages/mypage/mypage.js'
import RankPage from '../pages/rank/rank.js'
import FriendPage from '../pages/friend/friend.js'
import TwoFactorPage from '../pages/2fa/2fa.js'

export default container => {
    const home = () => {
        const page = new MainPage();
        container.innerHTML = page.render();
    }

    const login = () => {
        const page = new LoginPage();
        container.innerHTML = page.render();
    }

    const mypage = () => {
        const page = new MyPage();
        container.innerHTML = page.render();
    }

    const rank = () => {
        const page = new RankPage();
        container.innerHTML = page.render();
    }

    const friend = () => {
        const page = new FriendPage();
        container.innerHTML = page.render();
    }

    const twoFactor = () => {
        const page = new TwoFactorPage();
        container.innerHTML = page.render();
    }
  
    return {
        home,
        login,
        mypage,
        rank,
        friend,
		twoFactor,
    }
  }