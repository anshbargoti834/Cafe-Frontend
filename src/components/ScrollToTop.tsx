import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Disable the browser's default scroll restoration (Fixes the Refresh issue)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // 2. Scroll to top on route change (Fixes the Navigation issue)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;