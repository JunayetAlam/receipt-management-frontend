"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";
import type { Limb, Pose } from "./poses";

/** Web line in px, relative to the feet: `reach` up to the anchor, `dx` across to it, `out` 0..1 shot. */
export type WebLine = { reach: number; dx: number; out: number };

export type ClimberFigureHandle = {
  setPose: (pose: Pose, web?: WebLine) => void;
};

// Figure geometry in SVG units (viewBox below leaves headroom for the flag).
const NECK = { x: 12, y: 10.5 };
const SHOULDER_Y = 12.5;
const HIP = { x: 12, y: 22 };
const ARM = [5.5, 5] as const;
const LEG = [6.2, 6.2] as const;

/** Ground line for the feet, in SVG units. */
const FEET_Y = HIP.y + LEG[0] + LEG[1];

/** Rendered size in px, and where the feet stand (the anchor point). */
export const FIGURE_WIDTH = 30;
export const FIGURE_HEIGHT = 45;
export const FIGURE_ANCHOR_X = ((NECK.x + 4) / 32) * FIGURE_WIDTH;
export const FIGURE_FEET_Y = ((FEET_Y + 10) / 48) * FIGURE_HEIGHT;
/** Body center (mid-torso) in px: somersaults rotate around this point. */
export const FIGURE_CENTER_Y = ((16 + 10) / 48) * FIGURE_HEIGHT;

const HEAD = { x: NECK.x, y: 6.6, r: 3.6 };
/** Where the headband is tied, at the back-left of the head. */
const KNOT = { x: HEAD.x - 3.3, y: 5 };

/** px → SVG units. */
const UNITS_X = 32 / FIGURE_WIDTH;
const UNITS_Y = 48 / FIGURE_HEIGHT;

type Point = { x: number; y: number };

function step(from: Point, angle: number, length: number, side: number): Point {
  const rad = (angle * Math.PI) / 180;
  return {
    x: from.x + side * Math.sin(rad) * length,
    y: from.y + Math.cos(rad) * length,
  };
}

function limbPoints(
  origin: Point,
  [upper, bend]: Limb,
  lengths: readonly [number, number],
  side: number,
) {
  const joint = step(origin, upper, lengths[0], side);
  const end = step(joint, upper + bend, lengths[1], side);
  return { joint, end };
}

const toPoints = (...points: Point[]) =>
  points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

