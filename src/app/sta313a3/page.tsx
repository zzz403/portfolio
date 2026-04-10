"use client";

import { useState, useMemo, useCallback, useRef, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   DATA GENERATION
   ───────────────────────────────────────────── */

interface DayData {
  date: Date;
  dayIndex: number;
  cases: number;
  casesAvg: number;
  hospitalizations: number;
  hospAvg: number;
}

function gaussian(x: number, peak: number, center: number, width: number) {
  return peak * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
}

function generateData(): DayData[] {
  const start = new Date(2020, 0, 15);
  const end = new Date(2022, 0, 31);
  const days: DayData[] = [];

  const caseWaves = [
    { center: 91, peak: 32000, width: 18 },
    { center: 182, peak: 68000, width: 28 },
    { center: 366, peak: 250000, width: 35 },
    { center: 456, peak: 72000, width: 22 },
    { center: 595, peak: 165000, width: 30 },
    { center: 721, peak: 800000, width: 18 },
  ];

  const hospWaves = [
    { center: 96, peak: 60000, width: 20 },
    { center: 187, peak: 37000, width: 28 },
    { center: 371, peak: 132000, width: 38 },
    { center: 461, peak: 46000, width: 24 },
    { center: 600, peak: 103000, width: 32 },
    { center: 726, peak: 155000, width: 22 },
  ];

  let dayIndex = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    let cases = 1500 + Math.random() * 2000;
    for (const w of caseWaves) cases += gaussian(dayIndex, w.peak, w.center, w.width);
    cases = Math.max(0, cases * (1 + (Math.random() - 0.5) * 0.12));

    let hosp = 800 + Math.random() * 500;
    for (const w of hospWaves) hosp += gaussian(dayIndex, w.peak, w.center, w.width);
    hosp = Math.max(0, hosp * (1 + (Math.random() - 0.5) * 0.1));

    days.push({ date: new Date(d), dayIndex, cases: Math.round(cases), casesAvg: 0, hospitalizations: Math.round(hosp), hospAvg: 0 });
    dayIndex++;
  }

  for (let i = 0; i < days.length; i++) {
    const lo = Math.max(0, i - 3), hi = Math.min(days.length - 1, i + 3);
    let cSum = 0, hSum = 0, count = 0;
    for (let j = lo; j <= hi; j++) { cSum += days[j].cases; hSum += days[j].hospitalizations; count++; }
    days[i].casesAvg = Math.round(cSum / count);
    days[i].hospAvg = Math.round(hSum / count);
  }
  return days;
}

/* ─────────────────────────────────────────────
   GEOMETRY
   ───────────────────────────────────────────── */

const CX = 450;
const CY = 450;
const BASE_RADIUS = 70;
const RING_SPACING = 105;
const BAND_WIDTH = 28; // thickness of each heatmap segment

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// offsetX: positive = right, negative = left (in SVG pixels)
const WAVES = [
  { name: "Initial", dayIndex: 91, offsetX: 15, offsetY: 0 },
  { name: "Alpha", dayIndex: 456, offsetX: 20, offsetY: 0 },
  { name: "Delta", dayIndex: 595, offsetX: -20, offsetY: 0 },
  { name: "Omicron", dayIndex: 721, offsetX: 0, offsetY: 0 },
];

function dayToAngle(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysInYear = date.getFullYear() % 4 === 0 ? 366 : 365;
  return (dayOfYear / daysInYear) * Math.PI * 2 - Math.PI / 2;
}

