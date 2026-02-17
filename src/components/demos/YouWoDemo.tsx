"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Constants ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 30 };

const SOURCES = [
  { icon: "📄", label: "Lecture Notes.pdf", color: "#e06c75" },
  { icon: "🎙", label: "Meeting Recording", color: "#61afef" },
  { icon: "▶", label: "CS101 Tutorial", color: "#e5534b" },
];

const QUESTION = "How does binary search relate to the lecture?";

const AI_PARTS: Array<{ text: string } | { cite: number }> = [
  { text: "Binary search was covered in " },
  { text: "Chapter 4 of the lecture notes" },
  { cite: 0 },
  { text: ", where it's compared to linear scan. The " },
  { text: "meeting recording at 5:30" },
  { cite: 1 },
  { text: " discusses real-world performance. The " },
  { text: "tutorial demonstrates" },
  { cite: 2 },
  { text: " the O(log n) divide step visually." },
];

const CITATIONS = [
  { label: "P.12", color: "#e06c75" },
  { label: "5:30", color: "#61afef" },
  { label: "15:30", color: "#e5534b" },
];

type Phase =
  | "idle"
  | "sources"
  | "collapse"
  | "chatbar"
  | "typing"
  | "cursorToSend"
  | "clickSend"
  | "sent"
  | "streaming"
  | "complete";

