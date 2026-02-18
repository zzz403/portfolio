"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Spring configs ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 30 };

/* ── App icons for intro scatter ── */
const APP_ICONS = [
  "📱", "💬", "📧", "📞", "🗓", "📷", "🎵", "🗺",
  "🛒", "💳", "📰", "🎥", "☁️", "🔔", "⚙️", "📋",
  "🏥", "💊", "🚕", "🍽", "📺", "🎮", "💡", "🔍",
];

// Pre-generate stable random positions (seeded by index)
const APP_POSITIONS = APP_ICONS.map((_, i) => ({
  x: ((i * 37 + 13) % 90) + 5,   // 5-95%
  y: ((i * 53 + 7) % 80) + 10,    // 10-90%
}));

const INTRO_TEXT = "Seniors are lonely.\nThe internet wasn\u2019t built for them.";

/* ── Voice interaction rounds ── */
const ROUNDS = [
  {
    voice: "Send a message to Margaret",
    icon: "💬",
    title: "Opening Messages",
    subtitle: "→ Margaret",
    color: "#c678dd",
  },
  {
    voice: "Find a fishing club nearby",
    icon: "🎣",
    title: "Found: Lakeview Fishing Club",
    subtitle: "3 members · 0.5 km away",
    color: "#e5c07b",
  },
  {
    voice: "Read my new messages",
    icon: "📨",
    title: "2 new messages",
    subtitle: "Playing audio...",
    color: "#56b6c2",
  },
];

/* ── Waveform bar count ── */
const WAVE_BARS = 7;

type Phase = "idle" | "intro" | "introText" | "converge" | "listening" | "result" | "complete";

