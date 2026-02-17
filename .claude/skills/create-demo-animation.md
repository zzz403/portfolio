# Skill: Create Animated Demo Component

Create an animated mock-UI demo for a featured project card on this personal website. The demo plays inside a FeaturedBento card, auto-starts on scroll, and replays on hover.

## When to Use

When the user asks to create a new animated demo for a featured project, or to replace a placeholder demo (e.g., CanvasDemo, EditorDemo) with a real one.

## Architecture: Two Approaches

| Type | When to Use | Examples |
|------|-------------|----------|
| **DemoShell-wrapped** | Simpler demos that fit a terminal/app window metaphor | `ChatDemo`, `CanvasDemo`, `EditorDemo` |
| **Self-managed** | Complex demos needing custom chrome, multi-panel layouts, or overlays | `YouWoDemo`, `OpenBrowserDemo` |

Read the existing demos in `src/components/demos/` for reference. `YouWoDemo.tsx` and `OpenBrowserDemo.tsx` are the most complete examples.

---

## Core Pattern: Phase-Based State Machine

Every demo defines a `Phase` union type and an async `run()` function:

```tsx
type Phase = "idle" | "stage1" | "stage2" | "stage3" | "complete";
const [phase, setPhase] = useState<Phase>("idle");
```

## Core Pattern: Cancellable `wait()` Helper

Returns `Promise<boolean>` — `false` when cancelled (unmount or replay). Always check the return value.

**For DemoShell-wrapped demos:**
```tsx
const cancelled = useRef(false);
const wait = useCallback(
  (ms: number) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(!cancelled.current), ms);
    }),
  []
);
```

**For self-managed demos** (with playId for safe cancellation):
```tsx
const cancelled = useRef(false);
const playId = useRef(0);
const wait = useCallback(
  (ms: number) =>
    new Promise<boolean>((r) => {
      const id = playId.current;
      setTimeout(() => r(!cancelled.current && playId.current === id), ms);
    }),
  []
);
```

The `playId` pattern invalidates pending timeouts from the previous run when replay starts.

## Core Pattern: Replay System

FeaturedBento passes these props to every demo:

```tsx
type DemoProps = { replayToken?: number; onComplete?: () => void };
```

- `onComplete` — call when demo finishes. Signals card is eligible for replay.
- `replayToken` — incremented on hover after `onComplete` fires. When changed, restart animation.

### Self-Managed Demo Boilerplate

```tsx
export default function MyDemo({
  replayToken, onComplete,
}: { replayToken?: number; onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.6 });
  const started = useRef(false);
  const cancelled = useRef(false);
  const playId = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const lastReplayToken = useRef<number | undefined>(replayToken);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Define wait(), resetState(), run() here...

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
    return () => { cancelled.current = true; started.current = false; playId.current += 1; };
  }, []);

  // Start on scroll into view
  useEffect(() => {
    if (inView && !started.current) { started.current = true; startPlayback(); }
  }, [inView, startPlayback]);

  // Replay on token change
  useEffect(() => {
    if (replayToken === undefined) return;
    if (!inView || !started.current) return;
    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    startPlayback();
  }, [inView, replayToken, startPlayback]);

  return <div ref={containerRef}>...</div>;
}
```

### DemoShell-Wrapped Demo Boilerplate

```tsx
export default function MyDemo({
  replayToken, onComplete,
}: { replayToken?: number; onComplete?: () => void }) {
  // state, wait(), run(), reset() ...
  return (
    <DemoShell title="my-app" onStart={run} onReset={reset} replayToken={replayToken}>
      {/* demo content */}
    </DemoShell>
  );
}
```

For DemoShell demos, `reset` must: set `cancelled.current = true` + reset all state. `run` is called by DemoShell.

## Spring Physics Constants

```tsx
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };       // standard
const springSnappy = { type: "spring" as const, stiffness: 320, damping: 30 };  // responsive UI
const expo = [0.16, 1, 0.3, 1];  // expo-out for non-spring transitions
```

## Timing Guidelines

| Element | Timing |
|---------|--------|
| Initial delay | 200ms |
| Typing speed | 30-40ms/char |
| AI streaming speed | 8-18ms/char |
| Pause between stages | 400-800ms |
| Hold final frame | 2500-4000ms |
| Sequential items | 280-350ms between |
| Thinking bar | 500-1200ms |

## Visual Building Blocks

