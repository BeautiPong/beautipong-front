export default () => {
    const routes = [];
    let notFound = () => {}; // notFound를 기본적으로 빈 함수로 설정
  
    const router = {};
  
    const checkRoutes = () => {
      const currentRoute = routes.find(route => {
        return route.fragment === window.location.hash;
      });
  
      if (!currentRoute) {
        notFound(); // notFound 함수 호출
        return;
      }
  
      currentRoute.component(); // 해당 라우트의 컴포넌트 함수 호출
    };
  
    router.addRoute = (fragment, component) => {
      routes.push({
        fragment,
        component
      });
  
      return router;
    };
  
    router.setNotFound = cb => {
      notFound = cb || notFound; // 전달된 콜백 함수가 없으면 기존 notFound를 유지
      return router;
    };
  
    router.start = () => {
      window.addEventListener('hashchange', checkRoutes);
  
      if (!window.location.hash) {
        window.location.hash = '#/';
      }
  
      checkRoutes();
    };
  
    return router;
};
