"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoShell from "./DemoShell";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const LINES = [
  "# The Art of Simplicity",
  "",
  "Good tools disappear. They don't ask",
  "for attention — they give it back.",
  "",
  "When everything is stripped away,",
  "only the words remain.",
];

const CHAR_DELAY = 35;

type Phase = "idle" | "focus" | "writing" | "saving" | "saved" | "done";

export default function EditorDemo({
  replayToken,
  onComplete,
}: {
  replayToken?: number;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [wordCount, setWordCount] = useState(0);
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

    // Phase: focus mode activating
    setPhase("focus");
    if (!(await wait(800))) return;

    // Phase: writing lines one character at a time
    setPhase("writing");
    const builtLines: string[] = [];
    let wc = 0;

    for (let lineIdx = 0; lineIdx < LINES.length; lineIdx++) {
      if (cancelled.current) return;
      setCurrentLine(lineIdx);
      const line = LINES[lineIdx];

      if (line === "") {
        builtLines.push("");
        setLines([...builtLines]);
        setCurrentChar(0);
        if (!(await wait(300))) return;
        continue;
      }

      builtLines.push("");
      for (let charIdx = 0; charIdx <= line.length; charIdx++) {
        if (cancelled.current) return;
        builtLines[lineIdx] = line.slice(0, charIdx);
        setLines([...builtLines]);
        setCurrentChar(charIdx);

        // Count words
        const text = builtLines.join(" ");
        wc = text.split(/\s+/).filter(Boolean).length;
        setWordCount(wc);

        if (!(await wait(CHAR_DELAY))) return;
      }

      // Pause between lines
      if (!(await wait(200))) return;
    }

    if (!(await wait(600))) return;

    // Phase: auto-save
    setPhase("saving");
    if (!(await wait(1000))) return;

    setPhase("saved");
    if (!(await wait(3000))) return;

    setPhase("done");
    onComplete?.();
    if (!(await wait(2000))) return;
  }, [onComplete, wait]);

  const reset = useCallback(() => {
    cancelled.current = true;
    setPhase("idle");
    setLines([]);
    setCurrentLine(0);
    setCurrentChar(0);
    setWordCount(0);
  }, []);

  const isWriting = phase === "writing";
  const showSave = phase === "saving" || phase === "saved" || phase === "done";

  return (
    <DemoShell title="untitled.md" onStart={run} onReset={reset} replayToken={replayToken}>
      <div className="flex flex-col h-full">
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-[10px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <span>Markdown</span>
            <span className="text-border">|</span>
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {phase === "saving" && (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted"
                >
                  Saving...
                </motion.span>
              )}
              {showSave && phase !== "saving" && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-accent"
                >
                  &#10003; Saved locally
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {phase === "focus" && (
                <motion.span
                  key="focus"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="text-accent"
                >
                  Focus mode
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 relative p-4">
          {/* Focus mode overlay */}
          <AnimatePresence>
            {phase === "focus" && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={spring}
                >
                  <div className="text-lg font-light text-foreground/60 tracking-wide">
                    Focus
                  </div>
                  <div className="mt-1 text-[10px] text-muted font-mono">
                    distractions off
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text content */}
          <div className="space-y-0.5">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-6 text-right mr-3 text-[11px] text-[#2a2a2a] font-mono select-none shrink-0">
                  {i + 1}
                </span>
                <span
                  className={`text-xs leading-relaxed ${
                    i === 0
                      ? "text-foreground font-semibold text-sm"
                      : "text-foreground/80"
                  }`}
                >
                  {line}
                  {/* Cursor on active line */}
                  {isWriting && i === currentLine && (
                    <motion.span
                      className="inline-block w-0.5 h-3.5 bg-accent align-middle ml-px"
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