export default function KokoDemo({
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
  const [showApps, setShowApps] = useState(false);
  const [showIntroText, setShowIntroText] = useState(false);
  const [converging, setConverging] = useState(false);
  const [showKokoLogo, setShowKokoLogo] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [roundIndex, setRoundIndex] = useState(-1);
  const [voiceText, setVoiceText] = useState("");
  const [waveActive, setWaveActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultDone, setResultDone] = useState(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

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
    setShowApps(false);
    setShowIntroText(false);
    setConverging(false);
    setShowKokoLogo(false);
    setPhoneVisible(false);
    setRoundIndex(-1);
    setVoiceText("");
    setWaveActive(false);
    setShowResult(false);
    setResultDone(false);
  }, []);

  /* ── Animation sequence ── */
  const run = useCallback(async () => {
    cancelled.current = false;
    if (!(await wait(200))) return;

    /* ═══ Intro: Scattered app icons ═══ */
    setPhase("intro");
    setShowApps(true);
    if (!(await wait(1200))) return;

    /* ═══ Intro text fades in ═══ */
    setPhase("introText");
    setShowIntroText(true);
    if (!(await wait(2000))) return;

    /* ═══ All icons converge to center ═══ */
    setPhase("converge");
    setShowIntroText(false);
    if (!(await wait(300))) return;
    setConverging(true);
    if (!(await wait(800))) return;

    /* ═══ Icons disappear, KOKO logo appears ═══ */
    setShowApps(false);
    setShowKokoLogo(true);
    if (!(await wait(1000))) return;

    /* ═══ Logo fades, phone appears ═══ */
    setShowKokoLogo(false);
    if (!(await wait(300))) return;
    setPhoneVisible(true);
    if (!(await wait(500))) return;

    for (let r = 0; r < ROUNDS.length; r++) {
      if (cancelled.current) return;
      const round = ROUNDS[r];

      // Reset for this round
      setRoundIndex(r);
      setVoiceText("");
      setShowResult(false);
      setResultDone(false);

      // Start listening — waveform active
      setPhase("listening");
      setWaveActive(true);
      if (!(await wait(300))) return;

      // Type voice text
      for (let i = 0; i <= round.voice.length; i++) {
        if (cancelled.current) return;
        setVoiceText(round.voice.slice(0, i));
        if (!(await wait(35))) return;
      }
      if (!(await wait(300))) return;

      // Stop waveform
      setWaveActive(false);
      if (!(await wait(400))) return;

      // Show result
      setPhase("result");
      setShowResult(true);
      if (!(await wait(200))) return;
      setResultDone(true);
      if (!(await wait(1200))) return;
    }

    /* ═══ Complete ═══ */
    setPhase("complete");
    onCompleteRef.current?.();
    if (!(await wait(3500))) return;
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
    return () => { cancelled.current = true; started.current = false; playId.current += 1; };
  }, []);

  useEffect(() => {
    if (inView && !started.current) { started.current = true; startPlayback(); }
  }, [inView, startPlayback]);

  useEffect(() => {
    if (replayToken === undefined) return;
    if (!inView || !started.current) return;
    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    startPlayback();
  }, [inView, replayToken, startPlayback]);

  const currentRound = roundIndex >= 0 ? ROUNDS[roundIndex] : null;

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg bg-background border border-border">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">KOKO</span>
      </div>

      {/* Demo area */}
      <div className="relative aspect-[16/10] overflow-hidden flex items-center justify-center">

        {/* ═══ INTRO: Scattered app icons ═══ */}
        <AnimatePresence>
          {showApps && (
            <motion.div
              className="absolute inset-0 z-10"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {APP_ICONS.map((icon, i) => (
                <motion.div
                  key={i}
                  className="absolute flex items-center justify-center w-8 h-8 rounded-xl bg-surface border border-border shadow-sm"
                  style={{ left: `${APP_POSITIONS[i].x}%`, top: `${APP_POSITIONS[i].y}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    converging
                      ? { left: "48%", top: "45%", opacity: 0, scale: 0.3 }
                      : { opacity: 1, scale: 1 }
                  }
                  transition={
                    converging
                      ? { ...springSnappy, delay: i * 0.02 }
                      : { ...spring, delay: i * 0.04 }
                  }
                >
                  <span className="text-sm">{icon}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ INTRO: Center text ═══ */}
        <AnimatePresence>
          {showIntroText && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm font-semibold text-foreground text-center leading-relaxed whitespace-pre-line px-8"
                style={{ textShadow: "0 0 20px var(--background), 0 0 40px var(--background)" }}
              >
                {INTRO_TEXT}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ INTRO: KOKO logo after converge ═══ */}
        <AnimatePresence>
          {showKokoLogo && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
            >
              <span className="text-3xl font-bold text-foreground tracking-tight">KOKO</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ PHONE ═══ */}
        <AnimatePresence>
          {phoneVisible && (
            <motion.div
              className="relative flex flex-col overflow-hidden rounded-[20px] border-2 border-border bg-surface shadow-2xl"
              style={{ width: "42%", height: "92%" }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring}
            >
              {/* Phone status bar */}
              <div className="flex items-center justify-between px-5 pt-2.5 pb-1">
                <span className="text-[10px] font-mono text-muted">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 rounded-sm border border-muted/40" />
                </div>
              </div>

              {/* App header */}
              <div className="px-5 pb-2.5 border-b border-border/40">
                <span className="text-base font-bold text-foreground">KOKO</span>
              </div>

              {/* Content area */}
              <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 gap-4">
                <AnimatePresence mode="wait">
                  {currentRound && (
                    <motion.div
                      key={`round-${roundIndex}`}
                      className="w-full flex flex-col items-center gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Voice waveform */}
                      <div className="flex items-center gap-1 h-8">
                        {Array.from({ length: WAVE_BARS }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 rounded-full"
                            style={{ backgroundColor: waveActive ? currentRound.color : "var(--border)" }}
                            animate={
                              waveActive
                                ? {
                                    height: [8, 18 + Math.random() * 12, 8],
                                    opacity: [0.5, 1, 0.5],
                                  }
                                : { height: 5, opacity: 0.3 }
                            }
                            transition={
                              waveActive
                                ? {
                                    duration: 0.4 + Math.random() * 0.3,
                                    repeat: Infinity,
                                    repeatType: "reverse" as const,
                                    delay: i * 0.07,
                                  }
                                : { duration: 0.3 }
                            }
                          />
                        ))}
                      </div>

                      {/* Voice text bubble */}
                      {voiceText && (
                        <motion.div
                          className="rounded-2xl px-5 py-3 max-w-full"
                          style={{
                            backgroundColor: `${currentRound.color}15`,
                            border: `1.5px solid ${currentRound.color}40`,
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={springSnappy}
                        >
                          <p className="text-base font-semibold text-foreground text-center leading-snug">
                            &ldquo;{voiceText}&rdquo;
                            {waveActive && (
                              <motion.span
                                className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full"
                                style={{ backgroundColor: currentRound.color }}
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
                              />
                            )}
                          </p>
                        </motion.div>
                      )}

                      {/* AI result card */}
                      <AnimatePresence>
                        {showResult && (
                          <motion.div
                            className="w-full rounded-xl px-4 py-3 flex items-center gap-3"
                            style={{
                              backgroundColor: `${currentRound.color}12`,
                              border: `1.5px solid ${currentRound.color}30`,
                            }}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={spring}
                          >
                            <span className="text-lg shrink-0">{currentRound.icon}</span>
                            <div className="min-w-0 flex-1">
                              <span
                                className="text-sm font-bold block leading-tight"
                                style={{ color: currentRound.color }}
                              >
                                {currentRound.title}
                              </span>
                              <span className="text-[11px] text-muted block leading-tight mt-0.5">
                                {currentRound.subtitle}
                              </span>
                            </div>
                            <AnimatePresence>
                              {resultDone && (
                                <motion.span
                                  className="text-sm font-bold shrink-0"
                                  style={{ color: currentRound.color }}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={spring}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Idle state — mic button */}
                {!currentRound && (
                  <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
                      <span className="text-xl">🎙</span>
                    </div>
                    <span className="text-xs text-muted">Tap or speak</span>
                  </motion.div>
                )}
              </div>

              {/* Bottom mic bar */}
              <div className="px-5 pb-3 pt-1.5 border-t border-border/30">
                <motion.div
                  className="w-full py-2.5 rounded-full flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: waveActive
                      ? (currentRound?.color ?? "var(--accent)") + "20"
                      : "var(--background)",
                    border: `1.5px solid ${waveActive ? (currentRound?.color ?? "var(--accent)") + "50" : "var(--border)"}`,
                  }}
                  animate={waveActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                  transition={waveActive ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                >
                  <span className="text-sm">🎙</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: waveActive ? currentRound?.color : "var(--muted)" }}
                  >
                    {waveActive ? "Listening..." : "Hold to speak"}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
