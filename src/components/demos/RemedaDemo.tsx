"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Spring configs ── */
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 30 };

/* ── Patient record fields ── */
const PII_FIELDS = [
  { label: "Name", value: "Sarah Chen", redacted: "██████████" },
  { label: "DOB", value: "1987-03-14", redacted: "████-██-██" },
  { label: "OHIP#", value: "2948-716-385", redacted: "████-███-███" },
];

const SAFE_FIELDS = [
  { label: "Symptoms", value: "Chest pain, shortness of breath" },
  { label: "Duration", value: "3 days, worsening" },
  { label: "History", value: "Hypertension, family cardiac hx" },
];

/* ── AI recommendation ── */
const AI_DIAGNOSIS = "Angina Pectoris";
const AI_CONFIDENCE = "92%";
const AI_SECONDARY = "Costochondritis (61%)";

/* ── Audit log entries ── */
const AUDIT_ENTRIES = [
  { time: "14:32:01", action: "PII de-identified", icon: "🔒", color: "#c678dd" },
  { time: "14:32:02", action: "AI query submitted", icon: "🤖", color: "#61afef" },
  { time: "14:32:04", action: "Recommendation generated", icon: "📋", color: "#e5c07b" },
  { time: "14:32:09", action: "Physician approved", icon: "✓", color: "#98c379" },
];

type Phase =
  | "idle"
  | "record"
  | "deidentify"
  | "deidentified"
  | "aiProcess"
  | "recommendation"
  | "approve"
  | "audit"
  | "complete";

