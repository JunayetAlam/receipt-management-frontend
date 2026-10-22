// Ninja moves between two stairs. Each move maps progress `p` (0..1) to where
// the figure's feet are and how it is posed. `from`/`to` are the feet y positions.
// Every move starts and ends in the ready stance so moves chain without snapping.
// Only the front flip rotates the figure; every other move stays upright.

import {
  AIM,
  BALANCE,
  CROUCH,
  DIVE,
  FLIGHT,
  KICK,
  LAND,
  LEAN,
  RAPPEL,
  SEAL,
  SPREAD,
  STANCE,
  TUCK,
  clamp01,
  climbPose,
  crouchPose,
  easeInOutSine,
  easeOutCubic,
  lerp,
  lerpPose,
  runPose,
  type Pose,
} from "./poses";

export type MoveStyle =
  // going up
  | "flip"
  | "starJump"
  | "dash"
  | "wallKick"
  | "shadowStep"
  | "webClimb"
  // coming down
  | "drop"
  | "hopDown"
  | "tuckDrop"
  | "slide"
  | "smokeDrop"
  | "rappel";

export type Frame = {
  /** Feet y. */
  y: number;
  /** Horizontal offset from the lane center, px. */
  x: number;
  pose: Pose;
  /** Vertical squash/stretch around the feet (1 = none). */
  squash: number;
  /** Rotation around the body's center, degrees (somersaults). */
  spin?: number;
  /** Figure opacity, 0..1 (vanishing moves). */
  alpha?: number;
  /** Web line from the right hand to a stair: `anchorY` is that stair's feet y, `out` 0..1 how far it has shot. */
  rope?: { anchorY: number; out: number };
};

const UP_MOVES: MoveStyle[] = ["flip", "starJump", "dash", "wallKick", "shadowStep", "webClimb"];
const DOWN_MOVES: MoveStyle[] = ["drop", "hopDown", "tuckDrop", "slide", "smokeDrop", "rappel"];

/** A random move for the direction, never repeating the previous one back to back. */
export const pickStyle = (goingUp: boolean, previous: MoveStyle): MoveStyle => {
  const list = (goingUp ? UP_MOVES : DOWN_MOVES).filter((m) => m !== previous);
  return list[Math.floor(Math.random() * list.length)];
};

export const MOVE_DURATION: Record<MoveStyle, number> = {
  flip: 1300,
  starJump: 1150,
  dash: 1250,
  wallKick: 1400,
  shadowStep: 1300,
  webClimb: 2400,
  drop: 1100,
  hopDown: 950,
  tuckDrop: 1050,
  slide: 1100,
  smokeDrop: 1200,
  rappel: 2000,
};

/** Upward arc offset (negative = higher) for a flight progress q. */
const arc = (q: number, height: number) => -height * 4 * q * (1 - q);

