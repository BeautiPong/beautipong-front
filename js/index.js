import createRouter from './router.js'
import createPages from './pages.js'

const container = document.querySelector('main')

const pages = createPages(container)

const router = createRouter()

router
.addRoute('#/', pages.home)
.addRoute('#/mypage', pages.mypage)
.addRoute('#/friend', pages.friend)
.addRoute('#/rank', pages.rank)
.addRoute('#/login', pages.login)
.addRoute('#/2fa', pages.twoFactor)
.setNotFound(() => {
  container.innerHTML = '<h1>Page Not Found!</h1>';
})
.start();