export default function RemedaDemo({
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
  const [recordVisible, setRecordVisible] = useState(false);
  const [visiblePII, setVisiblePII] = useState(0);
  const [visibleSafe, setVisibleSafe] = useState(0);
  const [redactedFields, setRedactedFields] = useState<number[]>([]);
  const [deidentBadge, setDeidentBadge] = useState(false);

  // AI
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResult, setAiResult] = useState(false);
  const [approvalState, setApprovalState] = useState<"pending" | "approved" | "none">("none");

  // Audit
  const [visibleAudit, setVisibleAudit] = useState(0);

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
    setRecordVisible(false);
    setVisiblePII(0);
    setVisibleSafe(0);
    setRedactedFields([]);
    setDeidentBadge(false);
    setAiThinking(false);
    setAiResult(false);
    setApprovalState("none");
    setVisibleAudit(0);
  }, []);

  /* ── Animation sequence ── */
  const run = useCallback(async () => {
    cancelled.current = false;
    if (!(await wait(200))) return;

    /* ═══ Act 1: Patient record appears ═══ */
    setPhase("record");
    setRecordVisible(true);
    if (!(await wait(300))) return;

    // PII fields appear
    for (let i = 1; i <= PII_FIELDS.length; i++) {
      if (cancelled.current) return;
      setVisiblePII(i);
      if (!(await wait(250))) return;
    }
    // Safe fields appear
    for (let i = 1; i <= SAFE_FIELDS.length; i++) {
      if (cancelled.current) return;
      setVisibleSafe(i);
      if (!(await wait(250))) return;
    }
    if (!(await wait(600))) return;

    /* ═══ Act 2: De-identification ═══ */
    setPhase("deidentify");
    for (let i = 0; i < PII_FIELDS.length; i++) {
      if (cancelled.current) return;
      setRedactedFields((prev) => [...prev, i]);
      if (!(await wait(400))) return;
    }
    if (!(await wait(300))) return;

    setPhase("deidentified");
    setDeidentBadge(true);
    // Audit entry 1
    setVisibleAudit(1);
    if (!(await wait(800))) return;

    /* ═══ Act 3: AI processes ═══ */
    setPhase("aiProcess");
    setAiThinking(true);
    // Audit entry 2
    setVisibleAudit(2);
    if (!(await wait(1200))) return;

    /* ═══ Act 4: Recommendation ═══ */
    setPhase("recommendation");
    setAiThinking(false);
    setAiResult(true);
    setApprovalState("pending");
    // Audit entry 3
    setVisibleAudit(3);
    if (!(await wait(1000))) return;

    /* ═══ Act 5: Physician approval ═══ */
    setPhase("approve");
    setApprovalState("approved");
    // Audit entry 4
    setVisibleAudit(4);
    if (!(await wait(600))) return;

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

  /* ── Helpers ── */
  const isRedacted = (i: number) => redactedFields.includes(i);

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg bg-background border border-border">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono truncate">remeda.ai — Clinical AI</span>
      </div>

      {/* Demo area */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <AnimatePresence>
          {recordVisible && (
            <motion.div
              className="absolute inset-0 flex gap-2 p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* ═══ LEFT: Patient Record + AI Result ═══ */}
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                {/* Patient card */}
                <motion.div
                  className="rounded-lg border border-border bg-surface p-3 flex-shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                      Patient Record
                    </span>
                    {/* De-identified badge */}
                    <AnimatePresence>
                      {deidentBadge && (
                        <motion.span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                          style={{ backgroundColor: "#c678dd20", color: "#c678dd", border: "1.5px solid #c678dd40" }}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={spring}
                        >
                          🔒 De-identified
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* PII fields */}
                  <div className="space-y-2">
                    {PII_FIELDS.map((field, i) => (
                      <AnimatePresence key={field.label}>
                        {i < visiblePII && (
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...spring, delay: 0 }}
                          >
                            <span className="text-[10px] text-muted w-10 shrink-0">{field.label}</span>
                            <div className="relative flex-1 overflow-hidden">
                              {/* Original value */}
                              <motion.span
                                className="text-[11px] font-mono text-foreground/90"
                                animate={{
                                  opacity: isRedacted(i) ? 0 : 1,
                                  filter: isRedacted(i) ? "blur(4px)" : "blur(0px)",
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {field.value}
                              </motion.span>
                              {/* Redacted overlay */}
                              <AnimatePresence>
                                {isRedacted(i) && (
                                  <motion.span
                                    className="absolute inset-0 flex items-center text-[11px] font-mono font-bold"
                                    style={{ color: "#c678dd" }}
                                    initial={{ opacity: 0, x: 4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={springSnappy}
                                  >
                                    {field.redacted}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>

                  {/* Divider */}
                  {visibleSafe > 0 && (
                    <div className="border-t border-border/40 my-2" />
                  )}

                  {/* Safe fields */}
                  <div className="space-y-2">
                    {SAFE_FIELDS.map((field, i) => (
                      <AnimatePresence key={field.label}>
                        {i < visibleSafe && (
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={spring}
                          >
                            <span className="text-[10px] text-muted w-14 shrink-0">{field.label}</span>
                            <span className="text-[11px] font-mono text-foreground/90">{field.value}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </motion.div>

                {/* AI Result card */}
                <AnimatePresence>
                  {(aiThinking || aiResult) && (
                    <motion.div
                      className="rounded-lg border border-border bg-surface p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={spring}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          AI Recommendation
                        </span>
                        {/* Approval badge */}
                        <AnimatePresence mode="wait">
                          {approvalState === "pending" && (
                            <motion.span
                              key="pending"
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                              style={{ backgroundColor: "#e5c07b20", color: "#e5c07b", border: "1.5px solid #e5c07b40" }}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={spring}
                            >
                              ⏳ Requires Approval
                            </motion.span>
                          )}
                          {approvalState === "approved" && (
                            <motion.span
                              key="approved"
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                              style={{ backgroundColor: "#98c37920", color: "#98c379", border: "1.5px solid #98c37940" }}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={spring}
                            >
                              ✓ Physician Approved
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {aiThinking && !aiResult && (
                        <div className="flex items-center gap-2.5 py-1">
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-foreground"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="text-[11px] text-muted font-mono">Analyzing clinical data...</span>
                        </div>
                      )}

                      {aiResult && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-foreground">{AI_DIAGNOSIS}</span>
                            <span
                              className="text-[11px] font-mono font-bold"
                              style={{ color: "#98c379" }}
                            >
                              {AI_CONFIDENCE}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted font-mono">
                            Secondary: {AI_SECONDARY}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ RIGHT: Audit Trail ═══ */}
              <AnimatePresence>
                {visibleAudit > 0 && (
                  <motion.div
                    className="w-[38%] shrink-0 rounded-lg border border-border bg-surface p-3 flex flex-col"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={spring}
                  >
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2.5">
                      Audit Trail
                    </span>
                    <div className="flex-1 space-y-2.5 overflow-hidden">
                      {AUDIT_ENTRIES.slice(0, visibleAudit).map((entry, i) => (
                        <motion.div
                          key={entry.time}
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...spring, delay: 0 }}
                        >
                          <span className="text-xs shrink-0 mt-px">{entry.icon}</span>
                          <div className="min-w-0">
                            <span
                              className="text-[11px] font-semibold block leading-tight"
                              style={{ color: entry.color }}
                            >
                              {entry.action}
                            </span>
                            <span className="text-[8px] text-muted font-mono">{entry.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Lock footer */}
                    <AnimatePresence>
                      {phase === "complete" && (
                        <motion.div
                          className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-center gap-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <span className="text-[10px] font-mono text-muted">PHIPA/PIPEDA</span>
                          <span className="text-[10px] font-bold" style={{ color: "#98c379" }}>✓</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
