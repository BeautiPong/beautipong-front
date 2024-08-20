import Main from '../pages/main.js'
import Login from '../pages/login.js'
import Mypage from '../pages/mypage.js'
import Rank from '../pages/rank.js'
import Friend from '../pages/friend.js'


export class Router{
    constructor() {
        this.route = [
            { path : '/', main:Main},
            { path : '/login', login:Login},
            { path: '/mypage', mypage:Mypage},
            { path : '/rank', rank:Rank},
            { path : '/friend', friend:Friend},
        ]
    }
    
    async route() {
        let match = this.findMatch();
        if (!match || location.pathname === '/notfound') {
            match = this.handleNotFound();
        }
        await this.handleRouteChange(match);
    }

    findMatch() {
    return this.routes
        .map((route) => ({
        route,
        result: location.pathname.match(pathToRegex(route.path)),
        }))
        .find((potentialMatch) => potentialMatch.result !== null);
    }

    async handleRouteChange(match) {
        switch (match.route.path) {
            case '/login':
                await this.handleLoginRoute();
                break;
            case '/login_code/':
                await this.handleAutorhizationCode();
                break;
            case '/2fa':
                await this.handle2FA(match);
                break;
            case '/logout':
                await this.handleLogoutRoute(match);
                break;
            case '/profile':
                await this.handleProfileRoute(match);
                break;
            case '/play':
                await this.handlePlayRoute(match);
                break;
            case '/':
                await this.handleMainRoute(match);
                break;
            default:
                updateBackground('error');
                await this.render(match);
                break;
        }
    }
}
