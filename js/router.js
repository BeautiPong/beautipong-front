// router.js
let routerInstance;

export const createRouter = () => {
  if (routerInstance) return routerInstance;
  
  const routes = [];
  let notFound = () => {};

  const router = {};

  const checkRoutes = () => {
    const currentRoute = routes.find(route => route.path === window.location.pathname);

    if (!currentRoute) {
      notFound();
      return;
    }

    currentRoute.component();
  };

  router.addRoute = (path, component) => {
    routes.push({ path, component });
    return router;
  };

  router.setNotFound = cb => {
    notFound = cb || notFound;
    return router;
  };

  router.start = () => {
    window.addEventListener('popstate', checkRoutes);

    if (!window.location.pathname || window.location.pathname === '/') {
      window.history.replaceState({}, '', '/');
    }

    checkRoutes();
  };

  router.navigate = (path) => {
    window.history.pushState({}, '', path);
    checkRoutes();
  };

  routerInstance = router;
  return router;
};

export const getRouter = () => routerInstance;