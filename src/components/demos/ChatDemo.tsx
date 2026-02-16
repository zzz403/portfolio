"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoShell from "./DemoShell";

const QUESTION = "How does real-time collaboration work?";
const RESPONSE =
  "Each user connects via WebSocket. Edits are broadcast as operational transforms, merged conflict-free on the server, then pushed to all peers in <12ms.";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };
const CHAR_DELAY = 30;
const STREAM_DELAY = 18;
const PAUSE = 800;

type Phase = "idle" | "typing" | "sent" | "thinking" | "streaming" | "done";

export default function ChatDemo({
  replayToken,
  onComplete,
}: {
  replayToken?: number;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [response, setResponse] = useState("");
  const cancelled = useRef(false);

  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        const id = setTimeout(() => resolve(!cancelled.current), ms);
        // store for cleanup if needed
        if (cancelled.current) {
          clearTimeout(id);
          resolve(false);
        }
      }),
    []
  );

  const run = useCallback(async () => {
    cancelled.current = false;

    // Phase: typing question
    setPhase("typing");
    for (let i = 0; i <= QUESTION.length; i++) {
      if (cancelled.current) return;
      setTyped(QUESTION.slice(0, i));
      if (!(await wait(CHAR_DELAY))) return;
    }

    if (!(await wait(PAUSE))) return;

    // Phase: sent
    setPhase("sent");
    if (!(await wait(400))) return;

    // Phase: thinking dots
    setPhase("thinking");
    if (!(await wait(1200))) return;

    // Phase: streaming response
    setPhase("streaming");
    for (let i = 0; i <= RESPONSE.length; i++) {
      if (cancelled.current) return;
      setResponse(RESPONSE.slice(0, i));
      if (!(await wait(STREAM_DELAY))) return;
    }

    setPhase("done");
    onComplete?.();

    // Hold final frame
    if (!(await wait(4000))) return;
  }, [onComplete, wait]);

  const reset = useCallback(() => {
    cancelled.current = true;
    setPhase("idle");
    setTyped("");
    setResponse("");
  }, []);

  const showQuestion = phase !== "idle" && phase !== "typing";
  const showInput = phase === "idle" || phase === "typing";

  return (
    <DemoShell title="community-chat" onStart={run} onReset={reset} replayToken={replayToken}>
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Chat area */}
        <div className="flex-1 flex flex-col justify-end gap-2.5 overflow-hidden">
          <AnimatePresence>
            {showQuestion && (
              <motion.div
                key="q"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="self-end max-w-[75%] rounded-2xl rounded-br-md bg-accent/15 text-accent px-3 py-2 text-xs font-mono"
              >
                {QUESTION}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "thinking" && (
              <motion.div
                key="dots"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="self-start flex items-center gap-1 px-3 py-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(phase === "streaming" || phase === "done") && (
              <motion.div
                key="r"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="self-start max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-surface px-3 py-2 text-xs text-foreground/90 leading-relaxed"
              >
                {response}
                {phase === "streaming" && (
                  <motion.span
                    className="inline-block w-1 h-3 bg-accent ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="shrink-0 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          {showInput ? (
            <>
              <span className="flex-1 text-xs font-mono text-foreground/80 truncate">
                {typed}
                <motion.span
                  className="inline-block w-0.5 h-3.5 bg-foreground/60 align-middle ml-px"
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </span>
              <div className="h-5 w-5 rounded-md bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-[10px]">&#8593;</span>
              </div>
            </>
          ) : (
            <span className="flex-1 text-xs text-muted font-mono">
              Ask anything...
            </span>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
