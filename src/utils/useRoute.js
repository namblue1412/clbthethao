import { useState, useEffect } from "react";

/**
 * Hook điều hướng nhẹ hỗ trợ cả HTML5 pathname (/admin) và Hash routing (#/admin hoặc #admin)
 * Tương thích 100% với Netlify, Localhost và mọi hosting tĩnh.
 */
export function useRoute() {
  const getRoute = () => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (
      pathname.startsWith("/admin") ||
      hash.startsWith("#/admin") ||
      hash.startsWith("#admin")
    ) {
      return "/admin";
    }

    return "/";
  };

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRoute());
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigateTo = (path) => {
    if (path === "/admin") {
      window.history.pushState({}, "", "/admin");
      setRoute("/admin");
    } else {
      window.history.pushState({}, "", "/");
      setRoute("/");
    }
  };

  return { route, navigateTo };
}
