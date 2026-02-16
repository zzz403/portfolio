"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoShell from "./DemoShell";

const spring = { type: "spring" as const, stiffness: 200, damping: 25 };

// Procedural shapes to draw
const SHAPES = [
  { type: "circle", x: 20, y: 25, size: 80, color: "#e0ff00", delay: 0 },
  { type: "circle", x: 55, y: 15, size: 50, color: "#61afef", delay: 0.3 },
  { type: "circle", x: 75, y: 55, size: 65, color: "#c678dd", delay: 0.6 },
  { type: "circle", x: 35, y: 60, size: 45, color: "#98c379", delay: 0.9 },
  { type: "circle", x: 15, y: 75, size: 55, color: "#e06c75", delay: 1.2 },
  { type: "circle", x: 60, y: 80, size: 35, color: "#d19a66", delay: 1.5 },
];

const LINES = [
  { x1: 20, y1: 25, x2: 55, y2: 15, delay: 1.8 },
  { x1: 55, y1: 15, x2: 75, y2: 55, delay: 2.0 },
  { x1: 75, y1: 55, x2: 35, y2: 60, delay: 2.2 },
  { x1: 35, y1: 60, x2: 15, y2: 75, delay: 2.4 },
  { x1: 15, y1: 75, x2: 60, y2: 80, delay: 2.6 },
  { x1: 60, y1: 80, x2: 20, y2: 25, delay: 2.8 },
];

type Phase = "idle" | "generating" | "shapes" | "lines" | "export" | "done";

export default function CanvasDemo({
  replayToken,
  onComplete,
}: {
  replayToken?: number;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [seed, setSeed] = useState("a7f3c2");
  const cancelled = useRef(false);

  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(!cancelled.current), ms);
      }),
    []
  );

  const run = useCallback(async () => {
    cancelled.current = false;

    // Phase: generating with progress bar
    setPhase("generating");
    setSeed(Math.random().toString(16).slice(2, 8));
    for (let i = 0; i <= 100; i += 2) {
      if (cancelled.current) return;
      setProgress(i);
      if (!(await wait(25))) return;
    }
    if (!(await wait(300))) return;

    // Phase: shapes appear
    setPhase("shapes");
    if (!(await wait(2000))) return;

    // Phase: connecting lines
    setPhase("lines");
    if (!(await wait(3200))) return;

    // Phase: export badge
    setPhase("export");
    if (!(await wait(2500))) return;

    setPhase("done");
    onComplete?.();
    if (!(await wait(3000))) return;
  }, [onComplete, wait]);

  const reset = useCallback(() => {
    cancelled.current = true;
    setPhase("idle");
    setProgress(0);
  }, []);

  const showShapes = phase === "shapes" || phase === "lines" || phase === "export" || phase === "done";
  const showLines = phase === "lines" || phase === "export" || phase === "done";
  const showExport = phase === "export" || phase === "done";

  return (
    <DemoShell title={`generative — seed:${seed}`} onStart={run} onReset={reset} replayToken={replayToken}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border text-[10px] font-mono text-muted">
          <span className="text-foreground/70">voronoi</span>
          <span className="text-border">|</span>
          <span>cells: 128</span>
          <span className="text-border">|</span>
          <span>
            seed: <span className="text-accent">{seed}</span>
          </span>
          <div className="ml-auto flex gap-1.5">
            <span className="px-1.5 py-0.5 rounded border border-border text-muted hover:text-foreground cursor-default">
              SVG
            </span>
            <span className="px-1.5 py-0.5 rounded border border-border text-muted hover:text-foreground cursor-default">
              PNG
            </span>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative bg-[#080808]">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={100} stroke="#151515" strokeWidth={0.3} />
                <line x1={0} y1={v} x2={100} y2={v} stroke="#151515" strokeWidth={0.3} />
              </g>
            ))}
          </svg>

          {/* Generating progress */}
          <AnimatePresence>
            {phase === "generating" && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                <motion.div
                  className="h-6 w-6 rounded-full border-2 border-accent/30 border-t-accent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="w-32 h-1 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted">
                  Generating... {progress}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shapes */}
          {showShapes && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {/* Lines between shapes */}
              {showLines &&
                LINES.map((line, i) => (
                  <motion.line
                    key={`l-${i}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#333"
                    strokeWidth={0.3}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: (line.delay - 1.8) * 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                ))}

              {/* Circles */}
              {SHAPES.map((shape, i) => (
                <motion.circle
                  key={i}
                  cx={shape.x}
                  cy={shape.y}
                  fill="none"
                  stroke={shape.color}
                  strokeWidth={0.6}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{
                    r: shape.size / 6,
                    opacity: [0, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: shape.delay * 0.4,
                    ...spring,
                    opacity: { type: "tween", duration: 0.6, ease: "easeOut" },
                  }}
                />
              ))}

              {/* Center dots */}
              {SHAPES.map((shape, i) => (
                <motion.circle
                  key={`d-${i}`}
                  cx={shape.x}
                  cy={shape.y}
                  r={1}
                  fill={shape.color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: shape.delay * 0.4 + 0.2,
                  }}
                />
              ))}
            </svg>
          )}

          {/* Export success badge */}
          <AnimatePresence>
            {showExport && (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={spring}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-accent/15 border border-accent/30 px-2 py-1"
              >
                <span className="text-accent text-[10px]">&#10003;</span>
                <span className="text-[10px] font-mono text-accent">
                  Exported SVG
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoShell>
  );
}
