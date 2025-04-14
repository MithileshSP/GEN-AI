
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageReloader() {
  const pathname = usePathname();

  useEffect(() => {
    // When a page is loaded:
    // 1. Check if we should reload based on navigation history
    const lastPath = sessionStorage.getItem('lastPath');
    const currentPath = window.location.pathname;

    if (lastPath && lastPath !== currentPath) {
      // We've navigated from a different page - reload
      window.location.reload();
    }

    // Save the current path for next navigation check
    sessionStorage.setItem('lastPath', currentPath);
  }, [pathname]);

  return null; // This component doesn't render anything
}