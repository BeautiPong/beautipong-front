import createRouter from './router.js'
import createPages from './pages.js'

// 로그인 상태 확인 함수
function checkLoginStatus() {
  const token = localStorage.getItem('access_token');
  const tmpToken = localStorage.getItem('temp_token');

  if (!token && window.location.hash !== '#/login' && window.location.hash !== '#/signup') {

    // 처음 로그인해서 임시토큰을 발급받은 상태면 2fa로 넘어갈 수 있도록 
    if (tmpToken && window.location.hash === '#/2fa')
      retrun ;

    // 토큰이 없고, 현재 해시가 로그인 페이지나 회원가입 페이지가 아니면 로그인 페이지로 리다이렉트
    window.location.hash = '#/login';
  }
}

const container = document.querySelector('main')
const navContainer = document.querySelector('.nav-container');

const pages = createPages(container)
const router = createRouter()

router
.addRoute('#/', pages.home)
.addRoute('#/mypage', pages.mypage)
.addRoute('#/friend', pages.friend)
.addRoute('#/rank', pages.rank)
.addRoute('#/login', pages.login)
.addRoute('#/signup', pages.signup)
.addRoute('#/nickname', pages.nickname)
.addRoute('#/2fa', pages.twoFactor)
.addRoute('#/42oath-redirect', pages.oath)
.setNotFound(() => {
  container.innerHTML = '<h1>Page Not Found!</h1>';
})
.start();

// 해시가 변경될 때마다 로그인 상태 확인 및 nav 바 표시 여부 결정
window.addEventListener('hashchange', () => {
  checkLoginStatus(); // 로그인 상태 확인

  const currentHash = window.location.hash;
  if (currentHash === '#/login' || currentHash === '#/signup' || currentHash === '#/2fa' || currentHash === '#/nickname' ) {
    navContainer.style.display = 'none'; // 로그인 또는 회원가입 페이지에서 nav 바 숨기기
  } else {
    navContainer.style.display = 'block'; // 다른 페이지에서는 nav 바 표시
  }
});

// 페이지 로드 시 처음에 로그인 상태와 nav 바 표시 여부를 설정
checkLoginStatus();
const initialHash = window.location.hash;
if (initialHash === '#/login' || initialHash === '#/signup' || initialHash === '#/2fa' || initialHash === '#/nickname') {
  navContainer.style.display = 'none';
} else {
  navContainer.style.display = 'block';
}
