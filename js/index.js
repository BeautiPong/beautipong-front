import { createRouter } from './router.js';
import createPages from './pages.js'

// 로그인 상태 확인 함수
function checkLoginStatus() {
  const token = localStorage.getItem('access_token');
  const tmpToken = localStorage.getItem('temp_token');

  if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    
    // 처음 로그인해서 임시토큰을 발급받은 상태면 2fa로 넘어갈 수 있도록 
    if (tmpToken && window.location.pathname === '/2fa' || window.location.pathname === "/nickname")
      return ;

    router.navigate('/login');
  }
}

const container = document.querySelector('main');
const navContainer = document.querySelector('.nav-container');

const pages = createPages(container);
const router = createRouter();

router
.addRoute('/', pages.home)
.addRoute('/mypage', pages.mypage)
.addRoute('/friend', pages.friend)
.addRoute('/rank', pages.rank)
.addRoute('/login', pages.login)
.addRoute('/signup', pages.signup)
.addRoute('/nickname', pages.nickname)
.addRoute('/2fa', pages.twoFactor)
.addRoute('/42oauth-redirect', pages.oauth)
.addRoute('/waitgame', pages.waitgame)
.setNotFound(() => {
  container.innerHTML = '<h1>Page Not Found!</h1>';
})
.start();


// 해시가 변경될 때마다 로그인 상태 확인 및 nav 바 표시 여부 결정
window.addEventListener('popstate', () => {
  checkLoginStatus();
  updateNavVisibility();
});

// 페이지 로드 시 초기 상태 설정
checkLoginStatus();
updateNavVisibility();

function updateNavVisibility() {
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/2fa' || currentPath === '/nickname') {
    navContainer.style.display = 'none';
  } else {
    navContainer.style.display = 'block';
  }
}