/** Solid silhouette figure (filled head, thick limbs) driven imperatively by `setPose`. Feet stay planted on the ground line. */
export default function ClimberFigure({
  handleRef,
}: {
  handleRef: Ref<ClimberFigureHandle>;
}) {
  const leftArm = useRef<SVGPolylineElement>(null);
  const rightArm = useRef<SVGPolylineElement>(null);
  const leftLeg = useRef<SVGPolylineElement>(null);
  const rightLeg = useRef<SVGPolylineElement>(null);
  const flag = useRef<SVGGElement>(null);
  const pole = useRef<SVGLineElement>(null);
  const pennant = useRef<SVGPolygonElement>(null);
  const motion = useRef<SVGGElement>(null);
  const body = useRef<SVGGElement>(null);
  const tailA = useRef<SVGPolylineElement>(null);
  const tailB = useRef<SVGPolylineElement>(null);
  const web = useRef<SVGGElement>(null);
  const webLine = useRef<SVGLineElement>(null);
  const webSplat = useRef<SVGCircleElement>(null);
  const partsId = `climber-${useId().replace(/:/g, "")}`;

  useImperativeHandle(handleRef, () => ({
    setPose(pose, line) {
      const lShoulder = { x: NECK.x - 1.4, y: SHOULDER_Y };
      const rShoulder = { x: NECK.x + 1.4, y: SHOULDER_Y };
      const lHip = { x: HIP.x - 1.3, y: HIP.y };
      const rHip = { x: HIP.x + 1.3, y: HIP.y };

      const la = limbPoints(lShoulder, pose.leftArm, ARM, -1);
      const ra = limbPoints(rShoulder, pose.rightArm, ARM, 1);
      const ll = limbPoints(lHip, pose.leftLeg, LEG, -1);
      const rl = limbPoints(rHip, pose.rightLeg, LEG, 1);

      // Plant the lowest foot on the ground line.
      const lift = FEET_Y - Math.max(ll.end.y, rl.end.y);
      body.current?.setAttribute("transform", `translate(0 ${lift.toFixed(2)})`);

      leftArm.current?.setAttribute("points", toPoints(lShoulder, la.joint, la.end));
      rightArm.current?.setAttribute("points", toPoints(rShoulder, ra.joint, ra.end));
      leftLeg.current?.setAttribute("points", toPoints(lHip, ll.joint, ll.end));
      rightLeg.current?.setAttribute("points", toPoints(rHip, rl.joint, rl.end));

      // Flag is held in the right hand.
      const hand = ra.end;
      const top = { x: hand.x, y: hand.y - 10 };
      pole.current?.setAttribute("x1", hand.x.toFixed(2));
      pole.current?.setAttribute("y1", (hand.y + 1).toFixed(2));
      pole.current?.setAttribute("x2", top.x.toFixed(2));
      pole.current?.setAttribute("y2", top.y.toFixed(2));
      pennant.current?.setAttribute(
        "points",
        toPoints(
          top,
          { x: top.x + 8, y: top.y + 2.4 + pose.wave * 0.9 },
          { x: top.x, y: top.y + 5 },
        ),
      );
      flag.current?.setAttribute("opacity", pose.flag.toFixed(2));
      motion.current?.setAttribute("opacity", pose.motion.toFixed(2));

      // Headband tails stream out behind the head, fluttering harder in motion.
      const t = performance.now();
      const flutter = 0.3 + 0.7 * pose.motion;
      const len = 3.5 + 3.5 * flutter;
      const tail = (phase: number, droop: number) =>
        toPoints(
          KNOT,
          {
            x: KNOT.x - len * 0.5,
            y: KNOT.y + droop * 0.5 + Math.sin(t / 70 + phase) * 0.9 * flutter,
          },
          {
            x: KNOT.x - len,
            y: KNOT.y + droop + Math.sin(t / 70 + phase + 1.4) * 1.6 * flutter,
          },
        );
      tailA.current?.setAttribute("points", tail(0, 1.2 + 2.5 * (1 - flutter)));
      tailB.current?.setAttribute("points", tail(2.1, 2.6 + 3 * (1 - flutter)));

      // Web line shot from the right hand to the anchor (drawn outside the lifted body group).
      if (!line || line.out <= 0) {
        web.current?.setAttribute("opacity", "0");
      } else {
        const from = { x: ra.end.x, y: ra.end.y + lift };
        const anchor = { x: NECK.x + 3 + line.dx * UNITS_X, y: FEET_Y - line.reach * UNITS_Y };
        const end = {
          x: from.x + (anchor.x - from.x) * line.out,
          y: from.y + (anchor.y - from.y) * line.out,
        };
        webLine.current?.setAttribute("x1", from.x.toFixed(2));
        webLine.current?.setAttribute("y1", from.y.toFixed(2));
        webLine.current?.setAttribute("x2", end.x.toFixed(2));
        webLine.current?.setAttribute("y2", end.y.toFixed(2));
        webSplat.current?.setAttribute("cx", end.x.toFixed(2));
        webSplat.current?.setAttribute("cy", end.y.toFixed(2));
        webSplat.current?.setAttribute("opacity", line.out >= 0.98 ? "1" : "0");
        web.current?.setAttribute("opacity", "1");
      }
    },
  }));

  return (
    <svg
      width={FIGURE_WIDTH}
      height={FIGURE_HEIGHT}
      viewBox="-4 -10 32 48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="overflow-visible text-slate-800 dark:text-slate-100"
    >
      <g ref={web} opacity={0} className="text-slate-500 dark:text-slate-300">
        <line ref={webLine} strokeWidth={0.9} />
        <circle ref={webSplat} r={1.6} strokeWidth={0.8} strokeDasharray="1 0.8" />
      </g>
      <g ref={body}>
        {/* motion marks */}
        <g ref={motion} opacity={0} stroke="#f59e0b" strokeWidth={1.3}>
          <path d="M 2.5 9 q -2.2 3 0 6" />
          <path d="M -0.5 8 q -2.6 4 0 8" />
        </g>
        {/* Body parts are defined once and drawn twice: a thick dark pass, then a
            thinner light pass on top, so the joined shape reads as an outline. */}
        <defs>
          <g id={partsId}>
            <circle
              cx={HEAD.x}
              cy={HEAD.y}
              r={HEAD.r}
              fill="currentColor"
              style={{ strokeWidth: "var(--head-w)" }}
            />
            <line
              x1={NECK.x}
              y1={NECK.y}
              x2={HIP.x}
              y2={HIP.y}
              style={{ strokeWidth: "calc(var(--limb-w) * 1.35)" }}
            />
            <g style={{ strokeWidth: "var(--limb-w)" }}>
              <polyline ref={leftArm} />
              <polyline ref={rightArm} />
              <polyline ref={leftLeg} />
              <polyline ref={rightLeg} />
            </g>
          </g>
        </defs>
        <use
          href={`#${partsId}`}
          className="text-slate-800 dark:text-slate-100"
          style={{ ["--limb-w" as string]: "4.6", ["--head-w" as string]: "1.6" }}
        />
        <use
          href={`#${partsId}`}
          className="text-white dark:text-slate-900"
          style={{ ["--limb-w" as string]: "2.2", ["--head-w" as string]: "0" }}
        />
        {/* ninja hood with an eye slit, and a red headband with streaming tails */}
        <circle
          cx={HEAD.x}
          cy={HEAD.y}
          r={HEAD.r}
          fill="currentColor"
          stroke="none"
          className="text-slate-800 dark:text-slate-100"
        />
        <line
          x1={HEAD.x - 2.5}
          y1={HEAD.y + 0.5}
          x2={HEAD.x + 2.5}
          y2={HEAD.y + 0.5}
          strokeWidth={1.2}
          className="text-white dark:text-slate-900"
        />
        <g stroke="#ef4444" strokeWidth={1.3}>
          <line x1={KNOT.x} y1={KNOT.y} x2={HEAD.x + 3.1} y2={KNOT.y - 0.6} />
          <polyline ref={tailA} />
          <polyline ref={tailB} strokeWidth={1} />
        </g>
        <g ref={flag} opacity={0}>
          <line ref={pole} strokeWidth={1.4} />
          <polygon
            ref={pennant}
            fill="var(--primary)"
            stroke="var(--primary)"
            strokeWidth={0.8}
          />
        </g>
      </g>
    </svg>
  );
}
