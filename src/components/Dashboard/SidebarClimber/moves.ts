// Moves between two stairs. Each move maps progress `p` (0..1) to where the
// figure's feet are and how it is posed. `from`/`to` are the feet y positions.

import {
  balancePose,
  clamp01,
  climbPose,
  crouchPose,
  easeInOutSine,
  easeOutCubic,
  flightPose,
  lerp,
  lerpPose,
  reachPose,
  runPose,
  standPose,
  type Pose,
} from "./poses";

export type MoveStyle = "jump" | "run" | "pullUp" | "hopDown" | "stepDown" | "jumpDown";

export type Frame = {
  /** Feet y. */
  y: number;
  /** Horizontal offset from the lane center, px. */
  x: number;
  pose: Pose;
  /** Vertical squash/stretch around the feet (1 = none). */
  squash: number;
};

/** Going up mixes jumping, running up and pulling up; coming down mixes hops, steps and jumps. */
const UP_SEQUENCE: MoveStyle[] = ["jump", "run", "pullUp", "jump", "run", "jump", "pullUp"];
const DOWN_SEQUENCE: MoveStyle[] = ["hopDown", "stepDown", "jumpDown", "hopDown", "jumpDown", "stepDown"];

export const pickStyle = (goingUp: boolean, count: number): MoveStyle => {
  const list = goingUp ? UP_SEQUENCE : DOWN_SEQUENCE;
  return list[count % list.length];
};

export const MOVE_DURATION: Record<MoveStyle, number> = {
  jump: 2600,
  run: 3100,
  pullUp: 3600,
  hopDown: 2100,
  stepDown: 2800,
  jumpDown: 2400,
};

/** Upward arc offset (negative = higher) for a flight progress q. */
const arc = (q: number, height: number) => -height * 4 * q * (1 - q);

function jumpMove(p: number, from: number, to: number, height: number, down: boolean): Frame {
  if (p < 0.25) {
    const k = easeOutCubic(p / 0.25);
    return { y: from, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
  }
  if (p < 0.75) {
    const q = (p - 0.25) / 0.5;
    const air = Math.sin(Math.PI * q);
    return {
      y: lerp(from, to, easeInOutSine(q)) + arc(q, height),
      x: 5 * air,
      pose: down ? balancePose(air) : flightPose(Math.min(1, air * 1.6)),
      squash: 1 + 0.07 * air,
    };
  }
  const k = 1 - (p - 0.75) / 0.25;
  return { y: to, x: 0, pose: crouchPose(k * 0.85), squash: 1 - 0.1 * k };
}

function runMove(p: number, from: number, to: number): Frame {
  if (p < 0.5) {
    // A few quick strides along the stair, swinging out and back.
    const q = p / 0.5;
    return { y: from, x: -7 * Math.sin(Math.PI * q), pose: runPose(q * 2.5), squash: 1 };
  }
  if (p < 0.82) {
    const q = (p - 0.5) / 0.32;
    return {
      y: lerp(from, to, easeOutCubic(q)) + arc(q, 9),
      x: 0,
      pose: runPose(1.25 + q * 1.1),
      squash: 1 + 0.05 * Math.sin(Math.PI * q),
    };
  }
  const k = 1 - (p - 0.82) / 0.18;
  return { y: to, x: 0, pose: crouchPose(k * 0.5), squash: 1 - 0.06 * k };
}

function pullUpMove(p: number, from: number, to: number): Frame {
  if (p < 0.2) {
    return { y: from, x: 0, pose: reachPose(easeOutCubic(p / 0.2)), squash: 1 };
  }
  if (p < 0.85) {
    const q = (p - 0.2) / 0.65;
    return {
      y: lerp(from, to, easeInOutSine(q)),
      x: 2 * Math.sin(Math.PI * q),
      pose: climbPose(q * 2),
      squash: 1,
    };
  }
  const q = (p - 0.85) / 0.15;
  return { y: to, x: 0, pose: lerpPose(crouchPose(0.45), standPose(), q), squash: 1 };
}

function stepDownMove(p: number, from: number, to: number): Frame {
  if (p < 0.8) {
    const q = p / 0.8;
    return {
      y: lerp(from, to, easeInOutSine(q)),
      x: 2 * Math.sin(Math.PI * q),
      pose: climbPose(q * 2),
      squash: 1,
    };
  }
  const k = 1 - (p - 0.8) / 0.2;
  return { y: to, x: 0, pose: crouchPose(k * 0.5), squash: 1 - 0.05 * k };
}

export function evaluateMove(style: MoveStyle, progress: number, from: number, to: number): Frame {
  const p = clamp01(progress);
  switch (style) {
    case "jump":
      return jumpMove(p, from, to, 16, false);
    case "run":
      return runMove(p, from, to);
    case "pullUp":
      return pullUpMove(p, from, to);
    case "hopDown":
      return jumpMove(p, from, to, 8, true);
    case "stepDown":
      return stepDownMove(p, from, to);
    case "jumpDown":
      return jumpMove(p, from, to, 12, false);
  }
}
