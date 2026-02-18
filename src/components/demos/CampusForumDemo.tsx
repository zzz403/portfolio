"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Springs ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };

/* ── Classic Swing posts ── */
const POSTS = [
  { subject: "Welcome to the Forum", author: "admin", replies: 12 },
  { subject: "CSC207 Study Group", author: "jchen", replies: 5 },
  { subject: "Campus Events This Week", author: "events_mgr", replies: 8 },
];

/* ── Voice waveform config ── */
const WAVE_BARS = 16;
const WAVE_HEIGHTS = Array.from(
  { length: WAVE_BARS },
  (_, i) => 5 + ((i * 7 + 3) % 11)
);

type Phase = "idle" | "classic" | "transform" | "modern" | "complete";

export default function CampusForumDemo({
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
  const [isModern, setIsModern] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);
  const [waveActive, setWaveActive] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

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
    setIsModern(false);
    setVisibleItems(0);
    setWaveActive(false);
    setShowTranscription(false);
    setShowTranslation(false);
  }, []);

  /* ── Animation sequence ── */
  const run = useCallback(async () => {
    cancelled.current = false;
    if (!(await wait(200))) return;

    /* ═══ Classic Swing UI ═══ */
    setPhase("classic");
    if (!(await wait(1800))) return;

    /* ═══ Morph to modern ═══ */
    setPhase("transform");
    setIsModern(true);
    if (!(await wait(1200))) return;

    /* ═══ Modern chat activity ═══ */
    setPhase("modern");

    // 1. Text message
    setVisibleItems(1);
    if (!(await wait(600))) return;

    // 2. Location card
    setVisibleItems(2);
    if (!(await wait(700))) return;

    // 3. Voice message → play → transcription
    setVisibleItems(3);
    if (!(await wait(300))) return;
    setWaveActive(true);
    if (!(await wait(1500))) return;
    setWaveActive(false);
    if (!(await wait(300))) return;
    setShowTranscription(true);
    if (!(await wait(800))) return;

    // 4. Chinese message → translation
    setVisibleItems(4);
    if (!(await wait(600))) return;
    setShowTranslation(true);
    if (!(await wait(1500))) return;

    /* ═══ Done ═══ */
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
            <div
              className="flex items-center px-4 py-2.5 border-b"
              style={{
                backgroundColor: isModern ? "var(--background)" : "#0054E3",
                borderColor: isModern ? "var(--border)" : "#003CBB",
                transition:
                  "background-color 0.8s ease, border-color 0.8s ease",
              }}
            >
              <AnimatePresence>
                {isModern && (
                  <motion.div
                    className="flex items-center gap-1.5 mr-3"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <span
                className="text-xs font-mono truncate flex-1"
                style={{
                  color: isModern ? "var(--muted)" : "#ffffff",
                  transition: "color 0.8s ease",
                }}
              >
                {isModern ? "Campus Forum" : "Academia Imperial"}
              </span>

              <AnimatePresence>
                {!isModern && (
                  <motion.div
                    className="flex items-center gap-px"
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {["−", "□", "×"].map((btn) => (
                      <div
                        key={btn}
                        className="w-5 h-4 flex items-center justify-center text-[10px] font-bold leading-none"
                        style={{
                          backgroundColor: "#c0c0c0",
                          borderWidth: 1.5,
                          borderStyle: "solid",
                          borderColor: "#ffffff #808080 #808080 #ffffff",
                          color: "#000",
                        }}
                      >
                        {btn}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ MENU BAR (classic only) ═══ */}
            <AnimatePresence>
              {!isModern && (
                <motion.div
                  className="flex items-center gap-4 px-4 py-1.5 text-[11px] overflow-hidden"
                  style={{
                    backgroundColor: "#c0c0c0",
                    borderBottom: "1px solid #808080",
                    color: "#000",
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {["File", "Edit", "View", "Help"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ BODY ═══ */}
            <div
              className="relative aspect-[16/12] overflow-hidden flex"
              style={{
                backgroundColor: isModern ? "var(--background)" : "#c0c0c0",
                transition: "background-color 0.8s ease",
              }}
            >
              {/* ── Sidebar ── */}
              <div
                className="flex flex-col border-r overflow-hidden shrink-0"
                style={{
                  width: isModern ? 48 : 100,
                  backgroundColor: isModern
                    ? "var(--surface)"
                    : "#c0c0c0",
                  borderColor: isModern ? "var(--border)" : "#808080",
                  transition:
                    "width 0.8s ease, background-color 0.8s ease, border-color 0.8s ease",
                }}
              >
                <AnimatePresence>
                  {!isModern && (
                    <motion.div
                      key="classic-sb"
                      className="p-2.5"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="text-[10px] font-bold mb-2 pb-1"
                        style={{
                          color: "#000",
                          borderBottom: "1px solid #808080",
                        }}
                      >
                        Forums
                      </div>
                      {["General", "Announce", "Help"].map((item, i) => (
                        <div
                          key={item}
                          className="text-[10px] py-0.5 px-1"
                          style={{
                            color: i === 0 ? "#fff" : "#000",
                            backgroundColor:
                              i === 0 ? "#000080" : "transparent",
                          }}
                        >
                          {i === 0 ? "▾" : "▸"} {item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isModern && (
                    <motion.div
                      key="modern-sb"
                      className="flex flex-col items-center gap-2.5 pt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      {["💬", "📢", "❓", "⚙️"].map((icon, i) => (
                        <motion.div
                          key={icon}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i === 0 ? "bg-accent/15" : ""}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            ...spring,
                            delay: 0.5 + i * 0.06,
                          }}
                        >
                          {icon}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Main Content ── */}
              <div className="flex-1 relative overflow-hidden">
                {/* Classic: Post Table */}
                <AnimatePresence>
                  {!isModern && (
                    <motion.div
                      key="classic-content"
                      className="absolute inset-0 p-3"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div
                        className="flex text-[10px] font-bold pb-1.5 mb-1.5"
                        style={{
                          color: "#000",
                          borderBottom: "2px solid #808080",
                        }}
                      >
                        <span className="flex-1">Subject</span>
                        <span className="w-20 text-center">Author</span>
                        <span className="w-14 text-center">Replies</span>
                      </div>
                      {POSTS.map((post, i) => (
                        <motion.div
                          key={i}
                          className="flex text-[10px] py-1.5 px-1.5"
                          style={{
                            color: "#000",
                            backgroundColor:
                              i % 2 === 0 ? "#d4d0c8" : "#c0c0c0",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "#808080 #ffffff #ffffff #808080",
                          }}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.12 }}
                        >
                          <span className="flex-1 truncate font-medium">
                            {post.subject}
                          </span>
                          <span className="w-20 text-center">
                            {post.author}
                          </span>
                          <span className="w-14 text-center">
                            {post.replies}
                          </span>
                        </motion.div>
                      ))}
                      <div
                        className="absolute bottom-0 left-0 right-0 flex items-center px-3 py-1 text-[9px]"
                        style={{
                          backgroundColor: "#c0c0c0",
                          borderTop: "1px solid #808080",
                          color: "#000",
                        }}
                      >
                        <span>3 topics · 25 replies</span>
                        <span className="ml-auto">Connected</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modern: Chat */}
                <AnimatePresence>
                  {isModern && (
                    <motion.div
                      key="modern-content"
                      className="absolute inset-0 flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      {/* Channel header */}
                      <div
                        className="px-4 py-2.5 border-b flex items-center gap-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          Developers Group
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--muted)" }}
                        >
                          3 online
                        </span>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 px-4 py-3 flex flex-col gap-3 overflow-hidden">
                        {/* ── 1. Alice text ── */}
                        {visibleItems >= 1 && (
                          <motion.div
                            className="flex flex-col self-start items-start max-w-[85%]"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={spring}
                          >
                            <span
                              className="text-[10px] font-semibold mb-1"
                              style={{ color: "#c678dd" }}
                            >
                              Alice
                            </span>
                            <div
                              className="rounded-2xl px-4 py-2"
                              style={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <span
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--foreground)" }}
                              >
                                Let&apos;s meet up tomorrow to discuss the
                                details.
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {/* ── 2. Location card ── */}
                        {visibleItems >= 2 && (
                          <motion.div
                            className="flex flex-col self-end items-end max-w-[70%]"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={spring}
                          >
                            <div
                              className="rounded-xl overflow-hidden"
                              style={{
                                border: "1px solid var(--border)",
                              }}
                            >
                              {/* Map area */}
                              <div
                                className="relative"
                                style={{
                                  width: 200,
                                  height: 90,
                                  backgroundColor: "#1a1a2e",
                                }}
                              >
                                <svg
                                  className="absolute inset-0 w-full h-full opacity-20"
                                  viewBox="0 0 200 90"
                                  preserveAspectRatio="none"
                                >
                                  <line x1="0" y1="28" x2="200" y2="28" stroke="#4a5568" strokeWidth="1.5" />
                                  <line x1="0" y1="62" x2="200" y2="62" stroke="#4a5568" strokeWidth="1.5" />
                                  <line x1="55" y1="0" x2="55" y2="90" stroke="#4a5568" strokeWidth="1.5" />
                                  <line x1="120" y1="0" x2="120" y2="90" stroke="#4a5568" strokeWidth="1.5" />
                                  <line x1="160" y1="0" x2="160" y2="90" stroke="#4a5568" strokeWidth="1" />
                                </svg>
                                <motion.div
                                  className="absolute flex flex-col items-center"
                                  style={{ left: "55%", top: "28%" }}
                                  initial={{ y: -12, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ ...spring, delay: 0.2 }}
                                >
                                  <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{
                                      backgroundColor: "#e53e3e",
                                      boxShadow: "0 0 8px #e53e3eaa",
                                    }}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                  <div
                                    className="w-0.5 h-2 -mt-0.5"
                                    style={{ backgroundColor: "#e53e3e" }}
                                  />
                                </motion.div>
                              </div>
                              <div
                                className="px-3 py-2"
                                style={{ backgroundColor: "var(--surface)" }}
                              >
                                <span
                                  className="text-xs font-semibold block"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  You Shared a Location
                                </span>
                                <span
                                  className="text-[10px] block mt-0.5"
                                  style={{ color: "var(--muted)" }}
                                >
                                  Columbia Lake Firepit, Waterloo, ON
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ── 3. Voice message + transcription ── */}
                        {visibleItems >= 3 && (
                          <motion.div
                            className="flex flex-col self-start items-start max-w-[80%]"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={spring}
                          >
                            <span
                              className="text-[10px] font-semibold mb-1"
                              style={{ color: "#56b6c2" }}
                            >
                              Bob
                            </span>
                            {/* Voice bar */}
                            <div
                              className="rounded-2xl px-3 py-2 flex items-center gap-2.5"
                              style={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: "#56b6c2" }}
                              >
                                <span className="text-[9px] text-white ml-0.5">
                                  ▶
                                </span>
                              </div>

                              <div className="flex items-center gap-px">
                                {[0, 1, 2].map((d) => (
                                  <motion.div
                                    key={`dot-${d}`}
                                    className="w-1 h-1 rounded-full mx-0.5"
                                    style={{
                                      backgroundColor: waveActive
                                        ? "#56b6c2"
                                        : "var(--muted)",
                                    }}
                                    animate={
                                      waveActive
                                        ? { opacity: [0.4, 1, 0.4] }
                                        : { opacity: 0.5 }
                                    }
                                    transition={
                                      waveActive
                                        ? {
                                            duration: 0.5,
                                            repeat: Infinity,
                                            delay: d * 0.15,
                                          }
                                        : {}
                                    }
                                  />
                                ))}
                                {WAVE_HEIGHTS.map((h, i) => (
                                  <motion.div
                                    key={`bar-${i}`}
                                    className="w-[2.5px] rounded-full mx-[0.5px]"
                                    style={{
                                      backgroundColor: waveActive
                                        ? "#56b6c2"
                                        : "var(--muted)",
                                    }}
                                    animate={
                                      waveActive
                                        ? {
                                            height: [h * 0.4, h, h * 0.4],
                                            opacity: [0.5, 1, 0.5],
                                          }
                                        : {
                                            height: h * 0.6,
                                            opacity: 0.4,
                                          }
                                    }
                                    transition={
                                      waveActive
                                        ? {
                                            duration:
                                              0.3 +
                                              ((i * 3 + 1) % 5) * 0.06,
                                            repeat: Infinity,
                                            repeatType: "reverse" as const,
                                            delay: i * 0.04,
                                          }
                                        : { duration: 0.3 }
                                    }
                                  />
                                ))}
                              </div>

                              <span
                                className="text-[10px] font-mono shrink-0 ml-1"
                                style={{ color: "var(--muted)" }}
                              >
                                0:03
                              </span>
                            </div>

                            {/* Voice-to-text transcription */}
                            <AnimatePresence>
                              {showTranscription && (
                                <motion.div
                                  className="mt-1 rounded-lg px-3 py-1"
                                  style={{
                                    backgroundColor: "#56b6c210",
                                    border: "1px solid #56b6c220",
                                  }}
                                  initial={{
                                    opacity: 0,
                                    y: 4,
                                    scale: 0.9,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  transition={spring}
                                >
                                  <span
                                    className="text-[10px]"
                                    style={{ color: "#56b6c2" }}
                                  >
                                    🎙 &ldquo;Sounds good, see you
                                    there!&rdquo;
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}

                        {/* ── 4. Chinese message + translation ── */}
                        {visibleItems >= 4 && (
                          <motion.div
                            className="flex flex-col self-start items-start max-w-[80%]"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={spring}
                          >
                            <span
                              className="text-[10px] font-semibold mb-1"
                              style={{ color: "#e5c07b" }}
                            >
                              Charlie
                            </span>
                            <div
                              className="rounded-2xl px-4 py-2"
                              style={{
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <span
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--foreground)" }}
                              >
                                这个活动在哪里？
                              </span>
                            </div>

                            {/* Translation */}
                            <AnimatePresence>
                              {showTranslation && (
                                <motion.div
                                  className="mt-1 rounded-lg px-3 py-1"
                                  style={{
                                    backgroundColor: "#e5c07b10",
                                    border: "1px solid #e5c07b20",
                                  }}
                                  initial={{
                                    opacity: 0,
                                    y: 4,
                                    scale: 0.9,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  transition={spring}
                                >
                                  <span
                                    className="text-[10px]"
                                    style={{ color: "#e5c07b" }}
                                  >
                                    🌐 &ldquo;Where is this event?&rdquo;
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </div>

                      {/* Input bar */}
                      <div className="px-4 pb-3">
                        <div
                          className="rounded-full px-4 py-2 flex items-center gap-2"
                          style={{
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <span
                            className="text-xs flex-1"
                            style={{ color: "var(--muted)" }}
                          >
                            Type a message...
                          </span>
                          <span className="text-xs">😊</span>
                          <span className="text-xs">🎙</span>
                          <span className="text-xs">📎</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
