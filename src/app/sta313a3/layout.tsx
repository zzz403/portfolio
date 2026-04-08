"use client";

import { useEffect } from "react";

export default function STA313A3Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.className;
    html.className = "dark";
    return () => {
      html.className = previous;
    };
  }, []);

  return <div className="dark">{children}</div>;
}
