"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Springs ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };

/* ── Chat messages ── */
const MESSAGES: { role: "user" | "gpt"; text: string }[] = [
  {
    role: "user",
    text: "Explain how neural networks learn through backpropagation",
  },
  {
    role: "gpt",
    text: "Neural networks learn by propagating errors backward through the network. During the forward pass, input flows through layers of neurons, each applying weights and activation functions.\n\nThe key insight is the chain rule:\n∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w\n\nWeights update via gradient descent:\nw ← w − α · ∂L/∂w\n\nThis repeats across epochs until the loss converges to a minimum value.",
  },
  {
    role: "user",
    text: "Can you show a concrete example?",
  },
  {
    role: "gpt",
    text: "Sure! Consider a simple 2-layer network with sigmoid activation and MSE loss...",
  },
  {
    role: "user",
    text: "Thanks! What about activation functions?",
  },
];

/* ── Floating ball tools (radial positions from center) ── */
const TOOLS = [
  { icon: "👁", x: 0, y: -52 },
  { icon: "✨", x: -46, y: -18 },
  { icon: "📋", x: 46, y: -18 },
  { icon: "🔤", x: -32, y: 28 },
  { icon: "📸", x: 32, y: 28 },
];

type Phase =
  | "idle"
  | "cluttered"
  | "collapse"
  | "autoHide"
  | "floatingBall"
  | "complete";

