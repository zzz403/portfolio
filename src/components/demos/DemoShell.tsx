"use client";

import { useRef, useEffect, useCallback } from "react";
import { useInView } from "framer-motion";

interface DemoShellProps {
  title: string;
  children: React.ReactNode;
  onStart?: () => void;
  onReset?: () => void;
  replayToken?: number;
}

export default function DemoShell({
  title,
  children,
  onStart,
  onReset,
  replayToken,
}: DemoShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const hasStarted = useRef(false);
  const lastReplayToken = useRef<number | undefined>(replayToken);

  const trigger = useCallback(() => {
    onReset?.();
    requestAnimationFrame(() => onStart?.());
  }, [onStart, onReset]);

  useEffect(() => {
    if (inView && !hasStarted.current) {
      hasStarted.current = true;
      trigger();
    }
  }, [inView, trigger]);

  useEffect(() => {
    if (!inView) return;
    if (!hasStarted.current) return;
    if (replayToken === undefined) return;
    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    trigger();
  }, [inView, replayToken, trigger]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-lg bg-[#0a0a0a] border border-border"
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">{title}</span>
      </div>
      {/* Demo content area */}
      <div className="relative aspect-[16/10] overflow-hidden">{children}</div>
    </div>
  );
}