export default function YouWoDemo({
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

  // Sources
  const [visibleSources, setVisibleSources] = useState(0);

  // Chat bar
  const [chatBarVisible, setChatBarVisible] = useState(false);
  const [chatBarSnap, setChatBarSnap] = useState(0);
  const [typed, setTyped] = useState("");

  // Cursor
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorClick, setCursorClick] = useState(false);

  // Messages
  const [showUserMsg, setShowUserMsg] = useState(false);
  const [streamIdx, setStreamIdx] = useState(0);
  const [streamPartialText, setStreamPartialText] = useState("");
  const [shownCitations, setShownCitations] = useState<number[]>([]);

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
    setVisibleSources(0);
    setChatBarVisible(false);
    setChatBarSnap(0);
    setTyped("");
    setCursorVisible(false);
    setCursorPos({ x: 0, y: 0 });
    setCursorClick(false);
    setShowUserMsg(false);
    setStreamIdx(0);
    setStreamPartialText("");
    setShownCitations([]);
  }, []);

  /* ── Animation sequence ── */
  const run = useCallback(async () => {
    cancelled.current = false;

    if (!(await wait(200))) return;

    /* ═══ Stage 1: Sources fly in + bob ═══ */
    setPhase("sources");
    for (let i = 1; i <= SOURCES.length; i++) {
      if (cancelled.current) return;
      setVisibleSources(i);
      if (!(await wait(350))) return;
    }
    if (!(await wait(1400))) return;

    /* ═══ Stage 2: Sources collapse ═══ */
    setPhase("collapse");
    if (!(await wait(500))) return;
    setVisibleSources(0);
    if (!(await wait(200))) return;

    /* ═══ Stage 3: Oversized chat bar appears ═══ */
    setPhase("chatbar");
    setChatBarVisible(true);
    if (!(await wait(400))) return;

    /* ═══ Stage 4: Typing with snap shifts ═══ */
    setPhase("typing");
    const total = QUESTION.length;
    const snap1 = Math.floor(total * 0.35);
    const snap2 = Math.floor(total * 0.7);

    for (let i = 0; i <= total; i++) {
      if (cancelled.current) return;
      setTyped(QUESTION.slice(0, i));
      if (i === snap1) setChatBarSnap(1);
      if (i === snap2) setChatBarSnap(2);
      if (!(await wait(32))) return;
    }
    if (!(await wait(350))) return;

    /* ═══ Stage 5: Cursor to send button ═══ */
    setPhase("cursorToSend");
    setCursorVisible(true);
    // Start from bottom right
    setCursorPos({ x: 95, y: 85 });
    if (!(await wait(60))) return;
    // Move to send button (right side of bar, accounting for snap shift)
    setCursorPos({ x: 78, y: 50 });
    if (!(await wait(400))) return;

    /* ═══ Stage 6: Click send ═══ */
    setPhase("clickSend");
    setCursorClick(true);
    if (!(await wait(150))) return;
    setCursorClick(false);
    if (!(await wait(100))) return;

    /* ═══ Stage 7: Send — bar disappears, message appears ═══ */
    setPhase("sent");
    setCursorVisible(false);
    setChatBarVisible(false);
    setChatBarSnap(0);
    setShowUserMsg(true);
    if (!(await wait(400))) return;

    /* ═══ Stage 8: Stream AI response ═══ */
    setPhase("streaming");
    let fullText = "";

    for (let pIdx = 0; pIdx < AI_PARTS.length; pIdx++) {
      if (cancelled.current) return;
      const part = AI_PARTS[pIdx];

      if ("cite" in part) {
        setShownCitations((prev) => [...prev, part.cite]);
        setStreamIdx(pIdx + 1);
        setStreamPartialText("");
        if (!(await wait(100))) return;
      } else {
        for (let c = 0; c < part.text.length; c++) {
          if (cancelled.current) return;
          fullText += part.text[c];
          setStreamPartialText(fullText);
          setStreamIdx(pIdx);
          if (!(await wait(8))) return;
        }
        setStreamIdx(pIdx + 1);
      }
    }

    /* ═══ Stage 9: Complete — hold then loop ═══ */
    setPhase("complete");
    onCompleteRef.current?.();
    if (!(await wait(4000))) return;
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

  // Unmount-only cleanup
  useEffect(() => {
    return () => {
      cancelled.current = true;
      started.current = false;
      playId.current += 1;
    };
  }, []);

  // Start animation when in view
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

  /* ── Render helpers ── */
  const barShift = -chatBarSnap * 60; // px shift per snap

  const renderStream = () => {
    const nodes: React.ReactNode[] = [];
    let textConsumed = 0;

    for (let i = 0; i < AI_PARTS.length; i++) {
      const part = AI_PARTS[i];

      if (i < streamIdx) {
        // Fully revealed
        if ("cite" in part) {
          const c = CITATIONS[part.cite];
          if (shownCitations.includes(part.cite)) {
            nodes.push(
              <motion.span
                key={`c-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
                className="inline-flex items-center mx-0.5 rounded-full px-1.5 py-px text-[8px] font-mono font-semibold align-middle whitespace-nowrap"
                style={{
                  backgroundColor: `${c.color}20`,
                  color: c.color,
                  border: `1px solid ${c.color}35`,
                }}
              >
                {c.label}
              </motion.span>
            );
          }
        } else {
          nodes.push(<span key={`t-${i}`}>{part.text}</span>);
          textConsumed += part.text.length;
        }
      } else if (i === streamIdx && "text" in part) {
        // Partially streaming
        const shown = streamPartialText.slice(textConsumed);
        nodes.push(<span key={`t-${i}`}>{shown}</span>);
      }
    }
    return nodes;
  };

  const showSources = phase === "sources";
  const showCollapse = phase === "collapse";
  const isStreaming = phase === "streaming";
  const showResponse = isStreaming || phase === "complete";

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg bg-background border border-border">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">youwo.ai</span>
      </div>

      {/* Demo area */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* ═══ SOURCES — fly in + bob ═══ */}
        <AnimatePresence>
          {(showSources || showCollapse) && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="flex gap-3"
                animate={
                  showCollapse
                    ? { scale: 0, y: 30, opacity: 0 }
                    : { scale: 1, y: 0, opacity: 1 }
                }
                transition={{ ...spring, opacity: { duration: 0.15 } }}
              >
                {SOURCES.map((src, i) => (
                  <motion.div
                    key={src.label}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-surface"
                    style={{ width: 100 }}
                    initial={{ opacity: 0, y: -24, scale: 0.6 }}
                    animate={
                      i < visibleSources
                        ? {
                            opacity: 1,
                            y: showCollapse ? 0 : [0, -5, 0],
                            scale: showCollapse ? 1 : [1, 1.02, 1],
                          }
                        : { opacity: 0, y: -24, scale: 0.6 }
                    }
                    transition={{
                      ...spring,
                      y: showCollapse
                        ? spring
                        : {
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: i * 0.15,
                            ease: "easeInOut",
                          },
                      scale: showCollapse
                        ? spring
                        : {
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: i * 0.15,
                            ease: "easeInOut",
                          },
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${src.color}18` }}
                    >
                      {src.icon}
                    </div>
                    <span className="text-[9px] text-foreground/70 text-center leading-tight truncate w-full">
                      {src.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ OVERSIZED CHAT BAR ═══ */}
        <AnimatePresence>
          {chatBarVisible && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, x: barShift }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                x: springSnappy,
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-surface shadow-2xl"
                style={{ width: "calc(100% + 100px)" }}
              >
                {/* Model dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {["#10a37f", "#d97706", "#4285f4", "#888"].map((c, i) => (
                    <motion.div
                      key={c}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: c,
                        opacity: i === 0 ? 1 : 0.35,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, ...spring }}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-border shrink-0" />

                {/* Input */}
                <div className="flex-1 min-w-0 whitespace-nowrap overflow-hidden">
                  <span className="text-sm font-medium text-foreground">
                    {typed}
                  </span>
                  {(phase === "typing" || phase === "chatbar") && (
                    <motion.span
                      className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                </div>

                {/* Send button */}
                <motion.div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor:
                      typed.length > 0 ? "var(--accent)" : "var(--border)",
                    boxShadow:
                      typed.length > 0
                        ? "0 4px 16px rgba(0,0,0,0.25)"
                        : "none",
                  }}
                  animate={
                    cursorClick && phase === "clickSend"
                      ? { scale: 0.8 }
                      : { scale: 1 }
                  }
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: typed.length > 0 ? "var(--background)" : "var(--muted)",
                    }}
                  >
                    &#8593;
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ ANIMATED CURSOR ═══ */}
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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
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

        {/* ═══ MESSAGES AREA ═══ */}
        <AnimatePresence>
          {showUserMsg && (
            <motion.div
              className="absolute inset-0 flex flex-col justify-center px-4 py-3 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {/* User message */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="flex justify-end mb-2.5"
              >
                <div className="px-3 py-1.5 rounded-2xl rounded-br-md max-w-[85%] bg-accent/15">
                  <p className="text-[10px] font-mono font-medium text-accent">
                    {QUESTION}
                  </p>
                </div>
              </motion.div>

              {/* AI response */}
              <AnimatePresence>
                {showResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className="flex gap-2"
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-accent/15 mt-0.5">
                      <span className="text-accent text-[8px]">AI</span>
                    </div>
                    {/* Bubble */}
                    <div className="flex-1 px-3 py-2 rounded-2xl rounded-bl-md border border-border bg-surface min-w-0">
                      <p className="text-[10px] text-foreground/90 leading-relaxed break-words">
                        {renderStream()}
                        {isStreaming && (
                          <motion.span
                            className="inline-block w-0.5 h-2.5 bg-accent ml-0.5 align-middle"
                            animate={{ opacity: [1, 0] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          />
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
