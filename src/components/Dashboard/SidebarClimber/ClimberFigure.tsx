"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";
import type { Limb, Pose } from "./poses";

export type ClimberFigureHandle = {
  setPose: (pose: Pose) => void;
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
  const partsId = `climber-${useId().replace(/:/g, "")}`;

  useImperativeHandle(handleRef, () => ({
    setPose(pose) {
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
              cx={NECK.x}
              cy={6.6}
              r={3.6}
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