function spiralRadius(date: Date): number {
  const yi = date.getFullYear() - 2020;
  const angle = dayToAngle(date);
  const progress = ((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
  return BASE_RADIUS + (yi + progress) * RING_SPACING;
}

function polarToCart(angle: number, radius: number) {
  return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
}

// Case color: multi-stop sequential scale for maximum differentiation
function caseColor(value: number, max: number): string {
  const t = value / max;
  // 4-stop gradient: near-white → light peach → strong orange → deep crimson
  if (t < 0.05) {
    // baseline: very faint
    return `rgb(235,230,225)`;
  } else if (t < 0.15) {
    // low: warm peach
    const s = (t - 0.05) / 0.1;
    return `rgb(${Math.round(235 - 15 * s)},${Math.round(230 - 60 * s)},${Math.round(225 - 80 * s)})`;
  } else if (t < 0.4) {
    // medium: orange-salmon
    const s = (t - 0.15) / 0.25;
    return `rgb(${Math.round(220 - 10 * s)},${Math.round(170 - 80 * s)},${Math.round(145 - 85 * s)})`;
  } else {
    // high → max: strong red → deep crimson
    const s = (t - 0.4) / 0.6;
    return `rgb(${Math.round(210 - 30 * s)},${Math.round(90 - 70 * s)},${Math.round(60 - 40 * s)})`;
  }
}

// Hospitalization color: multi-stop blue scale matching case color contrast
function hospColorFn(value: number, max: number): string {
  const t = value / max;
  if (t < 0.05) {
    return `rgb(220,225,235)`;
  } else if (t < 0.15) {
    const s = (t - 0.05) / 0.1;
    return `rgb(${Math.round(220 - 80 * s)},${Math.round(225 - 60 * s)},${Math.round(235 - 15 * s)})`;
  } else if (t < 0.4) {
    const s = (t - 0.15) / 0.25;
    return `rgb(${Math.round(140 - 80 * s)},${Math.round(165 - 65 * s)},${Math.round(220 - 20 * s)})`;
  } else {
    const s = (t - 0.4) / 0.6;
    return `rgb(${Math.round(60 - 40 * s)},${Math.round(100 - 60 * s)},${Math.round(200 - 30 * s)})`;
  }
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

interface ComparePoint { data: DayData; }

export default function STA313A3Page() {
  const data = useMemo(() => generateData(), []);
  const maxCases = useMemo(() => Math.max(...data.map((d) => d.casesAvg)), [data]);
  const maxHosp = useMemo(() => Math.max(...data.map((d) => d.hospAvg)), [data]);

  const [showHosp, setShowHosp] = useState(false);
  const [isLinear, setIsLinear] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [comparePoints, setComparePoints] = useState<ComparePoint[]>([]);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  // Precompute heatmap segments (every 2 days → ~375 segments)
  const segments = useMemo(() => {
    const step = 2;
    const result: {
      i: number;
      // arc segment defined by two angles and inner/outer radii
      angle1: number; angle2: number;
      r: number; // spiral radius at midpoint
      casesAvg: number;
      hospAvg: number;
    }[] = [];

    for (let i = 0; i < data.length - step; i += step) {
      const d1 = data[i];
      const d2 = data[Math.min(i + step, data.length - 1)];
      const mid = data[Math.min(i + Math.floor(step / 2), data.length - 1)];

      result.push({
        i,
        angle1: dayToAngle(d1.date),
        angle2: dayToAngle(d2.date),
        r: spiralRadius(mid.date),
        casesAvg: mid.casesAvg,
        hospAvg: mid.hospAvg,
      });
    }
    return result;
  }, [data]);

  // Build segment path (trapezoid between two angles at inner/outer radius)
  function segmentPath(angle1: number, angle2: number, rInner: number, rOuter: number): string {
    // Handle angle wrapping (when crossing from Dec to Jan)
    let a1 = angle1, a2 = angle2;
    if (a2 < a1) a2 += Math.PI * 2;

    // For small arcs, straight lines are fine
    const p1i = polarToCart(a1, rInner);
    const p2i = polarToCart(a2, rInner);
    const p1o = polarToCart(a1, rOuter);
    const p2o = polarToCart(a2, rOuter);

    // Use arc commands for smooth curves
    const largeArc = (a2 - a1) > Math.PI ? 1 : 0;
    return [
      `M${p1i.x.toFixed(1)},${p1i.y.toFixed(1)}`,
      `A${rInner.toFixed(1)},${rInner.toFixed(1)} 0 ${largeArc} 1 ${p2i.x.toFixed(1)},${p2i.y.toFixed(1)}`,
      `L${p2o.x.toFixed(1)},${p2o.y.toFixed(1)}`,
      `A${rOuter.toFixed(1)},${rOuter.toFixed(1)} 0 ${largeArc} 0 ${p1o.x.toFixed(1)},${p1o.y.toFixed(1)}`,
      "Z",
    ].join(" ");
  }

  // Spiral baseline path
  const spiralPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i < data.length; i += 2) {
      const d = data[i];
      const angle = dayToAngle(d.date);
      const r = spiralRadius(d.date);
      const pt = polarToCart(angle, r);
      pts.push(`${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [data]);

  // Linear chart
  const LINEAR_W = 760;
  const LINEAR_H = 300;
  const LINEAR_PAD = { top: 30, right: 20, bottom: 40, left: 65 };

  const linearPaths = useMemo(() => {
    const w = LINEAR_W - LINEAR_PAD.left - LINEAR_PAD.right;
    const h = LINEAR_H - LINEAR_PAD.top - LINEAR_PAD.bottom;
    const xScale = (i: number) => LINEAR_PAD.left + (i / (data.length - 1)) * w;
    const yScale = (v: number) => LINEAR_PAD.top + h - (v / maxCases) * h;
    const yScaleH = (v: number) => LINEAR_PAD.top + h - (v / maxHosp) * h * 0.5;

    const casePts: string[] = [];
    const hospPts: string[] = [];
    data.forEach((d, i) => {
      casePts.push(`${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d.casesAvg).toFixed(1)}`);
      hospPts.push(`${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScaleH(d.hospAvg).toFixed(1)}`);
    });
    const baseline = `L${xScale(data.length - 1).toFixed(1)},${(LINEAR_PAD.top + h).toFixed(1)} L${xScale(0).toFixed(1)},${(LINEAR_PAD.top + h).toFixed(1)} Z`;

    return {
      caseLine: casePts.join(" "),
      caseArea: casePts.join(" ") + " " + baseline,
      hospLine: hospPts.join(" "),
      hospArea: hospPts.join(" ") + " " + baseline,
    };
  }, [data, maxCases, maxHosp]);

  // Hit detection
  const findClosestSpiral = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((clientX - rect.left) / rect.width) * 900;
    const my = ((clientY - rect.top) / rect.height) * 900;

    let bestIdx = -1, bestDist = Infinity;
    for (const seg of segments) {
      const midAngle = (seg.angle1 + seg.angle2) / 2;
      const pt = polarToCart(midAngle, seg.r);
      const dist = Math.hypot(pt.x - mx, pt.y - my);
      if (dist < bestDist) { bestDist = dist; bestIdx = seg.i; }
    }
    return bestDist < 45 ? bestIdx : null;
  }, [segments]);

  const findClosestLinear = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const w = LINEAR_W - LINEAR_PAD.left - LINEAR_PAD.right;
    const mx = ((clientX - rect.left) / rect.width) * LINEAR_W;
    const idx = Math.round(((mx - LINEAR_PAD.left) / w) * (data.length - 1));
    return (idx >= 0 && idx < data.length) ? idx : null;
  }, [data]);

  const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    const idx = isLinear ? findClosestLinear(e.clientX, e.clientY) : findClosestSpiral(e.clientX, e.clientY);
    setHoveredIdx(idx);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [findClosestSpiral, findClosestLinear, isLinear]);

  const handleClick = useCallback((e: MouseEvent<SVGSVGElement>) => {
    const idx = isLinear ? findClosestLinear(e.clientX, e.clientY) : findClosestSpiral(e.clientX, e.clientY);
    if (idx === null) return;
    setComparePoints((prev) => prev.length >= 2 ? [{ data: data[idx] }] : [...prev, { data: data[idx] }]);
  }, [data, findClosestSpiral, findClosestLinear, isLinear]);

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  // Find same calendar day (month+day) across all years
  const hoveredCrossYear = useMemo(() => {
    if (!hoveredData) return [];
    const m = hoveredData.date.getMonth();
    const d = hoveredData.date.getDate();
    const results: DayData[] = [];
    for (const entry of data) {
      if (entry.date.getMonth() === m && entry.date.getDate() === d) {
        results.push(entry);
      }
    }
    // Sort by year
    return results.sort((a, b) => a.date.getFullYear() - b.date.getFullYear());
  }, [hoveredData, data]);

  // Outer radius for labels
  const labelRadius = BASE_RADIUS + 2.15 * RING_SPACING + BAND_WIDTH + 25;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HERO ── */}
      <header className="max-w-[680px] mx-auto px-6 pt-20 pb-12">
        <p className="text-muted font-mono text-[11px] tracking-widest uppercase mb-6">
          Opinion &middot; Interactive &middot; Jan. 6, 2022
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-normal mb-6" style={{ lineHeight: 1.12, letterSpacing: "-0.01em" }}>
          The Omicron Spiral, Redesigned
        </h1>
        <p className="text-muted text-lg leading-relaxed font-serif italic mb-8">
          A new way to read the pandemic&rsquo;s most dramatic chart: same spiral, honest encoding, full context.
        </p>
        <div className="flex items-center gap-3 text-sm text-muted border-t border-border pt-5">
          <span className="font-mono text-xs">STA313 Assignment 3 &middot; Design Critique &amp; Redesign</span>
        </div>
      </header>

      {/* ── LEDE ── */}
      <section className="max-w-[680px] mx-auto px-6 mb-12">
        <p className="text-[15px] leading-relaxed mb-4">
          On January 6, 2022, <em>The New York Times</em> published an opinion piece
          by epidemiologist Jeffrey Shaman titled &ldquo;Here&rsquo;s When We Expect Omicron to Peak.&rdquo;
          At its center was a spiral chart of daily COVID-19 cases in the United States, designed
          by Gus Wezerek and Sara Chodosh. The Omicron spike burst outward from the spiral like nothing before it,
          instantly conveying one message: <strong>this wave is unprecedented</strong>.
        </p>
        <p className="text-[15px] leading-relaxed mb-4">
          The spiral was brilliant and flawed. Its radial layout systematically exaggerated later data,
          its geometry implied a cyclicality the pandemic never had, and it showed only case counts,
          omitting the crucial context that Omicron&rsquo;s record cases did not produce a proportional
          hospitalization surge.
        </p>
        <p className="text-[15px] leading-relaxed">
          Below is a redesign that preserves what made the original compelling while fixing what made it misleading.
          Instead of encoding magnitude as <em>radial distance</em> (which distorts across rings),
          this version uses a <strong>sequential color scale</strong>: every segment is the same width,
          and intensity alone carries the signal. Hover, click, and toggle to explore.
        </p>
      </section>

      {/* ── MAIN CHART ── */}
      <div className="max-w-[900px] mx-auto px-6 mb-6">
        <div className="relative bg-surface rounded-lg border border-border overflow-hidden">
          {/* Controls */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border">
            <Toggle label="Hospitalizations" active={showHosp} onToggle={() => setShowHosp(!showHosp)} color="#5b9bd5" />
            {comparePoints.length > 0 && (
              <button onClick={() => setComparePoints([])} className="ml-auto text-xs text-muted hover:text-foreground transition-colors cursor-pointer">
                Clear markers
              </button>
            )}
          </div>

          <div className="relative flex justify-center py-4">
            <AnimatePresence mode="wait">
              {!isLinear ? (
                <motion.div key="spiral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <svg ref={svgRef} viewBox="0 0 900 900" width={700} height={700}
                    className="cursor-crosshair"
                    onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIdx(null)} onClick={handleClick}>

                    {/* Grid circles (faint) */}
                    {[0, 1, 2].map((yi) => (
                      <circle key={yi} cx={CX} cy={CY} r={BASE_RADIUS + yi * RING_SPACING}
                        fill="none" stroke="var(--border)" strokeWidth={0.4} strokeDasharray="4,10" opacity={0.4} />
                    ))}

                    {/* Month radial lines */}
                    {MONTHS.map((_, mi) => {
                      const angle = (mi / 12) * Math.PI * 2 - Math.PI / 2;
                      const inner = polarToCart(angle, BASE_RADIUS - 5);
                      const outer = polarToCart(angle, BASE_RADIUS + 2.15 * RING_SPACING + BAND_WIDTH + 5);
                      return <line key={mi} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                        stroke="var(--border)" strokeWidth={0.3} strokeDasharray="2,8" opacity={0.3} />;
                    })}

                    {/* Month labels */}
                    {MONTHS.map((m, mi) => {
                      const angle = ((mi + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
                      const pt = polarToCart(angle, labelRadius);
                      return <text key={m} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
                        fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)" opacity={0.6}>{m}</text>;
                    })}

                    {/* Year labels — placed in the gap between rings
                        To adjust position: change `angle` (radians, -PI/2 = top/Jan, 0 = right/Apr, PI/2 = bottom/Jul, PI = left/Oct)
                        and `r` (distance from center). */}
                    {[2020, 2021, 2022].map((yr) => {
                      const yi = yr - 2020;
                      const thisOuter = BASE_RADIUS + yi * RING_SPACING + BAND_WIDTH / 2;
                      const nextInner = BASE_RADIUS + (yi + 1) * RING_SPACING - BAND_WIDTH / 2;
                      const r = (thisOuter + nextInner) / 2;
                      const angle = -Math.PI / 2; // 12 o'clock (straight up)
                      const pt = polarToCart(angle, r);
                      return (
                        <g key={yr}>
                          <text x={pt.x} y={pt.y - 6} fill="var(--accent)" fontSize={11}
                            fontFamily="var(--font-mono)" fontWeight={600} opacity={0.8}
                            textAnchor="middle" dominantBaseline="middle">{yr}</text>
                          <text x={pt.x} y={pt.y + 8} fill="var(--accent)" fontSize={10}
                            opacity={0.5} textAnchor="middle" dominantBaseline="middle">↓</text>
                        </g>
                      );
                    })}

                    {/* Spiral baseline (thin) */}
                    <path d={spiralPath} fill="none" stroke="var(--muted)" strokeWidth={0.5} opacity={0.15} />

                    {/* ── HOSPITALIZATION HEATMAP SEGMENTS (outer band) ── */}
                    {showHosp && segments.map((seg) => {
                      const rInner = seg.r + BAND_WIDTH / 2 + 2;
                      const rOuter = rInner + BAND_WIDTH * 0.6;
                      return (
                        <path key={`h-${seg.i}`}
                          d={segmentPath(seg.angle1, seg.angle2, rInner, rOuter)}
                          fill={hospColorFn(seg.hospAvg, maxHosp)}
                          stroke="none"
                          opacity={hoveredIdx !== null && Math.abs(seg.i - hoveredIdx) > 8 ? 0.3 : 0.75}
                        />
                      );
                    })}

                    {/* ── CASE HEATMAP SEGMENTS ── */}
                    {segments.map((seg) => {
                      const rInner = seg.r - BAND_WIDTH / 2;
                      const rOuter = seg.r + BAND_WIDTH / 2;
                      return (
                        <path key={`c-${seg.i}`}
                          d={segmentPath(seg.angle1, seg.angle2, rInner, rOuter)}
                          fill={caseColor(seg.casesAvg, maxCases)}
                          stroke="none"
                          opacity={hoveredIdx !== null && Math.abs(seg.i - hoveredIdx) > 8 ? 0.35 : 0.85}
                        />
                      );
                    })}

                    {/* Wave labels */}
                    {WAVES.map((w) => {
                      const d = data[Math.min(w.dayIndex, data.length - 1)];
                      if (!d) return null;
                      const angle = dayToAngle(d.date);
                      const r = spiralRadius(d.date) + BAND_WIDTH / 2 + (showHosp ? BAND_WIDTH * 0.6 + 14 : 14);
                      const pt = polarToCart(angle, r);
                      return <text key={w.name} x={pt.x + (w.offsetX ?? 0)} y={pt.y + (w.offsetY ?? 0)}
                        fill="var(--foreground)" fontSize={11} fontFamily="var(--font-mono)"
                        fontWeight={500} textAnchor="middle" dominantBaseline="middle" opacity={0.9}
                        style={{ pointerEvents: "none" }}>{w.name}</text>;
                    })}

                    {/* Hover indicators — highlight same date on all year rings */}
                    {hoveredCrossYear.map((entry) => {
                      const angle = dayToAngle(entry.date);
                      const r = spiralRadius(entry.date);
                      const isActive = hoveredData && entry.date.getFullYear() === hoveredData.date.getFullYear();
                      const inner = polarToCart(angle, r - BAND_WIDTH / 2 - 3);
                      const outer = polarToCart(angle, r + BAND_WIDTH / 2 + (showHosp ? BAND_WIDTH * 0.6 + 5 : 3));
                      return (
                        <g key={entry.date.getFullYear()}>
                          <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                            stroke="var(--accent)" strokeWidth={isActive ? 2.5 : 1.5} strokeLinecap="round"
                            opacity={isActive ? 1 : 0.5} />
                          <circle cx={outer.x} cy={outer.y} r={isActive ? 3.5 : 2.5} fill="var(--accent)"
                            opacity={isActive ? 1 : 0.5} />
                        </g>
                      );
                    })}

                    {/* Compare markers */}
                    {comparePoints.map((cp, i) => {
                      const angle = dayToAngle(cp.data.date);
                      const r = spiralRadius(cp.data.date);
                      const pt = polarToCart(angle, r);
                      return (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r={7} fill="none" stroke="var(--accent)" strokeWidth={2} />
                          <circle cx={pt.x} cy={pt.y} r={2.5} fill="var(--accent)" />
                          <text x={pt.x + 11} y={pt.y - 11} fill="var(--accent)" fontSize={11}
                            fontFamily="var(--font-mono)" fontWeight={700}>{i === 0 ? "A" : "B"}</text>
                        </g>
                      );
                    })}

                    {/* Legend */}
                    <g transform="translate(18,18)">
                      <text fill="var(--foreground)" fontSize={14} fontFamily="var(--font-mono)" fontWeight={600}>New Covid-19 cases, United States</text>
                      <g transform="translate(0,22)">
                        <text fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)" y={-2}>Cases</text>
                        {Array.from({ length: 8 }, (_, i) => {
                          const t = i / 7;
                          return <rect key={i} x={i * 20 + 50} y={-10} width={18} height={13} rx={2}
                            fill={caseColor(t * maxCases, maxCases)} opacity={0.85} />;
                        })}
                        <text x={50} y={18} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)">0</text>
                        <text x={208} y={18} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)" textAnchor="end">800K</text>
                      </g>
                      {showHosp && (
                        <g transform="translate(0,50)">
                          <text fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)" y={-2}>Hosp</text>
                          {Array.from({ length: 8 }, (_, i) => {
                            const t = i / 7;
                            return <rect key={i} x={i * 20 + 50} y={-10} width={18} height={13} rx={2}
                              fill={hospColorFn(t * maxHosp, maxHosp)} opacity={0.75} />;
                          })}
                          <text x={50} y={18} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)">0</text>
                          <text x={208} y={18} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)" textAnchor="end">{fmt(maxHosp)}</text>
                        </g>
                      )}
                    </g>
                  </svg>
                </motion.div>
              ) : (
                /* LINEAR VIEW */
                <motion.div key="linear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <svg ref={svgRef} viewBox={`0 0 ${LINEAR_W} ${LINEAR_H}`} width={760} height={300}
                    className="cursor-crosshair" onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredIdx(null)} onClick={handleClick}>
                    {[0, 200000, 400000, 600000, 800000].map((v) => {
                      const y = LINEAR_PAD.top + (LINEAR_H - LINEAR_PAD.top - LINEAR_PAD.bottom) -
                        (v / maxCases) * (LINEAR_H - LINEAR_PAD.top - LINEAR_PAD.bottom);
                      return (
                        <g key={v}>
                          <line x1={LINEAR_PAD.left} y1={y} x2={LINEAR_W - LINEAR_PAD.right} y2={y}
                            stroke="var(--border)" strokeWidth={0.5} />
                          <text x={LINEAR_PAD.left - 8} y={y + 3} fill="var(--muted)" fontSize={9}
                            fontFamily="var(--font-mono)" textAnchor="end">{fmt(v)}</text>
                        </g>
                      );
                    })}
                    {[2020, 2021, 2022].map((yr) => {
                      const idx = data.findIndex((d) => d.date.getFullYear() === yr && d.date.getMonth() === 0 && d.date.getDate() <= 3);
                      if (idx < 0) return null;
                      const x = LINEAR_PAD.left + (idx / (data.length - 1)) * (LINEAR_W - LINEAR_PAD.left - LINEAR_PAD.right);
                      return <text key={yr} x={x} y={LINEAR_H - 10} fill="var(--muted)" fontSize={10}
                        fontFamily="var(--font-mono)" textAnchor="middle">{yr}</text>;
                    })}
                    {showHosp && <><path d={linearPaths.hospArea} fill="rgba(91,155,213,0.1)" />
                      <path d={linearPaths.hospLine} fill="none" stroke="#5b9bd5" strokeWidth={1.5} /></>}
                    <path d={linearPaths.caseArea} fill="rgba(232,146,124,0.15)" />
                    <path d={linearPaths.caseLine} fill="none" stroke="#e8927c" strokeWidth={1.5} />
                    {hoveredIdx !== null && (
                      <line x1={LINEAR_PAD.left + (hoveredIdx / (data.length - 1)) * (LINEAR_W - LINEAR_PAD.left - LINEAR_PAD.right)}
                        y1={LINEAR_PAD.top}
                        x2={LINEAR_PAD.left + (hoveredIdx / (data.length - 1)) * (LINEAR_W - LINEAR_PAD.left - LINEAR_PAD.right)}
                        y2={LINEAR_H - LINEAR_PAD.bottom} stroke="var(--accent)" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.6} />
                    )}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip — shows same calendar date across all years */}
            <AnimatePresence>
              {hoveredData && hoveredCrossYear.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }} className="fixed z-50 pointer-events-none"
                  style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 20 }}>
                  <div className="bg-[#1a1a2e] border border-border rounded-md px-3 py-2.5 shadow-xl text-xs font-mono min-w-[180px]">
                    <div className="text-muted mb-1.5">
                      {hoveredData.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="space-y-1.5">
                      {hoveredCrossYear.map((entry) => {
                        const isActive = entry.date.getFullYear() === hoveredData.date.getFullYear();
                        return (
                          <div key={entry.date.getFullYear()}
                            className={`flex items-center justify-between gap-4 ${isActive ? "text-foreground" : "text-muted opacity-70"}`}>
                            <span className="font-semibold w-[36px]">{entry.date.getFullYear()}</span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: caseColor(entry.casesAvg, maxCases) }} />
                              {fmt(entry.casesAvg)}
                            </span>
                            {showHosp && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: hospColorFn(entry.hospAvg, maxHosp) }} />
                                {fmt(entry.hospAvg)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Compare Panel */}
        <AnimatePresence>
          {comparePoints.length === 2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="mt-4 bg-surface border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-border text-xs font-mono text-muted uppercase tracking-widest">Comparison</div>
              <div className="grid grid-cols-2 divide-x divide-border">
                {comparePoints.map((cp, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="text-accent font-mono text-xs font-bold mb-2">Point {i === 0 ? "A" : "B"}</div>
                    <div className="text-sm font-semibold mb-2">{fmtDate(cp.data.date)}</div>
                    <div className="space-y-1 text-xs font-mono text-muted">
                      <div>Cases (7d avg): <span className="text-[#e8927c]">{fmt(cp.data.casesAvg)}</span></div>
                      <div>Hospitalizations: <span className="text-[#5b9bd5]">{fmt(cp.data.hospAvg)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-border text-xs font-mono text-muted">
                Cases ratio: <span className="text-foreground">{(comparePoints[1].data.casesAvg / Math.max(1, comparePoints[0].data.casesAvg)).toFixed(1)}&times;</span>
                {" | "}Hosp ratio: <span className="text-foreground">{(comparePoints[1].data.hospAvg / Math.max(1, comparePoints[0].data.hospAvg)).toFixed(1)}&times;</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── SECTION: What the original got wrong ── */}
      <section className="max-w-[680px] mx-auto px-6 mt-16 mb-12">
        <h2 className="font-serif text-2xl mb-6" style={{ letterSpacing: "-0.01em" }}>What the Original Got Wrong</h2>

        <p className="text-[15px] leading-relaxed mb-4">
          The NYT spiral is an author-driven narrative designed for maximum viral impact.
          And it worked: the image circulated widely on social media, instantly communicating
          the Omicron surge&rsquo;s scale. But several design choices undermine accurate reading:
        </p>

        <div className="border-l-2 border-[#e8927c] pl-5 mb-6 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-1">Geometric distortion</p>
            <p className="text-sm text-muted leading-relaxed">
              Outer rings have greater arc length than inner rings for the same angular span.
              A wave on the 2021 ring appears physically larger than an identical wave on the 2020 ring,
              even if the underlying case counts are the same. This violates what Cleveland and McGill
              identified as a fundamental principle: radial distance is a weak channel for quantitative comparison.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">False cyclicality</p>
            <p className="text-sm text-muted leading-relaxed">
              A spiral implies periodicity. But the pandemic&rsquo;s trajectory was shaped by variant emergence
              and policy decisions, not by a repeating annual cycle. The layout violates Munzner&rsquo;s
              expressiveness principle: the visual structure suggests a pattern the data does not contain.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Missing severity context</p>
            <p className="text-sm text-muted leading-relaxed">
              Shaman&rsquo;s article explicitly discussed hospitalization rates, noting that
              &ldquo;if twice as many people become infected but these people are half as likely to be hospitalized,
              the demand for hospital beds would be the same.&rdquo; The spiral shows none of this nuance.
              Its explosive protrusion conveys alarm, potentially biasing readers toward disproportionate panic.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">No interaction</p>
            <p className="text-sm text-muted leading-relaxed">
              The static format makes it impossible to look up exact values, compare specific dates across years,
              or explore the data at your own pace. Cross-year comparison (e.g., July 2020 vs. July 2021)
              requires mentally aligning data at different radii, violating the Gestalt principle of proximity.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION: How the redesign works ── */}
      <section className="max-w-[680px] mx-auto px-6 mb-12">
        <h2 className="font-serif text-2xl mb-6" style={{ letterSpacing: "-0.01em" }}>How the Redesign Works</h2>

        <p className="text-[15px] leading-relaxed mb-4">
          The redesign keeps the spiral&rsquo;s temporal structure (one revolution per year, January at the top)
          and its visual drama (Omicron still stands out immediately). But it replaces the encoding that caused
          the distortion: instead of radial distance, magnitude is encoded as <strong>color intensity</strong> on
          equal-width segments. Inner and outer rings are now directly comparable.
        </p>

        <p className="text-[15px] leading-relaxed mb-6">
          Three interaction features address the limitations identified above:
        </p>

        <div className="space-y-5 mb-8">
          <div className="bg-surface border border-border rounded-lg px-5 py-4">
            <p className="text-sm font-semibold mb-1">Hover: cross-year comparison</p>
            <p className="text-sm text-muted leading-relaxed">
              Move your cursor over any segment. The same calendar date is highlighted on <em>all three rings</em>,
              and a tooltip shows the exact case count and hospitalization number for 2020, 2021, and 2022 side by side.
              No mental alignment needed.
            </p>
            <p className="text-[11px] font-mono text-accent mt-2 opacity-70">Addresses: Gestalt proximity violation, Shneiderman&rsquo;s details on demand</p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-5 py-4">
            <p className="text-sm font-semibold mb-1">Click to compare</p>
            <p className="text-sm text-muted leading-relaxed">
              Click any two points to place markers A and B. A comparison panel appears with side-by-side statistics
              and magnitude ratios, supporting the lookup and compare tasks that Munzner&rsquo;s framework identifies
              as poorly supported by radial layouts.
            </p>
            <p className="text-[11px] font-mono text-accent mt-2 opacity-70">Addresses: poor lookup/compare support in radial encoding</p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-5 py-4">
            <p className="text-sm font-semibold mb-1">Hospitalization toggle</p>
            <p className="text-sm text-muted leading-relaxed">
              Toggle the blue band to overlay hospitalization data alongside cases. During Omicron,
              the case band turns deep red while hospitalizations remain moderate blue,
              making the severity decoupling visually self-evident.
              The red/blue contrast was chosen for semantic clarity and accessibility under common color vision deficiencies.
            </p>
            <p className="text-[11px] font-mono text-accent mt-2 opacity-70">Addresses: Cairo&rsquo;s &ldquo;enlightenment&rdquo; dimension</p>
          </div>
        </div>
      </section>

      {/* ── SECTION: Trade-offs ── */}
      <section className="max-w-[680px] mx-auto px-6 mb-12">
        <h2 className="font-serif text-2xl mb-6" style={{ letterSpacing: "-0.01em" }}>Trade-offs</h2>
        <p className="text-[15px] leading-relaxed mb-4">
          Color encoding also ranks below position on Cleveland and McGill&rsquo;s effectiveness hierarchy.
          Precise magnitude comparison from color alone is difficult. The interaction layer compensates:
          hovering reveals exact values, so precise judgment does not depend on the color channel alone.
        </p>
        <p className="text-[15px] leading-relaxed">
          The spiral&rsquo;s geometric novelty is preserved rather than discarded.
          The redesign does not flatten the spiral into a conventional line chart;
          instead, it fixes the encoding while keeping the form that made the original memorable.
          The temporal structure, the year-over-year layering, and the visual climax of the Omicron spike
          are all retained.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-[680px] mx-auto px-6 pb-20">
        <div className="border-t border-border pt-6 space-y-2">
          <p className="text-xs text-muted font-mono leading-relaxed">
            Data is synthetic but modeled on U.S. COVID-19 case and hospitalization patterns from Our World in Data.
          </p>
          <p className="text-xs text-muted font-mono leading-relaxed">
            Original visualization: &ldquo;Here&rsquo;s When We Expect Omicron to Peak,&rdquo;
            by Jeffrey Shaman, with graphics by Gus Wezerek and Sara Chodosh.
            <em> The New York Times</em>, January 6, 2022.
          </p>
          <p className="text-xs text-muted font-mono leading-relaxed">
            Built as a redesign proposal for STA313 Assignment 3, University of Toronto.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

function Toggle({ label, active, onToggle, color }: { label: string; active: boolean; onToggle: () => void; color: string }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 text-xs font-mono cursor-pointer">
      <span className="w-8 h-[18px] rounded-full border transition-colors relative"
        style={{ borderColor: active ? color : "var(--border)", backgroundColor: active ? color + "22" : "transparent" }}>
        <motion.span className="absolute top-[2px] w-3 h-3 rounded-full"
          style={{ backgroundColor: active ? color : "var(--muted)" }}
          animate={{ left: active ? 14 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </span>
      <span className="transition-colors" style={{ color: active ? color : "var(--muted)" }}>{label}</span>
    </button>
  );
}

function Card({ title, desc, fix }: { title: string; desc: string; fix: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-5 py-4">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed mb-2">{desc}</p>
      <p className="text-[10px] font-mono text-accent opacity-80">{fix}</p>
    </div>
  );
}
