import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return null;
}