### Terminal Chrome (title bar)
```tsx
<div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
  <div className="flex items-center gap-1.5">
    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
  </div>
  <span className="text-xs text-muted font-mono truncate">{title}</span>
</div>
```

### Demo Content Area
```tsx
<div className="relative aspect-[16/10] overflow-hidden">{/* content */}</div>
```

### Animated SVG Cursor
```tsx
<AnimatePresence>
  {cursorVisible && (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{ left: 0, top: 0 }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1, x: `${cursorPos.x}%`, y: `${cursorPos.y}%`,
        scale: cursorClick ? 0.75 : 1,
      }}
      exit={{ opacity: 0 }}
      transition={spring}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill="#fff" stroke="#000" strokeWidth="1.5" />
      </svg>
    </motion.div>
  )}
</AnimatePresence>
```

### Blinking Text Cursor
```tsx
<motion.span
  className="inline-block w-0.5 h-3.5 bg-accent align-middle ml-px"
  animate={{ opacity: [1, 0] }}
  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
/>
```

### Typing Animation
```tsx
for (let i = 0; i <= TEXT.length; i++) {
  if (cancelled.current) return;
  setTyped(TEXT.slice(0, i));
  if (!(await wait(35))) return;
}
```

### Citation Badges
```tsx
<motion.span
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={spring}
  className="inline-flex items-center mx-0.5 rounded-full px-1.5 py-px text-[8px] font-mono font-semibold"
  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}35` }}
>{label}</motion.span>
```

### Bounding Boxes
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }} transition={spring}
  className="absolute -inset-0.5 rounded border-2 pointer-events-none"
  style={{ borderColor: color }}
>
  <span className="absolute -top-2 -left-1 text-[7px] font-mono font-bold rounded px-0.5"
    style={{ backgroundColor: color, color: "#fff" }}>{number}</span>
</motion.div>
```

### Loading Spinner
```tsx
<motion.div
  className="h-3 w-3 rounded-full border border-accent/40 border-t-accent"
  animate={{ rotate: 360 }}
  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
/>
```

### Bobbing Animation
```tsx
animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
transition={{ duration: 1.5, repeat: Infinity, repeatDelay: index * 0.15, ease: "easeInOut" }}
```

---

## Placement: FeaturedBento vs ProjectDemo

Demos can live in two places:

| Placement | When to Use | Registration |
|-----------|-------------|-------------|
| **FeaturedBento** (projects listing page) | Flagship projects shown on the main `/projects` page | Import + add to `demoMap` in `FeaturedBento.tsx`, set `featured: true` in MDX |
| **ProjectDemo** (detail page only) | Secondary projects that deserve a demo but aren't featured | Add dynamic import to `demoMap` in `ProjectDemo.tsx`, keep `featured: false` in MDX |

`ProjectDemo.tsx` uses `next/dynamic` for lazy loading:
```tsx
const demoMap: Record<string, React.ComponentType> = {
  youwoai: dynamic(() => import("./demos/YouWoDemo")),
  "uoft-timetable": dynamic(() => import("./demos/TimetableDemo")),
};
```

## Step-by-Step: Creating a New Demo

1. **Create file**: `src/components/demos/MyProjectDemo.tsx`
2. **Choose architecture**: DemoShell-wrapped (simple) or self-managed (complex)
3. **Define Phase type**: Each distinct visual state = one phase. Always include `"idle"` and `"complete"`.
4. **Define content constants**: Text, colors, data arrays — all outside the component.
5. **Implement component**: Use boilerplate above. Include `"use client"` directive.
6. **Write `run()` function**: Async sequence. Every `wait()` must be checked: `if (!(await wait(ms))) return;`
7. **Build JSX**: Use `AnimatePresence` for enter/exit. Phase-derived booleans for conditionals.
8. **Register**: Either in `FeaturedBento.tsx` (featured) or `ProjectDemo.tsx` (detail page only). Slug must match MDX filename.
9. **Update MDX**: Set `featured: true` (if FeaturedBento) in frontmatter of `content/projects/<slug>.mdx`.
10. **Test**: `npm run dev` (plays on scroll), hover to replay, `npm run build` (no TS errors).

## Design Lessons

