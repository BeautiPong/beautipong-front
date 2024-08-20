import { Router } from './router.js';
import navigateTo from './utility/navigateTo.js';

const router = new Router();
window.addEventListener('popstate', () => router.route());

document.addEventListener('DOMContentLoaded', () => {
  router.route();
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
      router.route();
    }
  });
});
