"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Spring configs ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 30 };

/* ── Data ── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm"];
const ROWS = HOURS.length;

type Slot = { day: number; start: number; len: number };
type Course = { code: string; color: string; slots: Slot[] };

/* Preference chips that fly in */
const PREF_CHIPS = [
  { label: "Late Start", icon: "\u{1f319}", color: "#c678dd" },
  { label: "Short Gaps", icon: "\u{26a1}", color: "#e5c07b" },
  { label: "Fri Off", icon: "\u{1f3d6}\u{fe0f}", color: "#56b6c2" },
];

/* ── Layouts ──
   4 courses across Mon–Fri. Each transition should be visually obvious.

   Grid: 0=8am 1=9am 2=10am 3=11am 4=12pm 5=1pm 6=2pm

   DEFAULT  (early, gappy, Fri course):
     Mon: CSC108 8-10, STA130 12-1        (2hr gap)
     Tue: MAT137 8-10, ECO101 12-1        (2hr gap)
     Wed: CSC108 8-10, STA130 12-1        (2hr gap)
     Thu: MAT137 8-10, ECO101 12-1        (2hr gap)
     Fri: ECO101 9-10

   LATE  (10am+, gaps remain):
     Mon: CSC108 10-12, STA130 2-3        (2hr gap)
     Tue: MAT137 10-12, ECO101 2-3        (2hr gap)
     Wed: CSC108 10-12, STA130 2-3        (2hr gap)
     Thu: MAT137 10-12, ECO101 2-3        (2hr gap)
     Fri: ECO101 11-12

   COMPACT  (gaps closed):
     Mon: CSC108 10-12, STA130 12-1       (no gap!)
     Tue: MAT137 10-12, ECO101 12-1       (no gap!)
     Wed: CSC108 10-12, STA130 12-1       (no gap!)
     Thu: MAT137 10-12, ECO101 12-1       (no gap!)
     Fri: ECO101 10-11

   FINAL  (Fri off, redistributed):
     Mon: CSC108 10-12, STA130 12-1, ECO101 1-2
     Tue: MAT137 10-12, ECO101 12-1
     Wed: CSC108 10-12, STA130 12-1
     Thu: MAT137 10-12, ECO101 12-1
     Fri: (empty)
*/

const LAYOUT_DEFAULT: Course[] = [
  { code: "CSC108", color: "#61afef", slots: [{ day: 0, start: 0, len: 2 }, { day: 2, start: 0, len: 2 }] },
  { code: "MAT137", color: "#98c379", slots: [{ day: 1, start: 0, len: 2 }, { day: 3, start: 0, len: 2 }] },
  { code: "STA130", color: "#d19a66", slots: [{ day: 0, start: 4, len: 1 }, { day: 2, start: 4, len: 1 }] },
  { code: "ECO101", color: "#c678dd", slots: [{ day: 1, start: 4, len: 1 }, { day: 3, start: 4, len: 1 }, { day: 4, start: 1, len: 1 }] },
];

const LAYOUT_LATE: Course[] = [
  { code: "CSC108", color: "#61afef", slots: [{ day: 0, start: 2, len: 2 }, { day: 2, start: 2, len: 2 }] },
  { code: "MAT137", color: "#98c379", slots: [{ day: 1, start: 2, len: 2 }, { day: 3, start: 2, len: 2 }] },
  { code: "STA130", color: "#d19a66", slots: [{ day: 0, start: 6, len: 1 }, { day: 2, start: 6, len: 1 }] },
  { code: "ECO101", color: "#c678dd", slots: [{ day: 1, start: 6, len: 1 }, { day: 3, start: 6, len: 1 }, { day: 4, start: 3, len: 1 }] },
];

const LAYOUT_COMPACT: Course[] = [
  { code: "CSC108", color: "#61afef", slots: [{ day: 0, start: 2, len: 2 }, { day: 2, start: 2, len: 2 }] },
  { code: "MAT137", color: "#98c379", slots: [{ day: 1, start: 2, len: 2 }, { day: 3, start: 2, len: 2 }] },
  { code: "STA130", color: "#d19a66", slots: [{ day: 0, start: 4, len: 1 }, { day: 2, start: 4, len: 1 }] },
  { code: "ECO101", color: "#c678dd", slots: [{ day: 1, start: 4, len: 1 }, { day: 3, start: 4, len: 1 }, { day: 4, start: 2, len: 1 }] },
];