export default function ChatGPTBoosterDemo({
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
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [ballVisible, setBallVisible] = useState(false);
  const [ballExpanded, setBallExpanded] = useState(false);

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
    setVisibleMessages(0);
    setIsCollapsed(false);
    setHiddenCount(0);
    setBallVisible(false);
    setBallExpanded(false);
  }, []);

  const run = useCallback(async () => {
    cancelled.current = false;
    if (!(await wait(200))) return;

    setPhase("cluttered");
    for (let i = 0; i < MESSAGES.length; i++) {
      if (cancelled.current) return;
      setVisibleMessages(i + 1);
      if (!(await wait(300))) return;
    }
    if (!(await wait(800))) return;

    setPhase("collapse");
    setIsCollapsed(true);
    if (!(await wait(1200))) return;

    setPhase("autoHide");
    setHiddenCount(3);
    if (!(await wait(1200))) return;

    setPhase("floatingBall");
    setBallVisible(true);
    if (!(await wait(500))) return;
    setBallExpanded(true);
    if (!(await wait(2500))) return;

    setPhase("complete");
    onCompleteRef.current?.();
    if (!(await wait(3000))) return;
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
    if (!inView || !started.current) return;
    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    startPlayback();
  }, [inView, replayToken, startPlayback]);

  const showContent = phase !== "idle";

  const shownMessages = MESSAGES.slice(0, visibleMessages)
    .map((msg, i) => ({ ...msg, idx: i }))
    .filter(({ idx }) => idx >= hiddenCount);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-border"
    >
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* ═══ TITLE BAR ═══ */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-muted font-mono">ChatGPT</span>
            </div>

            {/* ═══ CHAT AREA ═══ */}
            <div className="relative aspect-[16/12] overflow-hidden">
              <div className="absolute inset-0 flex flex-col px-5 py-4 gap-3 overflow-hidden">
                {/* Hidden messages bar */}
                <AnimatePresence>
                  {hiddenCount > 0 && (
                    <motion.div
                      key="hidden-bar"
                      className="flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] shrink-0"
                      style={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={spring}
                    >
                      <span>▲</span>
                      <span>
                        {hiddenCount} messages hidden · scroll up to load
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                <AnimatePresence mode="popLayout">
                  {shownMessages.map(({ idx, role, text }) => {
                    const isGpt = role === "gpt";
                    const isLongMsg = idx === 1;
                    const shouldCollapse = isLongMsg && isCollapsed;

                    return (
                      <motion.div
                        key={`msg-${idx}`}
                        className={`flex gap-2.5 shrink-0 max-w-[88%] ${isGpt ? "self-start" : "self-end"
                          }`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: isGpt ? -30 : 30,
                          transition: { duration: 0.3 },
                        }}
                        transition={spring}
                      >
                        {/* GPT avatar (left side) */}
                        {isGpt && (
                          <div
                            className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: "#10a37f",
                              color: "#fff",
                            }}
                          >
                            G
                          </div>
                        )}

                        <div
                          className={`flex-1 min-w-0 ${!isGpt ? "text-right" : ""
                            }`}
                        >
                          <span
                            className="text-[10px] font-semibold block mb-0.5"
                            style={{
                              color: isGpt ? "#10a37f" : "#7c3aed",
                            }}
                          >
                            {isGpt ? "ChatGPT" : "You"}
                          </span>

                          {/* Message bubble */}
                          <div
                            className={`rounded-2xl px-3.5 py-2 inline-block text-left ${!isGpt ? "ml-auto" : ""
                              }`}
                            style={{
                              backgroundColor: isGpt
                                ? "var(--surface)"
                                : "#7c3aed18",
                              border: `1px solid ${isGpt
                                ? "var(--border)"
                                : "#7c3aed30"
                                }`,
                            }}
                          >
                            <motion.div
                              className="overflow-hidden relative"
                              animate={{
                                maxHeight: shouldCollapse ? 16 : 300,
                              }}
                              transition={{
                                duration: 0.6,
                                ease: "easeInOut",
                              }}
                            >
                              <p
                                className="text-xs leading-relaxed whitespace-pre-line"
                                style={{
                                  color: "var(--foreground)",
                                }}
                              >
                                {text}
                              </p>
                              <AnimatePresence>
                                {shouldCollapse && (
                                  <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-5"
                                    style={{
                                      background:
                                        "linear-gradient(to top, var(--surface), transparent)",
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  />
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>

                          {/* Collapse indicator */}
                          <AnimatePresence>
                            {shouldCollapse && (
                              <motion.div
                                className="flex items-center gap-1 mt-1 text-[10px]"
                                style={{ color: "var(--accent)" }}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...spring, delay: 0.3 }}
                              >
                                <span>▸</span>
                                <span>
                                  Click to expand · 8 lines collapsed
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* User avatar (right side) */}
                        {!isGpt && (
                          <div
                            className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: "#7c3aed",
                              color: "#fff",
                            }}
                          >
                            Y
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* ═══ FLOATING BALL (radial expansion) ═══ */}
              <AnimatePresence>
                {ballVisible && (
                  <motion.div
                    className="absolute"
                    style={{ bottom: 95, right: 75 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Origin point for radial layout */}
                    <div className="relative" style={{ width: 0, height: 0 }}>
                      {/* Tool icons — expand from center */}
                      <AnimatePresence>
                        {ballExpanded &&
                          TOOLS.map((tool, i) => (
                            <motion.div
                              key={`tool-${i}`}
                              className="absolute w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg"
                              style={{
                                marginLeft: -20,
                                marginTop: -20,
                                backgroundColor: "var(--surface)",
                                border: "1.5px solid var(--border)",
                              }}
                              initial={{
                                x: 0,
                                y: 0,
                                opacity: 0,
                                scale: 0,
                              }}
                              animate={{
                                x: tool.x,
                                y: tool.y,
                                opacity: 1,
                                scale: 1,
                              }}
                              transition={{
                                ...spring,
                                delay: i * 0.05,
                              }}
                            >
                              {tool.icon}
                            </motion.div>
                          ))}
                      </AnimatePresence>

                      {/* Center ball */}
                      <motion.div
                        className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                        style={{
                          marginLeft: -24,
                          marginTop: -24,
                          backgroundColor: ballExpanded
                            ? "#10a37f"
                            : "var(--accent)",
                          color: ballExpanded
                            ? "#fff"
                            : "var(--background)",
                          border: ballExpanded
                            ? "2px solid #10a37f50"
                            : "none",
                          transition:
                            "background-color 0.4s ease, border 0.4s ease",
                        }}
                        initial={{ scale: 0 }}
                        animate={{
                          scale: 1,
                          rotate: ballExpanded ? 0 : 0,
                        }}
                        transition={spring}
                      >
                        {ballExpanded ? "×" : "+"}
                      </motion.div>

                      {/* Subtle ring around ball when expanded */}
                      <AnimatePresence>
                        {ballExpanded && (
                          <motion.div
                            className="absolute rounded-full"
                            style={{
                              width: 56,
                              height: 56,
                              marginLeft: -28,
                              marginTop: -28,
                              border: "1.5px solid #10a37f30",
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
