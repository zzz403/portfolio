"use client";

import Link from "next/link";

const navItems = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "#", disabled: true },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground transition-colors hover:text-accent"
        >
          august
        </Link>
        <ul className="flex items-center gap-6">
          {navItems.map((item) =>
            item.disabled ? (
              <li key={item.label}>
                <span className="font-mono text-sm text-muted cursor-not-allowed">
                  {item.label}
                </span>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-mono text-sm text-foreground transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  );
}
