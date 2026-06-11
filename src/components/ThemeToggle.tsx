"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

type Theme = "dark" | "light";

// The <html> class list is the source of truth (set by the inline script in
// layout.tsx before hydration), so model it as an external store.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const c = document.documentElement.classList;
    c.remove("light", "dark");
    c.add(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative flex h-5 w-9 items-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-hover"
    >
      <motion.div
        className="absolute h-3.5 w-3.5 rounded-full bg-accent"
        animate={{ x: theme === "dark" ? 2 : 18 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </button>
  );
}