1. **Plan the narrative first, code second**: Before writing any code, decide what story the demo tells. Ask: "What is the ONE thing this product does that's special?" and build the animation around that. For TimetableDemo the answer was "customizable optimization" — so the entire demo revolves around preference chips transforming the schedule.
2. **Discuss the design with the user iteratively**: Present the animation concept (phases, layout, visual elements) as a written plan BEFORE coding. The user may redirect the core concept entirely (e.g., sliders → floating chips), which is much cheaper to change at the plan stage.
3. **Keep UI elements large enough to read**: At demo scale, sliders/small controls become invisible. Prefer large, bold visual metaphors (floating chips, big cards, centered overlays) over miniaturized real UI (sliders, dropdowns, tiny buttons). Minimum readable sizes:
   - Floating overlays/chips: `text-sm` (14px) for labels, `text-xl` for icons
   - Completed badges: `text-[10px]` minimum, `px-2.5 py-1`
   - Course blocks / grid labels: `text-[8px]` for primary, `text-[6px]` for secondary
4. **Center important elements**: Floating elements (pref chips, modals) should use `absolute inset-0 flex items-center justify-center` to be centered in the demo area, not positioned with percentage offsets which are hard to get right.
5. **Make each transition causally obvious**: Every layout change must have a clear visual trigger. A chip flies in → the grid rearranges. If a transition only moves one block slightly, it's not convincing — add more data (e.g., a 4th course) to make the change dramatic.
6. **Data must be realistic**: Layout transitions should reflect real-world logic. "Fri Off" should redistribute Friday's course to Mon–Thu, not just delete it. "Short Gaps" needs visible gaps to close — if courses are on separate days, there's no gap to see.

## Common Pitfalls

1. **React Strict Mode**: Never put animation logic in useEffect cleanup. Use `playId` pattern.
2. **Missing cancellation checks** in loops: Every for-loop iteration needs `if (cancelled.current) return;`
3. **Missing wait() checks**: Every `wait()` must be wrapped: `if (!(await wait(ms))) return;`
4. **onComplete in deps**: Use `onCompleteRef` pattern — never put `onComplete` in `run()`'s useCallback deps.
5. **Text sizes**: Demos are miniaturized. Use `text-[7px]` to `text-[10px]`. Max `text-xs` (12px) for grid content. Floating overlays can go up to `text-sm` / `text-xl` for icons.
6. **Colors**: Use design tokens (`accent`, `muted`, `foreground`, `border`, `surface`). Project-specific hex with opacity suffixes (`#e06c7520`).
7. **NEVER hardcode dark-mode colors** (e.g., `bg-[#0a0a0a]`, `bg-[#141414]`, `border-[#222]`). The site supports dark/light theme switching via `.dark` / `.light` CSS classes. Always use Tailwind theme classes or `var(--token)` for inline styles:

   | Instead of | Use |
   |------------|-----|
   | `bg-[#0a0a0a]`, `bg-[#0e0e0e]` | `bg-background` |
   | `bg-[#141414]`, `bg-[#181818]` | `bg-surface` |
   | `bg-[#1a1a1a]` | `bg-surface-hover` |
   | `border-[#222]`, `border-[#333]` | `border-border` |
   | `text-[#333]` | `text-muted/40` |
   | Inline `backgroundColor: "#e0ff00"` | `backgroundColor: "var(--accent)"` |
   | Inline `color: "#050505"` | `color: "var(--background)"` |

   The traffic light dots (`bg-[#ff5f57]`, `bg-[#febc2e]`, `bg-[#28c840]`) are the only exception — these are universal macOS chrome colors and stay hardcoded.

## File Reference

| File | Purpose |
|------|---------|
| `src/components/FeaturedBento.tsx` | Card grid + demoMap + replay orchestration (featured projects) |
| `src/components/ProjectDemo.tsx` | Dynamic demo loader for project detail pages |
| `src/components/demos/DemoShell.tsx` | Reusable wrapper (title bar + useInView + replay) |
| `src/components/demos/YouWoDemo.tsx` | YouWo AI demo (self-managed, reference impl) |
| `src/components/demos/OpenBrowserDemo.tsx` | OpenBrowser AI demo (self-managed, reference impl) |
| `src/components/demos/TimetableDemo.tsx` | UofT Timetable demo (self-managed, floating chips + grid layout) |
| `src/components/demos/ChatDemo.tsx` | Chat demo (DemoShell-wrapped, simple reference) |
| `src/components/demos/CanvasDemo.tsx` | Generative art demo (DemoShell-wrapped) |
| `src/components/demos/EditorDemo.tsx` | Editor demo (DemoShell-wrapped) |
| `src/lib/projects.ts` | MDX parser + Project type |
| `content/projects/*.mdx` | Project content (frontmatter: featured, url, github, tags) |