const LAYOUT_FINAL: Course[] = [
  { code: "CSC108", color: "#61afef", slots: [{ day: 0, start: 2, len: 2 }, { day: 2, start: 2, len: 2 }] },
  { code: "MAT137", color: "#98c379", slots: [{ day: 1, start: 2, len: 2 }, { day: 3, start: 2, len: 2 }] },
  { code: "STA130", color: "#d19a66", slots: [{ day: 0, start: 4, len: 1 }, { day: 2, start: 4, len: 1 }] },
  { code: "ECO101", color: "#c678dd", slots: [{ day: 1, start: 4, len: 1 }, { day: 3, start: 4, len: 1 }, { day: 0, start: 5, len: 1 }] },
];

const LAYOUTS = [LAYOUT_DEFAULT, LAYOUT_LATE, LAYOUT_COMPACT, LAYOUT_FINAL];

const STATS = ["No gaps", "10am start", "Fri free"];

type Phase =
  | "idle"
  | "grid"
  | "pref0"
  | "pref1"
  | "pref2"
  | "done"
  | "complete";

export default function TimetableDemo({
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
  const [gridVisible, setGridVisible] = useState(false);
  const [layout, setLayout] = useState<Course[]>([]);

  // Floating pref chips
  const [activeChip, setActiveChip] = useState(-1); // which chip is currently visible
  const [chipAbsorbed, setChipAbsorbed] = useState(-1); // which chip just got absorbed
  const [completedChips, setCompletedChips] = useState<number[]>([]);

  // Result
  const [visibleStats, setVisibleStats] = useState(0);

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
    setGridVisible(false);
    setLayout([]);
    setActiveChip(-1);
    setChipAbsorbed(-1);
    setCompletedChips([]);
    setVisibleStats(0);
  }, []);

  /* ── Animation sequence ── */
  const run = useCallback(async () => {
    cancelled.current = false;
    if (!(await wait(200))) return;

    /* ═══ Grid + default courses ═══ */
    setPhase("grid");
    setGridVisible(true);
    if (!(await wait(400))) return;
    setLayout(LAYOUT_DEFAULT);
    if (!(await wait(1200))) return;

    /* ═══ Pref chips fly in one by one ═══ */
    for (let i = 0; i < PREF_CHIPS.length; i++) {
      if (cancelled.current) return;
      const phaseKey = `pref${i}` as Phase;
      setPhase(phaseKey);

      // Chip flies in
      setActiveChip(i);
      if (!(await wait(800))) return;

      // Chip gets absorbed → layout changes
      setChipAbsorbed(i);
      if (!(await wait(300))) return;
      setLayout(LAYOUTS[i + 1]);
      if (!(await wait(600))) return;

      // Chip disappears, mark as completed
      setActiveChip(-1);
      setChipAbsorbed(-1);
      setCompletedChips((prev) => [...prev, i]);
      if (!(await wait(500))) return;
    }

    /* ═══ Stats pop in ═══ */
    setPhase("done");
    for (let i = 1; i <= STATS.length; i++) {
      if (cancelled.current) return;
      setVisibleStats(i);
      if (!(await wait(300))) return;
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

  /* ── Grid math ── */
  const headerH = 10; // % for day header
  const cellH = (100 - headerH) / ROWS; // % per hour slot

  const renderCourseBlocks = () => {
    const blocks: React.ReactNode[] = [];
    layout.forEach((course) => {
      course.slots.forEach((slot, si) => {
        const left = `${(slot.day / 5) * 100}%`;
        const width = `${100 / 5}%`;
        const top = `${headerH + slot.start * cellH}%`;
        const height = `${slot.len * cellH}%`;
        blocks.push(
          <motion.div
            key={`${course.code}-${si}`}
            className="absolute rounded-[3px] flex flex-col items-center justify-center overflow-hidden px-0.5"
            style={{
              left, width, top, height,
              backgroundColor: `${course.color}25`,
              border: `1px solid ${course.color}50`,
            }}
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={spring}
          >
            <span className="text-[8px] font-mono font-bold leading-none" style={{ color: course.color }}>
              {course.code}
            </span>
            <span className="text-[5px] font-mono leading-none mt-0.5" style={{ color: `${course.color}99` }}>
              {HOURS[slot.start]}
            </span>
          </motion.div>
        );
      });
    });
    return blocks;
  };

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg bg-background border border-border">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">UofT Timetable</span>
      </div>

      {/* Demo area */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <AnimatePresence>
          {gridVisible && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* ═══ Day headers ═══ */}
              <div className="flex" style={{ height: `${headerH}%` }}>
                {DAYS.map((day, di) => (
                  <motion.div
                    key={day}
                    className="flex-1 flex items-center justify-center border-b border-border"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: di * 0.05 }}
                  >
                    <span className="text-[8px] font-mono text-muted uppercase tracking-wider">{day}</span>
                  </motion.div>
                ))}
              </div>

              {/* ═══ Grid lines ═══ */}
              <div className="absolute left-0 right-0" style={{ top: `${headerH}%`, bottom: 0 }}>
                {HOURS.map((hour, hi) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-border/20"
                    style={{ top: `${(hi / ROWS) * 100}%`, height: `${(1 / ROWS) * 100}%` }}
                  >
                    <span className="absolute left-0.5 top-px text-[6px] text-muted/30 font-mono">
                      {hour}
                    </span>
                  </div>
                ))}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-border/15"
                    style={{ left: `${(i / 5) * 100}%` }}
                  />
                ))}
              </div>

              {/* ═══ Course blocks ═══ */}
              <AnimatePresence mode="popLayout">
                {renderCourseBlocks()}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ FLOATING PREF CHIP (centered, large) ═══ */}
        <AnimatePresence>
          {activeChip >= 0 && (
            <motion.div
              key={`chip-${activeChip}`}
              className="absolute z-40 inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 shadow-2xl"
                style={{
                  backgroundColor: `${PREF_CHIPS[activeChip].color}20`,
                  border: `2px solid ${PREF_CHIPS[activeChip].color}70`,
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={
                  chipAbsorbed === activeChip
                    ? { opacity: 0, scale: 0.4, y: -60, x: 80 }
                    : { opacity: 1, scale: 1, y: 0, x: 0 }
                }
                exit={{ opacity: 0, scale: 0.5 }}
                transition={chipAbsorbed === activeChip ? { ...springSnappy, opacity: { duration: 0.25 } } : spring}
              >
                <span className="text-xl">{PREF_CHIPS[activeChip].icon}</span>
                <span
                  className="text-sm font-bold whitespace-nowrap"
                  style={{ color: PREF_CHIPS[activeChip].color }}
                >
                  {PREF_CHIPS[activeChip].label}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ COMPLETED CHIP BADGES (top-right) ═══ */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-1.5 items-end">
          <AnimatePresence>
            {completedChips.map((ci) => (
              <motion.div
                key={`done-${ci}`}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{
                  backgroundColor: `${PREF_CHIPS[ci].color}18`,
                  border: `1.5px solid ${PREF_CHIPS[ci].color}50`,
                }}
                initial={{ opacity: 0, scale: 0.5, x: 16 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={spring}
              >
                <span className="text-[10px]">{PREF_CHIPS[ci].icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: PREF_CHIPS[ci].color }}>
                  {PREF_CHIPS[ci].label}
                </span>
                <span className="text-[10px] font-bold" style={{ color: PREF_CHIPS[ci].color }}>&#10003;</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ═══ STATS BAR (bottom) ═══ */}
        <AnimatePresence>
          {visibleStats > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 py-2"
              style={{ background: "linear-gradient(transparent, var(--background))" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
              {STATS.slice(0, visibleStats).map((stat, si) => (
                <motion.span
                  key={stat}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-mono font-bold"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--background)",
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...spring, delay: si * 0.1 }}
                >
                  {stat}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
