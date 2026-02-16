"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 28 };

const BBOX_COLORS = ["#e06c75", "#61afef", "#98c379", "#d19a66"];

const QUERY = "wireless headphones";

const EXTRACTED = [
  { key: "title", value: "Sony WH-1000XM5" },
  { key: "price", value: "$279.99" },
  { key: "rating", value: "★★★★★ 4.8" },
];

type Phase =
  | "idle"
  | "webpage"
  | "bbox"
  | "thinking"
  | "cursorMove"
  | "click"
  | "typing"
  | "refresh"
  | "extract"
  | "speed"
  | "complete";

export default function OpenBrowserDemo({
  replayToken,
  onComplete,
}: {
  replayToken?: number;
  onComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.6 });
  const started = useRef(false);
  const cancelled = useRef(false);
  const playId = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const lastReplayToken = useRef<number | undefined>(replayToken);

  const [phase, setPhase] = useState<Phase>("idle");
  const [bboxCount, setBboxCount] = useState(0);
  const [thinkText, setThinkText] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 85, y: 80 });
  const [cursorClick, setCursorClick] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [extractCount, setExtractCount] = useState(0);
  const [showSpeed, setShowSpeed] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((r) => {
        const id = playId.current;
        setTimeout(() => r(!cancelled.current && playId.current === id), ms);
      }),
    []
  );

  const resetState = useCallback(() => {
    setPhase("idle");
    setBboxCount(0);
    setThinkText("");
    setCursorPos({ x: 85, y: 80 });
    setCursorVisible(false);
    setCursorClick(false);
    setTyped("");
    setShowResults(false);
    setExtractCount(0);
    setShowSpeed(false);
  }, []);

  const run = useCallback(async () => {
    cancelled.current = false;

    if (!(await wait(200))) return;

    /* ═══ Stage 1: Webpage skeleton appears ═══ */
    setPhase("webpage");
    if (!(await wait(800))) return;

    /* ═══ Stage 2: Bounding boxes appear ═══ */
    setPhase("bbox");
    for (let i = 1; i <= 4; i++) {
      if (cancelled.current) return;
      setBboxCount(i);
      if (!(await wait(280))) return;
    }
    if (!(await wait(600))) return;

    /* ═══ Stage 3: AI thinking ═══ */
    setPhase("thinking");
    const think = 'Click [1] search bar → type "wireless headphones"';
    for (let i = 0; i <= think.length; i++) {
      if (cancelled.current) return;
      setThinkText(think.slice(0, i));
      if (!(await wait(14))) return;
    }
    if (!(await wait(500))) return;

    /* ═══ Stage 4: Cursor moves to search bar [1] ═══ */
    setPhase("cursorMove");
    setCursorVisible(true);
    setCursorPos({ x: 85, y: 80 });
    if (!(await wait(50))) return;
    // Move to search bar area
    setCursorPos({ x: 38, y: 27 });
    if (!(await wait(500))) return;

    /* ═══ Stage 5: Click ═══ */
    setPhase("click");
    setCursorClick(true);
    if (!(await wait(150))) return;
    setCursorClick(false);
    if (!(await wait(200))) return;

    /* ═══ Stage 6: Type in search bar ═══ */
    setPhase("typing");
    setCursorVisible(false);
    for (let i = 0; i <= QUERY.length; i++) {
      if (cancelled.current) return;
      setTyped(QUERY.slice(0, i));
      if (!(await wait(40))) return;
    }
    if (!(await wait(400))) return;

    /* ═══ Stage 7: Page refreshes → results ═══ */
    setPhase("refresh");
    setShowResults(true);
    if (!(await wait(800))) return;

    /* ═══ Stage 8: Extract data ═══ */
    setPhase("extract");
    for (let i = 1; i <= EXTRACTED.length; i++) {
      if (cancelled.current) return;
      setExtractCount(i);
      if (!(await wait(350))) return;
    }
    if (!(await wait(600))) return;

    /* ═══ Stage 9: Speed comparison ═══ */
    setPhase("speed");
    setShowSpeed(true);
    if (!(await wait(3500))) return;

    /* ═══ Complete — hold then loop ═══ */
    setPhase("complete");
    onCompleteRef.current?.();
    if (!(await wait(2500))) return;
  }, [wait]);

  const startPlayback = useCallback(() => {
    playId.current += 1;
    cancelled.current = true;
    requestAnimationFrame(() => {
      resetState();
      requestAnimationFrame(() => {
        cancelled.current = false;
        run();
      });
    });
  }, [resetState, run]);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      started.current = false;
      playId.current += 1;
    };
  }, []);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      startPlayback();
    }
  }, [inView, startPlayback]);

  useEffect(() => {
    if (replayToken === undefined) return;
    if (!inView) return;
    if (!started.current) return;
    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    startPlayback();
  }, [inView, replayToken, startPlayback]);

  const showPage = phase !== "idle";
  const showBbox = ["bbox", "thinking", "cursorMove", "click", "typing"].includes(phase);
  const showThink = ["thinking", "cursorMove", "click", "typing"].includes(phase);
  const showExtract = ["extract", "speed", "complete"].includes(phase);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg bg-[#0a0a0a] border border-border"
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">
          openbrowser
        </span>
      </div>

      {/* Demo area */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <AnimatePresence>
          {showPage && (
            <motion.div
              className="absolute inset-0 p-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* ── Mini browser chrome ── */}
              <div className="h-full rounded-lg border border-border bg-[#0e0e0e] flex flex-col overflow-hidden">
                {/* URL bar */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border shrink-0">
                  <div className="flex gap-1">
                    <span className="text-muted text-[8px]">&#8592;</span>
                    <span className="text-muted text-[8px]">&#8594;</span>
                  </div>
                  <div className="flex-1 rounded bg-[#181818] px-2 py-0.5 text-[8px] font-mono text-muted truncate">
                    https://amazon.com/s?q={typed || "..."}
                  </div>
                </div>

                {/* Page content */}
                <div className="flex-1 relative p-2.5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!showResults ? (
                      /* ── Homepage skeleton ── */
                      <motion.div
                        key="home"
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-2.5"
                      >
                        {/* Search bar */}
                        <div className="relative">
                          <div className="flex items-center rounded border border-[#333] bg-[#141414] px-2 py-1.5">
                            <span className="text-[8px] text-muted mr-1">
                              🔍
                            </span>
                            <span className="text-[9px] font-mono text-foreground/70">
                              {typed || (
                                <span className="text-[#333]">
                                  Search products...
                                </span>
                              )}
                              {phase === "typing" && (
                                <motion.span
                                  className="inline-block w-0.5 h-2.5 bg-accent ml-px align-middle"
                                  animate={{ opacity: [1, 0] }}
                                  transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                  }}
                                />
                              )}
                            </span>
                          </div>
                          {/* Bbox [1] */}
                          <AnimatePresence>
                            {showBbox && bboxCount >= 1 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                className="absolute -inset-0.5 rounded border-2 pointer-events-none"
                                style={{ borderColor: BBOX_COLORS[0] }}
                              >
                                <span
                                  className="absolute -top-2 -left-1 text-[7px] font-mono font-bold rounded px-0.5"
                                  style={{
                                    backgroundColor: BBOX_COLORS[0],
                                    color: "#fff",
                                  }}
                                >
                                  1
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Category bar */}
                        <div className="relative flex gap-1.5">
                          {["Electronics", "Books", "Fashion"].map((c) => (
                            <div
                              key={c}
                              className="rounded bg-[#181818] px-2 py-0.5 text-[7px] text-muted"
                            >
                              {c}
                            </div>
                          ))}
                          <AnimatePresence>
                            {showBbox && bboxCount >= 2 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                className="absolute -inset-0.5 rounded border-2 pointer-events-none"
                                style={{ borderColor: BBOX_COLORS[1] }}
                              >
                                <span
                                  className="absolute -top-2 -left-1 text-[7px] font-mono font-bold rounded px-0.5"
                                  style={{
                                    backgroundColor: BBOX_COLORS[1],
                                    color: "#fff",
                                  }}
                                >
                                  2
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Product cards skeleton */}
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1].map((idx) => (
                            <div
                              key={idx}
                              className="relative rounded border border-[#222] bg-[#141414] p-2"
                            >
                              <div className="w-full h-6 rounded bg-[#1a1a1a] mb-1.5" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1a1a1a] mb-1" />
                              <div className="h-1.5 w-1/2 rounded bg-[#1a1a1a]" />
                              <AnimatePresence>
                                {showBbox && bboxCount >= 3 + idx && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={spring}
                                    className="absolute -inset-0.5 rounded border-2 pointer-events-none"
                                    style={{
                                      borderColor: BBOX_COLORS[2 + idx],
                                    }}
                                  >
                                    <span
                                      className="absolute -top-2 -left-1 text-[7px] font-mono font-bold rounded px-0.5"
                                      style={{
                                        backgroundColor: BBOX_COLORS[2 + idx],
                                        color: "#fff",
                                      }}
                                    >
                                      {3 + idx}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* ── Search results ── */
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring}
                        className="space-y-2"
                      >
                        <div className="text-[8px] text-muted font-mono mb-1.5">
                          Results for &quot;{QUERY}&quot;
                        </div>

                        {/* Result item */}
                        <div className="rounded border border-[#222] bg-[#141414] p-2 flex gap-2">
                          <div className="w-10 h-10 rounded bg-[#1a1a1a] shrink-0 flex items-center justify-center">
                            <span className="text-[10px]">🎧</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-medium text-foreground truncate">
                              Sony WH-1000XM5
                            </div>
                            <div className="text-[8px] text-accent font-mono">
                              $279.99
                            </div>
                            <div className="text-[7px] text-[#d19a66]">
                              ★★★★★ 4.8 (2,847)
                            </div>
                          </div>
                        </div>

                        <div className="rounded border border-[#222] bg-[#141414] p-2 flex gap-2 opacity-40">
                          <div className="w-10 h-10 rounded bg-[#1a1a1a] shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-3/4 rounded bg-[#1a1a1a]" />
                            <div className="h-1.5 w-1/2 rounded bg-[#1a1a1a]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── AI Thinking bar ── */}
              <AnimatePresence>
                {showThink && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={spring}
                    className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-surface/95 border border-border backdrop-blur-sm px-2.5 py-1.5"
                  >
                    <motion.div
                      className="h-3 w-3 rounded-full border border-accent/40 border-t-accent shrink-0"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span className="text-[8px] font-mono text-foreground/70 truncate">
                      {thinkText}
                      <motion.span
                        className="inline-block w-0.5 h-2 bg-accent/60 ml-px align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Extracted data card ── */}
              <AnimatePresence>
                {showExtract && (
                  <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.85 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springSnappy}
                    className="absolute top-3 right-3 rounded-lg bg-surface border border-accent/25 p-2 min-w-[100px]"
                  >
                    <div className="text-[7px] font-mono text-accent mb-1.5">
                      extracted
                    </div>
                    {EXTRACTED.slice(0, extractCount).map((item, i) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...spring, delay: 0 }}
                        className="flex items-baseline gap-1.5 mb-0.5"
                      >
                        <span className="text-[7px] font-mono text-muted">
                          {item.key}:
                        </span>
                        <span className="text-[8px] font-mono text-foreground font-medium">
                          {item.value}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Speed comparison ── */}
              <AnimatePresence>
                {showSpeed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springSnappy}
                    className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-lg bg-[#0e0e0e] border border-border px-3 py-2"
                  >
                    <div className="flex-1">
                      <div className="text-[7px] font-mono text-muted mb-0.5">
                        Run 1 — explore
                      </div>
                      <div className="text-[10px] font-mono text-foreground/50">
                        15 steps · 50k tokens · 3 min
                      </div>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex-1">
                      <div className="text-[7px] font-mono text-accent mb-0.5">
                        Run 2 — asset replay
                      </div>
                      <motion.div
                        className="text-[10px] font-mono text-accent font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        0 LLM calls · 2 sec ⚡
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Animated cursor ── */}
        <AnimatePresence>
          {cursorVisible && (
            <motion.div
              className="absolute z-50 pointer-events-none"
              style={{ left: 0, top: 0 }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: `${cursorPos.x}%`,
                y: `${cursorPos.y}%`,
                scale: cursorClick ? 0.75 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