/** Crouch in from the stance over [0, a), back out to the stance over [b, 1]. */
function loadAndLand(p: number, a: number, b: number, from: number, to: number, depth = 1): Frame | null {
  if (p < a) {
    const k = easeOutCubic(p / a) * depth;
    return { y: from, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
  }
  if (p >= b) {
    const k = (1 - easeOutCubic((p - b) / (1 - b))) * depth;
    return { y: to, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
  }
  return null;
}

/** Upright jump: crouch, fly an arc in the `shape` pose, land in a crouch. */
function jumpMove(p: number, from: number, to: number, height: number, shape: Pose, drift: number, depth = 1): Frame {
  const edge = loadAndLand(p, 0.2, 0.8, from, to, depth);
  if (edge) return edge;
  const q = (p - 0.2) / 0.6;
  const air = Math.sin(Math.PI * q);
  return {
    y: lerp(from, to, easeInOutSine(q)) + arc(q, height),
    x: drift * air,
    pose: lerpPose(crouchPose(depth), shape, clamp01(Math.min(q, 1 - q) * 5)),
    squash: 1 + 0.07 * air,
  };
}

/** Front somersault: the one rotating move. */
function flipMove(p: number, from: number, to: number): Frame {
  const edge = loadAndLand(p, 0.2, 0.8, from, to);
  if (edge) return edge;
  const q = (p - 0.2) / 0.6;
  const stretch =
    q < 0.5
      ? lerpPose(CROUCH, FLIGHT, clamp01(q / 0.15))
      : lerpPose(FLIGHT, CROUCH, clamp01((q - 0.85) / 0.15));
  const air = Math.sin(Math.PI * q);
  return {
    y: lerp(from, to, easeInOutSine(q)) + arc(q, 22),
    x: 4 * air,
    pose: lerpPose(stretch, TUCK, clamp01(air * 1.5 - 0.3)),
    squash: 1 + 0.06 * air,
    spin: 360 * easeInOutSine(q),
  };
}

/** Dash out along the stair, sprint back, and leap up in a long stretched arc. */
function dashMove(p: number, from: number, to: number): Frame {
  if (p < 0.4) {
    const q = p / 0.4;
    return {
      y: from,
      x: -12 * Math.sin(Math.PI * q),
      pose: lerpPose(STANCE, runPose(q * 3), clamp01(Math.min(q, 1 - q) * 6)),
      squash: 1,
    };
  }
  if (p < 0.48) {
    const k = easeOutCubic((p - 0.4) / 0.08);
    return { y: from, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
  }
  const edge = loadAndLand(p, 0, 0.85, from, to);
  if (edge) return edge;
  const q = (p - 0.48) / 0.37;
  const air = Math.sin(Math.PI * q);
  return {
    y: lerp(from, to, easeOutCubic(q)) + arc(q, 16),
    x: 3 * air,
    pose: lerpPose(CROUCH, FLIGHT, clamp01(Math.min(q, 1 - q) * 5)),
    squash: 1 + 0.08 * air,
  };
}

/** Leap out sideways, kick off an invisible wall at the peak, and spring back onto the stair above. */
function wallKickMove(p: number, from: number, to: number): Frame {
  const edge = loadAndLand(p, 0.15, 0.85, from, to);
  if (edge) return edge;
  const mid = lerp(from, to, 0.55);
  if (p < 0.45) {
    const q = (p - 0.15) / 0.3;
    return {
      y: lerp(from, mid, easeOutCubic(q)) + arc(q, 6),
      x: -14 * easeOutCubic(q),
      pose: lerpPose(CROUCH, FLIGHT, clamp01(q * 4)),
      squash: 1 + 0.05 * Math.sin(Math.PI * q),
    };
  }
  if (p < 0.55) {
    const q = (p - 0.45) / 0.1;
    return { y: mid, x: -14, pose: lerpPose(FLIGHT, KICK, clamp01(Math.min(q, 1 - q) * 4)), squash: 1 };
  }
  const q = (p - 0.55) / 0.3;
  return {
    y: lerp(mid, to, easeInOutSine(q)) + arc(q, 10),
    x: -14 * (1 - easeInOutSine(q)),
    pose: lerpPose(FLIGHT, CROUCH, clamp01((q - 0.6) / 0.4)),
    squash: 1 + 0.05 * Math.sin(Math.PI * q),
  };
}

/** Hand seal, vanish, and reappear on the target stair. */
function shadowStepMove(p: number, from: number, to: number): Frame {
  if (p < 0.2) {
    return { y: from, x: 0, pose: lerpPose(STANCE, SEAL, easeOutCubic(p / 0.2)), squash: 1 };
  }
  if (p < 0.4) {
    const q = (p - 0.2) / 0.2;
    return { y: from, x: 0, pose: SEAL, squash: 1 + 0.25 * q, alpha: 1 - q };
  }
  if (p < 0.55) return { y: to, x: 0, pose: CROUCH, squash: 1, alpha: 0 };
  if (p < 0.75) {
    const q = (p - 0.55) / 0.2;
    return { y: to, x: 0, pose: CROUCH, squash: 0.8 + 0.08 * q, alpha: q };
  }
  const k = 1 - easeOutCubic((p - 0.75) / 0.25);
  return { y: to, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
}

/**
 * Spider-Man style: throw an arm up, shoot a web line onto the stair above,
 * climb it hand over hand, and pull up over the edge.
 */
function webClimbMove(p: number, from: number, to: number): Frame {
  if (p < 0.12) {
    return { y: from, x: 0, pose: lerpPose(STANCE, AIM, easeOutCubic(p / 0.12)), squash: 1 };
  }
  if (p < 0.3) {
    const q = (p - 0.12) / 0.18;
    return { y: from, x: 0, pose: AIM, squash: 1, rope: { anchorY: to, out: easeOutCubic(q) } };
  }
  const rope = { anchorY: to, out: 1 };
  if (p < 0.36) {
    // Tug the line to test it.
    const q = (p - 0.3) / 0.06;
    return { y: from, x: 0, pose: lerpPose(AIM, climbPose(0), q), squash: 1 - 0.05 * Math.sin(Math.PI * q), rope };
  }
  if (p < 0.84) {
    const q = (p - 0.36) / 0.48;
    return {
      y: lerp(from, to, easeInOutSine(q)),
      x: 1.5 * Math.sin(q * Math.PI * 3),
      pose: climbPose(q * 3),
      squash: 1,
      rope,
    };
  }
  const r = (p - 0.84) / 0.16;
  return {
    y: to,
    x: 0,
    pose: lerpPose(climbPose(3), STANCE, easeInOutSine(r)),
    squash: 1,
    rope: { anchorY: to, out: 1 - clamp01(r * 3) },
  };
}

/** Silent drop: small hop off the edge, arms out, then a low one-hand ninja landing. */
function dropMove(p: number, from: number, to: number): Frame {
  if (p < 0.15) {
    const k = easeOutCubic(p / 0.15) * 0.5;
    return { y: from, x: 0, pose: crouchPose(k), squash: 1 - 0.08 * k };
  }
  if (p < 0.6) {
    const q = (p - 0.15) / 0.45;
    return {
      y: lerp(from, to, q * q) + arc(q, 6),
      x: 3 * Math.sin(Math.PI * q),
      pose: lerpPose(crouchPose(0.5), BALANCE, clamp01(q * 4)),
      squash: 1 + 0.05 * Math.sin(Math.PI * q),
    };
  }
  return landing((p - 0.6) / 0.4, to, BALANCE);
}

/** Absorb an impact into the one-hand ninja landing, hold it, then rise to the stance. */
function landing(r: number, to: number, incoming: Pose): Frame {
  if (r < 0.15) {
    const k = easeOutCubic(r / 0.15);
    return { y: to, x: 0, pose: lerpPose(incoming, LAND, k), squash: 1 - 0.14 * k };
  }
  if (r < 0.6) return { y: to, x: 0, pose: LAND, squash: 0.86 + 0.14 * ((r - 0.15) / 0.45) };
  return { y: to, x: 0, pose: lerpPose(LAND, STANCE, easeInOutSine((r - 0.6) / 0.4)), squash: 1 };
}

/** Lean back and slide down off the edge, dropping into the ninja landing. */
function slideMove(p: number, from: number, to: number): Frame {
  if (p < 0.15) {
    return { y: from, x: 0, pose: lerpPose(STANCE, LEAN, easeOutCubic(p / 0.15)), squash: 1 };
  }
  if (p < 0.6) {
    const q = (p - 0.15) / 0.45;
    return { y: lerp(from, to, Math.pow(q, 1.6)), x: 8 * Math.sin(Math.PI * q), pose: LEAN, squash: 1 };
  }
  return landing((p - 0.6) / 0.4, to, LEAN);
}

/** Shrink into nothing, then fall out of thin air into the ninja landing below. */
function smokeDropMove(p: number, from: number, to: number): Frame {
  if (p < 0.15) {
    return { y: from, x: 0, pose: lerpPose(STANCE, SEAL, easeOutCubic(p / 0.15)), squash: 1 };
  }
  if (p < 0.35) {
    const q = (p - 0.15) / 0.2;
    return { y: from, x: 0, pose: lerpPose(SEAL, TUCK, q), squash: 1 - 0.35 * q, alpha: 1 - q };
  }
  if (p < 0.45) return { y: to - 18, x: 0, pose: DIVE, squash: 1, alpha: 0 };
  if (p < 0.6) {
    const q = (p - 0.45) / 0.15;
    return { y: to - 18 * (1 - q * q), x: 0, pose: lerpPose(DIVE, BALANCE, q), squash: 1.06, alpha: Math.min(1, q * 2) };
  }
  return landing((p - 0.6) / 0.4, to, BALANCE);
}

/**
 * Rappel: shoot a line onto the stair it's leaving, hop out, and bounce down
 * the line against the wall to the stair below.
 */
function rappelMove(p: number, from: number, to: number): Frame {
  if (p < 0.1) {
    return { y: from, x: 0, pose: lerpPose(STANCE, RAPPEL, easeOutCubic(p / 0.1)), squash: 1 };
  }
  if (p < 0.25) {
    const q = (p - 0.1) / 0.15;
    return {
      y: from + arc(q, 4),
      x: -10 * easeOutCubic(q),
      pose: RAPPEL,
      squash: 1,
      rope: { anchorY: from, out: easeOutCubic(clamp01(q * 1.5)) },
    };
  }
  const rope = { anchorY: from, out: 1 };
  if (p < 0.78) {
    // Two push-off bounces on the way down.
    const q = (p - 0.25) / 0.53;
    const bounce = Math.abs(Math.sin(q * Math.PI * 2));
    return { y: lerp(from, to, q), x: -10 - 4 * bounce, pose: RAPPEL, squash: 1, rope };
  }
  if (p < 0.88) {
    const q = (p - 0.78) / 0.1;
    return {
      y: to,
      x: -10 * (1 - easeOutCubic(q)),
      pose: lerpPose(RAPPEL, CROUCH, q),
      squash: 1,
      rope: { anchorY: from, out: 1 - q },
    };
  }
  const k = 1 - easeOutCubic((p - 0.88) / 0.12);
  return { y: to, x: 0, pose: crouchPose(k), squash: 1 - 0.12 * k };
}

export function evaluateMove(style: MoveStyle, progress: number, from: number, to: number): Frame {
  const p = clamp01(progress);
  switch (style) {
    case "flip":
      return flipMove(p, from, to);
    case "starJump":
      return jumpMove(p, from, to, 24, SPREAD, 3);
    case "dash":
      return dashMove(p, from, to);
    case "wallKick":
      return wallKickMove(p, from, to);
    case "shadowStep":
      return shadowStepMove(p, from, to);
    case "webClimb":
      return webClimbMove(p, from, to);
    case "drop":
      return dropMove(p, from, to);
    case "hopDown":
      return jumpMove(p, from, to, 8, BALANCE, 4, 0.6);
    case "tuckDrop":
      return jumpMove(p, from, to, 14, TUCK, 2);
    case "slide":
      return slideMove(p, from, to);
    case "smokeDrop":
      return smokeDropMove(p, from, to);
    case "rappel":
      return rappelMove(p, from, to);
  }
}
